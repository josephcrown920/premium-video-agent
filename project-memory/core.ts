/**
 * Shared project-memory contract for Aurora video agents.
 * Context = active production truth. Notebook = persistent project knowledge.
 * Locks and acceptance criteria are hard production constraints.
 */

export type MemoryStatus = "DRAFT" | "PROPOSED" | "APPROVED" | "LOCKED" | "REJECTED" | "ARCHIVED";
export type ReferenceRole = "AUTHORITATIVE" | "SUPPORTING" | "EXPLORATORY" | "REJECTED";
export type NotebookType = "character" | "identity" | "face" | "body" | "hair" | "tattoo" | "jewelry" | "wardrobe" | "location" | "world" | "prop" | "style" | "camera" | "lighting" | "prompt_recipe" | "playbook" | "story" | "scene" | "shot" | "reference" | "continuity_rule" | "approved_generation" | "rejected_generation" | "lesson" | "general";
export type LockType = "identity" | "face" | "body" | "hair" | "wardrobe" | "location" | "world" | "camera" | "style" | "composition" | "performance" | "audio" | "continuity" | "brand" | "custom";

export interface ReferenceAsset { id: string; title: string; uri: string; purpose: string; role: ReferenceRole; tags: string[]; approvedAt?: string; }
export interface ContextSection { id: string; key: string; title: string; content: string; status: MemoryStatus; locked: boolean; referenceIds: string[]; tags: string[]; updatedAt: string; }
export interface NotebookEntry { id: string; type: NotebookType; title: string; content: string; status: MemoryStatus; tags: string[]; referenceIds: string[]; linkedIds: string[]; confidence: number; source?: string; updatedAt: string; }
export interface ProductionLock { id: string; type: LockType; title: string; rule: string; status: "APPROVED" | "LOCKED"; scope: string[]; referenceIds: string[]; }
export interface AcceptanceCriterion { id: string; rule: string; required: boolean; scope: string[]; }
export interface GenerationRecord { id: string; taskType: string; prompt: string; contextIds: string[]; notebookIds: string[]; referenceIds: string[]; lockIds: string[]; modelId?: string; assetIds: string[]; status: "GENERATED" | "APPROVED" | "REJECTED"; failureCodes: string[]; createdAt: string; }
export interface ContinuityEvent { id: string; generationId: string; kind: "IDENTITY_DRIFT" | "WARDROBE_DRIFT" | "HAIR_DRIFT" | "TATTOO_DRIFT" | "JEWELRY_DRIFT" | "LOCATION_DRIFT" | "LIGHTING_DRIFT" | "CAMERA_DRIFT" | "COMPOSITION_DRIFT" | "STYLE_DRIFT" | "OTHER"; detail: string; createdAt: string; }

export interface ProjectMemory {
  projectId: string;
  context: ContextSection[];
  notebook: NotebookEntry[];
  references: ReferenceAsset[];
  locks: ProductionLock[];
  acceptance: AcceptanceCriterion[];
  generations: GenerationRecord[];
  continuity: ContinuityEvent[];
}

const normalize = (s: string) => s.toLowerCase().trim();
const tokens = (s: string) => normalize(s).split(/[^a-z0-9]+/).filter(Boolean);

const taskKeywords: Record<string, string[]> = {
  FACE_GENERATION: ["face", "identity", "hair"],
  CHARACTER_GENERATION: ["character", "identity", "face", "body", "hair", "tattoo", "jewelry"],
  WARDROBE_GENERATION: ["wardrobe", "clothing", "jewelry", "hair"],
  LOCATION_GENERATION: ["location", "world", "lighting", "style"],
  PERFORMANCE_GENERATION: ["character", "performance", "wardrobe", "location", "camera"],
  LIP_SYNC_GENERATION: ["face", "identity", "hair", "wardrobe", "performance", "audio", "camera"],
  VIDEO_SHOT_GENERATION: ["character", "identity", "wardrobe", "location", "world", "camera", "style", "continuity"],
  STORYBOARD_GENERATION: ["story", "scene", "shot", "character", "location", "camera", "style"],
  FINAL_ASSEMBLY: ["shot", "audio", "continuity", "style", "camera"],
};

