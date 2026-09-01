import { tool } from "ai";
import { z } from "zod";

import type { AuthedContext } from "./auth.server";

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
  if (!/^[0-9+\-*/%().,\s^eE]*$/.test(expression)) {
    throw new Error("Only numbers and + - * / % ( ) ^ are allowed.");
  }
  const js = expression.replace(/\^/g, "**");
  // eslint-disable-next-line no-new-func
  const value = Function(`"use strict"; return (${js});`)() as unknown;
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error("That expression did not evaluate to a finite number.");
  }
  return value;
}

async function renderWithVideoWorker(input: {
  prompt: string;
  durationSeconds: number;
  aspectRatio: string;
  imageUrls?: string[];
}) {
  const endpoint = process.env["VIDEO_RENDERER_URL"] ?? process.env["RUNPOD_VIDEO_ENDPOINT"];
  const apiKey = process.env["VIDEO_RENDERER_API_KEY"] ?? process.env["RUNPOD_API_KEY"];
  if (!endpoint || !apiKey) {
    return {
      error:
        "Video rendering is not connected yet. Set VIDEO_RENDERER_URL and VIDEO_RENDERER_API_KEY (or RUNPOD_VIDEO_ENDPOINT and RUNPOD_API_KEY) on the server.",
    };
  }

  const headers = {
    "content-type": "application/json",
    authorization: `Bearer ${apiKey}`,
  };

  const start = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({
      input: {
        prompt: input.prompt,
        duration: input.durationSeconds,
        aspect_ratio: input.aspectRatio,
        image_urls: input.imageUrls ?? [],
      },
    }),
  });

  if (!start.ok) {
    const detail = await start.text();
    return { error: `Video worker rejected the job (${start.status}): ${detail.slice(0, 400)}` };
  }

  const started = (await start.json()) as {
    id?: string;
    status?: string;
    output?: unknown;
    video_url?: string;
    url?: string;
  };

  const immediateUrl = started.video_url ?? started.url;
  if (immediateUrl) return { videoUrl: immediateUrl, status: "completed" };
  if (!started.id) return { error: "Video worker returned no job id." };

  const statusUrl = `${endpoint.replace(/\/$/, "")}/${encodeURIComponent(started.id)}`;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const status = await fetch(statusUrl, { headers: { authorization: `Bearer ${apiKey}` } });
    if (!status.ok) continue;
    const data = (await status.json()) as {
      status?: string;
      output?: { video_url?: string; url?: string } | string;
      video_url?: string;
      url?: string;
      error?: string;
    };
    const videoUrl =
      data.video_url ??
      data.url ??
      (typeof data.output === "string" ? data.output : data.output?.video_url ?? data.output?.url);
    if (videoUrl) return { videoUrl, status: "completed", jobId: started.id };
    if (["failed", "canceled", "cancelled", "error"].includes((data.status ?? "").toLowerCase())) {
      return { error: data.error ?? "Video rendering failed.", jobId: started.id };
    }
  }

  return { error: "Video rendering timed out while waiting for the worker.", jobId: started.id };
}

