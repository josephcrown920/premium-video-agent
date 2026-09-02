# Aurora Individual Video Agent

This repository is part of the Aurora video-agent family: autonomous, production-oriented agents built to take a high-level video brief and carry it through planning, references, generation, inspection, revision, editing, QA and delivery.

The target is not a generic prompt-to-video wrapper. The agent should behave like an individual producer/director/editor with persistent project memory, reusable skills, model-aware routing and targeted repair.

## Production contract

```text
User brief / script / URL / media / references
                 ↓
             Project Context
                 ↓
       Individual Video Agent
                 ↓
  brief → script → characters → world → shots
                 ↓
 Vision / storyboard / looks / angles / frames
                 ↓
 Notebook experiments + approved references
                 ↓
 Capability-aware model routing
                 ↓
 image / video / avatar / voice / music / SFX
                 ↓
 Candidate inspection + acceptance gates
                 ↓
 Persistent Slate / timeline
                 ↓
 Natural-language edit compiler
                 ↓
 Targeted regeneration / repair
                 ↓
 Visual + audio + continuity QA
                 ↓
 FFmpeg / render workers
                 ↓
 16:9 / 9:16 / 1:1 / 4:5 delivery
```

## Architecture

### Project Memory

`project-memory/core.ts` provides the common memory contract across the agent family. It models Context, Notebook entries, references, production locks, acceptance criteria, generations, approvals, rejections and continuity events.

Approved or locked information is production state rather than disposable prompt text. A failed shot should be regenerated without resetting unrelated approved work.

### Production Agent Core

`agent-core/production.ts` normalizes generation requests and candidate scoring across video, image, voice, music, SFX, avatar and upscale work. It supports capability-aware routing, candidate selection, acceptance gates, targeted edits and campaign variants.

### ModelArk / BytePlus backend

`src/lib/modelark.server.ts` and `agent-core/modelark.ts` provide direct ModelArk execution. The shared adapter supports:

- OpenAI-compatible Chat Completions
- true SSE token streaming (`stream: true`)
- Seedream image generation
- Seedance video task submission + polling
- reference-image inputs
- configurable resolution, duration and aspect ratio
- environment-driven model IDs and regional base URLs
- retry tolerance for 429/5xx video polling

Secrets remain server-only. Supported names are `ARK_API_KEY` / `BYTEPLUS_API_KEY`, with `ARK_BASE_URL` / `BYTEPLUS_BASE_URL` and model-specific overrides.

### Streaming

Agent-facing responses should stream whenever the upstream provider supports it. ModelArk is wired for native SSE token streaming. The UI should consume incremental deltas rather than waiting for one large JSON response.

For long-running media jobs, progress is streamed as explicit lifecycle events such as `accepted`, `planning`, `routing`, `generating`, `inspecting`, `revising`, `rendering`, `completed`, `retrying` and `failed`. The final MP4 is only reported as complete after the worker has actually produced and verified it.

## Individual-agent workflow

1. Understand the request and production objective.
2. Retrieve relevant Context, Notebook, references, locks and skills.
3. Build or update the plan.
4. Select only the tools/models required.
5. Generate candidates when useful.
6. Inspect identity, prompt fit, camera, anatomy, lighting, composition and temporal continuity.
7. Approve strong generations into project memory.
8. Regenerate only failed assets/shots.
9. Compile natural-language edits into deterministic Slate operations.
10. Run visual, audio and continuity QA.
11. Render the requested delivery formats without destroying the master.

## Skills

Video-relevant supplied skills are treated as routing knowledge. Current families include HeyGen Avatar, HeyGen Video, HeyGen Translate, Chengfeng 剪口播, Chengfeng 口播成片, Ian Xiaohei SVG Motion and Chengfeng 自进化. Unrelated skills are not injected into video routing.

## Model routing

Routing is capability based rather than one global model. ModelArk should be preferred for supported Seedance/Seedream work when direct credentials and model activation are present. Fallback providers remain available for unavailable, rate-limited or unsuitable requests.

Never silently replace a user-pinned model/provider. Return a clear activation/configuration error instead.

## Continuity and revision

Characters, faces, wardrobe, locations, props, style, camera language and approved generations can become locks. Downstream generation retrieves these constraints automatically.

Revisions are scoped to the smallest affected unit: background changes affect the dependent shot; face fixes reuse the locked identity reference; pacing changes edit the timeline; vertical delivery creates a variant; subtitle edits do not regenerate the underlying footage.

## Acceptance gate

A feature is not production-complete because a UI button exists. It needs a domain contract, API/workflow, UI entry where appropriate, provider/worker boundary, observable status, failure path, revision path, persisted approved state and verifiable final output.

## Environment

```text
ARK_API_KEY=...
ARK_BASE_URL=https://ark.ap-southeast.bytepluses.com/api/v3
MODELARK_TEXT_MODEL=<active text model or endpoint>
MODELARK_IMAGE_MODEL=<active Seedream model or endpoint>
MODELARK_VIDEO_MODEL=<active Seedance model or endpoint>
```

Never commit real keys. Use Replit/Lovable/Cloudflare or the deployment platform's secret manager.

## Validation

```bash
npm install
npx tsc --noEmit
npm run build
```

Use the repository's existing lint/test commands when present.

## Production boundary

Live generation still depends on valid provider credentials, model activation, storage, queues/workers and rendering infrastructure. The codebase provides the agent contracts and provider boundaries; production readiness is proven by an end-to-end project that can plan, generate, inspect, revise, render and deliver while preserving approved state.

## Aurora Global synchronization

The canonical Aurora Global product also contains video-agent routes and exported video-agent artifacts. Shared improvements must be propagated into those product surfaces rather than leaving the standalone agent repositories ahead of the actual Aurora experience.
