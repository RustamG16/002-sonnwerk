#!/usr/bin/env python3
"""Gate 0 horse photos -> /arbeit-mit-dem-pferd/ media, per files/2026-07-24-pferd-page-and-design-fix-plan.md §D2.
WebP derivatives at 1600/1000/640w, q72. Vision-scaled.jpg has its manifesto baked into the
top of the pixels (transcribed as real HTML text on the page) -> crop that band off first."""
import os
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, '..', 'assets-in', 'gate0', 'horse')
DST = os.path.join(HERE, '..', 'site', 'public', 'media', 'pferd')
os.makedirs(DST, exist_ok=True)

WIDTHS = [1600, 1000, 640]
Q = 72

def save_widths(img, name):
    w0, h0 = img.size
    for w in WIDTHS:
        if w > w0:
            continue
        h = round(h0 * w / w0)
        out = img.resize((w, h), Image.LANCZOS)
        path = os.path.join(DST, f'{name}-{w}.webp')
        out.save(path, quality=Q, method=5)
        print(os.path.relpath(path, DST), out.size, f'{os.path.getsize(path)/1024:.0f}KB')

# slug -> source filename (per §D2 image map)
photos = {
    'hero':       '69-8Q3A9873.jpg',
    'boden':      '17-8Q3A9285.jpg',
    'kultur':     '51-8Q3A9679.jpg',
    'tempo':      '6-8Q3A8996.jpg',
    'energie':    '21-8Q3A9319.jpg',
    'kreislauf':  '59-8Q3A9806.jpg',
    'waldkante':  '111-8Q3A0067-e1615927311231.jpg',
    'handwerk':   '65-8Q3A9853.jpg',
    'cta':        '9-8Q3A9182.jpg',
}

for slug, filename in photos.items():
    img = Image.open(os.path.join(SRC, filename)).convert('RGB')
    save_widths(img, slug)

# Pferdevision: crop the baked-in manifesto text (top ~430px of 1697) off, keep the clean photo below.
vision = Image.open(os.path.join(SRC, 'Vision-scaled.jpg')).convert('RGB')
w, h = vision.size
crop_top = 430
vision_clean = vision.crop((0, crop_top, w, h))
save_widths(vision_clean, 'pferdevision')

print('done')
