"""Re-guarda los íconos PNG en sRGB plano: sin perfil ICC ni metadatos; los opacos sin canal alfa."""
import os
from PIL import Image
raiz = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OPACOS = {'icon-maskable-192.png', 'icon-maskable-512.png', 'apple-touch-icon.png'}
for dir_ in (raiz, os.path.join(raiz, 'dashboard')):
    for n in ['icon-192.png', 'icon-512.png', *sorted(OPACOS)]:
        ruta = os.path.join(dir_, n)
        im = Image.open(ruta)
        im = im.convert('RGB') if n in OPACOS else im.convert('RGBA')
        im.save(ruta, optimize=True)
        print(ruta.replace(raiz + '/', ''), im.size, im.mode)