export function createAgentTools(ctx: AuthedContext, apiKey: string) {
  return {
    web_search: tool({
      description:
        "Search the live web for current information, news, prices, docs or anything after your training cutoff. Returns titles, URLs and snippets.",
      inputSchema: z.object({ query: z.string().describe("The search query") }),
      execute: async ({ query }) => {
        try {
          const res = await fetch("https://html.duckduckgo.com/html/", {
            method: "POST",
            headers: {
              "content-type": "application/x-www-form-urlencoded",
              "user-agent": "Mozilla/5.0 (compatible; AuraAgent/1.0)",
            },
            body: new URLSearchParams({ q: query }).toString(),
          });
          if (!res.ok) return { error: `Search failed with status ${res.status}` };
          const html = await res.text();
          const results: { title: string; url: string; snippet: string }[] = [];
          const blocks = html.split('class="result__body"').slice(1, 9);
          for (const block of blocks) {
            const link = /href="([^"]+)"/.exec(block)?.[1] ?? "";
            const decoded = decodeURIComponent(
              /uddg=([^&"]+)/.exec(link)?.[1] ?? link.replace(/&amp;/g, "&"),
            );
            const title = stripHtml(/result__a[^>]*>([\s\S]*?)<\/a>/.exec(block)?.[1] ?? "");
            const snippet = stripHtml(
              /result__snippet[^>]*>([\s\S]*?)<\/a>/.exec(block)?.[1] ?? "",
            ).slice(0, 400);
            if (title && decoded.startsWith("http")) results.push({ title, url: decoded, snippet });
          }
          if (results.length === 0) return { results: [], note: "No results found." };
          return { results: results.slice(0, 6) };
        } catch (error) {
          return { error: `Search failed: ${(error as Error).message}` };
        }
      },
    }),

    fetch_url: tool({
      description:
        "Fetch a web page or API endpoint and return its readable text content. Use after web_search to read a source in depth.",
      inputSchema: z.object({ url: z.string().describe("Absolute http(s) URL to fetch") }),
      execute: async ({ url }) => {
        try {
          if (!/^https?:\/\//i.test(url)) return { error: "URL must start with http:// or https://" };
          const res = await fetch(url, {
            headers: { "user-agent": "Mozilla/5.0 (compatible; AuraAgent/1.0)" },
          });
          const type = res.headers.get("content-type") ?? "";
          const body = await res.text();
          const text = type.includes("html") ? stripHtml(body) : body;
          return { status: res.status, url, content: text.slice(0, 12000) };
        } catch (error) {
          return { error: `Fetch failed: ${(error as Error).message}` };
        }
      },
    }),

    calculate: tool({
      description:
        "Evaluate an arithmetic expression exactly. Use this instead of doing mental math.",
      inputSchema: z.object({ expression: z.string().describe("e.g. (1240 * 0.19) + 45") }),
      execute: async ({ expression }) => {
        try {
          return { expression, result: safeMath(expression) };
        } catch (error) {
          return { error: (error as Error).message };
        }
      },
    }),

    current_time: tool({
      description: "Get the current UTC date and time. Use for anything time sensitive.",
      inputSchema: z.object({}),
      execute: async () => ({ iso: new Date().toISOString() }),
    }),

    generate_image: tool({
      description:
        "Generate an image from a text prompt. Use whenever the user asks for a visual, illustration, mockup, logo or concept art. Returns a URL you should present to the user.",
      inputSchema: z.object({
        prompt: z.string().describe("Rich, detailed description of the image to create"),
      }),
      execute: async ({ prompt }) => {
        try {
          const res = await fetch(`${GATEWAY}/chat/completions`, {
            method: "POST",
            headers: {
              "content-type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash-image",
              modalities: ["image", "text"],
              messages: [{ role: "user", content: prompt }],
            }),
          });
          if (!res.ok) {
            const detail = await res.text();
            if (res.status === 402) return { error: "Out of AI credits — top up to generate images." };
            if (res.status === 429) return { error: "Rate limited. Try again shortly." };
            return { error: `Image generation failed (${res.status}): ${detail.slice(0, 200)}` };
          }
          const json = (await res.json()) as {
            choices?: { message?: { images?: { image_url?: { url?: string } }[] } }[];
          };
          const dataUrl = json.choices?.[0]?.message?.images?.[0]?.image_url?.url;
          if (!dataUrl) return { error: "The model returned no image." };

          const base64 = dataUrl.split(",")[1] ?? "";
          const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
          const path = `${ctx.userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`;
          const { error: uploadError } = await ctx.supabase.storage
            .from("artifacts")
            .upload(path, bytes, { contentType: "image/png" });
          if (uploadError) return { error: `Could not store image: ${uploadError.message}` };

          const { data: signed, error: signError } = await ctx.supabase.storage
            .from("artifacts")
            .createSignedUrl(path, 60 * 60 * 24 * 365);
          if (signError || !signed?.signedUrl) {
            return { error: `Could not link image: ${signError?.message ?? "unknown error"}` };
          }
          return { prompt, imageUrl: signed.signedUrl };
        } catch (error) {
          return { error: `Image generation failed: ${(error as Error).message}` };
        }
      },
    }),

    render_video: tool({
      description:
        "Render a real video from a prompt using the configured video-generation/rendering worker. Use whenever the user asks to create, generate, render, animate, or export a video. The worker should return a playable video URL.",
      inputSchema: z.object({
        prompt: z.string().describe("Detailed video prompt or scene description"),
        durationSeconds: z.number().min(1).max(300).default(10),
        aspectRatio: z.enum(["16:9", "9:16", "1:1"]).default("16:9"),
        imageUrls: z.array(z.string().url()).optional().describe("Optional reference images"),
      }),
      execute: async ({ prompt, durationSeconds, aspectRatio, imageUrls }) => {
        try {
          return await renderWithVideoWorker({ prompt, durationSeconds, aspectRatio, imageUrls });
        } catch (error) {
          return { error: `Video rendering failed: ${(error as Error).message}` };
        }
      },
    }),

    remember: tool({
      description:
        "Save a durable fact or preference about the user so you recall it in future conversations. Keep each memory to one short sentence.",
      inputSchema: z.object({ fact: z.string().describe("The fact to remember") }),
      execute: async ({ fact }) => {
        const { error } = await ctx.supabase
          .from("memories")
          .insert({ user_id: ctx.userId, content: fact });
        if (error) return { error: `Could not save memory: ${error.message}` };
        return { saved: fact };
      },
    }),

    recall_memories: tool({
      description: "List everything you have remembered about this user.",
      inputSchema: z.object({}),
      execute: async () => {
        const { data, error } = await ctx.supabase
          .from("memories")
          .select("content, created_at")
          .order("created_at", { ascending: false })
          .limit(50);
        if (error) return { error: error.message };
        return { memories: data ?? [] };
      },
    }),
  };
}

export async function loadMemoryPreamble(ctx: AuthedContext): Promise<string> {
  const { data } = await ctx.supabase
    .from("memories")
    .select("content")
    .order("created_at", { ascending: false })
    .limit(20);
  if (!data || data.length === 0) return "";
  return `\n\nLong-term memory about this user:\n${data.map((m) => `- ${m.content}`).join("\n")}`;
}
