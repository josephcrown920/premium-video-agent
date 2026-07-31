import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

type ChatRequestBody = { messages?: unknown };

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = (await request.json()) as ChatRequestBody;
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }

        const key = process.env.LOVABLE_API_KEY;
        if (!key) {
          return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        }

        const gateway = createLovableAiGatewayProvider(key);
        const result = streamText({
          model: gateway("openai/gpt-5.6-sol"),
          system:
            "You are Aura, a premium creative AI copilot for designers, founders and engineers. Answer with vivid, concise, well-structured markdown. Be specific and useful, never generic.",
          messages: await convertToModelMessages(messages as UIMessage[]),
          providerOptions: { lovable: { reasoningEffort: "none" } },
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages as UIMessage[],
          onError: (error) => {
            console.error("chat stream error", error);
            const text = error instanceof Error ? error.message : String(error);
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