export function retrieveProjectMemory(memory: ProjectMemory, taskType: string, query = "") {
  const keys = new Set([...(taskKeywords[taskType] ?? []), ...tokens(query)]);
  const score = (text: string) => tokens(text).reduce((n, t) => n + (keys.has(t) ? 1 : 0), 0);
  const relevantContext = memory.context.filter(x => x.locked || score(`${x.key} ${x.title} ${x.content} ${x.tags.join(" ")}`) > 0);
  const relevantNotebook = memory.notebook.filter(x => ["APPROVED", "LOCKED"].includes(x.status) || score(`${x.type} ${x.title} ${x.content} ${x.tags.join(" ")}`) > 0).sort((a,b) => Number(b.status === "LOCKED") - Number(a.status === "LOCKED"));
  const relevantRefs = memory.references.filter(r => r.role !== "REJECTED" && (relevantContext.some(c => c.referenceIds.includes(r.id)) || relevantNotebook.some(n => n.referenceIds.includes(r.id)) || score(`${r.title} ${r.purpose} ${r.tags.join(" ")}`) > 0));
  const relevantLocks = memory.locks.filter(l => l.status === "LOCKED" || l.scope.length === 0 || l.scope.some(s => keys.has(normalize(s))));
  const relevantAcceptance = memory.acceptance.filter(a => a.scope.length === 0 || a.scope.some(s => keys.has(normalize(s))) || taskType === "VIDEO_SHOT_GENERATION" || taskType === "LIP_SYNC_GENERATION");
  const recentFailures = memory.generations.filter(g => g.status === "REJECTED").slice(-10);
  return { context: relevantContext, notebook: relevantNotebook, references: relevantRefs, locks: relevantLocks, acceptance: relevantAcceptance, recentFailures };
}

export function buildGenerationContext(memory: ProjectMemory, taskType: string, userInstruction: string) {
  const retrieved = retrieveProjectMemory(memory, taskType, userInstruction);
  return {
    projectId: memory.projectId,
    taskType,
    userInstruction,
    ...retrieved,
    priority: ["HARD_LOCKS", "AUTHORITATIVE_REFERENCES", "ACCEPTANCE_CRITERIA", "ACTIVE_CONTEXT", "APPROVED_NOTEBOOK", "APPROVED_GENERATIONS", "GENERAL_NOTES", "USER_INSTRUCTION", "MODEL_DEFAULTS"],
  };
}

export function checkLockConflicts(instruction: string, locks: ProductionLock[]) {
  const text = normalize(instruction);
  return locks.filter(lock => {
    const rule = normalize(lock.rule);
    if (rule.includes("no sunglasses") && text.includes("sunglasses")) return true;
    if (rule.includes("camera locked") && /(camera|pan|zoom|dolly|handheld|tracking)/.test(text)) return true;
    return false;
  });
}

export function approveGeneration(memory: ProjectMemory, generationId: string, assetIds: string[]) {
  const g = memory.generations.find(x => x.id === generationId);
  if (!g) throw new Error(`Generation ${generationId} not found`);
  g.status = "APPROVED"; g.assetIds = assetIds;
  return g;
}

export function rejectGeneration(memory: ProjectMemory, generationId: string, failureCodes: string[], detail = "") {
  const g = memory.generations.find(x => x.id === generationId);
  if (!g) throw new Error(`Generation ${generationId} not found`);
  g.status = "REJECTED"; g.failureCodes = failureCodes;
  if (detail) memory.continuity.push({ id: `continuity-${Date.now()}`, generationId, kind: failureCodes[0] as ContinuityEvent["kind"] || "OTHER", detail, createdAt: new Date().toISOString() });
  return g;
}

export function toPromptContext(ctx: ReturnType<typeof buildGenerationContext>) {
  return [
    `PROJECT: ${ctx.projectId}`,
    `TASK: ${ctx.taskType}`,
    "HARD LOCKS:", ...ctx.locks.map(x => `- ${x.title}: ${x.rule}`),
    "ACCEPTANCE:", ...ctx.acceptance.map(x => `- ${x.rule}`),
    "ACTIVE CONTEXT:", ...ctx.context.map(x => `- ${x.title}: ${x.content}`),
    "APPROVED NOTEBOOK:", ...ctx.notebook.filter(x => ["APPROVED", "LOCKED"].includes(x.status)).map(x => `- ${x.type}/${x.title}: ${x.content}`),
    "AUTHORITATIVE REFERENCES:", ...ctx.references.filter(x => x.role === "AUTHORITATIVE").map(x => `- ${x.title}: ${x.uri}`),
    "RECENT FAILURES TO AVOID:", ...ctx.recentFailures.flatMap(x => x.failureCodes.map(c => `- ${c}`)),
    `USER INSTRUCTION: ${ctx.userInstruction}`,
  ].join("\n");
}
