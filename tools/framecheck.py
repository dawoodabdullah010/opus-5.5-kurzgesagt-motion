# Does every camera framing hold all of its subjects?  python framecheck.py framing.json
# framing.json: {"boxes": {"panel": [x0, y0, x1, y1], ...},              world-space boxes of the things that must stay whole
#                "keys":  {"cabin": [cx, cy, z, ["panel", "thermo"]], ...}, camera centre, zoom, and what must be in frame
#                "margin": 15}                                             minimum on-screen gap to the frame edge, px
# A 1920x1080 frame shows world x in cx +- 960/z, y in cy +- 540/z. Run it after every layout or camera-key change:
# eyeballing stills missed a 5 px crop that this caught.
import json, sys
cfg = json.load(open(sys.argv[1])); W2, H2, M = 960, 540, cfg.get('margin', 15)
bad = 0
for name, (cx, cy, z, need) in cfg['keys'].items():
    L, R, T, Bo = cx - W2 / z, cx + W2 / z, cy - H2 / z, cy + H2 / z
    for b in need:
        x0, y0, x1, y1 = cfg['boxes'][b]
        m = min(x0 - L, R - x1, y0 - T, Bo - y1) * z
        if m < M: bad += 1; print(f'FAIL {name:12s} {b:12s} {m:6.0f} px from the edge')
print('RESULT:', 'PASS' if not bad else f'FAIL ({bad})')
