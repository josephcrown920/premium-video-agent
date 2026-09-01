# Aurora AI — Individual Video Agent

Aurora is an autonomous video-production workspace designed against the current InVideo Agent Two capability model.

The goal is **not** to clone InVideo's branding or UI. The goal is to reproduce the useful production logic: one persistent project, one individual agent, specialized internal crew roles, multi-input context, model routing, Vision pre-production, Notebook experimentation, a persistent Slate edit, reusable workflows/playbooks, agentic stock selection, targeted revisions, QA, and multi-format delivery.

## Production loop

```text
Brief / Script / References / URL / Media
                    ↓
                 Context
                    ↓
          Individual Agent / Producer
                    ↓
       Script → Characters → World → Shots
                    ↓
              Vision / Boards
             ┌──────┼──────┐
             ↓      ↓      ↓
           Looks  Angles  Frames
             └──────┼──────┘
                    ↓
              Notebook / Models
                    ↓
          Per-shot model routing
                    ↓
        Stock OR Image OR Video generation
                    ↓
               Candidate QA
                    ↓
                 Slate
                    ↓
       Natural-language edit compiler
                    ↓
          Visual + Audio QA
                    ↓
        Targeted regeneration / repair
                    ↓
                 FFmpeg
                    ↓
       16:9 / 9:16 / 1:1 / 4:5
```

## Current architecture

### Individual Agent

The user directs one agent. Internally it can delegate to:

- Creative Producer
- Scriptwriter
- Storyboard Artist
- Director
- Cinematographer
- Casting
- Production Designer
- Editor
- Sound Designer
- Music Designer
- Colorist
- Caption/Translation Specialist
- QA Reviewer

### Context

The project can hold briefs, scripts, PDFs, images, videos, audio, URLs, character references, location references, style documents and shot lists. Locked context becomes a continuity constraint for downstream work.

### Vision

Vision is the storyboard/pre-production layer with:

- Boards: 3×3 storyboard generation
- Looks: consistent visual language
- Angles: alternate camera perspectives
- Frame extraction
- Reference handoff into generation

### Notebook

Notebook is the manual generation mode inside the same project. Generations are addressable by page/thread, carry their prompts and references, and can be approved back into the agent's project context.

### Model router

Aurora uses a capability registry rather than one global model. The router can evaluate quality, cost, latency, references, camera control, image-to-video, audio, editing support, tags and availability for each shot.

The initial catalog includes Seedance, Kling, Veo, Sora, Seedream, GPT Image, Nano Banana, FLUX, ElevenLabs and licensed-stock routing. Actual vendor execution remains credential/configuration dependent.

### Slate

Slate is the persistent production timeline. Natural-language edits compile into reversible operations so a request such as:

> Make shot 6 darker, keep the character and voice, replace the background, and make a TikTok version.

can affect only the required shots and timeline regions instead of rebuilding the project.

### Workflows and Playbooks

Workflows are reusable guided production jobs such as Casting, Storyboarding and Production Design. Playbooks are standing rules for camera language, model preferences, approval behavior, quality tier, brand constraints and generation policy.

### Stock intelligence

The agent considers licensed stock before paying the generation cost when a shot does not require generative control, exact identity or exact product behavior.

## Key files

- `src/lib/invideo-agent.ts` — production graph, routing, Slate revisions, approval and pipeline contracts
- `src/lib/invideo-workspace.ts` — Context, Pages, Threads, Workflows and Playbooks
- `src/lib/model-catalog.ts` — capability-based model registry and routing defaults
- `src/components/aura/VisionStudio.tsx` — Vision storyboard workspace
- `src/components/aura/VideoStudio.tsx` — main production workspace
- `INVIDEO_PARITY_ARCHITECTURE.md` — architecture and acceptance criteria
- `.github/workflows/aurora-ci.yml` — typecheck, lint and production build validation

## Important boundary

The repository contains the application architecture and provider integration boundaries. Live production still requires the relevant API credentials, GPU workers, storage, rendering infrastructure, stock licenses, authentication and billing services.

A feature is not considered production-complete merely because a button or adapter exists. The acceptance test is an end-to-end project in which the agent can plan, generate, inspect, revise, edit, render and deliver while preserving approved project state.

## Development

```sh
npm install
npm run dev
```

Validation:

```sh
npx tsc --noEmit
npm run lint
npm run build
```
