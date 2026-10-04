"""Geometría del logo "381" (v2, 2026-10): numerales de trazo continuo en cursiva real
y tres corrientes de brisa onduladas que pasan por detrás.

Uso:  python3 tools/logo381.py
Escribe logo-381.svg (maestro de los íconos) e imprime los trazados que usa
logo381Html() en dashboard/app.js y logo-381.html. Todo vive en un tile de 200x200.
Los PNG se rasterizan con tools/render_icons.mjs (Chromium vía Playwright).
"""
import math, os

BG, VERDE, CELESTE = '#101014', '#7CFA9E', '#5AC8FA'
SK = -12                    # cursiva real (skewX), no rotación
T = 13                      # grosor del trazo de los números
H, W, SP = 84, 50, 13       # alto, ancho de dígito, separación
CX, CY = 104, 100           # centro óptico (el 1 es angosto: se corre 4 a la derecha)
P = 100                     # periodo de la onda: el bucle animado se desplaza exactamente P
BRISA = [                   # y, amplitud, fase, grosor, opacidad, duración del bucle (s)
    (52, 4, 0.6, 2.6, .55, 11),
    (148, 6, 2.4, 4.2, .95, 7.5),
    (162, 4, 4.0, 2.4, .50, 9.5),
]


def _redondo(pts, r):
    """Polilínea con esquinas redondeadas (curvas cuadráticas de radio r)."""
    def hacia(ax, ay, bx, by, k):
        L = math.hypot(bx - ax, by - ay); k = min(k, L / 2)
        return ax + (bx - ax) * k / L, ay + (by - ay) * k / L
    d = f'M{pts[0][0]:g} {pts[0][1]:g}'
    for i in range(1, len(pts) - 1):
        (x0, y0), (x1, y1), (x2, y2) = pts[i - 1], pts[i], pts[i + 1]
        a, b = hacia(x1, y1, x0, y0, r), hacia(x1, y1, x2, y2, r)
        d += f'L{a[0]:g} {a[1]:g}Q{x1:g} {y1:g} {b[0]:g} {b[1]:g}'
    return d + f'L{pts[-1][0]:g} {pts[-1][1]:g}'


def numerales():
    """Un solo `d` con 3, 8 y 1 (en coordenadas sin cursiva; la cursiva va en transform)."""
    h2, r = T / 2, 10
    x = CX - (W + SP + W + SP + 22) / 2; y = CY - H / 2
    top, bot, mid = y + h2, y + H - h2, y + H / 2
    l3, r3 = x + h2, x + W - h2
    x8 = x + W + SP; l8, r8 = x8 + h2, x8 + W - h2
    x1 = x + 2 * (W + SP) + 22 - h2
    return ''.join([
        _redondo([(l3, top), (r3, top), (r3, bot), (l3, bot)], r), f'M{l3 + 10:g} {mid:g}H{r3:g}',
        _redondo([(l8, mid), (l8, top), (r8, top), (r8, bot), (l8, bot), (l8, mid - .01)], r), f'M{l8:g} {mid:g}H{r8:g}',
        _redondo([(x1 - 13, top + 9), (x1, top), (x1, bot)], 6),
    ])


def onda(y, A, fase, x0, x1):
    """Onda de arcos cuadráticos encadenados (Q + T): periódica en P, así el bucle no tiene
    costura. Arranca en un cruce por cero desplazado según la fase, antes de x0."""
    inicio = -fase * P / (2 * math.pi)
    while inicio > x0: inicio -= P
    d, x = f'M{inicio:.1f} {y}Q{inicio + P / 4:.1f} {y - 2 * A} {inicio + P / 2:.1f} {y}', inicio + P / 2
    while x < x1:
        x += P / 2; d += f'T{x:.1f} {y}'
    return d


def transform_cursiva():
    return f'translate({CX} {CY}) skewX({SK}) translate({-CX} {-CY})'


