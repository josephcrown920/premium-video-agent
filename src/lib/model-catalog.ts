import type { ModelCapability } from "./invideo-agent";

/**
 * Aurora model catalog. This is a capability registry, not a promise that
 * every vendor endpoint is configured. Availability is resolved at runtime.
 */
export const MODEL_CATALOG: ModelCapability[] = [
  {
    id: "seedance-2.0",
    provider: "BytePlus ModelArk",
    modality: "video",
    quality: 9.5,
    costPerUnit: 1.0,
    latencyMs: 12000,
    available: true,
    supportsReferences: true,
    supportsImageToVideo: true,
    supportsCameraControl: true,
    tags: ["continuity", "reference", "cinematic", "performance"],
  },
  {
    id: "kling-3.0",
    provider: "Kling",
    modality: "video",
    quality: 9.3,
    costPerUnit: 0.95,
    latencyMs: 14000,
    available: true,
    supportsReferences: true,
    supportsImageToVideo: true,
    supportsCameraControl: true,
    tags: ["motion", "camera", "performance"],
  },
  {
    id: "veo-3.1",
    provider: "Google",
    modality: "video",
    quality: 9.7,
    costPerUnit: 1.2,
    latencyMs: 18000,
    available: true,
    supportsReferences: true,
    supportsImageToVideo: true,
    supportsCameraControl: true,
    supportsAudio: true,
    tags: ["dialogue", "audio", "cinematic", "realism"],
  },
  {
    id: "sora-2",
    provider: "OpenAI",
    modality: "video",
    quality: 9.5,
    costPerUnit: 1.1,
    latencyMs: 20000,
    available: true,
    supportsReferences: true,
    supportsImageToVideo: true,
    tags: ["narrative", "cinematic", "motion"],
  },
  {
    id: "seedream-5.0-pro",
    provider: "BytePlus ModelArk",
    modality: "image",
    quality: 9.5,
    costPerUnit: 0.25,
    latencyMs: 7000,
    available: true,
    supportsReferences: true,
    supportsEditing: true,
    tags: ["character", "reference", "photoreal", "storyboard"],
  },
  {
    id: "gpt-image-2",
    provider: "OpenAI",
    modality: "image",
    quality: 9.4,
    costPerUnit: 0.3,
    latencyMs: 8000,
    available: true,
    supportsReferences: true,
    supportsEditing: true,
    tags: ["character", "editing", "storyboard", "text"],
  },
  {
    id: "nano-banana-pro",
    provider: "Google",
    modality: "image",
    quality: 9.4,
    costPerUnit: 0.28,
    latencyMs: 7500,
    available: true,
    supportsReferences: true,
    supportsEditing: true,
    tags: ["character", "editing", "reference"],
  },
  {
    id: "flux-2-create",
    provider: "Black Forest Labs",
    modality: "image",
    quality: 9.1,
    costPerUnit: 0.2,
    latencyMs: 6500,
    available: true,
    supportsReferences: true,
    tags: ["cinematic", "style", "concept"],
  },
  {
    id: "elevenlabs",
    provider: "ElevenLabs",
    modality: "audio",
    quality: 9.4,
    costPerUnit: 0.2,
    latencyMs: 5000,
    available: true,
    supportsAudio: true,
    tags: ["voice", "tts", "voice-clone"],
  },
  {
    id: "stock-agent",
    provider: "Licensed Stock Providers",
    modality: "stock",
    quality: 8.8,
    costPerUnit: 0.05,
    latencyMs: 1500,
    available: true,
    tags: ["stock", "licensed", "b-roll"],
  },
];

export function modelsForShot(input: {
  modality: ModelCapability["modality"];
  needsReferences?: boolean;
  needsCameraControl?: boolean;
  needsAudio?: boolean;
  tags?: string[];
}) {
  return MODEL_CATALOG
    .filter((model) => model.modality === input.modality && model.available)
    .filter((model) => !input.needsReferences || model.supportsReferences)
    .filter((model) => !input.needsCameraControl || model.supportsCameraControl)
    .filter((model) => !input.needsAudio || model.supportsAudio)
    .sort((a, b) => {
      const overlap = (model: ModelCapability) =>
        (input.tags ?? []).filter((tag) => model.tags?.includes(tag)).length;
      return overlap(b) - overlap(a) || b.quality - a.quality;
    });
}
