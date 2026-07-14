#!/usr/bin/env python3
"""Gate 0 real photos -> site media: product squares (800), ambient 16:9 (1600w), logos, OG image."""
import os
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
G0 = os.path.join(HERE, '..', 'assets-in', 'gate0')
PUB = os.path.join(HERE, '..', 'site', 'public')
MEDIA = os.path.join(PUB, 'media')

def crop_ratio(img, rw, rh):
    w, h = img.size
    target = rw / rh
    if w / h > target:
        nw = int(h * target); x = (w - nw) // 2; return img.crop((x, 0, x + nw, h))
    nh = int(w / target); y = (h - nh) // 2; return img.crop((0, y, w, y + nh))

def save(src, dst, ratio, width, q=82):
    img = Image.open(src).convert('RGB')
    img = crop_ratio(img, *ratio)
    img = img.resize((width, int(width * ratio[1] / ratio[0])))
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    img.save(dst, quality=q, method=5)
    print(os.path.relpath(dst, PUB))

B = lambda *p: os.path.join(G0, *p)
P = lambda name: os.path.join(MEDIA, 'products', name)
A = lambda name: os.path.join(MEDIA, 'ambient', name)

# --- products (square on their native cream/white studio bg) ---
prod = {
    'oel-5.webp':        B('bottle', '©ApolloniaTheresaBitzan20231017190013_15A3941-2-2048x2048.jpg'),
    'oel-11.webp':       B('bottle', '©ApolloniaTheresaBitzan20231017190111_15A3942-2-2048x2048.jpg'),
    'oel-22.webp':       B('bottle', '©ApolloniaTheresaBitzan20231017190119_15A3943-2-2048x2048.jpg'),
    'oel-hunde.webp':    B('bottle', '©ApolloniaTheresaBitzan2023Oktober__15A3902-2.jpg'),
    'gel.webp':          B('product', '©ApolloniaTheresaBitzan202511132216258Q3A6686-2-2048x2048.jpg'),
    'balsam.webp':       B('product', '©ApolloniaTheresaBitzan202511132213018Q3A6678-2.jpg'),
    'creme-set.webp':    B('product', '©ApolloniaTheresaBitzan202511132207368Q3A6675-2-2048x2048.jpg'),
    'deocreme.webp':     B('product', '©ApolloniaTheresaBitzan202511132248408Q3A6714-2-2048x2048.jpg'),
    'shampoo.webp':      B('product', '©ApolloniaTheresaBitzan202511132302568Q3A6720-2-2048x2048.jpg'),
    'tee-bluete.webp':   B('farm', 'Bud.jpg'),
}
for name, src in prod.items():
    save(src, P(name), (1, 1), 800)

# category cards reuse hero product shots
cats = {
    'cat-oel.webp': prod['oel-5.webp'], 'cat-gel.webp': prod['gel.webp'],
    'cat-balsam.webp': prod['balsam.webp'], 'cat-kosmetik.webp': prod['creme-set.webp'],
    'cat-tee.webp': prod['tee-bluete.webp'],
}
for name, src in cats.items():
    save(src, P(name), (1, 1), 800)
save(B('horse', '21-8Q3A9319.jpg'), P('cat-tierprodukte.webp'), (1, 1), 800)

# --- ambient 16:9 ---
save(B('horse', '6-8Q3A8996.jpg'),  A('horses.webp'),    (16, 9), 1600)   # ploughing team
save(B('horse', '21-8Q3A9319.jpg'), A('begleiter.webp'), (16, 9), 1600)   # grazing horse (band)
save(B('horse', '51-8Q3A9679.jpg'), A('harness.webp'),   (16, 9), 1600)   # Kutschenfahrten texture
save(B('farm', '8Q3A5932-scaled-1.jpg'), A('hanf.webp'), (16, 9), 1600)   # young hemp plant
# hof hero = journey chapter-1 poster (sunrise field)
save(os.path.join(MEDIA, 'journey', 'poster-c1.webp'), A('feld.webp'), (16, 9), 1600)

# --- logos ---
solo = Image.open(B('logo', 'cropped-Logo-SonnwerkSolo-270x270.png'))
solo.save(os.path.join(PUB, 'logo-mark.png'))
for s in (48,):
    solo.resize((s, s)).save(os.path.join(PUB, 'favicon.png'))
lang = Image.open(B('logo', 'Logo-Natur-die-wirkt-lang.png'))
lang.resize((1400, int(lang.height * 1400 / lang.width))).save(os.path.join(PUB, 'logo-lang.png'), optimize=True)

# --- OG image 1200x630 from chapter-1 poster ---
og = Image.open(os.path.join(MEDIA, 'journey', 'poster-c1.webp')).convert('RGB')
og = crop_ratio(og, 1200, 630).resize((1200, 630))
og.save(os.path.join(PUB, 'og.jpg'), quality=85)
print('done')
