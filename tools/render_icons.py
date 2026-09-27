"""Genera los íconos PNG estáticos del logo "381" (sin dependencias de build del sitio).

Uso:  pip install pillow numpy && python3 tools/render_icons.py
Toda la geometría está definida sobre un tile de referencia de 200x200 y se escala.
"""
import math, os
import numpy as np
from PIL import Image

BG = (0x10, 0x10, 0x14)
GREEN = (0x7C, 0xFA, 0x9E)
SS = 8  # supersampling por eje (solo para el borde geométrico de 1px, sin blur)

DIGITS = {
    "3": ["11111", "00001", "00001", "01110", "00001", "00001", "11111"],
    "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
    "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
}
# left, top, w, h, rot(deg), opacity  — tile de referencia 200x200
STREAKS = [
    (150, 24, 14, 3, -10, .16), (36, 34, 12, 3, -15, .15),
    (108, 52, 13, 3, -5, .18), (130, 58, 30, 4, -16, .35),
    (64, 62, 24, 4, -19, .30), (82, 74, 15, 3, -21, .20),
    (128, 76, 56, 8, -11, .65), (22, 86, 36, 5, -13, .45),
    (135, 100, 11, 3, -9, .16), (52, 98, 26, 4, -9, .34),
    (10, 110, 32, 4, -17, .40), (68, 120, 17, 3, -7, .22),
    (26, 132, 20, 3, -13, .26), (107, 149, 44, 6, -12, .55),
    (65, 159, 18, 3, -8, .22), (156, 141, 16, 3, -6, .20),
]
CELL = 8.0          # tamaño de celda del número (16x7 celdas -> 128x56)
NUM_CX, NUM_CY = 100.0, 112.0   # 50% / 56%
NUM_ROT = -12.0


def rot(px, py, cx, cy, deg):
    a = math.radians(deg)
    dx, dy = px - cx, py - cy
    return (cx + dx * math.cos(a) - dy * math.sin(a), cy + dx * math.sin(a) + dy * math.cos(a))


def number_quads(gap):
    """Un cuadrado por píxel encendido, rotado -12° alrededor del centro del número."""
    cols = 16 * CELL
    x0, y0 = NUM_CX - cols / 2, NUM_CY - 7 * CELL / 2
    quads = []
    for d, ch in enumerate("381"):
        for r, row in enumerate(DIGITS[ch]):
            for c, bit in enumerate(row):
                if bit == "1":
                    x = x0 + (d * 6 + c) * CELL + gap / 2
                    y = y0 + r * CELL + gap / 2
                    s = CELL - gap
                    pts = [(x, y), (x + s, y), (x + s, y + s), (x, y + s)]
                    quads.append([rot(px, py, NUM_CX, NUM_CY, NUM_ROT) for px, py in pts])
    return quads


def streak_quads():
    out = []
    for l, t, w, h, r, o in STREAKS:
        cx, cy = l + w / 2, t + h / 2  # transform-origin: center (igual que CSS)
        pts = [(l, t), (l + w, t), (l + w, t + h), (l, t + h)]
        out.append(([rot(px, py, cx, cy, r) for px, py in pts], o))
    return out


def coverage(quad, size, k, off):
    """Cobertura [0..1] por pixel de un cuadrilátero convexo (coords de referencia)."""
    q = [(off + x * k, off + y * k) for x, y in quad]
    xs, ys = [p[0] for p in q], [p[1] for p in q]
    bx0, by0 = max(0, int(math.floor(min(xs)))), max(0, int(math.floor(min(ys))))
    bx1, by1 = min(size, int(math.ceil(max(xs)))), min(size, int(math.ceil(max(ys))))
    cov = np.zeros((size, size), np.float32)
    if bx1 <= bx0 or by1 <= by0:
        return cov
    sx = bx0 + (np.arange((bx1 - bx0) * SS) + .5) / SS
    sy = by0 + (np.arange((by1 - by0) * SS) + .5) / SS
    X, Y = np.meshgrid(sx, sy)
    inside = np.ones(X.shape, bool)
    area = sum(q[i][0] * q[(i + 1) % 4][1] - q[(i + 1) % 4][0] * q[i][1] for i in range(4))
    sign = 1 if area > 0 else -1
    for i in range(4):
        (ax, ay), (bx, by) = q[i], q[(i + 1) % 4]
        inside &= sign * ((bx - ax) * (Y - ay) - (by - ay) * (X - ax)) >= 0
    blk = inside.reshape(by1 - by0, SS, bx1 - bx0, SS).mean(axis=(1, 3))
    cov[by0:by1, bx0:bx1] = blk
    return cov


def rounded_rect_cov(size, radius):
    s = np.arange(size * SS)
    c = (s + .5) / SS
    X, Y = np.meshgrid(c, c)
    cx = np.clip(X, radius, size - radius)
    cy = np.clip(Y, radius, size - radius)
    inside = (X - cx) ** 2 + (Y - cy) ** 2 <= radius ** 2
    return inside.reshape(size, SS, size, SS).mean(axis=(1, 3)).astype(np.float32)


def render(size, maskable=False, opaque=False, safe=None):
    # escala de la composición: normal = 1 ; maskable = cabe en la zona segura
    k = size / 200.0
    off = 0.0
    if maskable:
        k *= safe
        off = size * (1 - safe) / 2
    gap = 1.0 if size >= 96 else 0.0  # separación dot-matrix entre píxeles
    rgb = np.zeros((size, size, 3), np.float32)
    rgb[:] = BG
    g = np.array(GREEN, np.float32)
    for quad, op in streak_quads():
        a = (coverage(quad, size, k, off) * op)[..., None]
        rgb = rgb * (1 - a) + g * a
    num = np.zeros((size, size), np.float32)
    for quad in number_quads(gap):
        num += coverage(quad, size, k, off)
    a = np.clip(num, 0, 1)[..., None]
    rgb = rgb * (1 - a) + g * a
    rgb8 = np.round(rgb).clip(0, 255).astype(np.uint8)
    if maskable or opaque:
        return Image.fromarray(rgb8, "RGB")
    alpha = (np.round(rounded_rect_cov(size, size * 0.22) * 255)).astype(np.uint8)
    return Image.fromarray(np.dstack([rgb8, alpha]), "RGBA")


def safe_scale():
    """Escala para que todo (número + estela) quede dentro del círculo de radio 40%."""
    pts = [p for q in number_quads(0) for p in q] + [p for q, _ in streak_quads() for p in q]
    far = max(math.hypot(x - 100, y - 100) for x, y in pts)
    return 0.4 * 200 * 0.97 / far  # 3% de margen extra


if __name__ == "__main__":
    out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
    s = safe_scale()
    jobs = {
        "icon-192.png": render(192),
        "icon-512.png": render(512),
        "icon-maskable-192.png": render(192, maskable=True, safe=s),
        "icon-maskable-512.png": render(512, maskable=True, safe=s),
        "apple-touch-icon.png": render(180, opaque=True),
    }
    for name, img in jobs.items():
        img.save(os.path.join(out, name), optimize=True)  # sin iCCP / sin gAMA
        print(name, img.size, img.mode)
    print("maskable scale", round(s, 3))
