import { z } from "zod";

/** Persistent workspace primitives inspired by InVideo Agent Two. */

export const inputKindSchema = z.enum([
  "brief",
  "script",
  "pdf",
  "image",
  "video",
  "audio",
  "url",
  "reference",
]);

export const workspaceInputSchema = z.object({
  id: z.string(),
  kind: inputKindSchema,
  title: z.string(),
  uri: z.string().optional(),
  extractedText: z.string().optional(),
  metadata: z.record(z.string(), z.string()).default({}),
  locked: z.boolean().default(false),
});

export const projectThreadSchema = z.object({
  id: z.string(),
  pageId: z.string(),
  label: z.string(),
  parentThreadId: z.string().optional(),
  assetIds: z.array(z.string()).default([]),
});

export const projectPageSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  threadIds: z.array(z.string()).default([]),
  locked: z.boolean().default(false),
});

export const workflowStepSchema = z.object({
  id: z.string(),
  label: z.string(),
  role: z.string(),
  requiresApproval: z.boolean().default(true),
  inputKinds: z.array(inputKindSchema).default([]),
  outputKinds: z.array(z.string()).default([]),
});

export const workflowSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  steps: z.array(workflowStepSchema),
  reusable: z.boolean().default(true),
});

export const playbookSchema = z.object({
  id: z.string(),
  name: z.string(),
  rules: z.array(z.string()),
  defaultQuality: z.enum(["basic", "pro", "ultra"]).default("pro"),
  defaultApproval: z.enum(["autopilot", "always_ask", "review"]).default("always_ask"),
  preferredModels: z.array(z.string()).default([]),
});

export type WorkspaceInput = z.infer<typeof workspaceInputSchema>;
export type ProjectPage = z.infer<typeof projectPageSchema>;
export type ProjectThread = z.infer<typeof projectThreadSchema>;
export type Workflow = z.infer<typeof workflowSchema>;
export type Playbook = z.infer<typeof playbookSchema>;

export const defaultWorkflows: Workflow[] = [
  {
    id: "casting",
    name: "Casting",
    description: "Read the script, create character options, approve a cast and lock references before video generation.",
    steps: [
      { id: "read", label: "Read script and character context", role: "casting", requiresApproval: false, inputKinds: ["script", "pdf"], outputKinds: ["character_plan"] },
      { id: "faces", label: "Generate character sheets", role: "casting", requiresApproval: true, inputKinds: ["reference", "image"], outputKinds: ["character_reference"] },
      { id: "lock", label: "Lock approved cast", role: "creative_producer", requiresApproval: true, inputKinds: ["image"], outputKinds: ["identity_lock"] },
    ],
    reusable: true,
  },
  {
    id: "storyboarding",
    name: "Storyboarding",
    description: "Turn a script or brief into a shot-by-shot visual plan before video generation.",
    steps: [
      { id: "breakdown", label: "Break script into scenes and shots", role: "storyboard_artist", requiresApproval: false, inputKinds: ["script", "pdf"], outputKinds: ["shot_list"] },
      { id: "vision", label: "Generate Vision boards", role: "storyboard_artist", requiresApproval: true, inputKinds: ["image", "reference"], outputKinds: ["storyboard"] },
      { id: "approve", label: "Approve anchor frames", role: "creative_producer", requiresApproval: true, inputKinds: ["image"], outputKinds: ["shot_references"] },
    ],
    reusable: true,
  },
  {
    id: "production-design",
    name: "Production Design",
    description: "Build locations, interiors, atmosphere and world rules that persist across the production.",
    steps: [
      { id: "research", label: "Research visual references", role: "production_designer", requiresApproval: false, inputKinds: ["brief", "url", "pdf"], outputKinds: ["reference_board"] },
      { id: "world", label: "Generate environment plates", role: "production_designer", requiresApproval: true, inputKinds: ["reference", "image"], outputKinds: ["world_reference"] },
      { id: "lock", label: "Lock world continuity", role: "creative_producer", requiresApproval: true, inputKinds: ["image"], outputKinds: ["world_lock"] },
    ],
    reusable: true,
  },
];

export const defaultPlaybook: Playbook = {
  id: "cinematic-default",
  name: "Cinematic Default",
  rules: [
    "Preserve locked character and world references.",
    "Generate storyboard anchors before expensive video generation.",
    "Route each shot by capability rather than using one model globally.",
    "Prefer licensed stock when generative control is unnecessary.",
    "Regenerate only failed or explicitly changed shots.",
    "Keep approved audio and timeline state unless explicitly changed.",
  ],
  defaultQuality: "pro",
  defaultApproval: "always_ask",
  preferredModels: ["Seedance 2.0", "Kling 3.0", "Veo 3.1", "GPT Image 2", "Seedream 5.0 Pro"],
};

export function addressGeneration(pageId: string, threadId: string, generationNumber: number) {
  return `${pageId}:${threadId}.${generationNumber}`;
}

export function shouldAskUser(step: z.infer<typeof workflowStepSchema>, mode: "autopilot" | "always_ask" | "review") {
  if (mode === "autopilot") return false;
  if (mode === "always_ask") return step.requiresApproval;
  return step.requiresApproval;
}