def defs(sfx=''):
    return (f'<linearGradient id="l381n{sfx}" gradientUnits="userSpaceOnUse" x1="0" y1="{CY - H / 2:g}" x2="0" y2="{CY + H / 2:g}">'
            f'<stop offset="0" stop-color="#A8FFC4"/><stop offset="1" stop-color="#5FEA89"/></linearGradient>'
            f'<linearGradient id="l381b{sfx}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="{P}" y2="0" spreadMethod="repeat">'
            f'<stop offset="0" stop-color="{CELESTE}" stop-opacity=".25"/><stop offset=".55" stop-color="{CELESTE}"/>'
            f'<stop offset=".9" stop-color="#C8F6FF"/><stop offset="1" stop-color="{CELESTE}" stop-opacity=".25"/></linearGradient>')


def svg(fondo='redondo', escala=1.0):
    """fondo: 'redondo' (any, esquinas transparentes), 'lleno' (maskable / apple, sin transparencia).
    escala < 1 encoge el contenido hacia el centro (zona segura de maskable)."""
    tile = {'redondo': f'<rect width="200" height="200" rx="44" fill="{BG}"/>',
            'lleno': f'<rect width="200" height="200" fill="{BG}"/>'}[fondo]
    fade = ('<linearGradient id="f" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/>'
            '<stop offset=".22" stop-color="#fff"/><stop offset=".78" stop-color="#fff"/>'
            '<stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>'
            '<mask id="m"><rect width="200" height="200" fill="url(#f)"/></mask>')
    ondas = ''.join(f'<path d="{onda(y, A, f, -8, 208)}" stroke-width="{t}" opacity="{o}"/>' for y, A, f, t, o, _ in BRISA)
    d = numerales()
    k = f'translate(100 100) scale({escala}) translate(-100 -100)'
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs>{defs()}{fade}</defs>{tile}'
            f'<g transform="{k}"><g mask="url(#m)" fill="none" stroke="url(#l381b)" stroke-linecap="round">{ondas}</g>'
            f'<g fill="none" stroke-linecap="round" stroke-linejoin="round" transform="{transform_cursiva()}">'
            f'<path d="{d}" stroke="{BG}" stroke-width="{T + 9}"/><path d="{d}" stroke="url(#l381n)" stroke-width="{T}"/></g></g></svg>')


def html(sfx=''):
    """Logo animado para la cabecera: cada onda es su propia capa de 300x200 (150% del tile)
    que CSS desplaza exactamente un periodo; los números quedan quietos encima."""
    ondas = ''.join(
        f'<svg class="logo381__onda" viewBox="0 0 300 200" style="--t:{dur}s;--o:{o}">'
        f'<path d="{onda(y, A, f, -4, 304)}" stroke="url(#l381b{sfx})" stroke-width="{t}"/></svg>'
        for y, A, f, t, o, dur in BRISA)
    d = numerales()
    return (f'<div class="logo381" role="img" aria-label="381">'
            f'<div class="logo381__brisa" aria-hidden="true">{ondas}</div>'
            f'<svg class="logo381__num" viewBox="0 0 200 200" aria-hidden="true" focusable="false"><defs>{defs(sfx)}</defs>'
            f'<g transform="{transform_cursiva()}"><path class="logo381__halo" d="{d}" stroke-width="{T + 9}"/>'
            f'<path d="{d}" stroke="url(#l381n{sfx})" stroke-width="{T}"/></g></svg></div>')


if __name__ == '__main__':
    raiz = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    variantes = {'logo-381.svg': svg(), 'logo-381-maskable.svg': svg('lleno', .8), 'logo-381-apple.svg': svg('lleno', .92)}
    for nombre, s in variantes.items():
        open(os.path.join(raiz, nombre), 'w').write(s + '\n')
    open(os.path.join(raiz, 'logo-381.html'), 'w').write(
        '<!-- Logo 381 animado (34x34), generado por tools/logo381.py; requiere logo-381.css -->\n' + html() + '\n')
    print(html('${sfx}'))
