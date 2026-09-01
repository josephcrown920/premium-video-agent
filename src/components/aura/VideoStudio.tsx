import { useMemo, useState } from "react";
import {
  AudioLines,
  Camera,
  Check,
  ChevronDown,
  Clapperboard,
  Film,
  Grid3X3,
  Image as ImageIcon,
  Layers3,
  LayoutTemplate,
  ListVideo,
  Mic2,
  Music2,
  NotebookPen,
  Play,
  Plus,
  Search,
  Sparkles,
  Wand2,
  X,
} from "lucide-react";

const MODEL_GROUPS = {
  Video: [
    ["Seedance 2.0", "ByteDance", "video"],
    ["Kling 3.0", "Kling", "video"],
    ["Veo 3.1", "Google", "video"],
    ["Sora", "OpenAI", "video"],
    ["Seedance 1.5 Pro", "ByteDance", "video"],
  ],
  Image: [
    ["GPT Image 2", "OpenAI's latest image generation model", "image"],
    ["Nano Banana Pro", "Google's next-gen state-of-the-art model", "image"],
    ["Reve 2.1", "Reve's image model for text-to-image and editing", "image"],
    ["Seedream 5.0 Pro", "ByteDance's flagship high-fidelity image model", "image"],
    ["Seedream 5.0 Pro Layers", "Splits an image into editable layers", "image"],
    ["Nano Banana 2", "Google's advanced image model", "image"],
    ["Nano Banana 2 Lite", "Google's fast, lightweight image model", "image"],
    ["Kling 3.0 Image", "Kling's image generation and editing model", "image"],
    ["Seedream 5.0 Lite", "ByteDance's lightweight image model", "image"],
    ["Kling Image 01", "Kling's image editing model", "image"],
    ["P-Image", "PrunaAI's real-time image generation model", "image"],
    ["P-Image Edit", "PrunaAI's real-time image editing model", "image"],
    ["Qwen Image Layered", "Decomposes an image into multiple layers", "image"],
    ["Grok Imagine Image 2.0", "xAI's image generation and editing model", "image"],
    ["Grok Imagine", "xAI's text-to-image and image-to-image model", "image"],
    ["Flux 2 Create", "Flux's cinematic text-to-image model", "image"],
    ["Flux 2 Edit", "Flux's controllable image-to-image edit model", "image"],
  ],
  Audio: [
    ["Audio Separation", "Split a mixed track into stems", "audio"],
    ["CleanVoice", "Denoise, remove fillers and normalize speech", "audio"],
  ],
  Music: [
    ["Music Generator", "Generate music beds and variations", "music"],
    ["Stem Mixer", "Arrange generated and uploaded stems", "music"],
  ],
  "3D": [
    ["3D Scene Builder", "Build scene-ready 3D assets", "3d"],
    ["Image to 3D", "Turn reference images into 3D assets", "3d"],
  ],
  Tools: [
    ["Clarity Upscaler", "High-quality image upscaling", "tool"],
    ["P-Image Upscale", "PrunaAI image upscaler", "tool"],
    ["BytePlus Ultra HD", "Upscale images to ultra-high resolution", "tool"],
    ["Magnific Upscaler Creative", "Upscale with style optimization", "tool"],
    ["Magnific Upscaler Precision", "Upscale with detail enhancement", "tool"],
    ["Magnific Skin Enhancer", "Skin enhancement for images", "tool"],
    ["Looks", "Generate director-style cinematic variations", "tool"],
    ["Boards", "Generate a storyboard grid and extract shots", "tool"],
    ["Angles", "Generate camera-angle variations from a scene", "tool"],
  ],
} as const;

type Category = keyof typeof MODEL_GROUPS;
type ModelRow = (typeof MODEL_GROUPS)[Category][number];

