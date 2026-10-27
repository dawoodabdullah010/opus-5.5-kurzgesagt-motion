---
name: opus-5-5-kurzgesagt-motion
description: Make a Kurzgesagt-style animated explainer (30 s to 2 min) drawn entirely in code, narrated by an ElevenLabs voice with real-room depth and sound effects, checked by a measured evaluation flow before anyone sees it. Use for "make a Kurzgesagt-style video", an animated explainer, a true-story explainer, or to fix one of these films.
---

# Opus 5.5 Kurzgesagt Motion

A method, a code film template and an evaluation flow, built while making two films ("Made of Stars", 26 s, and "Apollo 13 in 60 seconds"). Every rule here is a mistake one of those films made. Follow them literally. Not affiliated with Kurzgesagt; no Kurzgesagt artwork, characters or footage is used or included.

## Before anything
1. State the job in one line: `Doing · Keeping · Changing`.
2. Read `reference/STYLE.md` (the measured look), `reference/mistakes.md` (K1–K37) and `EVAL.md` (the gates).
3. Ask only what changes the work, in one short question: the story, if none is given. Defaults: ElevenLabs premade voice `UGTtbzgh3HObxRjWaSpr` ("Brian", a gentle reader) at natural speed, 1920x1080, 60 fps, no music, sound effects on, everything drawn in code.

## The pipeline
| # | Step | How | Gate |
|---|---|---|---|
| 1 | Story | A true story or a sourced explainer. Facts from primary sources | Every fact has a source or is labelled NOT CHECKED. Check what the pictures imply, not only the words |
| 2 | Script | ~2.9 words per second (75 words ≈ 25 s, 150 ≈ 55 s); one picture change per line | Read it as the picture |
| 3 | Voice | `python tools/voice.py FILM script.txt [voice_id]` → `audio/voice.mp3`, `audio/words.json` | Never change the voice's speed. Length follows the voice |
| 4 | Beats | `beats.spec.json` (beat → word, occurrence, shift, "cut") then `python tools/beats.py FILM beats.spec.json` | Cuts on whole frames; count repeated words carefully |
| 5 | Build | Copy `template/` into FILM, keep `lib.js`, rewrite the shots in `film.js` (the template is the Apollo film: 7 shots, every camera pattern) | The camera rules below |
| 6 | Stills | `node tools/render.mjs stills ...` + `python tools/sheet.py` | EVAL gate 1 |
| 7 | Render | `node tools/render.mjs full` | EVAL gate 2 |
| 8 | Scan + cuts | `python tools/scan.py frames --cuts ... --flash ...`, `node tools/camlog.mjs ...`, cut sheets | EVAL gates 3–4 |
| 9 | Sound | `python tools/sfx.py FILM name secs "prompt, no music"` per effect, a `roomtone.mp3`, a `cues.json`, then `python tools/mix.py FILM` and `python tools/voicecheck.py FILM` | EVAL gate 5 |
| 10 | Encode | `ffmpeg -framerate 60 -i frames/f%04d.png -i audio/mix.wav -c:v libx264 -tune animation -crf 20 -pix_fmt yuv420p -colorspace bt709 -color_primaries bt709 -color_trc bt709 -c:a aac -b:a 192k film.mp4` | Frame count and loudness measured on the file |
| 11 | Critics | `agents/motion-critic.md`, then `agents/verify-critic.md` after every fix round | EVAL gates 6–7 |
| 12 | Report | MEASURED / NOT CHECKED, one file | EVAL gate 8 |

## Camera rules
- **One straight zoom per move.** `aim(fx, fy, sx, sy, z)` puts the world point (fx, fy) at screen offset (sx, sy). The offset slides to its target on the same curve as the log-zoom. Never move the centre and the zoom on separate curves.
- **Across every cut** the zoom keeps its direction and speed (within 1.5x) or starts from zero. Outgoing shots accelerate into the cut, incoming shots enter moving and settle (`EA(n, k)`).
- **Match cuts keep size and place**: compute the incoming zoom from the outgoing shot's last frame. **Carry visible state** (smoke, damage, rotation) across, or fade it out before the cut.
- **Every move starts from the camera's current state** (same zoom, same offset).
- **Never parked**: a 3–7 %/s creep on every hold, multiplied into every zoom target, through the end card.
- **No white-outs**; a flash is exactly 1 frame. No motion blur needed.
- **Show the action the words describe** instead of a camera trick; label every abstract graphic.
- Pills (`pill(...)` in `lib.js`) enter from 94 % with a 16 px rise on the measured snap-settle curve, fade out with `alpha`, stay on screen at least 0.4 s.
- Every value continuous in t; guard every radius and modulo.

## Sound rules
- `mix.py` gives the voice a recorded feel: warmth, presence, de-esser, gentle compression, soft saturation, small-room early reflections (9–38 ms), and room tone at about -58 dBFS so it never drops to digital silence. Effects share the small room.
- Effects duck about 9 dB under speech; whooshes are reversed (`~r`) to rise into a cut; hits are placed by onset. A radio line can be band-limited with `"radio"` in `cues.json`.
- Effects only, no music, unless asked. -14 LUFS, true peak -1.5 dBFS.

## Files
- `EVAL.md`: the 8 gates with pass numbers. `agents/`: critic prompts.
- `reference/STYLE.md`: palette, saturation, push/pull rates and cut counts measured from two Kurzgesagt clips (numbers only). `reference/mistakes.md`: K1–K37.
- `template/`: `index.html`, `lib.js` (measured curves, `aim`, `pill`, starfield, planet, bloom, vignette), `film.js` (Apollo 13).
- `examples/apollo-13/`: `script.txt`, `words.json`, `beats.spec.json`, `beats.js`, `cues.json`.
- `tools/`: `voice.py`, `beats.py`, `sfx.py`, `mix.py`, `voicecheck.py`, `render.mjs`, `scan.py`, `camlog.mjs`, `sheet.py`, `measure.py` (measure a reference clip's camera and palette).
