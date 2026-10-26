# One ElevenLabs sound effect: python sfx.py FILM_DIR name seconds "prompt"  ->  FILM_DIR/audio/sfx/name.mp3
# End every prompt with "no music". Prints the credits the account counter moved (it often lags; MEASURED ~0-113 per effect).
import http.client, json, os, sys, time, urllib.request

K = os.environ['ELEVENLABS_API_KEY']
def used():
    r = urllib.request.Request('https://api.elevenlabs.io/v1/user/subscription', headers={'xi-api-key': K})
    return json.load(urllib.request.urlopen(r))['character_count']
film, name, dur, text = sys.argv[1], sys.argv[2], float(sys.argv[3]), sys.argv[4]
os.makedirs(f'{film}/audio/sfx', exist_ok=True)
u0 = used()
body = json.dumps({'text': text, 'duration_seconds': dur, 'prompt_influence': 0.5}).encode()
r = urllib.request.Request('https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_192', data=body,
                           headers={'xi-api-key': K, 'Content-Type': 'application/json'})
for attempt in range(4):
    try: data = urllib.request.urlopen(r, timeout=120).read(); break
    except (http.client.IncompleteRead, OSError) as e: print('retry', type(e).__name__); time.sleep(2)
open(f'{film}/audio/sfx/{name}.mp3', 'wb').write(data)
print(name, 'credits used:', used() - u0)
