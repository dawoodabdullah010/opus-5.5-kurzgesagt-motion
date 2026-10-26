# Kurzgesagt style study (26 Oct 2026)

Sources: first 30 s of "You Will Only Like Half of This Video" (half.mp4) and "We Finally Know More About Humanity's First Civilization" (civ.mp4), 1920x1080, 60 fps. Numbers from `tools/measure.py` (optical-flow camera tracking, k-means palette) and frame strips.

## Measured
| What | half | civ |
|---|---|---|
| Frame rate | true 60 fps, 2/179 repeated frames | true 60 fps, 7/179 repeated |
| Hard cuts in 30 s | 5 (6.5, 15.3, 17.6, 21.7, 29.2 s) | 1 (11.8 s) |
| Shot length | 2.2 to 8.8 s | 11.8 s, then 18 s of morphs |
| Frames with no motion | 0 to 14 % per shot | 8 to 24 % |
| Push-in | x1.22 over 6.5 s, speeding up (1.01, 1.02, 1.04, 1.06 ... 1.19, 1.21 every 0.5 s) | |
| Pull-back | x0.50 over 7.6 s, slowing down (0.97, 0.94, 0.90, 0.85 ... 0.51, 0.50) | x0.50 over 11.8 s with a pause in the middle |
| Base colour | navy #0a0835 = 46 % of pixels | near-black purples #06020b #170425 #240c38 = 67 % |
| Accents | magenta #df04a9, crimson #760541, purple #62088c, teal #286e60, blue #2d80dd, mint #73dd9e, green #24bc39, off-white #eaf5ee, gold #dea21b | ultramarine #0324b9, ember #b43517, wine #480828 |
| Saturation | median 247/255 | median 223/255 |
| Brightness | 31 % of pixels under 25 % | 77 % of pixels under 25 % |

## Seen in the frames (not measured)
- Flat shapes, no outlines. Each shape has one darker same-hue shadow shape and one lighter highlight shape.
- Light sources glow: a soft radial halo, a pool of light on the ground (the torch), emissive screens and characters.
- Every object drifts on its own slow float (the phone sways and rotates a few px while the camera pushes). Nothing is ever parked.
- Transitions are mostly morphs, not cuts: blob to ring to swirl to leaves to particles to a mountain to a portal ring.
- Particle dissolves: figures break into small blue dots and fade.
- Text lives in the world (on a phone screen, a speech bubble), bold rounded sans, not subtitle captions.
- Pop-ins (speech bubbles, cards) scale up with a quick overshoot.
- Deep vignette, dark backgrounds, small sparkle stars.
