#!/usr/bin/env python3
"""Gate 0 horse photos -> /arbeit-mit-dem-pferd/ media, per files/2026-07-24-pferd-page-and-design-fix-plan.md §D2.
WebP derivatives at 1600/1000/640w, q72. Vision-scaled.jpg has its manifesto baked into the
top of the pixels (transcribed as real HTML text on the page) -> crop that band off first."""
import os
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
# Rooted at assets-in, not assets-in/gate0 — sources now come from more than one gate
# (the hero is a Gate-1 NANO render), so each entry below carries its own gate folder.
ASSETS = os.path.join(HERE, '..', 'assets-in')
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

# slug -> (subfolder, source filename) per §D2 image map.
# energie repointed to gate0/farm per files/2026-07-26-pass2-proximity-crop-and-blend-plan.md
# Phase C — the full ploughing team in daylight, replacing the half-cropped grazing muzzle.
# hero repointed to the Gate-1 NANO render (man at the horse's head, soft overcast) —
# replaces 69-8Q3A9873.jpg, whose alt never matched the frame anyway.
photos = {
    'hero':       ('NANO',       'hf_20260726_232053_78440d50-d56b-4f81-8853-817c61804849.png'),
    'boden':      ('gate0/horse', '17-8Q3A9285.jpg'),
    'kultur':     ('gate0/horse', '51-8Q3A9679.jpg'),
    'tempo':      ('NANO', 'Horses_pulling_carriage_on_track_202607270255.jpeg'),
    'energie':    ('gate0/farm',  '13-8Q3A9263.jpg'),
    'kreislauf':  ('gate0/horse', '59-8Q3A9806.jpg'),
    'waldkante':  ('NANO', 'Hemp_plants_filling_frame_edge_202607270255.jpeg'),
    'handwerk':   ('gate0/horse', '65-8Q3A9853.jpg'),
    'cta':        ('gate0/horse', '9-8Q3A9182.jpg'),
}

for slug, (subfolder, filename) in photos.items():
    img = Image.open(os.path.join(ASSETS, subfolder, filename)).convert('RGB')
    save_widths(img, slug)

# Pferdevision: crop the baked-in manifesto text (top ~430px of 1697) off, keep the clean photo below.
vision = Image.open(os.path.join(ASSETS, 'gate0', 'horse', 'Vision-scaled.jpg')).convert('RGB')
w, h = vision.size
crop_top = 430
vision_clean = vision.crop((0, crop_top, w, h))
save_widths(vision_clean, 'pferdevision')

print('done')
