# The evaluation flow

Nothing reaches the director until it passes every gate below, in order. Each gate exists because a film failed it. "It rendered" and "the scan passed" only mean *not broken*. Quality words ("smooth", "good", "fixed") need the side-by-side.

## Gate 1. Stills, before any full render
- Render ~25 stills across every shot: `node tools/render.mjs stills 120,300,...` then `python tools/sheet.py out/stills sheet.jpg 120 300 ...`.
- Open the sheet next to `reference/STYLE.md` and 3 reference frames. For each shot write one line: what reads, what reads wrong.
- Typical catches: a subject too small in an empty frame; two round shapes side by side reading as a cartoon face; labels covering the thing they label; an abstract line with no label.

## Gate 2. The full render is complete
- `ls frames | wc -l` = LAST_FRAME + 1. A crashed worker leaves gaps, and gaps make fake jumps and freezes in every later check.
- Any `PAGE ERROR` or `frame N:` line in the render log is a bug, not noise.

## Gate 3. Motion scan
`python tools/scan.py frames --cuts <cut frames> --flash <flash frames>`

| Check | Pass |
|---|---|
| Gaps | 0 |
| Frozen runs (3+ identical frames) | 0. Every hold keeps a creep of 3–7 %/s |
| Jumps (d > 25) | only on planned cuts and 1-frame flashes |
| Kinks (one-frame spike or dip) | 0 above d 1.5; look at every one below that |

Calibrate against the reference: at 60 fps the measured reference style itself shows long "near-still" stretches. That warning is not a failure; frozen runs are.

## Gate 4. Every cut, measured
- `node tools/camlog.mjs <cut-4>-<cut+4> ...` prints the camera's zoom change per frame straight from the film code (each shot sets `window.CAM = [cx, cy, z]`).
- Pass: same sign on both sides of the cut (or zero on the incoming side), and speeds within 1.5x.
- Pass: the subject keeps its on-screen size and place across a match cut (compute the incoming zoom from the outgoing one's last frame).
- `sheet.py` on the 2 frames before and after each cut: no grey or blank frame, nothing vanishes (smoke, damage, labels carry across or fade out first).

## Gate 5. Sound, measured
- `python tools/mix.py FILM` then `python tools/voicecheck.py FILM`.

| Check | Pass |
|---|---|
| Integrated loudness | -14 LUFS (±0.5) |
| True peak | ≤ -1.5 dBFS |
| Voice over effects, every spoken line | ≥ +6 dB (effects duck ~9 dB under speech) |
| Room tone between words | about -58 dBFS: never digital silence |
| Biggest effect | the loudest moment *between* words, never over them |

## Gate 6. A fresh critic
- Spawn an agent that did not build the film, with `agents/motion-critic.md`, the film, the frames folder and the reference clips. Default stance: reject.
- It must measure (optical flow, frame differences), not describe, and label every claim MEASURED or LOOKED.

## Gate 7. A verification critic after every fix round
- Fixes introduce new faults (a fixed reversal created a size jump; a fixed white-out created a grey frame). After each round, spawn `agents/verify-critic.md` with the previous critic's list: each item FIXED / PARTLY / NOT FIXED with numbers, plus any new defect.

## Gate 8. The report
- One file, named by what changed. Lead with what changed, then MEASURED results, then NOT CHECKED (always includes "nobody has watched it at full speed with sound" until someone has).
- If a gate was skipped for time, say so first.

## The director's notes become rules
Every note the director gives becomes a row in `reference/mistakes.md`: what happened, why, the rule now. Read that file before building and before every critic round. A rule a newer film proves wrong is marked superseded, never left standing.
