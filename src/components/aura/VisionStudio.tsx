import { useMemo, useState } from "react";
import { ArrowRight, Camera, Check, Download, Eye, Grid3X3, Image as ImageIcon, Layers3, Play, RotateCcw, Sparkles, Wand2 } from "lucide-react";

const FRAMES = [
  ["01", "Establishing", "Josh waist-up, wet night street, officers distant", "24mm wide"],
  ["02", "Entrance", "Officers begin running into the upper-left", "35mm wide"],
  ["03", "Performance", "Josh calm, subtle hands, locked identity", "50mm medium"],
  ["04", "Hold", "Less movement, visible glitch, same lighting", "50mm locked"],
  ["05", "The Look", "Glance over left shoulder, calm smirk", "85mm close"],
  ["06", "Reaction", "Officers loop behind him, Josh stays composed", "50mm OTS"],
  ["07", "Hero", "Chain and face detail, rain highlights", "85mm hero"],
  ["08", "Exit", "Josh turns and walks out of frame", "35mm tracking"],
  ["09", "End beat", "Empty wet street, officers still running", "24mm locked"],
] as const;

const VISION_MODES = [
  ["Storyboard", "3×3 visual sequence with persistent character, lighting and art direction."],
  ["Look", "Lock the visual language, wardrobe, palette and lighting across every frame."],
  ["Angles", "Generate camera-angle alternatives without losing the selected frame's identity."],
  ["Frame analysis", "Inspect composition, identity, wardrobe, objects, lighting and continuity."],
];

export function VisionStudio() {
  const [prompt, setPrompt] = useState("NBA Josh on a wet urban street at night, calm fearless performance while two police officers run endlessly behind him. Cinematic, high contrast, locked continuity.");
  const [mode, setMode] = useState("Storyboard");
  const [selected, setSelected] = useState("05");
  const [generated, setGenerated] = useState(true);

  const selectedFrame = useMemo(() => FRAMES.find(([id]) => id === selected) ?? FRAMES[0], [selected]);

  return (
    <main className="min-h-screen bg-background px-3 py-5 text-foreground sm:px-6">
      <div className="mx-auto max-w-6xl space-y-4">
        <header className="flex items-center justify-between rounded-2xl border border-white/10 bg-surface/80 px-4 py-3 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/15 text-primary"><Eye className="size-5" /></div>
            <div><p className="text-sm font-semibold">Vision</p><p className="text-[11px] text-muted-foreground">Pre-production visual intelligence</p></div>
          </div>
          <div className="rounded-full border border-white/10 px-3 py-1.5 text-[11px] text-muted-foreground">9 frames · continuity locked</div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="space-y-3 rounded-2xl border border-white/10 bg-surface/70 p-3">
            <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Vision tools</p>
            {VISION_MODES.map(([name, description]) => (
              <button key={name} onClick={() => setMode(name)} className={`w-full rounded-xl border p-3 text-left transition ${mode === name ? "border-primary/40 bg-primary/10" : "border-white/5 bg-background/30 hover:bg-white/5"}`}>
                <div className="flex items-center gap-2"><Sparkles className={`size-4 ${mode === name ? "text-primary" : "text-muted-foreground"}`} /><span className="text-xs font-semibold">{name}</span>{mode === name && <Check className="ml-auto size-3.5 text-primary" />}</div>
                <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">{description}</p>
              </button>
            ))}
            <div className="border-t border-white/5 pt-3">
              <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Reference state</p>
              <div className="mt-2 space-y-2 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-2"><Layers3 className="size-3.5" /> Character identity locked</div>
                <div className="flex items-center gap-2"><ImageIcon className="size-3.5" /> Wardrobe reference locked</div>
                <div className="flex items-center gap-2"><Camera className="size-3.5" /> Camera grammar preserved</div>
              </div>
            </div>
          </aside>

          <section className="min-w-0 rounded-2xl border border-white/10 bg-surface/70 p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><p className="text-xs text-muted-foreground">Vision · {mode}</p><h1 className="mt-1 text-xl font-semibold">Build the visual language before video</h1><p className="mt-1 max-w-2xl text-xs leading-relaxed text-muted-foreground">Vision turns the brief into a consistent 3×3 storyboard. Approve a frame, extract it, change its angle, or send it directly into video generation instead of rebuilding the whole sequence.</p></div>
              <button onClick={() => setGenerated(true)} className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-black"><Wand2 className="size-3.5" /> Generate 3×3</button>
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-background/50 p-3">
              <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={3} className="w-full resize-none bg-transparent text-sm leading-relaxed outline-none placeholder:text-muted-foreground" />
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2"><span className="text-[10px] text-muted-foreground">Uses Context + Notebook + approved references</span><button className="rounded-lg border border-white/10 px-3 py-1.5 text-[10px] hover:bg-white/5">Add reference</button></div>
            </div>

            {generated && <div className="mt-4 grid grid-cols-3 gap-2">
              {FRAMES.map(([id, title, description, lens]) => (
                <button key={id} onClick={() => setSelected(id)} className={`group overflow-hidden rounded-xl border text-left transition ${selected === id ? "border-primary/60 ring-1 ring-primary/30" : "border-white/10 hover:border-white/20"}`}>
                  <div className="relative aspect-square bg-gradient-to-br from-primary/20 via-white/5 to-black">
                    <div className="absolute inset-0 flex items-center justify-center"><Grid3X3 className="size-7 text-white/20" /></div>
                    <span className="absolute left-2 top-2 rounded-md bg-black/60 px-1.5 py-1 text-[9px] font-semibold">{id}</span>
                    {selected === id && <span className="absolute right-2 top-2 rounded-full bg-primary p-1"><Check className="size-3 text-white" /></span>}
                  </div>
                  <div className="p-2.5"><div className="flex items-center justify-between gap-2"><span className="text-[10px] font-semibold">{title}</span><span className="text-[9px] text-primary">{lens}</span></div><p className="mt-1 line-clamp-2 text-[9px] leading-relaxed text-muted-foreground">{description}</p></div>
                </button>
              ))}
            </div>}
          </section>
        </section>

        <section className="rounded-2xl border border-white/10 bg-surface/70 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-semibold">Selected frame · {selectedFrame[0]}</p><p className="mt-1 text-[11px] text-muted-foreground">{selectedFrame[1]} · {selectedFrame[3]}</p></div><div className="flex flex-wrap gap-2"><button className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-[10px] hover:bg-white/5"><RotateCcw className="size-3.5" /> Regenerate frame</button><button className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-[10px] hover:bg-white/5"><Download className="size-3.5" /> Extract image</button><button className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-[10px] font-semibold text-black"><ArrowRight className="size-3.5" /> Send to video</button></div></div>
        </section>
      </div>
    </main>
  );
}
