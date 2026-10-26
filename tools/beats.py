# Story beats from the voice's word times: python beats.py FILM_DIR beats.spec.json
# spec: {"offset": 0.3, "endcard": 1.45,
#        "beats": {"bang": ["bang"], "fuel": ["iron", 2], "cut1": ["it", 1, -0.1, "cut"], ...}}
#   [word, occurrence = 1, shift seconds = 0, "cut"]: the word's start + offset + shift; "cut" rounds to a whole 60 fps frame.
#   Words match without punctuation and case ("then..." -> "then"). Count occurrences carefully: "to" appears many times.
# Adds "end" (last word's end) and "title" (end + 0.25), and window.LAST (title + endcard). Writes FILM_DIR/beats.js.
import json, math, sys

film, spec = sys.argv[1], json.load(open(sys.argv[2]))
W = json.load(open(f'{film}/audio/words.json')); OFF = spec.get('offset', .3)
norm = lambda w: w.strip('.,!?:;"“”').lower()
def start(word, n=1):
    k = 0
    for w, s, e in W:
        if norm(w) == word:
            k += 1
            if k == n: return s + OFF
    raise SystemExit(f'beat word not found: {word!r} occurrence {n}')
B = {}
for name, args in spec['beats'].items():
    word, n, shift, kind = list(args) + [None, 1, 0, ''][len(args):]
    t = start(word.lower(), n) + shift
    B[name] = round(round(t * 60) / 60, 4) if kind == 'cut' else round(t, 3)
B['end'] = round(W[-1][2] + OFF, 3); B['title'] = round(B['end'] + .25, 3)
last = math.ceil((B['title'] + spec.get('endcard', 1.45)) * 60) - 1
open(f'{film}/beats.js', 'w').write(f'// Beats (s) from audio/words.json + {OFF} s lead-in. Cuts on whole 60 fps frames.\n'
                                     f'window.VOICE_OFFSET = {OFF};\nwindow.LAST = {last};\nwindow.B = {json.dumps(B)};\n')
print(json.dumps(B, indent=1)); print('LAST', last, '=', round((last + 1) / 60, 2), 's')
print('cut frames:', {k: round(v * 60) for k, v in B.items() if k.startswith('cut')})
