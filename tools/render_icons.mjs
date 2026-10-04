// Rasteriza los íconos PNG del logo 381 desde los SVG que escribe tools/logo381.py.
// Uso:  python3 tools/logo381.py && node tools/render_icons.mjs   (requiere Playwright + Chromium)
// Escribe los PNG en la raíz y en dashboard/. Luego tools/limpiar_png.py los deja en sRGB sin ICC.
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const SALIDAS = [
  ['logo-381.svg', 192, 'icon-192.png', true],
  ['logo-381.svg', 512, 'icon-512.png', true],
  ['logo-381-maskable.svg', 192, 'icon-maskable-192.png', false],
  ['logo-381-maskable.svg', 512, 'icon-maskable-512.png', false],
  ['logo-381-apple.svg', 180, 'apple-touch-icon.png', false],
];
const b = await chromium.launch();
const p = await b.newPage({ deviceScaleFactor: 1 });
for (const [svg, px, png, transparente] of SALIDAS) {
  await p.setViewportSize({ width: px, height: px });
  const src = readFileSync(join(raiz, svg), 'utf8').replace('<svg ', `<svg width="${px}" height="${px}" `);
  await p.setContent(`<html><body style="margin:0;background:transparent">${src}</body></html>`);
  for (const dir of [raiz, join(raiz, 'dashboard')])
    await p.screenshot({ path: join(dir, png), omitBackground: transparente, clip: { x: 0, y: 0, width: px, height: px } });
}
await b.close();
