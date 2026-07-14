#!/usr/bin/env python3
"""Photo remap pass 2: real oil strengths (5/7/19%), Kühlend variants, tea jar for Tee,
dog-oil bottle for Tierprodukte, top-aligned horse crop for the Begleiter band, 1100px q85."""
import os
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
G0 = os.path.join(HERE, '..', 'assets-in', 'gate0')
MEDIA = os.path.join(HERE, '..', 'site', 'public', 'media')

def crop_ratio(img, rw, rh, fx=0.5, fy=0.5):
    """center-ish crop; fx/fy = focal point (0..1) the window pulls toward"""
    w, h = img.size
    target = rw / rh
    if w / h > target:
        nw = int(h * target); x = int((w - nw) * fx); return img.crop((x, 0, x + nw, h))
    nh = int(w / target); y = int((h - nh) * fy); return img.crop((0, y, w, y + nh))

def save(src, dst, ratio, width, q=85, fx=0.5, fy=0.5):
    img = Image.open(src).convert('RGB')
    img = crop_ratio(img, *ratio, fx=fx, fy=fy)
    img = img.resize((width, int(width * ratio[1] / ratio[0])))
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    img.save(dst, quality=q, method=5)
    print(os.path.basename(dst))

B = lambda *p: os.path.join(G0, *p)
P = lambda n: os.path.join(MEDIA, 'products', n)
A = lambda n: os.path.join(MEDIA, 'ambient', n)

prod = {
    'oel-5.webp':          B('bottle', '©ApolloniaTheresaBitzan20231017190013_15A3941-2-2048x2048.jpg'),
    'oel-7.webp':          B('bottle', '©ApolloniaTheresaBitzan2023Oktober__15A3902-2.jpg'),
    'oel-19.webp':         B('bottle', '©ApolloniaTheresaBitzan2023Oktober__15A3905-2.jpg'),
    'oel-hunde.webp':      B('bottle', '©ApolloniaTheresaBitzan2023Oktober__15A3903-2.jpg'),
    'gel.webp':            B('product', '©ApolloniaTheresaBitzan202511132216258Q3A6686-2-2048x2048.jpg'),
    'gel-kuehlend.webp':   B('product', '©ApolloniaTheresaBitzan202511132216358Q3A6687-2-2048x2048.jpg'),
    'balsam.webp':         B('product', '©ApolloniaTheresaBitzan202511132213018Q3A6678-2.jpg'),
    'balsam-kuehlend.webp':B('product', '©ApolloniaTheresaBitzan202511132214118Q3A6679-2.jpg'),
    'creme-set.webp':      B('product', '©ApolloniaTheresaBitzan202511132207368Q3A6675-2-2048x2048.jpg'),
    'deocreme.webp':       B('product', '©ApolloniaTheresaBitzan202511132248408Q3A6714-2-2048x2048.jpg'),
    'shampoo.webp':        B('product', '©ApolloniaTheresaBitzan202511132302568Q3A6720-2-2048x2048.jpg'),
}
for name, src in prod.items():
    save(src, P(name), (1, 1), 1100)

# tea jar (cat + jar photo): focus window on the jar, left third
save(B('farm', '8Q3A6133-scaled.jpg'), P('tee-bluete.webp'), (1, 1), 1100, fx=0.12)

cats = {
    'cat-oel.webp': 'oel-5.webp', 'cat-gel.webp': 'gel.webp', 'cat-balsam.webp': 'balsam.webp',
    'cat-kosmetik.webp': 'creme-set.webp', 'cat-tee.webp': 'tee-bluete.webp',
    'cat-tierprodukte.webp': 'oel-hunde.webp',
}
for name, src in cats.items():
    save(P(src), P(name), (1, 1), 1100)

# Begleiter band: keep the horse's head — pull crop window to the top
save(B('horse', '21-8Q3A9319.jpg'), A('begleiter.webp'), (16, 9), 1600, fy=0.12)
print('done')
