import { createFileRoute } from "@tanstack/react-router";
import { useRef } from "react";

import { HeroIntro } from "@/components/aura/HeroIntro";
import { VideoStudio } from "@/components/aura/VideoStudio";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aurora AI — Video Production Studio" },
      {
        name: "description",
        content:
          "Create cinematic AI videos with persistent context, notebooks, storyboards, camera angles, continuity locks, and a multi-model generation studio.",
      },
      { property: "og:title", content: "Aurora AI — Video Production Studio" },
      {
        property: "og:description",
        content:
          "A director-style AI video workspace with models, context, notebooks, boards and angles.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://cdn.gpteng.co/blank-app-v1.svg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://cdn.gpteng.co/blank-app-v1.svg" },
    ],
  }),
  component: Index,
});

function Index() {
  const workspaceRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(139,92,246,0.18),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(217,70,239,0.12),transparent_50%)]" />
        <div className="absolute inset-0 bg-noise opacity-[0.025]" />
      </div>

      <HeroIntro
        onEnter={() =>
          workspaceRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
        }
      />

      <div ref={workspaceRef} className="relative">
        <VideoStudio />
      </div>
    </div>
  );
}
