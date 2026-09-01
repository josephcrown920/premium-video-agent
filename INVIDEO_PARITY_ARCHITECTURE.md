# Aurora InVideo-Parity Architecture

Aurora is not designed as a generic text-to-video generator. The product architecture follows the current InVideo Agent Two production model: one persistent project, one creative intelligence layer, specialized crew roles, multi-input context, direct model access, a manual Notebook mode, Vision pre-production, a persistent Slate editor, guided Workflows, standing Playbooks, agentic stock selection, and targeted revisions.

## 1. Core rule

**The project graph is the source of truth.**

The agent does not rebuild a video from a conversation transcript. It reads and mutates persistent project state:

`Context → Plan → References → Boards/Vision → Generations → Approvals → Slate → QA → Versions`

Every generation has a project address and can be reused by later agent instructions.

## 2. Agent hierarchy

```text
INDIVIDUAL AGENT
      │
      ├── Creative Producer
      │     ├── Scriptwriter
      │     ├── Storyboard Artist
      │     ├── Casting
      │     ├── Production Designer
      │     └── Director / Cinematographer
      │
      ├── Generation Router
      │     ├── Video models
      │     ├── Image models
      │     ├── Audio / music models
      │     ├── Stock retrieval
      │     └── Custom GPU / ComfyUI
      │
      ├── Notebook
      │     ├── Pages
      │     ├── Threads
      │     ├── Manual model selection
      │     └── Approved-generation handoff
      │
      └── Slate
            ├── Timeline
            ├── Conversational edit compiler
            ├── Captions / audio
            ├── Human media
            └── Reversible operations
```

The user sees one Individual Agent. The internal crew can operate as specialized roles against the same project graph.

## 3. Context

Context is persistent project memory, not a prompt attachment.

Supported inputs:

- Briefs
- Scripts
- PDFs
- Images
- Videos
- Audio
- URLs
- Character references
- Location references
- Style/look documents
- Shot lists

Context items can be locked. Locked character, world, wardrobe, style, and brand rules are automatically available to downstream planning and generation.

## 4. Vision

Vision is the pre-production visual layer:

- **Boards:** 3×3 storyboard sequence
- **Looks:** preserve visual language, character, wardrobe, lighting and palette
- **Angles:** create alternate camera perspectives without losing continuity
- Frame extraction
- Reference handoff into image/video generation

Vision output is project state. An approved board frame can become the canonical reference for a shot.

## 5. Notebook

Notebook is the deliberate/manual mode inside the same project.

Each generation has:

- Page
- Thread ID
- Model
- Prompt
- References
- Output assets
- Annotations
- Approval state

Manual work is never stranded outside the agent. Approving a Notebook generation hands its assets back into project context so the agent can use them later.

## 6. Model routing

Models are capabilities, not UI buttons with hard-coded behavior.

For every shot the router evaluates:

- modality
- quality
- references
- image-to-video support
- camera control
- audio support
- editing support
- cost
- latency
- availability
- project locks

The router can select a different model per shot and can fail over without rebuilding the project.

## 7. Stock-first intelligence

The agent should not spend generation credits when licensed stock is good enough.

```text
Need exact character/product/control?
        ├── yes → generate
        └── no
             ├── suitable licensed stock → use stock
             └── otherwise → generate
```

Stock assets remain ordinary project assets and participate in the same Slate, QA and versioning system.

## 8. Slate

Slate is the persistent editing representation. It is not merely a rendered preview.

Supported operations include:

- insert
- remove
- replace
- trim
- split
- move
- speed
- volume
- opacity
- reframe
- caption
- transition
- regenerate

Natural-language commands compile into reversible operations. Example:

> “Replace shot 6 with a darker 85mm close-up, keep the character and wardrobe, preserve the voice, and make a TikTok version.”

The agent should produce:

`intent → affected shots → continuity locks → Slate diff → generation job → QA → replacement → render`

Unchanged timeline state remains untouched.

## 9. Workflows

Workflows are reusable guided production jobs, not just prompt presets.

Examples:

- Casting
- Reference research
- Production design
- Storyboarding
- Script writing
- Localization
- Campaign adaptations
- Music-video production

A workflow owns its steps, questions, approval checkpoints and outputs. A user can invoke it without manually briefing every stage.

## 10. Playbooks

Playbooks are standing rules that the agent follows across projects.

Examples:

- Brand visual language
- Camera grammar
- Always Ask before generation
- Preferred models
- Negative constraints
- Export rules
- Caption rules
- Cost ceilings

Playbooks should be composable with a project and should never overwrite explicit user instructions unless the project policy says so.

## 11. Approval model

Aurora supports three production modes:

- **Autopilot:** agent executes without routine approval
- **Always Ask:** generation/edit decisions require approval
- **Review:** agent completes stages and pauses at defined checkpoints

Approval is attached to the project object or operation, not buried in chat.

## 12. QA and revision loop

```text
Generate
   ↓
Inspect
   ↓
Score
   ↓
Pass? ── yes → Approve → Slate
   │
   no
   ↓
Targeted revision
   ↓
Regenerate affected media only
   ↓
QA again
```

QA should evaluate identity, wardrobe, composition, lighting, camera intent, artifacts, unwanted text, temporal consistency, audio and continuity.

## 13. Production acceptance test

Aurora is InVideo-parity-ready only when this test passes:

1. Give the Individual Agent one complete brief.
2. Upload multiple input types into Context.
3. Agent asks only blocking questions.
4. Agent creates script and shot plan.
5. Agent locks character/world/style references.
6. Vision creates boards; approved frames become references.
7. Notebook can manually generate/edit an asset and hand it back.
8. Router selects models per shot.
9. Stock is considered before unnecessary generation.
10. Multiple candidates can be scored.
11. Approved shots assemble into Slate.
12. A natural-language edit changes only affected timeline state.
13. QA identifies a weak shot and triggers targeted regeneration.
14. Final render preserves approved state.
15. Agent creates platform adaptations without rebuilding the master project.

That is the behavioral bar. A UI that merely contains buttons labelled “Context”, “Notebook”, “Boards” and “Angles” does not satisfy it.
