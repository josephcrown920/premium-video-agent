# Video Agent Skill Pack

This registry is the routing layer for the supplied video skills. It keeps specialized workflows distinct instead of collapsing everything into one generic video prompt.

## HeyGen Avatar
Establish a persistent face + voice identity for the agent, user or named presenter. When a request both creates an identity and asks for a video, avatar setup runs first.

## HeyGen Video
Create new presenter-led videos: pitches, updates, tutorials, explainers, personalized messages and talking-head content. Do not use it for avatar creation or translation of an existing video.

## HeyGen Translate
Localize an existing finished video while preserving the same presenter identity, voice and performance through translation, dubbing and lip-sync. It is not the new-video creation path.

## Chengfeng 剪口播
Prepare talking-head source material: extract audio → transcribe → detect mistakes/silence/repetition → review → user confirmation → cut → retranscribe the cut → AI-correct subtitles. Final subtitles must come from the post-cut video.

## Chengfeng 口播成片
Turn source video + subtitles + optional HTML/image assets into a complete edit: storyboard → timeline preview → configured aspect ratio/animation style → MP4 → ffprobe/keyframe QA.

## Ian Xiaohei SVG Motion
Build controllable HTML/SVG/GSAP explanatory motion. Do not auto-vectorize PNGs into path soup. Extract a cognitive anchor, choose a physical metaphor, build semantic SVG layers and animate with GSAP.

## Chengfeng 自进化
Integrate user corrections into the correct methodology/rule section. Durable rules belong in the skill body; feedback logs record the event.

## Routing policy
Resolve intent first; chain skills when required; preserve project memory and identity locks; treat skills as production methods; record durable corrections; exclude unrelated skills from video routing.

## Provenance
Derived from the user-supplied `skills-master` HeyGen pack and `chengfeng-videocut-skills` pack.
