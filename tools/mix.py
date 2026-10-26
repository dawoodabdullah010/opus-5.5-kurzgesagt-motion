# Mix: voice with "real recording" depth + room tone + sound effects on their beats -> FILM_DIR/audio/mix.wav at -14 LUFS.
# usage: python mix.py FILM_DIR      (reads FILM_DIR/beats.js, audio/voice.mp3, audio/words.json, audio/sfx/*.mp3, cues.json)
# cues.json: {"radio": ["\"Houston", "problem.\""],              optional: first and last word of a line to put "on the radio"
#             "cues": [["bang", "bang", 0, "onset", 8], ["whoosh_in~r", "cut1", 0, "peak", -15], ...]}
#   [sfx file (~r = reversed, a riser that peaks on its anchor), beat name or seconds, shift s, "onset" (hits) or "peak" (whooshes), gain dB vs the voice]
# Needs roomtone.mp3 in audio/sfx. FFMPEG env var = ffmpeg binary (default: ffmpeg on PATH).
import json, os, re, subprocess, sys
import numpy as np

FILM = sys.argv[1]
FF = os.environ.get('FFMPEG', 'ffmpeg')
SR, DUR = 48000, 0
N = int(SR * DUR)
A = f'{FILM}/audio'

def decode(path, af=None):
    cmd = [FF, '-v', 'error', '-i', path] + (['-af', af] if af else []) + ['-f', 'f32le', '-ac', '2', '-ar', str(SR), '-']
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, np.float32).reshape(-1, 2).copy()

def db(x): return 10 ** (x / 20)

def put(bus, clip, start):
    i = int(round(start * SR))
    a, b = max(0, i), min(N, i + len(clip))
    if b > a: bus[a:b] += clip[a - i:b - i]

def env(clip, win=0.01):
    m = np.abs(clip).max(1); k = max(1, int(win * SR))
    return np.convolve(m, np.ones(k) / k, 'same')

def peak_t(clip): return env(clip).argmax() / SR
def onset_t(clip):
    e = env(clip, .005); return np.argmax(e > e.max() * db(-30)) / SR

# beats from the film
_bj = open(f'{FILM}/beats.js').read()
CFG = json.load(open(f'{FILM}/cues.json'))
B = json.loads(_bj.split('window.B = ')[1].rstrip().rstrip(';'))
OFF = float(re.search(r'VOICE_OFFSET\s*=\s*([\d.]+)', _bj).group(1))
DUR = (int(re.search(r'window\.LAST = (\d+)', _bj).group(1)) + 1) / 60
N = int(SR * DUR)

# 1. voice: warmth, presence, de-ess, gentle compression, soft saturation, small-room early reflections
voice_chain = ('highpass=f=75,equalizer=f=170:t=q:w=1.1:g=2.2,equalizer=f=3400:t=q:w=1.2:g=1.2,'
               'deesser=i=0.35,acompressor=threshold=-21dB:ratio=2.4:attack=6:release=110:makeup=2,'
               'asoftclip=type=tanh:threshold=0.85,'
               'aecho=0.85:0.5:9|17|26|38:0.16|0.11|0.08|0.05')
voice = decode(f'{A}/voice.mp3', voice_chain)
# the radio line: band-limited, a little crunchy, crossfaded in over the quote only
radio = decode(f'{A}/voice.mp3', 'highpass=f=450,lowpass=f=2900,acompressor=threshold=-25dB:ratio=4:makeup=4,asoftclip=type=hard:threshold=0.6')
W = json.load(open(f'{A}/words.json'))
R0, R1 = CFG.get('radio', [None, None])
if R0:                                                           # times in the voice file (before the lead-in offset)
    q0 = [s for w, s, e in W if w == R0][0] - .05; q1 = [e for w, s, e in W if w == R1][0] + .25
    n_ = min(len(voice), len(radio)); voice, radio = voice[:n_], radio[:n_]
    i0, i1, xf_ = int(q0 * SR), int(q1 * SR), int(.04 * SR)
    mask = np.zeros(len(voice), np.float32); mask[i0:i1] = 1
    mask[i0 - xf_:i0] = np.linspace(0, 1, xf_); mask[i1:i1 + xf_] = np.linspace(1, 0, xf_)
    voice = voice * (1 - mask[:, None]) + radio * .9 * mask[:, None]
