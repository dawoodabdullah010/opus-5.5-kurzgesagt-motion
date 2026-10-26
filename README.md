# kurzgesagt-explainer

A Claude Code skill for making Kurzgesagt-style animated explainers entirely in code: a measured style reference, a 60 fps canvas film template, ElevenLabs narration with a "real recording" feel, sound effects, and an evaluation flow (motion scan, per-cut camera measurement, voice-over-effects check, critic agents) that runs before anyone watches the film.

Not affiliated with Kurzgesagt. No Kurzgesagt artwork, characters, footage or audio is included.

## Install
```bash
git clone https://github.com/<you>/kurzgesagt-explainer ~/.claude/skills/kurzgesagt-explainer
```
Then ask Claude Code for a Kurzgesagt-style video. Start reading at `SKILL.md`, then `EVAL.md`.

## Requirements
- Node 18+ with Playwright: `npm i playwright && npx playwright install chromium`
- Python 3.10+: `pip install -r requirements.txt`
- ffmpeg on PATH (or `FFMPEG=/path/to/ffmpeg`)
- An ElevenLabs API key in `ELEVENLABS_API_KEY` for narration and sound effects (paid usage on your own account)

## Quick start (the Apollo 13 example)
```bash
mkdir my-film && cp template/* examples/apollo-13/beats.js my-film/ && cd my-film
node ../tools/render.mjs stills 120,700,1300,2400,3200
python ../tools/sheet.py out/stills sheet.jpg 120 700 1300 2400 3200
```
For a new film: write `script.txt`, run `tools/voice.py`, write `beats.spec.json`, run `tools/beats.py`, rewrite the shots in `film.js`, then follow `EVAL.md`.

## License
MIT