const SECTIONS = [
  { id: "hook", title: "The One Hook", duration: "0:00–0:24", shots: 6 },
  { id: "verse", title: "Verse 1", duration: "0:24–0:52", shots: 8 },
  { id: "chorus", title: "Chorus", duration: "0:52–1:20", shots: 7 },
];

const BOARD_SHOTS = [
  ["01", "Cold open", "Josh waist-up, bottom-right", "24mm locked-off"],
  ["02", "Officers enter", "Two officers upper-left", "35mm wide"],
  ["03", "Hook performance", "Josh calm, subtle hands", "50mm medium"],
  ["04", "Glitch hold", "Less movement, obvious glitch", "50mm locked"],
  ["05", "The Look", "Glance over left shoulder", "85mm close"],
  ["06", "Walk out", "Josh exits, officers loop", "35mm wide"],
];

const ANGLES = [
  ["Locked-off wide", "24mm", "Full environment, no camera movement"],
  ["Medium performance", "50mm", "Waist-up lip-sync with natural motion"],
  ["Hero close", "85mm", "Face, jewelry and expression"],
  ["Over-shoulder", "50mm", "Look toward background action"],
  ["Low hero", "35mm", "Confident low-angle perspective"],
  ["Tracking", "35mm", "Follow subject while preserving continuity"],
];

function iconFor(kind: string) {
  if (kind === "video") return Film;
  if (kind === "image") return ImageIcon;
  if (kind === "audio") return AudioLines;
  if (kind === "music") return Music2;
  if (kind === "3d") return Grid3X3;
  return Wand2;
}

