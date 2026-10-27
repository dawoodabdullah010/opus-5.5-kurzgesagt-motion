# Mistakes from the first two films, and the rule each one created

Caught by: **D** the director, **C** a critic agent, **B** the builder's own measurement. Most are D: each one reached the director when a gate in `EVAL.md` would have caught it first.

| # | By | What happened | Why | Rule now |
|---|---|---|---|---|
| K1 | D | Asked about paid image credits | Assumed a paid image tool | Ask once which image source the director uses; default is code-drawn |
| K2 | D | First preview: small character in an empty frame, rainbow layers, confetti-sized cells | Built from an impression; no stills check | Stills sheet against `STYLE.md` before any full render; big subjects, full frames |
| K3 | D | "Choppy, basic mistakes" on the first preview | Camera rules not read; no scan or critic before showing | Read the camera rules first; scan and critic before showing anything |
| K4 | D | The camera slid sideways, then zoomed | Camera centre and zoom on two separate curves, off-centre target | `aim()`: one straight move per zoom |
| K5 | C | The zoom reversed across cuts (dive in, then pull back) | Each shot designed on its own | Direction continues or is zero across every cut; measure with `camlog.mjs` |
| K6 | C | Grey mud and blank cream frames at transitions | White opacity fade over dark frames | Match cut or motion-matched cut; no white-outs |
| K7 | C | 8x speed drop across a cut | Exit and entry curves tuned separately | Within 1.5x on both sides, measured |
| K8 | C | Labels popped off in one frame and overlapped | An on/off threshold | Fade with alpha; space labels |
| K9 | C | A shockwave ring strobed at 200 px per frame | Ease too steep for 60 fps | Under ~60 px per frame for thin shapes |
| K10 | D | Motion blur not wanted | A general rule said to add blur | The director's call wins: no motion blur |
| K11 | D | "The narrator voice is bad" | A voice picked without auditions | Audition 4–5 voices on the same line; the director picks by ear |
| K12 | D | The story implied an origin claim the director did not accept | The picture (zoom from blood iron into a star) said more than the words | Check what the visuals imply, not only the words; respect the director's beliefs; contrast framing works |
| K13 | D | Invented end-card copy | Copy written without asking | End-card text comes from the director |
| K14 | D | Voice sped up 10 % to hit a length | "Stop at 24 s" read as a hard limit when it meant "cut the outro" | Never change voice speed; ask whether a length is a hard limit |
| K15 | D | An obvious scope question annoyed the director | Asked what to delete when the answer was clear | Keep all code, studies and eval data; only old output media is deletable, still confirm before deleting |
| K16 | B | A render worker crashed on a negative arc radius | `(x % 1)` is negative before a beat | Guard every modulo and radius |
| K17 | B | The scan showed jumps and freezes that were not real | The crash left gaps in the frames | Count frames before trusting a scan (`scan.py` checks gaps) |
| K18 | B | A one-frame full-frame jump when a mid-shot move started | The move started from a zoom that differed from the current one | Every move starts from the camera's current state |
| K19 | B | Frozen holds after a camera move landed | The zoom target replaced the creep | Multiply the creep into every target |
| K20 | B | The explosion was not the loudest moment | A short hit has less RMS than speech | Superseded by K23 |
| K21 | D | "It's been 4 hours" | A broken first version, then many fix rounds | Running the gates before the first showing is faster than fixing after |
| K22 | D | "Zoom in, then it backs out" at a cut | The close-up started with the ship smaller than the last frame of the zoom-in | Across a match cut the subject keeps its on-screen size and place |
| K23 | D | "I can't hear the narrator" over the explosion | The bang was pushed up to win a loudness metric | The voice is never masked: effects duck ~9 dB under speech; `voicecheck.py` ≥ +6 dB on every line |
| K24 | D | "What is that green line?" | An abstract graphic with no label | Every abstract graphic gets a label or a moving cue |
| K25 | D | A zoom into the ship, then a cut to the lander, "makes no sense" | A camera move stood in for the story action | Show the action the words describe (the crew moving into the lander), then cut |
| K26 | D | 12–13 s felt rough | Smoke, damage and label vanished at the cut and the ship shrank | Carry every visible state across a cut (or fade it out first) |
| K27 | C | Two more cuts with a size jump (into the cabin, onto the ocean) after K22 was fixed at one cut | The fix was applied to the cut the director named, not to every cut | Every rule is applied to every cut and shot, not only where the note landed |
| K28 | C | The spacecraft broke apart next to the Moon | The jettison was drawn where it looked dramatic, not where it happened | Every picture is checked against the facts, not only the words |
| K29 | C | Items half off-screen, square and round never in frame together | A slow sideways drift accumulated over a 19 s shot | Creep with zoom, not with an unbounded pan; check framing at every key, at the end of each move |
| K30 | C | Frost drawn as four-point sparkles read as stars indoors; crystal strokes read as bird footprints | Decoration borrowed from another scene | A visual means one thing in a film; frost is an edge haze |
| K31 | B | 0.1-0.5 alternating frame differences on a slow cabin push | Sub-pixel camera steps on sharp lines | Not a defect below d 1.5; do not chase it |
| K32 | B | Cabin subjects cropped late in a 19 s shot | A "never parks" creep multiplied over the whole shot (35 % past every planned framing) | Creep belongs in the keys, never as a global multiplier over a long shot |
| K33 | C | The camera stopped at every key, then zoomed in and out five times | Piecewise eases between keys | One monotone spline through the keys (craft 3.7); zoom only ever pushes in during a scene |
| K34 | C | Labels popped off at cuts again, after K8 and K26 | Each fix covered the labels in the note, not every label | Every label fades before every cut and before its object moves |
| K35 | C | Parachutes shrank to dots with lines left standing | An exit drawn as "scale to zero" | Things leave the way they would: deflate, settle, drift |
| K36 | B | A 5 px crop no still sheet showed | Framing checked by eye | `tools/framecheck.py` on the layout boxes and every camera key |
| K37 | C | The payoff ("IT WORKS") was on screen 0.25 s while the setup had seconds | The next line followed the payoff by 0.8 s | Give the payoff room: a short pause in the narration after it (edit the audio, never its speed) and assemble the payoff ON its word |
| K38 | D | The crew "moving into the lander" was drawn as one giant astronaut climbing along the outside of the ship, bigger than the capsule | The action was drawn small, then the camera zoomed 5x onto it and a 2x scale made it huge; the critics checked motion, not what the picture says | An action inside a ship is shown inside: a cutaway with figures at true scale (an astronaut is about half the capsule's height), clipped to the hull. Look at the frame where the action peaks, at full size, before any render |
| K39 | D | The flyby trail had a visible corner at the top of the Moon, and the ship snapped 17 degrees in one frame there | The path was built from `Math.max(0, s - a)` pieces, which switch on with a corner; only 60 segments drew it | Every path a viewer sees is smooth: blend pieces in with a soft ramp (`.06 * log1p(exp(x / .06))`), never `max(0, x)`; draw curves with 200+ segments; measure the largest bend between neighbouring points |
| K40 | B | The "way home" route had a 40 px gap where two pieces met, and it showed a different route (over the top first) from the flyby later (round the far side, then over the top) | Each shot's path was drawn on its own; the pieces were never checked for meeting | One trip, one route in every shot. Pieces of a path meet at the same point, in the same direction (gate 2d) |
| K41 | B | Three camera jolts: two long moves flipped from speeding up to slowing down in one frame, and the splashdown camera stopped dead with the capsule | The cubic ease-in-out has a jump in acceleration at its middle; the follow camera copied the capsule's hard stop | Long moves use a sine ease; a camera following something that stops eases out. `camcheck.py` on every frame (gate 2d) |
| K42 | B | The square filter looked like a sheet of paper (the same as the flight-plan cover), had no label, and slid over the round hole instead of hitting its rim | A prop drawn as "a grey box with lines"; the contact point never checked | Every prop the narration names has its own shape and a label; contact stops at the edge, then bounces (gate 2c) |
