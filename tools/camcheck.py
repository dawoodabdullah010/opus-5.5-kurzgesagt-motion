# usage: python camcheck.py cams.json --cuts 376,791,... [--skip 448:45]
# cams.json comes from camfull.mjs (window.CAM per frame). Flags corners in the camera's motion:
# a sudden change of acceleration (jerk) in screen px/frame or zoom %/frame, away from cuts and planned shakes.
import json, math, sys, argparse
ap = argparse.ArgumentParser(); ap.add_argument('cams'); ap.add_argument('--cuts', default=''); ap.add_argument('--skip', default='')
ap.add_argument('--px', type=float, default=.5); ap.add_argument('--zoom', type=float, default=.12)
A = ap.parse_args()
C = json.load(open(A.cams)); cuts = [int(x) for x in A.cuts.split(',') if x]
skips = [tuple(int(v) for v in s.split(':')) for s in A.skip.split(',') if s]
v = [(0, 0, 0)] + [((C[f][0] - C[f-1][0]) * C[f][2], (C[f][1] - C[f-1][1]) * C[f][2], 100 * math.log(C[f][2] / C[f-1][2])) for f in range(1, len(C))]
a = [(0, 0, 0)] + [tuple(v[f][i] - v[f-1][i] for i in range(3)) for f in range(1, len(C))]
near = lambda f: any(abs(f - k) <= 3 for k in cuts) or any(abs(f - c) < w for c, w in skips)
bad = [(f, [round(a[f][i] - a[f-1][i], 2) for i in range(3)]) for f in range(3, len(C)) if not near(f)
       and (abs(a[f][0] - a[f-1][0]) > A.px or abs(a[f][1] - a[f-1][1]) > A.px or abs(a[f][2] - a[f-1][2]) > A.zoom)]
for f, j in bad: print(f'frame {f} ({f/60:.2f} s): jerk x,y px/frame^2, zoom %/frame^2 = {j}')
print('RESULT:', 'PASS' if not bad else f'FAIL ({len(bad)} frames)')
sys.exit(1 if bad else 0)
