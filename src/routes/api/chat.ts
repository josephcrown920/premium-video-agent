import { createFileRoute } from "@tanstack/react-router";
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  type UIMessage,
} from "ai";

import { createAgentTools, loadMemoryPreamble } from "@/lib/agent-tools.server";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { authenticateRequest } from "@/lib/auth.server";

type ChatRequestBody = { messages?: unknown; id?: unknown };

const SYSTEM = `You are Aura, a premium autonomous AI video agent for creators, designers, founders and engineers.

You have real tools. Use them proactively instead of guessing:
- web_search + fetch_url for anything current, factual, or link-based. Always cite sources as markdown links.
- generate_image whenever a visual is requested. After it returns, embed the image with markdown: ![alt](imageUrl).
- render_video whenever the user asks to create, generate, render, animate, or export a video. It produces a real playable video URL when a video worker is configured.
- calculate for any arithmetic.
- current_time for anything date or time sensitive.
- remember to store durable user preferences and facts; recall_memories to look them up.

For video requests, think like an InVideo-style production agent: turn the user's idea into a clear cinematic prompt, choose a sensible duration and aspect ratio, then call render_video. Do not merely describe how to make the video when the user asked you to make it.

Work in multiple steps: plan, call tools, read results, then answer. Reply in vivid, concise, well-structured markdown. Be specific and useful, never generic.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = await authenticateRequest(request);
        if (!auth) return new Response("Unauthorized", { status: 401 });

        const body = (await request.json()) as ChatRequestBody;
        const messages = body.messages;
        const threadId = typeof body.id === "string" ? body.id : null;
        if (!Array.isArray(messages)) return new Response("Messages are required", { status: 400 });
        if (!threadId) return new Response("A conversation id is required", { status: 400 });

        const { data: thread, error: threadError } = await auth.supabase
          .from("threads")
          .select("id, title")
          .eq("id", threadId)
          .maybeSingle();
        if (threadError) return new Response(threadError.message, { status: 500 });
        if (!thread) return new Response("Conversation not found", { status: 404 });

        const key = process.env["LOVABLE_API_KEY"];
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const uiMessages = messages as UIMessage[];
        const lastUser = [...uiMessages].reverse().find((m) => m.role === "user");
        if (lastUser) {
          const { error: insertError } = await auth.supabase.from("messages").insert({
            thread_id: threadId,
            user_id: auth.userId,
            role: "user",
            client_message_id: lastUser.id,
            parts: lastUser.parts as unknown as never,
          });
          if (insertError && !insertError.message.includes("duplicate key")) {
            console.error("failed to save user message", insertError);
          }

          const firstText = lastUser.parts.find((p) => p.type === "text");
          if (thread.title === "New conversation" && firstText && "text" in firstText) {
            const raw = String(firstText.text).trim().replace(/\s+/g, " ");
            await auth.supabase
              .from("threads")
              .update({ title: raw.length > 60 ? `${raw.slice(0, 60)}…` : raw || "New conversation" })
              .eq("id", threadId);
          }
        }

        const memory = await loadMemoryPreamble(auth);
        const gateway = createLovableAiGatewayProvider(key);

        const result = streamText({
          model: gateway("openai/gpt-5.6-sol"),
          system: SYSTEM + memory,
          messages: await convertToModelMessages(uiMessages),
          tools: createAgentTools(auth, key),
          stopWhen: stepCountIs(50),
          providerOptions: { lovable: { reasoningEffort: "none" } },
        });

        return result.toUIMessageStreamResponse({
          originalMessages: uiMessages,
          onFinish: async ({ responseMessage }) => {
            const { error } = await auth.supabase.from("messages").insert({
              thread_id: threadId,
              user_id: auth.userId,
              role: "assistant",
              client_message_id: responseMessage.id,
              parts: responseMessage.parts as unknown as never,
            });
            if (error) console.error("failed to save assistant message", error);
            await auth.supabase
              .from("threads")
              .update({ updated_at: new Date().toISOString() })
              .eq("id", threadId);
          },
          onError: (error) => {
            console.error("chat stream error", error);
            const detail = error as { message?: string; responseBody?: string; statusCode?: number };
            const text = `${detail?.statusCode ?? ""} ${detail?.message ?? ""} ${detail?.responseBody ?? ""}`;
            if (text.includes("402") || text.toLowerCase().includes("credit")) {
              return "You're out of AI credits. Top up your Lovable AI credits to keep generating.";
            }
            if (text.includes("429")) return "Rate limit reached. Try again in a moment.";
            return "Generation failed. Please try again.";
          },
        });
      },
    },
  },
});
