# usage: python sheet.py frames_dir out.jpg f1 f2 ... (5 per row, labelled)
import sys
from PIL import Image, ImageDraw
d, out, fs = sys.argv[1], sys.argv[2], [int(x) for x in sys.argv[3:]]
w, h, cols = 384, 216, 5
rows = (len(fs) + cols - 1) // cols
S = Image.new('RGB', (w * cols, h * rows), 'black')
for i, f in enumerate(fs):
    im = Image.open(f'{d}/f{f:04d}.png').convert('RGB').resize((w, h))
    ImageDraw.Draw(im).text((6, 4), f'f{f}', fill='white')
    S.paste(im, ((i % cols) * w, (i // cols) * h))
S.save(out, quality=88)
