# Measure camera motion, activity and palette of a reference clip.
# usage: python tools/measure.py ref/half.mp4 "6.52 15.32 17.55 21.67 29.23"
import sys, json, cv2, numpy as np

path, cuts = sys.argv[1], [float(c) for c in sys.argv[2].split()] if len(sys.argv) > 2 else []
cap = cv2.VideoCapture(path)
fps = cap.get(cv2.CAP_PROP_FPS)
prev, rows, pix = None, [], []
i = 0
while True:
    ok, f = cap.read()
    if not ok: break
    t = i / fps
    if i % 2 == 0:  # 30 fps
        g = cv2.cvtColor(cv2.resize(f, (960, 540)), cv2.COLOR_BGR2GRAY)
        if i % 30 == 0:
            pix.append(cv2.resize(f, (96, 54)).reshape(-1, 3))
        if prev is not None:
            diff = float(np.mean(cv2.absdiff(g, prev)))
            p0 = cv2.goodFeaturesToTrack(prev, 400, 0.01, 8)
            s = tx = ty = None
            if p0 is not None and len(p0) > 20:
                p1, st, _ = cv2.calcOpticalFlowPyrLK(prev, g, p0, None)
                good = st.ravel() == 1
                if good.sum() > 20:
                    M, inl = cv2.estimateAffinePartial2D(p0[good], p1[good], method=cv2.RANSAC)
                    if M is not None:
                        s = float(np.hypot(M[0, 0], M[1, 0])); tx = float(M[0, 2]) * 2; ty = float(M[1, 2]) * 2
            cut = any(abs(t - c) < 0.04 for c in cuts)
            rows.append(dict(t=round(t, 3), diff=round(diff, 2), s=s, tx=tx, ty=ty, cut=cut))
        prev = g
    i += 1

# per-shot camera summary (zoom product, pan sum), ignoring cut frames
edges = [0] + cuts + [rows[-1]['t'] + 0.1]
print(f"fps={fps:.0f} frames={i}")
for a, b in zip(edges, edges[1:]):
    r = [x for x in rows if a < x['t'] < b and not x['cut'] and x['s']]
    if not r: continue
    z = float(np.prod([x['s'] for x in r])); px = sum(x['tx'] for x in r); py = sum(x['ty'] for x in r)
    still = sum(1 for x in r if x['diff'] < 0.3) / len(r)
    zr = [x['s'] for x in r]
    print(f"shot {a:5.2f}-{b:5.2f} ({b-a:4.1f}s) zoom x{z:.3f}  pan ({px:+.0f},{py:+.0f})px@1080  "
          f"peak zoom/frame {max(zr):.4f}/{min(zr):.4f}  still-frames {still*100:.0f}%  mean diff {np.mean([x['diff'] for x in r]):.2f}")

# zoom curve sampling every 0.5 s (cumulative per shot) to see ease shape
print("cumulative zoom every 0.5s (resets at cuts):")
z, line, nexts, shot = 1.0, [], 0.5, 0
for x in rows:
    if x['cut']: z = 1.0; line.append('|')
    if x['s']: z *= x['s']
    if x['t'] >= nexts: line.append(f"{z:.3f}"); nexts += 0.5
print(' '.join(line))

# palette: k-means 10
P = np.concatenate(pix).astype(np.float32)
_, lab, cen = cv2.kmeans(P, 10, None, (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 30, 1.0), 3, cv2.KMEANS_PP_CENTERS)
cnt = np.bincount(lab.ravel(), minlength=10)
for k in np.argsort(-cnt):
    b, g, r = cen[k]
    print(f"#{int(r):02x}{int(g):02x}{int(b):02x}  {cnt[k]/cnt.sum()*100:4.1f}%")
hsv = cv2.cvtColor(P.reshape(-1, 1, 3).astype(np.uint8), cv2.COLOR_BGR2HSV).reshape(-1, 3)
print(f"median brightness {np.median(hsv[:,2]):.0f}/255, median saturation {np.median(hsv[:,1]):.0f}/255, pixels under 25% brightness {np.mean(hsv[:,2]<64)*100:.0f}%")
