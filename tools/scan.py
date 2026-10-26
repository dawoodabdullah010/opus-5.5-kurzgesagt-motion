# Motion scan for a rendered film: frozen runs, jumps, one-frame kinks.
# usage: python scan.py FRAMES_DIR [--cuts 377,791,...] [--flash 448]
# d = mean |frame - previous| on a 192x108 grey copy (0-255).
#   FAIL frozen: >= 3 frames in a row with d < 0.02 (the picture stopped)
#   FAIL jump:   d > 25 on a frame that is not a planned cut or flash (the cut frame and the next are exempt)
#   FAIL kink:   a one-frame spike or dip: d > 2.2x both neighbours or < 1/2.2 of both (values above 0.35)
#   Also checks the frame sequence has no gaps: a crashed render leaves gaps that look like jumps and freezes.
# At 60 fps a flat-shaded style measures "near-still" (d < 0.2) a lot; the reference style does too. That is not a failure.
import os, re, sys
import numpy as np
from PIL import Image

d0 = sys.argv[1]
opt = lambda k: [int(x) for x in sys.argv[sys.argv.index(k) + 1].split(',')] if k in sys.argv else []
cuts, flash = opt('--cuts'), opt('--flash')
exempt = set(cuts + [c + 1 for c in cuts] + flash + [f + 1 for f in flash])
files = sorted(f for f in os.listdir(d0) if re.match(r'f\d+\.png$', f))
nums = [int(f[1:-4]) for f in files]
gaps = [n for n in range(nums[0], nums[-1] + 1) if n not in set(nums)]
if gaps: print(f'FAIL gaps: {len(gaps)} missing frames, first {gaps[:5]}: re-render before trusting anything below')
g = lambda f: np.asarray(Image.open(os.path.join(d0, f)).convert('L').resize((192, 108)), np.float32)
prev, d = None, []
for f in files:
    x = g(f); d.append(0.0 if prev is None else float(np.abs(x - prev).mean())); prev = x
d = np.array(d)
frozen, run = [], 0
for i, v in enumerate(d[1:], 1):
    run = run + 1 if v < .02 else 0
    if run == 3: frozen.append(nums[i - 2])
jumps = [(nums[i], round(v, 1)) for i, v in enumerate(d) if v > 25 and nums[i] not in exempt]
kinks = [nums[i] for i in range(1, len(d) - 1) if nums[i] not in exempt and max(d[i - 1], d[i], d[i + 1]) > .35 and
         ((d[i] > 2.2 * d[i - 1] and d[i] > 2.2 * d[i + 1]) or (d[i] < d[i - 1] / 2.2 and d[i] < d[i + 1] / 2.2))]
print(f'frames {len(files)}  mean d {d.mean():.2f}')
print('frozen runs:', frozen or 'none'); print('jumps:', jumps or 'none'); print('kinks:', kinks or 'none')
print('RESULT:', 'PASS' if not (gaps or frozen or jumps or kinks) else 'FAIL (look at those frames: small kinks under d 1.5 on a planned event can be fine)')
