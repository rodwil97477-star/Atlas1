"""Geometría del logo "381" (v3, 2026-10): numerales pixel en cursiva y ráfagas de brisa
también en pixeles, que pasan con la cabeza brillante y la cola apagándose.

Uso:  python3 tools/logo381.py
Escribe logo-381.svg (maestro de los íconos), sus variantes maskable/apple y logo-381.html,
e imprime el HTML que usa logo381Html() en dashboard/app.js. Todo vive en un tile de 200x200.
Los PNG se rasterizan con tools/render_icons.mjs (Chromium vía Playwright).
"""
import math, os

BG, CELESTE = '#101014', '#5AC8FA'
C = 7                       # lado de la celda pixel
SK = -12                    # cursiva real (skewX)
CX, CY = 104, 100           # centro óptico (el 1 es angosto: se corre 4 a la derecha)
DIGITOS = {                 # 6x10 con trazo de 2 celdas y esquinas recortadas
    '3': ['#####.', '######', '....##', '....##', '.#####', '.#####', '....##', '....##', '######', '#####.'],
    '8': ['.####.', '######', '##..##', '##..##', '.####.', '.####.', '##..##', '##..##', '######', '.####.'],
    '1': ['.##', '###', '.##', '.##', '.##', '.##', '.##', '.##', '.##', '.##'],
}
ESPACIO = 2                 # celdas entre dígitos
P, L = 15, 9                # periodo de las ráfagas y largo de cada una (celdas)
ANCHO_CAPA = 200 + P * C    # la capa animada mide un tile + un periodo
BRISA = [                   # fila, desfase, opacidad, paso de fila a mitad de ráfaga, duración (s)
    (7, 5, .80, -1, 9.5),
    (21, 0, 1.0, -1, 6.5),
    (23, 9, .65, 1, 8),
]


def _cuadros(celdas, lado, margen):
    """Un solo `d` con un cuadrado por celda (x, y en unidades del tile)."""
    s = lado - 2 * margen
    return ''.join(f'M{x + margen:g} {y + margen:g}h{s:g}v{s:g}h{-s:g}z' for x, y in celdas)


def celdas_numero():
    ancho = sum(len(DIGITOS[k][0]) for k in '381') + 2 * ESPACIO
    x, y0 = CX - ancho * C / 2, CY - 10 * C / 2
    out = []
    for k in '381':
        for j, fila in enumerate(DIGITOS[k]):
            out += [(x + i * C, y0 + j * C) for i, ch in enumerate(fila) if ch == '#']
        x += (len(DIGITOS[k][0]) + ESPACIO) * C
    return out


def rafagas(fila, desfase, sube, x_max):
    """Celdas de una corriente agrupadas por posición dentro de la ráfaga (0 = cola, L-1 = cabeza).
    El patrón se repite cada P celdas, así que desplazar la capa P celdas es un bucle sin costura."""
    grupos = [[] for _ in range(L)]
    for i in range(-P, math.ceil(x_max / C) + 1):
        k = (i - desfase) % P
        if k < L:
            grupos[k].append((i * C, (fila + (sube if k >= L // 2 else 0)) * C))
    return grupos


def _corriente(fila, desfase, sube, x_max):
    out = ''
    for k, celdas in enumerate(rafagas(fila, desfase, sube, x_max)):
        t = k / (L - 1)
        color, alfa = ('#C8F6FF', 1) if k == L - 1 else (CELESTE, .18 + .82 * t ** 1.4)
        out += f'<path d="{_cuadros(celdas, C, .7)}" fill="{color}" opacity="{alfa:.2f}"/>'
    return out


def transform_cursiva():
    return f'translate({CX} {CY}) skewX({SK}) translate({-CX} {-CY})'


def _numero(sfx):
    celdas = celdas_numero()
    return (f'<linearGradient id="l381n{sfx}" gradientUnits="userSpaceOnUse" x1="0" y1="{CY - 5 * C:g}" x2="0" y2="{CY + 5 * C:g}">'
            f'<stop offset="0" stop-color="#A8FFC4"/><stop offset="1" stop-color="#5FEA89"/></linearGradient>',
            f'<g transform="{transform_cursiva()}"><path class="logo381__halo" fill="{BG}" d="{_cuadros(celdas, C, -2.5)}"/>'
            f'<path fill="url(#l381n{sfx})" d="{_cuadros(celdas, C, -.15)}"/></g>')


def svg(fondo='redondo', escala=1.0):
    """fondo: 'redondo' (any, esquinas transparentes), 'lleno' (maskable / apple, sin transparencia).
    escala < 1 encoge el contenido hacia el centro (zona segura de maskable)."""
    tile = {'redondo': f'<rect width="200" height="200" rx="44" fill="{BG}"/>',
            'lleno': f'<rect width="200" height="200" fill="{BG}"/>'}[fondo]
    fade = ('<linearGradient id="f" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/>'
            '<stop offset=".2" stop-color="#fff"/><stop offset=".8" stop-color="#fff"/>'
            '<stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>'
            '<mask id="m"><rect width="200" height="200" fill="url(#f)"/></mask>')
    grad, num = _numero('')
    capas = ''.join(f'<g opacity="{o}">' + _corriente(f, d, s, 200) + '</g>' for f, d, o, s, _t in BRISA)
    k = f'translate(100 100) scale({escala}) translate(-100 -100)'
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs>{grad}{fade}</defs>{tile}'
            f'<g transform="{k}"><g mask="url(#m)">{capas}</g>{num}</g></svg>')


def html(sfx=''):
    """Logo animado: cada corriente es su propia capa (un tile + un periodo de ancho) que CSS
    desplaza exactamente un periodo; el número queda quieto encima."""
    pct = 100 * ANCHO_CAPA / 200
    ondas = ''.join(
        f'<svg class="logo381__onda" viewBox="0 0 {ANCHO_CAPA} 200" style="--t:{t}s;--o:{o}">'
        f'{_corriente(f, d, s, ANCHO_CAPA)}</svg>'
        for f, d, o, s, t in BRISA)
    grad, num = _numero(sfx)
    return (f'<div class="logo381" role="img" aria-label="381" style="--capa:{pct:g}%;--paso:{-100 * P * C / ANCHO_CAPA:.4f}%">'
            f'<div class="logo381__brisa" aria-hidden="true">{ondas}</div>'
            f'<svg class="logo381__num" viewBox="0 0 200 200" aria-hidden="true" focusable="false">'
            f'<defs>{grad}</defs>{num}</svg></div>')


if __name__ == '__main__':
    raiz = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    variantes = {'logo-381.svg': svg(), 'logo-381-maskable.svg': svg('lleno', .8), 'logo-381-apple.svg': svg('lleno', .92)}
    for nombre, s in variantes.items():
        open(os.path.join(raiz, nombre), 'w').write(s + '\n')
    open(os.path.join(raiz, 'logo-381.html'), 'w').write(
        '<!-- Logo 381 animado (34x34), generado por tools/logo381.py; requiere logo-381.css -->\n' + html() + '\n')
    print(html('${sfx}'))
