#!/usr/bin/env python3
"""Pass 3: gallery set for the infinite canvas page (max 900px long edge).
Homepage bento uses Deocreme studio still — never write cat-tee / tee-bluete from farm grass shots."""
import os
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
G0 = os.path.join(HERE, '..', 'assets-in', 'gate0')
NANO = os.path.join(HERE, '..', 'assets-in', 'NANO')
MEDIA = os.path.join(HERE, '..', 'site', 'public', 'media')

def crop_ratio(img, rw, rh, fx=0.5, fy=0.5):
    w, h = img.size
    target = rw / rh
    if w / h > target:
        nw = int(h * target); x = int((w - nw) * fx); return img.crop((x, 0, x + nw, h))
    nh = int(w / target); y = int((h - nh) * fy); return img.crop((0, y, w, y + nh))

def save(src, dst, ratio, width, q=82, fx=0.5, fy=0.5):
    img = Image.open(src).convert('RGB')
    img = crop_ratio(img, *ratio, fx=fx, fy=fy)
    img = img.resize((width, int(width * ratio[1] / ratio[0])))
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    img.save(dst, quality=q, method=5)
    print(os.path.basename(dst))

B = lambda *p: os.path.join(G0, *p)

# Deocreme — Bitzan studio still for the bento slot that used to be Tee
deo = B('product', '©ApolloniaTheresaBitzan202511132248408Q3A6714-2-2048x2048.jpg')
if not os.path.isfile(deo):
    # Windows sometimes strips the © from the filename
    deo = B('product', 'cApolloniaTheresaBitzan202511132248408Q3A6714-2-2048x2048.jpg')
save(deo, os.path.join(MEDIA, 'products', 'deocreme.webp'), (1, 1), 1100, q=85)
save(deo, os.path.join(MEDIA, 'products', 'cat-deocreme.webp'), (1, 1), 1100, q=85)
# Ensure grass Tee assets stay gone
for stale in ('cat-tee.webp', 'tee-bluete.webp'):
    p = os.path.join(MEDIA, 'products', stale)
    if os.path.isfile(p):
        os.remove(p)
        print('removed', stale)

# Gallery: farm + production, mixed portrait/landscape
GAL = os.path.join(MEDIA, 'galerie')
items = [
    # (src, out, ratio, fx, fy)
    (B('farm', '8Q3A5975-scaled.jpg'),  'sense.webp',    (3, 4), 0.35, 0.5),
    (B('farm', '8Q3A5932-scaled-1.jpg'),'jungpflanze.webp',(1, 1), 0.5, 0.5),
    (B('farm', '8Q3A5987-scaled.jpg'),  'haende.webp',   (4, 3), 0.5, 0.35),
    (B('farm', '8Q3A6133-scaled.jpg'),  'hofkatze.webp', (4, 3), 0.3, 0.5),
    (os.path.join(NANO, 'Hemp_plants_filling_frame_edge_202607270255.jpeg'), 'bluete.webp', (3, 4), 0.5, 0.5),
    (B('farm', '8Q3A5888-scaled-e1616013664921.jpg'), 'feldarbeit.webp', (4, 3), 0.5, 0.5),
    (B('farm', '13-8Q3A9263.jpg'),      'hof.webp',      (4, 3), 0.5, 0.5),
    (B('horse', '6-8Q3A8996.jpg'),      'pfluegen.webp', (3, 4), 0.55, 0.4),
    (B('horse', '21-8Q3A9319.jpg'),     'grasen.webp',   (4, 3), 0.5, 0.15),
    (B('horse', '65-8Q3A9853-980x653.jpg'), 'zaumzeug.webp', (4, 3), 0.5, 0.4),
    (B('horse', '9-8Q3A9182.jpg'),      'gespann.webp',  (4, 3), 0.5, 0.5),
    (B('horse', '69-8Q3A9873.jpg'),     'stall.webp',    (3, 4), 0.5, 0.5),
]
for src, name, ratio, fx, fy in items:
    save(src, os.path.join(GAL, name), ratio, 900 if ratio[0] >= ratio[1] else 675, fx=fx, fy=fy)
print('done')
