import { z } from "zod";

/**
 * Aurora's InVideo-style production contract.
 *
 * The important architectural rule is that the agent does not own a chat
 * transcript and then throw clips over the wall. It operates a persistent
 * project graph. Context, generations, approvals, Slate edits, model choices,
 * and revisions all become addressable project state.
 */

export const aspectRatioSchema = z.enum(["16:9", "9:16", "1:1", "4:5"]);
export const qualityTierSchema = z.enum(["basic", "pro", "ultra"]);
export const approvalModeSchema = z.enum(["autopilot", "always_ask", "review"]).default("always_ask");

export const agentRoleSchema = z.enum([
  "creative_producer",
  "scriptwriter",
  "storyboard_artist",
  "director",
  "cinematographer",
  "casting",
  "production_designer",
  "editor",
  "sound_designer",
  "music_designer",
  "colorist",
  "caption_translator",
  "qa_reviewer",
]);

export const contextItemSchema = z.object({
  id: z.string(),
  type: z.enum(["brief", "script", "pdf", "image", "video", "audio", "url", "reference", "style", "character", "location", "shotlist"]),
  title: z.string(),
  uri: z.string().optional(),
  content: z.string().optional(),
  tags: z.array(z.string()).default([]),
  locked: z.boolean().default(false),
  createdAt: z.string().default(() => new Date().toISOString()),
});

export const notebookGenerationSchema = z.object({
  id: z.string(),
  threadId: z.string(),
  pageId: z.string(),
  modelId: z.string(),
  modality: z.enum(["image", "video", "audio", "music"]),
  prompt: z.string(),
  references: z.array(z.string()).default([]),
  outputAssetIds: z.array(z.string()).default([]),
  annotations: z.array(z.string()).default([]),
  approved: z.boolean().default(false),
});

export const notebookPageSchema = z.object({
  id: z.string(),
  title: z.string(),
  purpose: z.string().optional(),
  generationIds: z.array(z.string()).default([]),
  locked: z.boolean().default(false),
});

export const shotSchema = z.object({
  id: z.string(),
  sceneId: z.string(),
  order: z.number().int().nonnegative(),
  duration: z.number().positive(),
  prompt: z.string(),
  references: z.array(z.string()).default([]),
  camera: z.object({
    framing: z.string().optional(),
    lens: z.string().optional(),
    angle: z.string().optional(),
    movement: z.string().optional(),
    speed: z.string().optional(),
    focus: z.string().optional(),
    lighting: z.string().optional(),
  }).default({}),
  behavior: z.object({
    pose: z.string().optional(),
    gaze: z.string().optional(),
    expression: z.string().optional(),
    action: z.string().optional(),
    beat: z.string().optional(),
  }).default({}),
  continuityLocks: z.array(z.string()).default([]),
  status: z.enum(["planned", "generating", "qa", "approved", "failed"]).default("planned"),
  selectedAssetId: z.string().optional(),
});

export const slateOperationSchema = z.object({
  id: z.string(),
  type: z.enum([
    "insert",
    "remove",
    "replace",
    "trim",
    "split",
    "move",
    "speed",
    "volume",
    "opacity",
    "reframe",
    "caption",
    "transition",
    "regenerate",
  ]),
  targetId: z.string(),
  before: z.unknown().optional(),
  after: z.unknown().optional(),
  reversible: z.boolean().default(true),
});

export const productionPlanSchema = z.object({
  projectId: z.string(),
  title: z.string(),
  objective: z.string(),
  duration: z.number().positive(),
  aspectRatio: aspectRatioSchema,
  qualityTier: qualityTierSchema.default("pro"),
  approvalMode: approvalModeSchema,
  context: z.array(contextItemSchema).default([]),
  scenes: z.array(z.object({
    id: z.string(),
    order: z.number().int().nonnegative(),
    title: z.string(),
    purpose: z.string(),
    shotIds: z.array(z.string()),
  })),
  shots: z.array(shotSchema),
  assets: z.array(z.object({
    id: z.string(),
    kind: z.enum(["stock", "image", "video", "voice", "music", "sfx", "reference"]),
    source: z.string(),
    provider: z.string().optional(),
    approved: z.boolean().default(false),
    license: z.string().optional(),
  })).default([]),
  notebook: z.object({
    pages: z.array(notebookPageSchema).default([]),
    generations: z.array(notebookGenerationSchema).default([]),
  }).default({}),
  timeline: z.array(z.object({
    id: z.string(),
    track: z.enum(["video", "image", "voice", "music", "sfx", "text", "captions"]),
    assetId: z.string(),
    start: z.number().nonnegative(),
    duration: z.number().positive(),
    trimStart: z.number().nonnegative().default(0),
    speed: z.number().positive().default(1),
  })).default([]),
  slateHistory: z.array(slateOperationSchema).default([]),
  memory: z.object({
    characterLocks: z.array(z.string()).default([]),
    worldLocks: z.array(z.string()).default([]),
    styleLocks: z.array(z.string()).default([]),
    brandRules: z.array(z.string()).default([]),
    approvedModels: z.array(z.string()).default([]),
  }).default({}),
});

export type ProductionPlan = z.infer<typeof productionPlanSchema>;
export type Shot = z.infer<typeof shotSchema>;
export type SlateOperation = z.infer<typeof slateOperationSchema>;

