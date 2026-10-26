# Narration with word timestamps from ElevenLabs.
# usage: python voice.py FILM_DIR script.txt [voice_id]
# writes FILM_DIR/audio/voice.mp3 and FILM_DIR/audio/words.json ([[word, start, end], ...], seconds)
# Needs ELEVENLABS_API_KEY in the environment. On a CERTIFICATE_VERIFY_FAILED error: export SSL_CERT_FILE=$(python -m certifi)
# Never change the speed of the result (no atempo). The film's length follows the voice.
import base64, http.client, json, os, sys, time, urllib.request

film, script = sys.argv[1], open(sys.argv[2]).read().strip()
voice_id = sys.argv[3] if len(sys.argv) > 3 else 'UGTtbzgh3HObxRjWaSpr'   # ElevenLabs premade "Brian - gentle realistic reader"
body = json.dumps({'text': script, 'model_id': 'eleven_multilingual_v2',
                   'voice_settings': {'stability': .5, 'similarity_boost': .75, 'style': 0.0, 'use_speaker_boost': True}}).encode()
for attempt in range(5):                       # the API connection sometimes drops mid-download
    try:
        r = urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{voice_id}/with-timestamps?output_format=mp3_44100_192',
                                   data=body, headers={'xi-api-key': os.environ['ELEVENLABS_API_KEY'], 'Content-Type': 'application/json'})
        d = json.loads(urllib.request.urlopen(r, timeout=180).read()); break
    except (http.client.IncompleteRead, OSError) as e:
        print('retry', type(e).__name__); time.sleep(3)
os.makedirs(f'{film}/audio', exist_ok=True)
open(f'{film}/audio/voice.mp3', 'wb').write(base64.b64decode(d['audio_base64']))
a = d['alignment']; words, cur = [], ''
for ch, s, e in zip(a['characters'], a['character_start_times_seconds'], a['character_end_times_seconds']):
    if ch.isspace():
        if cur: words.append([cur, s0, pe]); cur = ''
        continue
    if not cur: s0 = s
    cur += ch; pe = e
if cur: words.append([cur, s0, pe])
json.dump(words, open(f'{film}/audio/words.json', 'w'))
print(len(script), 'characters, duration', round(a['character_end_times_seconds'][-1], 2), 's')
print(' '.join(f'{w}@{s:.2f}' for w, s, e in words))
