# The evaluation flow

Nothing reaches the director until it passes every gate below, in order. Each gate exists because a film failed it. "It rendered" and "the scan passed" only mean *not broken*. Quality words ("smooth", "good", "fixed") need the side-by-side.

## Gate 1. Stills, before any full render
- Render ~25 stills across every shot: `node tools/render.mjs stills 120,300,...` then `python tools/sheet.py out/stills sheet.jpg 120 300 ...`.
- Open the sheet next to `reference/STYLE.md` and 3 reference frames. For each shot write one line: what reads, what reads wrong.
- Typical catches: a subject too small in an empty frame; two round shapes side by side reading as a cartoon face; labels covering the thing they label; an abstract line with no label.

## Gate 2. The full render is complete
- `ls frames | wc -l` = LAST_FRAME + 1. A crashed worker leaves gaps, and gaps make fake jumps and freezes in every later check.
- Any `PAGE ERROR` or `frame N:` line in the render log is a bug, not noise.

## Gate 2b. Framing
- `python tools/framecheck.py framing.json`: every subject box inside every camera key by at least 15 px. Run it after every layout or camera change.

## Gate 2c. Peak frames: what each picture says, and is it true
- Render one frame per narration beat (beat + 0.45 s, before any cut) and look at each at full size, 4 to a sheet at 960x540 or bigger.
- For each: what does it show to someone who has not read the script? Is it true (scale, inside or outside, order of events)? Does any prop read as something else (a filter that looks like paper)? Does any drawing contradict another shot (two routes for one trip)?
- Every prop the narration names gets its own shape and a label.

## Gate 2d. Smooth paths and camera
- `node tools/camfull.mjs out/cams.json` then `python tools/camcheck.py out/cams.json --cuts <cut frames> --skip <shake frame>:<half width>`: no sudden change of acceleration anywhere except cuts and planned shakes.
- Every drawn path: sample it at 1000+ points; the largest bend between neighbouring points is no bigger than on the rest of the curve, and no step jumps (a gap). Pieces of a path meet at the same point in the same direction; blend with a soft ramp, never `max(0, x)`.
- Long moves use a sine ease (`.5 - .5 cos(pi x)`): the cubic ease-in-out flips from speeding up to slowing down in one frame. A camera following something that stops eases out; it never stops dead.

## Gate 3. Motion scan
`python tools/scan.py frames --cuts <cut frames> --flash <flash frames>`

| Check | Pass |
|---|---|
| Gaps | 0 |
| Frozen runs (3+ identical frames) | 0. Every hold keeps moving: a creep built into the camera keys (never a global multiplier over a long shot, K32) |
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
