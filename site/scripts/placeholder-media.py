#!/usr/bin/env python3
"""SONNWERK placeholder media — makes the site buildable before Gate 0/1/2 assets exist.
Generates: journey frame sequence (4 chained chapters, continuous motion), mobile half-res
set (clips 1+4 with crossfade feel), journey poster, ambient posters, category/product images.
Brand tokens: #0D1408 / #F2EBDC / #E8A33D, golden-hour gradient + grain."""
import math, os, random
from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
PUB = os.path.join(HERE, '..', 'public', 'media')
BG = (13, 20, 8); CREAM = (242, 235, 220); GOLD = (232, 163, 61)
CHAPTERS = ['FELD', 'ERNTE', 'EXTRAKTION', 'FLASCHE']
PER = 60  # frames per chapter (placeholder; real ingest sets counts in site.ts)

def lerp(a, b, t): return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))

def grain(img, n=350, seed=0):
    d = ImageDraw.Draw(img, 'RGBA'); random.seed(seed)
    W, H = img.size
    for _ in range(n):
        d.point((random.randint(0, W), random.randint(0, H)), fill=CREAM + (random.randint(6, 26),))
    return img

def sky(d, W, H, sun_y, glow):
    for y in range(H):
        t = y / H
        c = lerp(lerp((26, 32, 14), BG, t), GOLD, max(0, glow * (1 - abs(y - sun_y) / (H * 0.55)) ** 2) * 0.55)
        d.line([(0, y), (W, y)], fill=c)