bus = np.zeros((N, 2), np.float32)
put(bus, voice, OFF)

# 2. room tone: looped with crossfades, kept low (audible only between words)
rt = decode(f'{A}/sfx/roomtone.mp3', 'highpass=f=45,lowpass=f=7000')
rt = rt / (np.sqrt((rt ** 2).mean()) + 1e-9) * db(-52)          # RMS -52 dBFS before the final loudness match
xf = int(SR * 1.0); tone = np.zeros((N + xf, 2), np.float32); pos = 0
ramp = np.linspace(0, 1, xf)[:, None]
while pos < N:
    seg = rt.copy(); seg[:xf] *= ramp; seg[-xf:] *= ramp[::-1]
    put_len = min(len(seg), len(tone) - pos); tone[pos:pos + put_len] += seg[:put_len]; pos += len(seg) - xf
tone = tone[:N]; tone[:int(.25 * SR)] *= np.linspace(0, 1, int(.25 * SR))[:, None]
bus += tone

# 3. sound effects: (file, anchor time, 'peak' or 'onset', gain dB)
FX = [(f, (B[k] if isinstance(k, str) else k) + sh, mode, g) for f, k, sh, mode, g in CFG['cues']]
fxbus = np.zeros((N, 2), np.float32)
vref = np.sqrt((voice ** 2).mean())
for name, t, mode, g in FX:
    base, rev = name.split('~')[0], name.endswith('~r')   # ~r = reversed: a riser that peaks on the cut
    clip = decode(f'{A}/sfx/{base}.mp3', 'areverse' if rev else None)
    clip = clip / (np.sqrt((clip ** 2).mean()) + 1e-9) * vref * db(g)     # level relative to the voice's RMS
    clip[-int(.05 * SR):] *= np.linspace(1, 0, int(.05 * SR))[:, None]
    shift = peak_t(clip) if mode == 'peak' else onset_t(clip)
    put(fxbus, clip, t - shift)
    print(f'{name:11s} {mode:5s} anchored {t:6.2f}s  starts {t - shift:6.2f}s  gain {g} dB')
# the effects share the voice's room, lightly
fx_room = fxbus.copy()
for d_ms, a in ((9, .1), (17, .07), (26, .05)):
    k = int(SR * d_ms / 1000); fx_room[k:] += fxbus[:-k] * a
# the voice is never masked (K23): effects duck under speech, about 9 dB, fast attack, slow release
vbus = np.zeros(N, np.float32); vv = np.abs(voice).max(1); put_n = min(len(vv), N - int(OFF * SR)); vbus[int(OFF * SR):int(OFF * SR) + put_n] = vv[:put_n]
k = int(.08 * SR); venv = np.convolve(vbus, np.ones(k) / k, 'same')
act = np.clip(venv / (venv.max() * .12 + 1e-9), 0, 1)
rel = int(.35 * SR); act = np.maximum(act, np.convolve(act, np.ones(rel) / rel, 'same') * 1.4).clip(0, 1)
duck = (1 - (1 - db(-9)) * act)[:, None]
bus += fx_room * duck

# stems for tools/voicecheck.py: the voice (with room tone) and the ducked effects, before the loudness match
for name, x in (('stem_voice', bus - fx_room * duck), ('stem_fx', fx_room * duck)):
    subprocess.run([FF, '-v', 'error', '-y', '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-i', '-', f'{A}/{name}.wav'], input=x.astype(np.float32).tobytes(), check=True)
raw = f'{A}/mix_raw.wav'
subprocess.run([FF, '-v', 'error', '-y', '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-i', '-', raw], input=bus.tobytes(), check=True)
# 4. two-pass loudness match to -14 LUFS, true peak -1.5 dB
m = subprocess.run([FF, '-hide_banner', '-i', raw, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'],
                   capture_output=True, text=True).stderr
j = json.loads(m[m.rindex('{'):m.rindex('}') + 1])
af = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}"
      f":measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true")
subprocess.run([FF, '-v', 'error', '-y', '-i', raw, '-af', af, '-ar', str(SR), f'{A}/mix.wav'], check=True)
out = subprocess.run([FF, '-hide_banner', '-i', f'{A}/mix.wav', '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
print('final:', ' '.join(l.strip() for l in out.splitlines()[-12:] if 'I:' in l or 'Peak:' in l))
