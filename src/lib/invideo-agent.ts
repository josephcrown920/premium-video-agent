import { z } from "zod";

/**
 * InVideo-class autonomous production contract.
 * The agent operates on a persistent project graph rather than generating
 * disconnected clips. Providers are implementation details behind this plan.
 */

export const aspectRatioSchema = z.enum(["16:9", "9:16", "1:1", "4:5"]);
export const shotSchema = z.object({
  id: z.string(),
  sceneId: z.string(),
  duration: z.number().positive(),
  prompt: z.string(),
  references: z.array(z.string()).default([]),
  camera: z.object({
    framing: z.string().optional(),
    lens: z.string().optional(),
    angle: z.string().optional(),
    movement: z.string().optional(),
  }).default({}),
  continuityLocks: z.array(z.string()).default([]),
  status: z.enum(["planned", "generating", "qa", "approved", "failed"]).default("planned"),
});

export const productionPlanSchema = z.object({
  projectId: z.string(),
  title: z.string(),
  objective: z.string(),
  duration: z.number().positive(),
  aspectRatio: aspectRatioSchema,
  scenes: z.array(z.object({
    id: z.string(),
    title: z.string(),
    purpose: z.string(),
    shotIds: z.array(z.string()),
  })),
  shots: z.array(shotSchema),
  assets: z.array(z.object({
    id: z.string(),
    kind: z.enum(["stock", "image", "video", "voice", "music", "sfx", "reference"]),
    source: z.string(),
    approved: z.boolean().default(false),
  })).default([]),
  timeline: z.array(z.object({
    id: z.string(),
    track: z.enum(["video", "image", "voice", "music", "sfx", "text", "captions"]),
    assetId: z.string(),
    start: z.number().nonnegative(),
    duration: z.number().positive(),
  })).default([]),
});

export type ProductionPlan = z.infer<typeof productionPlanSchema>;
export type Shot = z.infer<typeof shotSchema>;

export type ProviderCapability = {
  provider: string;
  modality: "video" | "image" | "audio" | "stock" | "render";
  score: number;
  cost: number;
  latency: number;
  available: boolean;
  supportsReferences?: boolean;
  supportsCameraControl?: boolean;
};

export function rankProviders(candidates: ProviderCapability[], requirements: Partial<ProviderCapability> = {}) {
  return candidates
    .filter((candidate) => candidate.available)
    .filter((candidate) => !requirements.modality || candidate.modality === requirements.modality)
    .sort((a, b) => {
      const aScore = a.score * 0.5 + (a.supportsReferences ? 0.15 : 0) + (a.supportsCameraControl ? 0.15 : 0) - a.cost * 0.1 - a.latency * 0.1;
      const bScore = b.score * 0.5 + (b.supportsReferences ? 0.15 : 0) + (b.supportsCameraControl ? 0.15 : 0) - b.cost * 0.1 - b.latency * 0.1;
      return bScore - aScore;
    });
}

export function buildRevisionPlan(command: string, plan: ProductionPlan) {
  const normalized = command.toLowerCase();
  const affectedShots = plan.shots.filter((shot) =>
    normalized.includes(shot.id.toLowerCase()) || normalized.includes(`scene ${shot.sceneId.toLowerCase()}`),
  );

  return {
    command,
    affectedShots: affectedShots.map((shot) => shot.id),
    preserve: ["project state", "approved assets", "unaffected timeline", "voice unless explicitly changed"],
    operations: [
      "parse natural-language edit",
      "compile reversible timeline diff",
      "regenerate only affected media",
      "run QA on changed shots",
      "replace approved clips without rebuilding the project",
    ],
  };
}

export function autonomousPipeline() {
  return [
    "understand",
    "research",
    "script",
    "storyboard",
    "asset selection",
    "director planning",
    "provider routing",
    "generation",
    "inspect",
    "score",
    "targeted revision",
    "assemble slate",
    "captions",
    "audio mix",
    "QA",
    "render",
    "verify",
    "repurpose",
  ] as const;
}