def frame(gt, W, H, label):
    """gt in [0,1] across the WHOLE journey — continuous so seams feel chained."""
    img = Image.new('RGB', (W, H), BG); d = ImageDraw.Draw(img, 'RGBA')
    ch = min(3, int(gt * 4)); lt = gt * 4 - ch  # chapter + local t
    sun_y = H * (0.42 - 0.10 * math.sin(gt * math.pi))
    sky(d, W, H, sun_y, glow=0.5 + 0.5 * math.sin(gt * math.pi))
    # sun disc
    r = int(H * (0.055 + 0.02 * gt)); cx = int(W * (0.3 + 0.4 * gt))
    d.ellipse([cx - r, sun_y - r, cx + r, sun_y + r], fill=GOLD + (200,))
    d.ellipse([cx - r * 2, sun_y - r * 2, cx + r * 2, sun_y + r * 2], outline=GOLD + (40,), width=6)
    if ch == 0:  # FELD: perspective rows drifting toward viewer
        for k in range(12):
            p = (k + lt) / 12
            y = int(H * 0.55 + (H * 0.5) * p ** 2)
            spread = 0.5 + 2.2 * p
            d.line([(W / 2 - W * spread / 2, y), (W / 2 + W * spread / 2, y)], fill=(30, 42, 18, 160), width=max(1, int(1 + 6 * p)))
    elif ch == 1:  # ERNTE: stalks + a cutting sweep
        for k in range(9):
            x = int(W * (0.08 + 0.1 * k)); h = int(H * (0.5 + 0.08 * math.sin(k * 2.3)))
            d.line([(x, H), (x + int(14 * math.sin(lt * math.pi + k)), H - h)], fill=(34, 48, 20), width=10)
        sw = int(W * lt)
        d.line([(sw, H * 0.35), (sw - 80, H * 0.75)], fill=GOLD + (150,), width=4)
    elif ch == 2:  # EXTRAKTION: glass column + falling drop
        gx = W // 2
        d.rectangle([gx - 60, H * 0.15, gx + 60, H * 0.9], outline=CREAM + (60,), width=3)
        dy = H * (0.2 + 0.65 * lt)
        d.ellipse([gx - 14, dy, gx + 14, dy + 20], fill=GOLD + (230,))
        d.rectangle([gx - 57, H * 0.9 - 40 * lt - 30, gx + 57, H * 0.9], fill=(GOLD[0], GOLD[1], GOLD[2], 90))
    else:  # FLASCHE: bottle silhouette revealed by dolly-out
        s = 0.55 + 0.45 * (1 - lt)  # starts tight, pulls back
        bw, bh = int(W * 0.11 / s), int(H * 0.5 / s)
        bx, by = W // 2, int(H * 0.72)
        d.rounded_rectangle([bx - bw // 2, by - bh, bx + bw // 2, by], radius=bw // 5, fill=(8, 12, 5))
        d.rectangle([bx - bw // 6, by - bh - bh // 5, bx + bw // 6, by - bh], fill=(8, 12, 5))
        d.line([(bx - bw // 2 + 6, by - bh + 10), (bx - bw // 2 + 6, by - 10)], fill=GOLD + (170,), width=4)
        d.rectangle([bx - bw // 3, by - bh * 0.55, bx + bw // 3, by - bh * 0.2], fill=CREAM + (28,))
    img = img.filter(ImageFilter.GaussianBlur(0.6))
    grain(img, seed=int(gt * 1000))
    ImageDraw.Draw(img).text((18, H - 30), f'PLACEHOLDER · {label}', fill=(90, 88, 70))
    return img

def journey():
    total = PER * 4
    out = os.path.join(PUB, 'journey'); os.makedirs(out, exist_ok=True)
    for i in range(total):
        gt = i / (total - 1)
        frame(gt, 1600, 900, CHAPTERS[min(3, int(gt * 4))]).save(f'{out}/frame_{i+1:04d}.webp', quality=68, method=4)
    frame(0, 1600, 900, 'FELD').save(f'{out}/poster.webp', quality=80)
    # mobile: clips 1+4 only (approved creative decision), half-res, crossfade in the middle
    outm = os.path.join(PUB, 'journey-mobile'); os.makedirs(outm, exist_ok=True)
    n = 0
    for i in range(PER):
        n += 1; frame(i / (4 * PER - 1), 800, 450, 'FELD').save(f'{outm}/frame_{n:04d}.webp', quality=66, method=4)
    for i in range(PER):
        n += 1
        img = frame((3 * PER + i) / (4 * PER - 1), 800, 450, 'FLASCHE')
        if i < 8:  # crossfade from clip 1's last frame
            a = frame((PER - 1) / (4 * PER - 1), 800, 450, 'FELD')
            img = Image.blend(a, img, (i + 1) / 9)
        img.save(f'{outm}/frame_{n:04d}.webp', quality=66, method=4)
    print(f'journey: {total} + mobile {n} frames')

def still(W, H, base, draw_fn, label, path, q=80):
    img = Image.new('RGB', (W, H), base); d = ImageDraw.Draw(img, 'RGBA')
    draw_fn(d, W, H)
    img = img.filter(ImageFilter.GaussianBlur(0.5)); grain(img, seed=hash(label) % 9999)
    ImageDraw.Draw(img).text((14, H - 26), f'PLACEHOLDER · {label}', fill=(120, 112, 95) if base == CREAM else (90, 88, 70))
    os.makedirs(os.path.dirname(path), exist_ok=True); img.save(path, quality=q, method=4)

def ambient_posters():
    def golden(d, W, H):
        sky(d, W, H, H * 0.4, 0.8)
    for name in ['dogs', 'horses', 'tea', 'hanf']:
        def fn(d, W, H, name=name):
            golden(d, W, H)
            if name == 'horses':
                for k in range(3): d.ellipse([W*0.2+k*140, H*0.6, W*0.32+k*140, H*0.78], fill=(10, 14, 6, 220))
            if name == 'dogs':
                d.ellipse([W*0.38, H*0.55, W*0.62, H*0.85], fill=(10, 14, 6, 220))
            if name == 'tea':
                d.ellipse([W*0.42, H*0.62, W*0.58, H*0.72], fill=(10, 14, 6, 220))
                for k in range(3): d.arc([W*0.46+k*20, H*0.3, W*0.5+k*20, H*0.6], 90, 270, fill=CREAM + (70,), width=3)
            if name == 'hanf':
                for k in range(7):
                    x = W * (0.12 + 0.12 * k)
                    d.line([(x, H), (x, H*0.3)], fill=(20, 30, 10), width=8)
                    for a in range(5):
                        ang = -math.pi/2 + (a-2)*0.5
                        d.line([(x, H*0.4), (x + 90*math.cos(ang), H*0.4 + 90*math.sin(ang))], fill=(24, 36, 12), width=5)
        still(1600, 900, BG, fn, name.upper(), os.path.join(PUB, 'ambient', f'{name}.webp'))

def products():
    shapes = {
        'oel':          lambda d, W, H: (d.rounded_rectangle([W*0.42, H*0.3, W*0.58, H*0.78], 14, fill=(30, 26, 16)), d.rectangle([W*0.465, H*0.2, W*0.535, H*0.3], fill=(20, 18, 12))),
        'kosmetik':     lambda d, W, H: d.rounded_rectangle([W*0.36, H*0.45, W*0.64, H*0.75], 20, fill=(30, 26, 16)),
        'gel':          lambda d, W, H: (d.rounded_rectangle([W*0.4, H*0.32, W*0.6, H*0.76], 30, fill=(30, 26, 16)), d.rectangle([W*0.44, H*0.26, W*0.56, H*0.32], fill=GOLD)),
        'balsam':       lambda d, W, H: (d.ellipse([W*0.34, H*0.5, W*0.66, H*0.78], fill=(30, 26, 16)), d.ellipse([W*0.34, H*0.44, W*0.66, H*0.62], fill=GOLD)),
        'tee':          lambda d, W, H: (d.rectangle([W*0.36, H*0.36, W*0.64, H*0.76], fill=(30, 26, 16)), d.rectangle([W*0.36, H*0.36, W*0.64, H*0.48], fill=GOLD)),
        'tierprodukte': lambda d, W, H: (d.rounded_rectangle([W*0.42, H*0.34, W*0.58, H*0.74], 14, fill=(30, 26, 16)), d.ellipse([W*0.55, H*0.6, W*0.68, H*0.73], fill=GOLD)),
    }
    for cat, fn in shapes.items():
        def draw(d, W, H, fn=fn):
            d.ellipse([W*0.2, H*0.72, W*0.8, H*0.86], fill=(214, 202, 178))
            fn(d, W, H)
        still(800, 800, CREAM, draw, cat.upper(), os.path.join(PUB, 'products', f'cat-{cat}.webp'))

journey(); ambient_posters(); products()
print('placeholder media done ->', os.path.abspath(PUB))
