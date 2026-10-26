# Is every spoken line clearly above the sound effects?  python voicecheck.py FILM_DIR   (run tools/mix.py first)
# Splits the narration into lines at pauses > 0.35 s (audio/words.json) and prints voice level, effects level and the gap.
# Pass: the voice is at least +6 dB over the effects on every line.
import json, os, re, subprocess, sys
import numpy as np

film = sys.argv[1]; FF = os.environ.get('FFMPEG', 'ffmpeg')
rd = lambda p: np.frombuffer(subprocess.run([FF, '-v', 'error', '-i', p, '-f', 'f32le', '-ac', '1', '-ar', '48000', '-'], capture_output=True, check=True).stdout, np.float32)
v, fx = rd(f'{film}/audio/stem_voice.wav'), rd(f'{film}/audio/stem_fx.wav')
OFF = float(re.search(r'VOICE_OFFSET\s*=\s*([\d.]+)', open(f'{film}/beats.js').read()).group(1))
W = json.load(open(f'{film}/audio/words.json'))
lines, cur = [], [W[0]]
for w in W[1:]:
    if w[1] - cur[-1][2] > .35: lines.append(cur); cur = []
    cur.append(w)
lines.append(cur)
db = lambda x, a, b: 20 * np.log10(np.sqrt((x[int(a * 48000):int(b * 48000)] ** 2).mean()) + 1e-9)
fails = 0
for ln in lines:
    a, b = ln[0][1] + OFF, ln[-1][2] + OFF
    fxl = db(fx, a, b); gap = db(v, a, b) - fxl; fails += gap < 6
    text = ' '.join(w for w, _, _ in ln)
    shown = 'no effects' if fxl < -90 else f'{gap:+6.1f} dB'
    print(f'{a:6.2f}-{b:6.2f}s  voice over effects {shown:>10}  {"OK  " if gap >= 6 else "FAIL"}  {text[:60]}')
print('RESULT:', 'PASS' if not fails else f'FAIL ({fails} line(s) under +6 dB)')
