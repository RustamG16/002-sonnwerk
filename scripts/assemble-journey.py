#!/usr/bin/env python3
"""Assemble journey frames: continuous numbering across 4 clips, 8-frame crossfade at
each seam (clips are graded-matched cuts, not frame-matched), poster, mobile set
(clips 1+4 at 800w with 10-frame crossfade — approved creative decision)."""
import os
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
TMP = os.path.join(HERE, '..', 'ingest-tmp')
OUT = os.path.join(HERE, '..', 'site', 'public', 'media', 'journey')
OUTM = os.path.join(HERE, '..', 'site', 'public', 'media', 'journey-mobile')
os.makedirs(OUT, exist_ok=True); os.makedirs(OUTM, exist_ok=True)
Q = 70
XFADE = 8

clips = []
for c in ['c1', 'c2', 'c3', 'c4']:
    d = os.path.join(TMP, c)
    clips.append([os.path.join(d, f) for f in sorted(os.listdir(d))])

def save(img, n, outdir=OUT):
    img.save(os.path.join(outdir, f'frame_{n:04d}.webp'), quality=Q, method=4)

n = 0
for ci, frames in enumerate(clips):
    prev_last = Image.open(clips[ci - 1][-1]).convert('RGB') if ci > 0 else None
    for fi, path in enumerate(frames):
        n += 1
        img = Image.open(path).convert('RGB')
        if prev_last is not None and fi < XFADE:
            a = prev_last.resize(img.size)
            img = Image.blend(a, img, (fi + 1) / (XFADE + 1))
        save(img, n)
print('desktop frames:', n)

Image.open(clips[0][0]).convert('RGB').save(os.path.join(OUT, 'poster.webp'), quality=80, method=4)
# chapter posters (fallback stills / og image source)
for ci, frames in enumerate(clips):
    Image.open(frames[0]).convert('RGB').save(os.path.join(OUT, f'poster-c{ci+1}.webp'), quality=80, method=4)

# mobile: clips 1 + 4 only, 800w, 10-frame crossfade at the join
m = 0
XM = 10
c1, c4 = clips[0], clips[3]
last_c1 = None
for fi, path in enumerate(c1):
    m += 1
    img = Image.open(path).convert('RGB')
    img = img.resize((800, int(img.height * 800 / img.width)))
    last_c1 = img
    save(img, m, OUTM)
for fi, path in enumerate(c4):
    m += 1
    img = Image.open(path).convert('RGB')
    img = img.resize((800, int(img.height * 800 / img.width)))
    if fi < XM:
        img = Image.blend(last_c1.resize(img.size), img, (fi + 1) / (XM + 1))
    save(img, m, OUTM)
Image.open(c1[0]).convert('RGB').resize((800, 450)).save(os.path.join(OUTM, 'poster.webp'), quality=78, method=4)
print('mobile frames:', m)