export type ModelCapability = {
  id: string;
  provider: string;
  modality: "video" | "image" | "audio" | "music" | "stock" | "render";
  quality: number;
  costPerUnit: number;
  latencyMs: number;
  available: boolean;
  supportsReferences?: boolean;
  supportsImageToVideo?: boolean;
  supportsCameraControl?: boolean;
  supportsAudio?: boolean;
  supportsEditing?: boolean;
  maxDuration?: number;
  tags?: string[];
};

/** Score models per-shot instead of hard-coding one model for the whole film. */
export function rankModels(candidates: ModelCapability[], requirements: Partial<ModelCapability> = {}) {
  return candidates
    .filter((candidate) => candidate.available)
    .filter((candidate) => !requirements.modality || candidate.modality === requirements.modality)
    .sort((a, b) => {
      const score = (model: ModelCapability) =>
        model.quality * 0.45 +
        (model.supportsReferences ? 0.12 : 0) +
        (model.supportsCameraControl ? 0.12 : 0) +
        (model.supportsImageToVideo ? 0.08 : 0) +
        (model.supportsAudio ? 0.05 : 0) -
        model.costPerUnit * 0.1 -
        model.latencyMs / 100000;
      return score(b) - score(a);
    });
}

/** InVideo-style stock-first decision: don't spend generation credits when licensed media is enough. */
export function chooseAssetStrategy(input: {
  needsGenerativeControl: boolean;
  needsCharacterContinuity: boolean;
  needsExactProduct: boolean;
  stockAvailable: boolean;
}) {
  if (input.needsGenerativeControl || input.needsCharacterContinuity || input.needsExactProduct) return "generate" as const;
  if (input.stockAvailable) return "stock" as const;
  return "generate" as const;
}

/** Compile an agent command into a reversible Slate patch. */
export function buildRevisionPlan(command: string, plan: ProductionPlan) {
  const normalized = command.toLowerCase();
  const affectedShots = plan.shots.filter((shot) => {
    const shotId = shot.id.toLowerCase();
    const scene = plan.scenes.find((item) => item.id === shot.sceneId);
    const sceneTitle = scene?.title.toLowerCase() ?? "";
    return normalized.includes(shotId) || normalized.includes(sceneTitle) || normalized.includes(`scene ${shot.sceneId.toLowerCase()}`);
  });

  const regenerate = /replace|regenerate|change|make .* darker|make .* brighter|different|new shot|camera|lighting|wardrobe/i.test(command);
  const preserve = [
    "project context",
    "approved references",
    "unaffected shots",
    "unaffected timeline positions",
    "voice unless explicitly changed",
    "music unless explicitly changed",
  ];

  const operations: SlateOperation[] = affectedShots.map((shot) => ({
    id: `op-${shot.id}`,
    type: regenerate ? "regenerate" : "replace",
    targetId: shot.id,
    before: { selectedAssetId: shot.selectedAssetId },
    after: { instruction: command },
    reversible: true,
  }));

  return {
    command,
    affectedShots: affectedShots.map((shot) => shot.id),
    preserve,
    operations,
    requiresGeneration: regenerate,
  };
}

/** Notebook handoff: manual work becomes first-class project state. */
export function approveNotebookGeneration(plan: ProductionPlan, generationId: string, assetIds: string[]) {
  const generation = plan.notebook.generations.find((item) => item.id === generationId);
  if (!generation) throw new Error(`Notebook generation ${generationId} not found`);
  generation.approved = true;
  generation.outputAssetIds = assetIds;
  return { generationId, assetIds, handoff: "project_context" as const };
}

/** Vision modes mirror the production role of Boards, Looks and Angles. */
export const visionModes = [
  { id: "boards", purpose: "Generate a 3×3 storyboard sequence from the held project context." },
  { id: "looks", purpose: "Lock character appearance, wardrobe, lighting, palette and art direction." },
  { id: "angles", purpose: "Generate camera-perspective alternatives while preserving identity and world continuity." },
] as const;

export const agentCrew = [
  "creative_producer",
  "scriptwriter",
  "storyboard_artist",
  "director",
  "cinematographer",
  "casting",
  "production_designer",
  "editor",
  "sound_designer",
  "music_designer",
  "colorist",
  "caption_translator",
  "qa_reviewer",
] as const;

export const autonomousPipeline = [
  "ingest_inputs",
  "understand_intent",
  "load_context",
  "ask_only_blocking_questions",
  "research",
  "script",
  "lock_characters_and_world",
  "storyboard",
  "director_breakdown",
  "choose_stock_or_generation",
  "route_each_generation_to_best_model",
  "generate_candidates",
  "inspect_outputs",
  "score_candidates",
  "request_approval_when_required",
  "assemble_slate",
  "apply_natural_language_edits_as_reversible_diffs",
  "captions_and_audio",
  "visual_and_audio_qa",
  "targeted_regeneration",
  "render",
  "verify",
  "repurpose",
] as const;

export const invideoParityFeatures = {
  agent: ["persistent context", "expert crew", "multi-input", "autonomous planning"],
  production: ["script", "storyboard", "casting", "production design", "shot planning", "model routing"],
  vision: ["boards", "looks", "angles", "frame extraction", "reference handoff"],
  notebook: ["pages", "threads", "manual model selection", "edit-on-frame", "agent handoff"],
  slate: ["timeline", "conversational edits", "reversible operations", "user media", "captions", "audio"],
  workflows: ["guided workflows", "approval checkpoints", "reusable workflow definitions"],
  playbooks: ["standing creative rules", "quality tiers", "per-project process"],
  stock: ["agentic stock selection", "license-aware reuse", "stock-before-generation"],
  delivery: ["multi-aspect repurposing", "render verification", "versioned outputs"],
} as const;
