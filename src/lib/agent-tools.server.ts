import { tool } from "ai";
import { z } from "zod";

import type { AuthedContext } from "./auth.server";
import { generateSeedreamImage } from "./modelark.server";

const GATEWAY = "https://ai.gateway.lovable.dev/v1";

function stripHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function safeMath(expression: string): number {
  if (!/^[0-9+\-*/%().,\s^eE]*$/.test(expression)) throw new Error("Only numbers and + - * / % ( ) ^ are allowed.");
  const value = Function(`"use strict"; return (${expression.replace(/\^/g, "**")});`)() as unknown;
  if (typeof value !== "number" || !Number.isFinite(value)) throw new Error("That expression did not evaluate to a finite number.");
  return value;
}

async function renderWithVideoWorker(input: { prompt: string; durationSeconds: number; aspectRatio: string; imageUrls?: string[] }) {
  const endpoint = process.env["VIDEO_RENDERER_URL"] ?? process.env["RUNPOD_VIDEO_ENDPOINT"];
  const apiKey = process.env["VIDEO_RENDERER_API_KEY"] ?? process.env["RUNPOD_API_KEY"];
  if (!endpoint || !apiKey) return { error: "Video rendering is not connected yet. Set VIDEO_RENDERER_URL and VIDEO_RENDERER_API_KEY (or RUNPOD_VIDEO_ENDPOINT and RUNPOD_API_KEY) on the server." };
  const start = await fetch(endpoint, { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` }, body: JSON.stringify({ input: { prompt: input.prompt, duration: input.durationSeconds, aspect_ratio: input.aspectRatio, image_urls: input.imageUrls ?? [] } }) });
  if (!start.ok) return { error: `Video worker rejected the job (${start.status}): ${(await start.text()).slice(0, 400)}` };
  const started = (await start.json()) as { id?: string; video_url?: string; url?: string };
  if (started.video_url ?? started.url) return { videoUrl: started.video_url ?? started.url, status: "completed" };
  if (!started.id) return { error: "Video worker returned no job id." };
  const statusUrl = `${endpoint.replace(/\/$/, "")}/${encodeURIComponent(started.id)}`;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const status = await fetch(statusUrl, { headers: { authorization: `Bearer ${apiKey}` } });
    if (!status.ok) continue;
    const data = (await status.json()) as { status?: string; output?: { video_url?: string; url?: string } | string; video_url?: string; url?: string; error?: string };
    const videoUrl = data.video_url ?? data.url ?? (typeof data.output === "string" ? data.output : data.output?.video_url ?? data.output?.url);
    if (videoUrl) return { videoUrl, status: "completed", jobId: started.id };
    if (["failed", "canceled", "cancelled", "error"].includes((data.status ?? "").toLowerCase())) return { error: data.error ?? "Video rendering failed.", jobId: started.id };
  }
  return { error: "Video rendering timed out while waiting for the worker.", jobId: started.id };
}

export function createAgentTools(ctx: AuthedContext, apiKey: string) {
  return {
    web_search: tool({
      description: "Search the live web for current information, news, prices, docs or anything after your training cutoff.",
      inputSchema: z.object({ query: z.string() }),
      execute: async ({ query }) => {
        try {
          const res = await fetch("https://html.duckduckgo.com/html/", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded", "user-agent": "Mozilla/5.0 (compatible; AuraAgent/1.0)" }, body: new URLSearchParams({ q: query }).toString() });
          if (!res.ok) return { error: `Search failed with status ${res.status}` };
          const html = await res.text();
          const results: { title: string; url: string; snippet: string }[] = [];
          for (const block of html.split('class="result__body"').slice(1, 9)) {
            const link = /href="([^"]+)"/.exec(block)?.[1] ?? "";
            const decoded = decodeURIComponent(/uddg=([^&"]+)/.exec(link)?.[1] ?? link.replace(/&amp;/g, "&"));
            const title = stripHtml(/result__a[^>]*>([\s\S]*?)<\/a>/.exec(block)?.[1] ?? "");
            const snippet = stripHtml(/result__snippet[^>]*>([\s\S]*?)<\/a>/.exec(block)?.[1] ?? "").slice(0, 400);
            if (title && decoded.startsWith("http")) results.push({ title, url: decoded, snippet });
          }
          return { results: results.slice(0, 6) };
        } catch (error) { return { error: `Search failed: ${(error as Error).message}` }; }
      },
    }),
    fetch_url: tool({
      description: "Fetch a web page or API endpoint and return readable text content.",
      inputSchema: z.object({ url: z.string().url() }),
      execute: async ({ url }) => {
        try { const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 (compatible; AuraAgent/1.0)" } }); const body = await res.text(); return { status: res.status, url, content: (res.headers.get("content-type") ?? "").includes("html") ? stripHtml(body).slice(0, 12000) : body.slice(0, 12000) }; }
        catch (error) { return { error: `Fetch failed: ${(error as Error).message}` }; }
      },
    }),
    calculate: tool({ description: "Evaluate an arithmetic expression exactly.", inputSchema: z.object({ expression: z.string() }), execute: async ({ expression }) => { try { return { expression, result: safeMath(expression) }; } catch (error) { return { error: (error as Error).message }; } } }),
    current_time: tool({ description: "Get current UTC date and time.", inputSchema: z.object({}), execute: async () => ({ iso: new Date().toISOString() }) }),
    generate_image: tool({
      description: "Generate a production image. Prefer BytePlus ModelArk Seedream when ARK_API_KEY is configured; fall back to the app image model when it is not.",
      inputSchema: z.object({ prompt: z.string(), size: z.string().default("2K") }),
      execute: async ({ prompt, size }) => {
        try {
          if (process.env["ARK_API_KEY"]) {
            const generated = await generateSeedreamImage({ prompt, size, responseFormat: "url", watermark: false });
            return { prompt, imageUrl: generated.imageUrl, provider: "byteplus-modelark", model: generated.model };
          }
          const res = await fetch(`${GATEWAY}/chat/completions`, { method: "POST", headers: { "content-type": "application/json", Authorization: `Bearer ${apiKey}` }, body: JSON.stringify({ model: "google/gemini-2.5-flash-image", modalities: ["image", "text"], messages: [{ role: "user", content: prompt }] }) });
          if (!res.ok) return { error: `Image generation failed (${res.status}): ${(await res.text()).slice(0, 200)}` };
          const json = (await res.json()) as { choices?: { message?: { images?: { image_url?: { url?: string } }[] } }[] };
          const imageUrl = json.choices?.[0]?.message?.images?.[0]?.image_url?.url;
          return imageUrl ? { prompt, imageUrl, provider: "lovable-ai" } : { error: "The image model returned no image." };
        } catch (error) { return { error: `Image generation failed: ${(error as Error).message}` }; }
      },
    }),
    render_video: tool({
      description: "Render a real video. Use for any request to create, generate, animate or export video.",
      inputSchema: z.object({ prompt: z.string(), durationSeconds: z.number().min(1).max(300).default(10), aspectRatio: z.enum(["16:9", "9:16", "1:1"]).default("16:9"), imageUrls: z.array(z.string().url()).optional() }),
      execute: async (input) => { try { return await renderWithVideoWorker(input); } catch (error) { return { error: `Video rendering failed: ${(error as Error).message}` }; } },
    }),
    remember: tool({ description: "Save a durable user fact or preference.", inputSchema: z.object({ fact: z.string() }), execute: async ({ fact }) => { const { error } = await ctx.supabase.from("memories").insert({ user_id: ctx.userId, content: fact }); return error ? { error: error.message } : { saved: fact }; } }),
    recall_memories: tool({ description: "List remembered user facts and preferences.", inputSchema: z.object({}), execute: async () => { const { data, error } = await ctx.supabase.from("memories").select("content, created_at").order("created_at", { ascending: false }).limit(50); return error ? { error: error.message } : { memories: data ?? [] }; } }),
  };
}

export async function loadMemoryPreamble(ctx: AuthedContext): Promise<string> {
  const { data } = await ctx.supabase.from("memories").select("content").order("created_at", { ascending: false }).limit(20);
  if (!data?.length) return "";
  return `\n\nLong-term memory about this user:\n${data.map((m) => `- ${m.content}`).join("\n")}`;
}