export function VideoStudio() {
  const [category, setCategory] = useState<Category>("Video");
  const [model, setModel] = useState("Seedance 2.0");
  const [modelOpen, setModelOpen] = useState(false);
  const [modelSearch, setModelSearch] = useState("");
  const [activeTool, setActiveTool] = useState<"context" | "notebook" | "boards" | "angles">("context");
  const [section, setSection] = useState("hook");
  const [prompt, setPrompt] = useState("");

  const filteredModels = useMemo(() => {
    const needle = modelSearch.trim().toLowerCase();
    return MODEL_GROUPS[category].filter(([name, description]) =>
      !needle || `${name} ${description}`.toLowerCase().includes(needle),
    );
  }, [category, modelSearch]);

  const activeSection = SECTIONS.find((item) => item.id === section) ?? SECTIONS[0];

  return (
    <div className="relative z-10 mx-auto w-full max-w-6xl px-3 pb-32 sm:px-5">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-background/90 py-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Clapperboard className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">Aurora Video Director</p>
            <p className="text-[11px] text-muted-foreground">InVideo-style production workspace</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-surface px-3 py-1.5 text-xs">
          <span className="size-1.5 rounded-full bg-emerald-400" />
          Project: <span className="font-medium">The One Hook</span>
        </div>
      </header>

      <div className="mt-5 grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-white/10 bg-surface/70 p-2">
          <p className="px-3 pb-2 pt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Studio</p>
          {[
            ["context", NotebookPen, "Context"],
            ["notebook", NotebookPen, "Notebook"],
            ["boards", LayoutTemplate, "Boards"],
            ["angles", Camera, "Angles"],
          ].map(([id, Icon, label]) => (
            <button
              key={id as string}
              onClick={() => setActiveTool(id as typeof activeTool)}
              className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${activeTool === id ? "bg-white/10 text-foreground" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"}`}
            >
              <Icon className="size-4" />
              {label as string}
            </button>
          ))}
          <div className="my-3 border-t border-white/5" />
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Sections</p>
          {SECTIONS.map((item) => (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              className={`w-full rounded-xl px-3 py-2 text-left ${section === item.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-white/5"}`}
            >
              <div className="text-xs font-medium">{item.title}</div>
              <div className="mt-0.5 text-[10px] opacity-70">{item.duration} · {item.shots} shots</div>
            </button>
          ))}
        </aside>

        <main className="min-w-0 space-y-4">
          <section className="rounded-2xl border border-white/10 bg-surface/70 p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Context</p>
                <h1 className="mt-1 text-xl font-semibold tracking-tight">{activeSection.title}</h1>
                <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Stretched from the source audio onto the real hook. Camera and continuity stay locked while background action loops underneath.</p>
              </div>
              <button className="rounded-xl border border-white/10 px-3 py-2 text-xs text-muted-foreground hover:bg-white/5">Edit context</button>
            </div>

            {activeTool === "context" && (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {[
                  ["Picture", "Josh already in, waist-up bottom-right. Officers start upper-left."],
                  ["Performance", "Subtle hands. Unbothered. Officers looping, going nowhere."],
                  ["Hold", "Less hands. The glitch is obvious."],
                  ["The Look", "Glance over left shoulder, calm smirk at the officers."],
                ].map(([title, body]) => (
                  <div key={title} className="rounded-xl border border-white/5 bg-background/40 p-3">
                    <p className="text-xs font-semibold">{title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{body}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTool === "notebook" && (
              <div className="mt-5 space-y-3">
                <div className="rounded-xl border border-white/5 bg-background/40 p-4">
                  <div className="flex items-center gap-2"><NotebookPen className="size-4 text-primary" /><span className="text-sm font-semibold">Artist Lore</span></div>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">NBA Josh. Young Black male rapper, athletic build, long dark dreadlocks with red-tipped strands, diamond chains, arm tattoos, calm fearless expression. Preserve identity across every shot.</p>
                </div>
                <div className="rounded-xl border border-white/5 bg-background/40 p-4">
                  <div className="flex items-center gap-2"><Layers3 className="size-4 text-primary" /><span className="text-sm font-semibold">Wardrobe lock</span></div>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">Red and black long-sleeve jersey, black pants, white sneakers with black sole, layered diamond chains. Wet from rain. No sunglasses on lip-sync shots.</p>
                </div>
                <div className="rounded-xl border border-white/5 bg-background/40 p-4">
                  <div className="flex items-center gap-2"><Mic2 className="size-4 text-primary" /><span className="text-sm font-semibold">Audio lock</span></div>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">The uploaded track is the master clock. Section timing, vocal cuts and lip-sync slices override generic scene duration.</p>
                </div>
              </div>
            )}

            {activeTool === "boards" && (
              <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {BOARD_SHOTS.map(([number, title, subject, lens]) => (
                  <button key={number} className="group overflow-hidden rounded-xl border border-white/10 bg-background/50 text-left transition hover:border-primary/30">
                    <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-white/10 via-white/5 to-primary/10">
                      <Play className="size-5 text-white/50 transition group-hover:text-white" />
                    </div>
                    <div className="p-3">
                      <div className="flex items-center justify-between"><span className="text-[10px] text-muted-foreground">SHOT {number}</span><span className="text-[10px] text-primary">{lens}</span></div>
                      <p className="mt-1 text-xs font-semibold">{title}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{subject}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {activeTool === "angles" && (
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {ANGLES.map(([title, lens, description]) => (
                  <button key={title} className="flex items-start gap-3 rounded-xl border border-white/10 bg-background/40 p-3 text-left hover:border-primary/30">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Camera className="size-4" /></div>
                    <div className="min-w-0"><div className="flex gap-2"><p className="text-xs font-semibold">{title}</p><span className="text-[10px] text-muted-foreground">{lens}</span></div><p className="mt-1 text-[11px] text-muted-foreground">{description}</p></div>
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-white/10 bg-surface/70 p-4">
            <div className="flex items-center justify-between">
              <div><p className="text-xs font-semibold">Layers</p><p className="mt-1 text-[11px] text-muted-foreground">Two plates composited on a slate. Track is the base audio.</p></div>
              <button className="rounded-lg border border-white/10 p-2 text-muted-foreground hover:bg-white/5"><Plus className="size-4" /></button>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-background/40 p-3"><div className="size-8 rounded-lg bg-primary/15" /><div className="flex-1"><p className="text-xs font-medium">Layer A · Josh</p><p className="text-[11px] text-muted-foreground">Waist-up lip-sync · bottom-right · 0:00–0:24.35</p></div><span className="rounded-full bg-emerald-400/10 px-2 py-1 text-[10px] text-emerald-300">Locked</span></div>
              <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-background/40 p-3"><div className="size-8 rounded-lg bg-white/10" /><div className="flex-1"><p className="text-xs font-medium">Layer B · Officers</p><p className="text-[11px] text-muted-foreground">2–3s full-body run · upper-left · loop to 25s</p></div><span className="rounded-full bg-emerald-400/10 px-2 py-1 text-[10px] text-emerald-300">Loop</span></div>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-surface/70 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><p className="text-xs font-semibold">Generate</p><p className="mt-1 text-[11px] text-muted-foreground">Choose a model, then generate into the active shot or section.</p></div>
              <button onClick={() => setModelOpen(true)} className="flex items-center gap-2 rounded-xl border border-white/10 bg-background/60 px-3 py-2 text-xs font-medium hover:bg-white/5"><Sparkles className="size-3.5 text-primary" />{model}<ChevronDown className="size-3.5 text-muted-foreground" /></button>
            </div>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {(Object.keys(MODEL_GROUPS) as Category[]).map((item) => (
                <button key={item} onClick={() => setCategory(item)} className={`rounded-full px-3 py-1.5 text-[11px] ${category === item ? "bg-white text-black" : "bg-white/5 text-muted-foreground hover:text-foreground"}`}>{item}</button>
              ))}
            </div>
            <div className="mt-3 rounded-xl border border-white/5 bg-background/40 p-3">
              <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={3} placeholder="Describe the shot, motion, performance or visual change…" className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
              <div className="mt-3 flex items-center justify-between"><span className="text-[10px] text-muted-foreground">Continuity locks active · {activeSection.title}</span><button className="rounded-xl bg-white px-4 py-2 text-xs font-semibold text-black">Generate</button></div>
            </div>
          </section>
        </main>
      </div>

      {modelOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-2 backdrop-blur-sm sm:items-center sm:p-6" onClick={() => setModelOpen(false)}>
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#1b1b1b] shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-white/10 p-4"><div><p className="font-semibold">Select model</p><p className="mt-0.5 text-[11px] text-muted-foreground">Video, image, audio, music, 3D and production tools</p></div><button onClick={() => setModelOpen(false)}><X className="size-5 text-muted-foreground" /></button></div>
            <div className="p-3"><div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2"><Search className="size-4 text-muted-foreground" /><input value={modelSearch} onChange={(e) => setModelSearch(e.target.value)} placeholder="Search models" className="w-full bg-transparent text-sm outline-none" /></div></div>
            <div className="flex gap-1 overflow-x-auto px-3 pb-3">{(Object.keys(MODEL_GROUPS) as Category[]).map((item) => <button key={item} onClick={() => setCategory(item)} className={`rounded-lg px-3 py-2 text-xs ${category === item ? "bg-white/10 text-white" : "text-muted-foreground"}`}>{item}</button>)}</div>
            <div className="overflow-y-auto px-3 pb-4">
              {filteredModels.map(([name, description, kind]) => { const Icon = iconFor(kind); return <button key={name} onClick={() => { setModel(name); setModelOpen(false); }} className="flex w-full items-center gap-3 rounded-xl p-3 text-left hover:bg-white/5"><div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-white/5"><Icon className="size-5 text-muted-foreground" /></div><div className="min-w-0 flex-1"><p className="text-sm font-medium">{name}</p><p className="mt-0.5 text-[11px] text-muted-foreground">{description}</p></div>{model === name && <Check className="size-4 text-primary" />}</button>; })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
