import { createFileRoute, notFound } from "@tanstack/react-router";
import type { UIMessage } from "ai";

import { ChatWindow } from "@/components/aura/ChatWindow";
import { getThread, listThreads } from "@/lib/threads.functions";

export const Route = createFileRoute("/_authenticated/chat/$threadId")({
  ssr: false,
  loader: async ({ params }) => {
    const [thread, threads] = await Promise.all([
      getThread({ data: { id: params.threadId } }),
      listThreads(),
    ]);
    if (!thread) throw notFound();
    return { thread: thread.thread, messages: thread.messages, threads };
  },
  head: () => ({
    meta: [
      { title: "Aura Agent — Research, imagine, and remember" },
      {
        name: "description",
        content:
          "Chat with Aura, an AI agent that searches the web, reads pages, generates images and remembers what matters to you.",
      },
      { property: "og:title", content: "Aura Agent — Your premium AI workspace" },
      {
        property: "og:description",
        content: "A streaming AI agent with web search, browsing, image generation and memory.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ThreadPage,
});

function ThreadPage() {
  const { thread, messages, threads } = Route.useLoaderData();
  return (
    <ChatWindow
      key={thread.id}
      threadId={thread.id}
      initialMessages={messages as unknown as UIMessage[]}
      initialThreads={threads}
    />
  );
}
