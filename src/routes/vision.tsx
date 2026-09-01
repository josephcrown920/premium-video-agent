import { createFileRoute } from "@tanstack/react-router";

import { VisionStudio } from "@/components/aura/VisionStudio";

export const Route = createFileRoute("/vision")({
  head: () => ({
    meta: [
      { title: "Vision — Aurora AI" },
      {
        name: "description",
        content: "Generate consistent 3×3 storyboards, analyze frames, lock looks, and send approved frames into video generation.",
      },
    ],
  }),
  component: VisionPage,
});

function VisionPage() {
  return <VisionStudio />;
}
