import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Sparkles,
  Code2,
  ImageIcon,
  Mic,
  Paperclip,
  Globe,
  ArrowUp,
  ChevronRight,
  Plus,
  Clock,
  Zap,
  Wand2,
  LayoutGrid,
  MoreHorizontal,
} from "lucide-react";

import heroCity from "../assets/hero-city.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aura AI — Premium Generative Workspace" },
      {
        name: "description",
        content:
          "Create hyper-real visuals, review complex logic, and generate world-class work in seconds with Aura AI.",
      },
      {
        property: "og:title",
        content: "Aura AI — Premium Generative Workspace",
      },
      {
        property: "og:description",
        content:
          "Create hyper-real visuals, review complex logic, and generate world-class work in seconds with Aura AI.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://cdn.gpteng.co/blank-app-v1.svg" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:image",
        content: "https://cdn.gpteng.co/blank-app-v1.svg",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [prompt, setPrompt] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [greeting, setGreeting] = useState("Good evening");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  const quickActions = [
    {
      icon: Sparkles,
      label: "Imagine",
      description: "Generate hyper-real visuals",
      color: "primary",
      pulse: true,
    },
    {
      icon: Code2,
      label: "Architect",
      description: "Review and write complex logic",
      color: "emerald",
      pulse: false,
    },
  ];

  const recentDrafts = [
    {
      title: "Neon Cyberpunk Cityscape",
      subtitle: "Visual Gen • 2h ago",
      image: heroCity,
      active: true,
    },
    {
      title: "Orbital Brand Identity",
      subtitle: "Brand Kit • 5h ago",
      active: false,
    },
    {
      title: "Quantum Interface System",
      subtitle: "UI/UX • 1d ago",
      active: false,
    },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-background text-foreground">
      {/* Ambient background layers */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(139,92,246,0.18),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(217,70,239,0.12),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_60%,rgba(139,92,246,0.08),transparent_40%)]" />
        <div className="absolute inset-0 bg-noise opacity-[0.025]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="animate-fade-in flex items-center justify-between pt-6 pb-4 sm:pt-8 sm:pb-6">
          <div className="flex items-center gap-3">
            <div className="relative flex size-9 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-fuchsia-500 shadow-lg shadow-primary/20">
              <Zap className="size-4 fill-white text-white" />
              <div className="absolute -inset-1 rounded-full bg-primary/20 blur-md" />
            </div>
            <span className="text-base font-semibold tracking-tight">Aura AI</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button className="hidden sm:flex items-center gap-2 rounded-full border border-white/10 bg-surface/50 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm transition-colors hover:bg-surface hover:text-foreground">
              <Plus className="size-3.5" />
              New project
            </button>
            <button className="flex size-9 items-center justify-center rounded-full border border-white/10 bg-surface/50 backdrop-blur-sm transition-colors hover:bg-surface">
              <LayoutGrid className="size-4 text-muted-foreground" />
            </button>
            <button className="flex size-9 items-center justify-center rounded-full border border-white/10 bg-surface/50 backdrop-blur-sm transition-colors hover:bg-surface">
              <div className="size-4 rounded-sm border border-muted-foreground/50" />
            </button>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 pb-48 pt-2 sm:pt-6">
          {/* Hero greeting */}
          <section className="animate-fade-in-up delay-100 mb-8 sm:mb-12">
            <h1 className="text-balance text-3xl font-medium leading-tight tracking-tight sm:text-4xl md:text-5xl">
              {greeting},
              <br />
              <span className="text-muted-foreground">what shall we create?</span>
            </h1>
          </section>

          {/* Quick actions */}
          <section className="animate-fade-in-up delay-200 mb-8 sm:mb-10">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  className="group relative flex items-start gap-4 overflow-hidden rounded-2xl border border-white/5 bg-surface p-5 text-left transition-all duration-300 hover:border-primary/20 hover:bg-surface-elevated hover:shadow-lg hover:shadow-primary/5"
                >
                  <div
                    className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
                      action.color === "primary"
                        ? "bg-primary/15 text-primary"
                        : "bg-emerald-500/15 text-emerald-400"
                    }`}
                  >
                    <action.icon
                      className={`size-5 ${action.pulse ? "animate-pulse-soft" : ""}`}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold">{action.label}</h3>
                      <ChevronRight className="size-3.5 text-muted-foreground opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100" />
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                  <div className="absolute -right-4 -top-4 size-24 rounded-full bg-primary/5 blur-2xl transition-opacity duration-300 opacity-0 group-hover:opacity-100" />
                </button>
              ))}
            </div>
          </section>

          {/* Recent canvas */}
          <section className="animate-fade-in-up delay-300">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                Latest Drafts
              </h2>
              <button className="text-xs font-medium text-primary transition-colors hover:text-primary/80">
                View all
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
              {/* Featured draft */}
              <div className="group relative overflow-hidden rounded-2xl border border-white/5 bg-surface lg:col-span-8">
                <div className="relative aspect-[16/9] overflow-hidden sm:aspect-[2/1]">
                  <img
                    src={heroCity}
                    alt="Neon Cyberpunk Cityscape generated by Aura AI"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    width={1024}
                    height={512}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute right-3 top-3 flex gap-2">
                    <button className="flex size-8 items-center justify-center rounded-full bg-black/40 backdrop-blur-md transition-colors hover:bg-black/60">
                      <Wand2 className="size-3.5 text-white" />
                    </button>
                    <button className="flex size-8 items-center justify-center rounded-full bg-black/40 backdrop-blur-md transition-colors hover:bg-black/60">
                      <MoreHorizontal className="size-3.5 text-white" />
                    </button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-sm font-semibold sm:text-base">
                          Neon Cyberpunk Cityscape
                        </p>
                        <p className="mt-0.5 text-xs text-white/70">
                          Visual Gen • 2h ago
                        </p>
                      </div>
                      <button className="flex size-8 items-center justify-center rounded-full bg-white/10 backdrop-blur-md transition-colors hover:bg-white/20">
                        <ChevronRight className="size-4 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Draft list */}
              <div className="flex flex-col gap-3 lg:col-span-4">
                {recentDrafts.slice(1).map((draft, index) => (
                  <button
                    key={draft.title}
                    className="group flex flex-1 items-center gap-4 rounded-2xl border border-white/5 bg-surface p-4 text-left transition-all duration-300 hover:border-white/10 hover:bg-surface-elevated"
                    style={{ animationDelay: `${400 + index * 100}ms` }}
                  >
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-surface-elevated ring-1 ring-white/5">
                      <ImageIcon className="size-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{draft.title}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {draft.subtitle}
                      </p>
                    </div>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100" />
                  </button>
                ))}

                <button className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-dashed border-white/10 bg-transparent p-4 text-xs font-medium text-muted-foreground transition-colors hover:border-white/20 hover:text-foreground">
                  <Clock className="size-3.5" />
                  Browse history
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Floating command center */}
      <div className="fixed bottom-0 left-0 right-0 z-30 px-4 pb-6 pt-12 sm:pb-8">
        <div className="mx-auto w-full max-w-2xl animate-slide-up delay-500">
          <div className="relative">
            {/* Glow effect */}
            <div
              className={`absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary/60 to-fuchsia-500/60 blur-md transition-opacity duration-500 ${
                isFocused ? "opacity-40" : "opacity-20"
              }`}
            />

            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-surface/95 backdrop-blur-xl shadow-2xl">
              <div className="flex items-end gap-2 p-3 sm:p-4">
                <div className="flex-1">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="Describe what you want to create..."
                    rows={1}
                    className="w-full resize-none border-0 bg-transparent p-0 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 sm:text-base"
                    style={{ minHeight: "24px", maxHeight: "120px" }}
                    onInput={(e) => {
                      const target = e.currentTarget;
                      target.style.height = "auto";
                      target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
                    }}
                  />
                </div>
                <button
                  className={`flex size-9 shrink-0 items-center justify-center rounded-xl transition-all duration-200 sm:size-10 ${
                    prompt.trim()
                      ? "bg-white text-black shadow-lg shadow-white/10 hover:bg-white/90"
                      : "bg-white/10 text-muted-foreground"
                  }`}
                  disabled={!prompt.trim()}
                >
                  <ArrowUp className="size-4 sm:size-5" />
                </button>
              </div>

              <div className="flex items-center justify-between border-t border-white/5 px-3 py-2 sm:px-4">
                <div className="flex items-center gap-1 sm:gap-2">
                  <button className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground">
                    <ImageIcon className="size-3.5" />
                    <span className="hidden sm:inline">Image</span>
                  </button>
                  <button className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground">
                    <Mic className="size-3.5" />
                    <span className="hidden sm:inline">Voice</span>
                  </button>
                  <button className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground">
                    <Paperclip className="size-3.5" />
                    <span className="hidden sm:inline">Attach</span>
                  </button>
                  <button className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground">
                    <Globe className="size-3.5" />
                    <span className="hidden sm:inline">Browse</span>
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="hidden text-[10px] text-muted-foreground sm:inline">
                    Aura-1 Pro
                  </span>
                  <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          <p className="mt-3 text-center text-[10px] text-muted-foreground/60 sm:text-xs">
            Aura can make mistakes. Verify critical output before shipping.
          </p>
        </div>
      </div>
    </div>
  );
}
