/* ============================================================
   Finanzas · v7 · interfaz
   Una sola lógica para las 4 pestañas: cada página marca
   <body data-page="..."> y aquí se dibuja lo que corresponde.
   ============================================================ */
const PAGINA = document.body.dataset.page || 'inicio';
const TABS = [
  { id:'inicio', nombre:'Inicio', href:'index.html', ic:'home' },
  { id:'gastos', nombre:'Gastos', href:'gastos.html', ic:'pie' },
  { id:'ritmo', nombre:'Ritmo', href:'ritmo.html', ic:'pulse' },
  { id:'compromisos', nombre:'Compromisos', href:'compromisos.html', ic:'cal' },
  { id:'resumen', nombre:'Resumen', href:'resumen.html', ic:'resumen' }
];
let ALL = [], MESES = [], PRESTAMOS = [], MES = null, INFO = null, HOJA_PRESTAMOS = false, COMPLETO = true;
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

/* ---------- utilidades de datos ---------- */
function filasMes(k){ return ALL.filter(r => monthKey(r.fecha) === k); }
function suma(rows){ return rows.reduce((s, r) => s + r.montoSoles, 0); }
function prevKey(k){ const [y, m] = k.split('-').map(Number); const d = new Date(y, m - 2, 1); return monthKey(d); }
function mesesHasta(k, n){ const out = []; let c = k; for(let i = 0; i < n; i++){ out.unshift(c); c = prevKey(c); } return out; }
function totalGasto(k){ return suma(filasMes(k).filter(esGastoReal)); }
function primerMes(){ return MESES[0]; }
/** Los últimos n meses hasta k, sin irse antes del primer mes con datos */
function ventana(k, n){ const p = primerMes(); return mesesHasta(k, n).filter(x => !p || x >= p); }
function agrupar(rows, fnClave){
  const m = {};
  rows.forEach(r => { const c = fnClave(r); if(!m[c]) m[c] = { clave:c, total:0, n:0, filas:[] }; m[c].total += r.montoSoles; m[c].n++; m[c].filas.push(r); });
  return Object.values(m).sort((a, b) => b.total - a.total);
}
function flecha(sube){ return `<i class="arrow ${sube ? 'up' : 'down'}">${svg(sube ? 'arribaF' : 'abajoF', 12, 'currentColor', 2.6)}</i>`; }
function deltaChip(actual, anterior, sufijo){
  const d = delta(actual, anterior);
  if(!d) return '';
  if(d.pct === 0) return `<span class="chip">= igual ${sufijo || ''}</span>`;
  return `<span class="chip ${d.sube ? 'up' : 'down'}">${flecha(d.sube)} ${d.pct}% ${sufijo || ''}</span>`;
}
function deltaTxt(actual, anterior){
  const d = delta(actual, anterior);
  if(!d) return anterior === 0 && actual > 0 ? '<b class="t-up">nuevo</b>' : '';
  if(d.pct === 0) return '<b class="muted">= ' + '</b>';
  return `<b class="${d.sube ? 't-up' : 't-down'}">${flecha(d.sube)} ${d.pct}%</b>`;
}

/* ---------- logo animado "381" (reutilizado en la cabecera y en el candado) ---------- */
function logo381Html(){
  return `<div class="logo381" role="img" aria-label="381">
    <div class="logo381__trail" aria-hidden="true">
      <span style="--x:75%;--y:12%;--w:7%;--h:1.5%;--r:-10deg;--o:0.16;--t:4.9s;--dl:-0.3s;--dx:2.1px"></span>
      <span style="--x:18%;--y:17%;--w:6%;--h:1.5%;--r:-15deg;--o:0.15;--t:5.6s;--dl:-2.7s;--dx:1.8px"></span>
      <span style="--x:54%;--y:26%;--w:6.5%;--h:1.5%;--r:-5deg;--o:0.18;--t:4.3s;--dl:-1.1s;--dx:2.5px"></span>
      <span style="--x:65%;--y:29%;--w:15%;--h:2%;--r:-16deg;--o:0.35;--t:5.2s;--dl:-4.2s;--dx:4.9px"></span>
      <span style="--x:32%;--y:31%;--w:12%;--h:2%;--r:-19deg;--o:0.3;--t:4.6s;--dl:-3.4s;--dx:3.9px"></span>
      <span style="--x:41%;--y:37%;--w:7.5%;--h:1.5%;--r:-21deg;--o:0.2;--t:5.8s;--dl:-0.9s;--dx:2.8px"></span>
      <span style="--x:64%;--y:38%;--w:28%;--h:4%;--r:-11deg;--o:0.65;--t:4.4s;--dl:-2.1s;--dx:7.0px"></span>
      <span style="--x:11%;--y:43%;--w:18%;--h:2.5%;--r:-13deg;--o:0.45;--t:5.4s;--dl:-4.9s;--dx:5.6px"></span>
      <span style="--x:67.5%;--y:50%;--w:5.5%;--h:1.5%;--r:-9deg;--o:0.16;--t:4.8s;--dl:-1.6s;--dx:1.8px"></span>
      <span style="--x:26%;--y:49%;--w:13%;--h:2%;--r:-9deg;--o:0.34;--t:5.0s;--dl:-3.8s;--dx:4.2px"></span>
      <span style="--x:5%;--y:55%;--w:16%;--h:2%;--r:-17deg;--o:0.4;--t:4.2s;--dl:-0.6s;--dx:5.3px"></span>
      <span style="--x:34%;--y:60%;--w:8.5%;--h:1.5%;--r:-7deg;--o:0.22;--t:5.7s;--dl:-2.4s;--dx:3.2px"></span>
      <span style="--x:13%;--y:66%;--w:10%;--h:1.5%;--r:-13deg;--o:0.26;--t:4.7s;--dl:-4.5s;--dx:3.5px"></span>
      <span style="--x:53.5%;--y:74.5%;--w:22%;--h:3%;--r:-12deg;--o:0.55;--t:5.3s;--dl:-1.3s;--dx:6.3px"></span>
      <span style="--x:32.5%;--y:79.5%;--w:9%;--h:1.5%;--r:-8deg;--o:0.22;--t:4.5s;--dl:-3.1s;--dx:2.8px"></span>
      <span style="--x:78%;--y:70.5%;--w:8%;--h:1.5%;--r:-6deg;--o:0.2;--t:5.5s;--dl:-5.1s;--dx:2.5px"></span>
    </div>
    <svg class="logo381__num" viewBox="0 0 200 200" aria-hidden="true" focusable="false">
      <path transform="translate(100 100) rotate(-12) scale(8) translate(-8 -3.5)" d="M0 0h5v1h-5zM7 0h3v1h-3zM14 0h1v1h-1zM4 1h1v1h-1zM6 1h1v1h-1zM10 1h1v1h-1zM13 1h2v1h-2zM4 2h1v1h-1zM6 2h1v1h-1zM10 2h1v1h-1zM14 2h1v1h-1zM1 3h3v1h-3zM7 3h3v1h-3zM14 3h1v1h-1zM4 4h1v1h-1zM6 4h1v1h-1zM10 4h1v1h-1zM14 4h1v1h-1zM4 5h1v1h-1zM6 5h1v1h-1zM10 5h1v1h-1zM14 5h1v1h-1zM0 6h5v1h-5zM7 6h3v1h-3zM13 6h3v1h-3z"/>
    </svg>
  </div>`;
}

/* ---------- cáscara: cabecera, selector de mes y pestañas ---------- */
function shell(){
  const tab = TABS.find(t => t.id === PAGINA) || TABS[0];
  $('#top').innerHTML = `
    <div class="brand">
      <div class="brand-l">
        ${logo381Html()}
        <div class="brand-t"><b>Finanzas</b><span id="upd">Rodrigo · cargando…</span></div>
      </div>
      <button type="button" class="live off" id="live" aria-label="Actualizar datos"><i></i><span>Conectando</span></button>
    </div>
    <div class="title-row">
      <h1>${tab.nombre}</h1>
      <label class="month"><span class="sr">Mes (aplica a todas las pestañas)</span><select id="mes" disabled><option>...</option></select>${svg('down', 12, 'var(--accent)', 2.2).replace('viewBox="0 0 24 24"', 'viewBox="0 0 12 12"')}</label>
    </div>`;
  $('#tabbar').innerHTML = TABS.map(t => `<a href="${t.href}" data-nav="${t.href}"${t.id === PAGINA ? ' aria-current="page"' : ''}>${svg(t.ic, 22)}<span>${t.nombre}</span></a>`).join('');
  $('#mes').addEventListener('change', e => {
    if(e.target.value === '__todo'){
      e.target.value = MES; e.target.disabled = true;
      estadoConexion('sync');
      pedirHistorialCompleto();
      obtenerDatos(cargar, () => { e.target.disabled = false; estadoConexion('off'); }, true);
      return;
    }
    elegirMes(e.target.value);
  });
}
function actualizarLinks(){
  $$('[data-nav]').forEach(a => {
    const base = a.getAttribute('data-nav');
    a.setAttribute('href', base + (MES ? '?mes=' + encodeURIComponent(MES) : ''));
  });
}
function elegirMes(k){
  MES = k;
  lsSet(MES_KEY, k);
  try{ const u = new URL(location.href); u.searchParams.set('mes', k); history.replaceState({}, '', u); }catch(e){}
  actualizarLinks();
  render(false);
}
function llenarSelect(){
  const sel = $('#mes');
  sel.innerHTML = MESES.slice().reverse().map(k => `<option value="${k}">${monthShortYear(k)}</option>`).join('') + (COMPLETO ? '' : '<option value="__todo">Ver meses anteriores…</option>');
  sel.disabled = false;
  sel.value = MES;
}
function estadoConexion(tipo){
  const el = $('#live'); if(!el) return;
  el.className = 'live' + (tipo === 'ok' ? '' : tipo === 'sync' ? ' sync' : ' off');
  el.lastElementChild.textContent = tipo === 'ok' ? 'En vivo' : (tipo === 'sync' ? 'Actualizando' : 'Sin conexión');
  if(INFO){
    const d = new Date(INFO.at);
    $('#upd').textContent = 'Rodrigo · ' + d.getDate() + ' ' + MESES_CORTOS[d.getMonth()].toLowerCase() + ', ' + horaCorta(d);
  }
}

/* ---------- animación ---------- */
let _obs = null;
function activarAnimaciones(quiet){
  const els = $$('.anim:not(.in)');
  if(quiet || REDUCIR_MOVIMIENTO || !('IntersectionObserver' in window)){ els.forEach(e => e.classList.add('in')); return; }
  if(_obs) _obs.disconnect();
  _obs = new IntersectionObserver(entries => {
    let i = 0;
    entries.forEach(en => {
      if(!en.isIntersecting) return;
      en.target.style.setProperty('--d', Math.min(i++ * 70, 350) + 'ms');
      en.target.classList.add('in');
      _obs.unobserve(en.target);
    });
  }, { rootMargin:'0px 0px -6% 0px', threshold:0.05 });
  els.forEach(e => _obs.observe(e));
}
function contar(el, destino, formato, dur){
  if(!el) return;
  formato = formato || (v => 'S/ ' + fmtMonto(v));
  if(REDUCIR_MOVIMIENTO || document.body.classList.contains('quiet')){ el.textContent = formato(destino); return; }
  const t0 = performance.now() + 150; dur = dur || 1200;
  el.textContent = formato(0);
  function paso(t){
    const p = Math.max(0, Math.min(1, (t - t0) / dur));
    const e = p >= 1 ? 1 : 1 - Math.pow(2, -10 * p);
    el.textContent = formato(destino * e);
    if(p < 1) requestAnimationFrame(paso);
  }
  requestAnimationFrame(paso);
}
/** Los gráficos son SVG con viewBox fijo: en pantallas anchas se estiran y su texto crecía
    con ellos (v14). Esto devuelve el texto a su tamaño de diseño, en px reales. */
function ajustarTextoGraficos(raiz){
  $$('.chart svg', raiz || document).forEach(s => {
    const vb = s.viewBox && s.viewBox.baseVal, w = s.getBoundingClientRect().width;
    if(!vb || !vb.width || !w) return;
    const k = Math.max(1, w / vb.width);
    $$('text', s).forEach(t => { if(!t.dataset.fs) t.dataset.fs = t.getAttribute('font-size') || 11; t.setAttribute('font-size', (t.dataset.fs / k).toFixed(2)); });
  });
}
/** v16: toca o arrastra sobre un gráfico de línea para leer el valor exacto (también con mouse y flechas).
    La guía y la tarjeta siguen al dedo con una transición corta; el resto del gráfico no se mueve. */
function activarScrub(raiz){
  $$('.chart[data-scrub]', raiz || document).forEach(ch => {
    if(ch._scrub) return; ch._scrub = 1;
    let d; try{ d = JSON.parse(ch.dataset.scrub); }catch(e){ return; }
    const sv = $('svg', ch); if(!sv || !d.x.length) return;
    const NS = 'http://www.w3.org/2000/svg';
    const g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'scrub-g'); g.setAttribute('aria-hidden', 'true');
    const ln = document.createElementNS(NS, 'line'); ln.setAttribute('class', 'scrub-line'); ln.setAttribute('x1', 0); ln.setAttribute('x2', 0); ln.setAttribute('y1', d.top - 6); ln.setAttribute('y2', d.bot);
    const dot = document.createElementNS(NS, 'circle'); dot.setAttribute('class', 'scrub-dot'); dot.setAttribute('r', 5.5); dot.setAttribute('cx', 0); dot.setAttribute('cy', 0);
    g.append(ln, dot); sv.appendChild(g);
    const tip = document.createElement('div'); tip.className = 'scrub-tip'; tip.setAttribute('aria-live', 'polite'); ch.appendChild(tip);
    ch.tabIndex = 0; ch.classList.add('scrubbable');
    let idx = -1, tOcultar = 0;
    const mostrar = i => {
      i = Math.max(0, Math.min(d.x.length - 1, i)); idx = i;
      ln.style.transform = `translateX(${d.x[i]}px)`; dot.style.transform = `translate(${d.x[i]}px,${d.y[i]}px)`;
      tip.textContent = '';
      const v = document.createElement('b'); v.textContent = d.v[i];
      const l = document.createElement('span'); l.textContent = d.l[i];
      tip.append(v, l);
      if(d.n){ const n = document.createElement('em'); n.textContent = d.n[i]; n.className = d.nc[i]; tip.append(n); }
      const r = sv.getBoundingClientRect(), cr = ch.getBoundingClientRect();
      const px = r.left - cr.left + d.x[i] / d.w * r.width, mitad = tip.offsetWidth / 2;
      tip.style.transform = `translateX(${Math.round(Math.max(mitad, Math.min(cr.width - mitad, px)) - mitad)}px)`;
      ch.classList.add('scrubbing');
    };
    const ocultar = () => { ch.classList.remove('scrubbing'); idx = -1; };
    const cercano = e => { const r = sv.getBoundingClientRect(), vx = (e.clientX - r.left) / r.width * d.w; let b = 0; d.x.forEach((x, i) => { if(Math.abs(x - vx) < Math.abs(d.x[b] - vx)) b = i; }); return b; };
    ch.addEventListener('pointerdown', e => { clearTimeout(tOcultar); mostrar(cercano(e)); });
    ch.addEventListener('pointermove', e => { if(e.pointerType === 'mouse' || e.buttons){ clearTimeout(tOcultar); const b = cercano(e); if(b !== idx) mostrar(b); } });
    ch.addEventListener('pointerleave', e => { if(e.pointerType === 'mouse') ocultar(); });
    ch.addEventListener('pointerup', e => { if(e.pointerType !== 'mouse'){ clearTimeout(tOcultar); tOcultar = setTimeout(ocultar, 2600); } });
    ch.addEventListener('keydown', e => {
      if(e.key === 'ArrowRight' || e.key === 'ArrowLeft'){ e.preventDefault(); mostrar((idx < 0 ? d.x.length - 1 : idx) + (e.key === 'ArrowRight' ? 1 : -1)); }
      else if(e.key === 'Escape') ocultar();
    });
    ch.addEventListener('focus', () => mostrar(d.x.length - 1));
    ch.addEventListener('blur', ocultar);
  });
}
let _rsz = 0;
window.addEventListener('resize', () => { clearTimeout(_rsz); _rsz = setTimeout(() => ajustarTextoGraficos(), 150); });
/** v16: rayita de "dónde deberías ir hoy" sobre una barra de presupuesto (solo en el mes en curso) */
function marcaRitmo(k, i){
  if(!esMesActual(k)) return '';
  return `<i class="pace-tick fi" style="--i:${(i || 0) + 10};left:${(diaLimite(k) / diasDelMes(k) * 100).toFixed(1)}%" title="ritmo ideal a hoy"></i>`;
}
function leyendaRitmo(k){ return esMesActual(k) ? `<div class="legend meter-leg"><span><i class="k-mark"></i>ritmo ideal a hoy (día ${diaLimite(k)} de ${diasDelMes(k)})</span></div>` : ''; }
function card(html, extra){ return `<section class="card anim ${extra || ''}">${html}</section>`; }
function head(titulo, derecha){ return `<div class="card-head"><h2 class="card-title">${titulo}</h2>${derecha || ''}</div>`; }

/* ---------- gráficos (SVG propio) ---------- */
let _gid = 0;
function curvaSVG(valores, etiquetas, opt){
  opt = opt || {};
  const W = 340, H = opt.alto || 170, x0 = opt.ejes ? 40 : 16, x1 = W - 16, top = 26, bot = H - 26;
  const tope = Math.max(opt.meta || 0, ...valores) * 1.12 || 1;
  const n = valores.length;
  const X = valores.map((_, i) => n === 1 ? (x0 + x1) / 2 : x0 + i * (x1 - x0) / (n - 1));
  const Y = valores.map(v => bot - v / tope * (bot - top));
  let d = `M${X[0].toFixed(1)},${Y[0].toFixed(1)}`;
  for(let i = 0; i < n - 1; i++){
    const p0 = [X[i-1] ?? X[i], Y[i-1] ?? Y[i]], p1 = [X[i], Y[i]], p2 = [X[i+1], Y[i+1]], p3 = [X[i+2] ?? X[i+1], Y[i+2] ?? Y[i+1]];
    const c1 = [p1[0] + (p2[0] - p0[0]) * 0.16, p1[1] + (p2[1] - p0[1]) * 0.16];
    const c2 = [p2[0] - (p3[0] - p1[0]) * 0.16, p2[1] - (p3[1] - p1[1]) * 0.16];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  const area = `${d} L${X[n-1].toFixed(1)},${bot} L${X[0].toFixed(1)},${bot} Z`;
  const id = 'g' + (++_gid);
  const tend = calcularTendencia(valores);
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${escapeHtml(opt.aria || 'Tendencia')}"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${TINTA.accent}" stop-opacity="0.30"/><stop offset="1" stop-color="${TINTA.accent}" stop-opacity="0.02"/></linearGradient></defs>`;
  if(opt.ejes){
    const paso = tope > 3000 ? 1000 : (tope > 1500 ? 500 : (tope > 600 ? 200 : 100));
    for(let v = 0; v <= tope; v += paso){
      const y = bot - v / tope * (bot - top);
      s += `<line x1="${x0 - 6}" y1="${y.toFixed(1)}" x2="${W}" y2="${y.toFixed(1)}" stroke="var(--grid)" stroke-width="1"/><text x="0" y="${(y + 3.5).toFixed(1)}" font-size="11" fill="var(--label-3)">${fmtCorto(v)}</text>`;
    }
  }
  const ym = opt.meta ? bot - opt.meta / tope * (bot - top) : null;
  if(opt.meta){
    s += `<line x1="${x0 - 6}" y1="${ym.toFixed(1)}" x2="${W}" y2="${ym.toFixed(1)}" stroke="var(--label-2)" stroke-width="1.2" opacity="0.85"/><text x="${W}" y="${(ym - 5).toFixed(1)}" text-anchor="end" font-size="10" font-weight="700" fill="var(--label-2)">meta</text>`;
  }
  if(n > 1){
    s += `<path d="${area}" fill="url(#${id})" class="fi"/>`;
    const t0 = bot - tend.linea[0] / tope * (bot - top), t1 = bot - tend.linea[n-1] / tope * (bot - top);
    s += `<line x1="${X[0].toFixed(1)}" y1="${t0.toFixed(1)}" x2="${X[n-1].toFixed(1)}" y2="${t1.toFixed(1)}" stroke="var(--label-3)" stroke-width="1.5" stroke-dasharray="5 4" class="fi" style="--i:6"/>`;
    s += `<path d="${d}" fill="none" stroke="${TINTA.accent}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" pathLength="1" class="dr"/>`;
  }
  X.forEach((x, i) => {
    const on = i === n - 1;
    if(on) s += `<circle cx="${x.toFixed(1)}" cy="${Y[i].toFixed(1)}" r="6" fill="${TINTA.accent}" class="live-ping"/>`;
    s += `<circle cx="${x.toFixed(1)}" cy="${Y[i].toFixed(1)}" r="${on ? 6 : 3.5}" fill="${on ? TINTA.accent : 'var(--card)'}" stroke="${on ? 'var(--card)' : TINTA.accent}" stroke-width="${on ? 2.5 : 2}" class="pp" style="--i:${i}"/>`;
    // v14: si la cifra caería sobre la línea punteada de la meta, va debajo del punto
    let ty = Y[i] - 11;
    if(ym !== null && Math.abs((ty - 4) - ym) < 9) ty = Y[i] + 19;
    s += `<text x="${x.toFixed(1)}" y="${ty.toFixed(1)}" text-anchor="${on ? 'end' : (i === 0 ? 'start' : 'middle')}" font-size="${on ? 11 : 10.5}" font-weight="${on ? 800 : 600}" fill="${on ? 'var(--label)' : 'var(--label-3)'}" class="fi" style="--i:${i}">${fmtCorto(valores[i])}</text>`;
    s += `<text x="${x.toFixed(1)}" y="${H - 4}" text-anchor="${on ? 'end' : (i === 0 ? 'start' : 'middle')}" font-size="12" font-weight="${on ? 800 : 500}" fill="${on ? 'var(--label)' : 'var(--label-3)'}">${etiquetas[i]}</text>`;
  });
  const scrub = { w: W, top, bot, x: X.map(v => +v.toFixed(1)), y: Y.map(v => +v.toFixed(1)), v: valores.map(v => 'S/ ' + fmtMonto(v)), l: opt.tip || etiquetas,
    n: opt.meta ? valores.map(v => v > opt.meta ? `S/ ${fmtMonto(v - opt.meta)} sobre la meta` : `S/ ${fmtMonto(opt.meta - v)} bajo la meta`) : null,
    nc: opt.meta ? valores.map(v => v > opt.meta ? 't-up' : 't-down') : null };
  return `<div class="chart" data-scrub="${escapeHtml(JSON.stringify(scrub))}">${s}</svg></div>`;
}
function barrasV(items, alto, opt){
  opt = opt || {};
  const max = Math.max(opt.tope || 0, ...items.map(i => i.v), 1);
  const h = alto - 20;
  let goal = '';
  if(opt.meta){ const b = 20 + (1 - opt.meta / max) * h; goal = `<div class="goal-line" style="top:${b.toFixed(0)}px"></div>`; }
  const cols = items.map((it, i) => `<div class="col${it.on ? ' on' : ''}"><span class="v">${it.txt ?? fmtCorto(it.v)}</span><div class="b gy" style="--i:${i};height:${Math.max(it.v > 0 ? 3 : 0, it.v / max * h).toFixed(0)}px;background:${it.color}"></div></div>`).join('');
  const labels = items.map(it => `<span class="${it.on ? 'on' : ''}">${it.label}</span>`).join('');
  return `<div class="bars-wrap"><div class="vbars" style="height:${alto}px">${cols}</div>${goal}</div><div class="xlabels">${labels}</div>`;
}
function donutSVG(partes, centro, sub, numId){
  const total = partes.reduce((s, p) => s + p.v, 0) || 1;
  const C = 2 * Math.PI * 52; let off = 0; const id = 'm' + (++_gid);
  const segs = partes.map((p, i) => { const L = p.v / total * C; const s = `<circle class="seg" data-i="${i}" cx="66" cy="66" r="52" fill="none" stroke="${p.color}" stroke-width="20" stroke-dasharray="${L.toFixed(2)} ${(C - L).toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}" transform="rotate(-90 66 66)"/>`; off += L; return s; }).join('');
  return `<div class="donut" data-partes="${escapeHtml(JSON.stringify(partes.map(p => ({ n: p.n, v: p.v }))))}"><svg width="132" height="132" viewBox="0 0 132 132" role="img" aria-label="${escapeHtml(partes.map(p => p.n + ' ' + fmtPct(p.v, total)).join(', '))}"><defs><mask id="${id}"><circle cx="66" cy="66" r="52" fill="none" stroke="#fff" stroke-width="22" pathLength="1" transform="rotate(-90 66 66)" class="dr"/></mask></defs><circle cx="66" cy="66" r="52" fill="none" stroke="var(--track)" stroke-width="20"/><g mask="url(#${id})">${segs}</g></svg><div class="c"><b${numId ? ` id="${numId}"` : ''}${String(centro).length >= 9 ? ' class="sm"' : ''}>${centro}</b><span>${sub || 'total'}</span></div></div>`;
}
function leyenda(partes){
  const total = partes.reduce((s, p) => s + p.v, 0) || 1;
  return `<div class="leg">${partes.map((p, i) => `<div data-i="${i}" role="button" tabindex="0" aria-label="Ver ${escapeHtml(p.n)} en el gráfico"><i style="background:${p.color}"></i><span class="n">${escapeHtml(p.n)}<b>S/ ${fmtMonto(p.v)}</b></span><span class="p">${fmtPct(p.v, total)}</span></div>`).join('')}</div>`;
}
/** v16: tocar una categoría (en la leyenda o en la dona) la resalta y muestra su monto en el centro */
function enlazarDonut(raiz){
  const dn = $('.donut[data-partes]', raiz); if(!dn || dn._ok) return; dn._ok = 1;
  let partes; try{ partes = JSON.parse(dn.dataset.partes); }catch(e){ return; }
  const total = partes.reduce((a, p) => a + p.v, 0) || 1, b = $('.c b', dn), sp = $('.c span', dn);
  const filas = $$('.leg [data-i]', dn.parentElement);
  let sel = -1, fijo = -1, encima = -1;
  const mostrar = () => pintar(encima >= 0 ? encima : fijo);
  const pintar = i => {
    if(i === sel) return; sel = i;
    dn.classList.toggle('hl', i >= 0);
    $$('.seg', dn).forEach(c => c.classList.toggle('on', +c.dataset.i === i));
    filas.forEach(r => { r.classList.toggle('on', +r.dataset.i === i); r.setAttribute('aria-pressed', String(+r.dataset.i === i)); });
    if(filas[0]) filas[0].parentElement.classList.toggle('has-sel', i >= 0);
    b.textContent = 'S/ ' + fmtCorto(i >= 0 ? partes[i].v : total);
    sp.textContent = i >= 0 ? partes[i].n + ' · ' + fmtPct(partes[i].v, total) : 'total';
    if(!REDUCIR_MOVIMIENTO && b.animate) [b, sp].forEach(e => e.animate([{ opacity: 0, transform: 'translateY(5px)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: 'cubic-bezier(.16,1,.3,1)' }));
  };
  // tocar fija la selección (tocar de nuevo la suelta); pasar el mouse solo la previsualiza
  const alternar = i => { fijo = fijo === i ? -1 : i; encima = -1; mostrar(); };
  filas.forEach(r => {
    r.addEventListener('click', () => alternar(+r.dataset.i));
    r.addEventListener('keydown', e => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); alternar(+r.dataset.i); } });
    r.addEventListener('pointerenter', e => { if(e.pointerType === 'mouse'){ encima = +r.dataset.i; mostrar(); } });
    r.addEventListener('pointerleave', e => { if(e.pointerType === 'mouse'){ encima = -1; mostrar(); } });
  });
  $$('.seg', dn).forEach(c => c.addEventListener('click', () => alternar(+c.dataset.i)));
}
function stackBar(partes){
  const total = partes.reduce((s, p) => s + p.v, 0) || 1;
  return `<div class="stack gx">${partes.map(p => `<span style="width:${(p.v / total * 100).toFixed(2)}%;background:${p.color}"></span>`).join('')}</div>`;
}
function filaMov(r, opt){
  opt = opt || {};
  const sub = opt.sub ? opt.sub(r) : [r.cat2, r.cat3].filter(Boolean).join(' · ');
  const fecha = opt.soloHora ? (tieneHora(r.fecha) ? horaCorta(r.fecha) : '') : fechaRelativa(r.fecha);
  return `<div class="row">${tile(iconoFila(r), colorFila(r))}<span class="main"><span class="name">${escapeHtml(r.comercio || '(sin comercio)')}</span><span class="sub">${escapeHtml(sub)}</span></span><span class="right"><span class="amt">${montoTxt(r)}</span><span class="date">${fecha}</span></span></div>`;
}

/* ============================================================
   Hoja de detalle (sube desde abajo). Si desde una hoja abres otra
   (por ejemplo, tocar una categoría dentro de "Presupuesto"), la
   anterior queda en un historial: "Atrás" (o Escape, tocar afuera,
   arrastrar hacia abajo) vuelve un nivel; sólo la X cierra todo.
   ============================================================ */
let _hoja = null, _pila = [], _reabrirActual = null, _volviendo = false;
function cerrarHoja(inmediato){
  const h = _hoja; if(!h) return;
  _hoja = null; _pila = []; _reabrirActual = null;
  h.ov.classList.remove('open');
  document.removeEventListener('keydown', h.esc);
  const fin = () => { h.ov.remove(); document.body.style.overflow = ''; if(h.foco && h.foco.focus) h.foco.focus({ preventScroll:true }); };
  if(inmediato || REDUCIR_MOVIMIENTO) fin(); else setTimeout(fin, 420);
}
function volverHoja(){
  if(!_pila.length) return;
  const anterior = _pila.pop();
  _volviendo = true;
  try{ anterior(); } finally { _volviendo = false; }
}
function irAtrasOSalir(){ if(_pila.length) volverHoja(); else cerrarHoja(); }
function pintarHoja(opt){
  const ov = _hoja.ov;
  const back = $('.sheet-back', ov);
  back.hidden = _pila.length === 0;
  $('.sheet', ov).setAttribute('aria-label', opt.titulo);
  $('.sheet-head .tt', ov).innerHTML = `${opt.ruta ? `<span class="crumb" style="color:${opt.colorRuta || 'var(--accent)'}">${escapeHtml(opt.ruta)}</span>` : ''}
    <h2>${opt.icono ? tile(opt.icono, opt.color, true) : ''}<span>${escapeHtml(opt.titulo)}</span></h2>`;
  const body = $('.sheet-body', ov);
  body.innerHTML = opt.html;
  body.scrollTop = 0;
  if(opt.enlazar) opt.enlazar(body);
  (back.hidden ? $('.sheet-x', ov) : back).focus({ preventScroll:true });
}
function abrirHoja(opt){
  const esNuevo = !_volviendo;
  const reabrir = opt.reabrir || (() => abrirHoja(opt));
  if(_hoja){
    if(esNuevo && _reabrirActual) _pila.push(_reabrirActual);
    _reabrirActual = reabrir;
    pintarHoja(opt);
    return;
  }
  const foco = document.activeElement;
  const ov = document.createElement('div');
  ov.className = 'sheet-ov';
  ov.innerHTML = `<div class="sheet" role="dialog" aria-modal="true">
      <div class="sheet-grip" aria-hidden="true"></div>
      <div class="sheet-head">
        <button class="sheet-back" aria-label="Atrás" hidden>${svg('atras', 18)}</button>
        <div class="tt"></div>
        <button class="sheet-x" aria-label="Cerrar">${svg('x', 14)}</button>
      </div>
      <div class="sheet-body"></div>
    </div>`;
  document.body.appendChild(ov);
  document.body.style.overflow = 'hidden';
  const esc = e => { if(e.key === 'Escape') irAtrasOSalir(); };
  _hoja = { ov, esc, foco };
  _pila = [];
  _reabrirActual = reabrir;
  document.addEventListener('keydown', esc);
  ov.addEventListener('click', e => { if(e.target === ov) irAtrasOSalir(); });
  $('.sheet-x', ov).addEventListener('click', () => cerrarHoja());
  $('.sheet-back', ov).addEventListener('click', () => volverHoja());
  arrastrable($('.sheet', ov), ov);
  pintarHoja(opt);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    ov.classList.add('open');
    $('.sheet-body', ov).classList.add('in');
  }));
}
function arrastrable(sheet, ov){
  const grip = $('.sheet-grip', sheet), cab = $('.sheet-head', sheet), body = $('.sheet-body', sheet);
  let y0 = 0, dy = 0, t0 = 0, activo = false, desdeBody = false;
  function puede(t){
    if(t.closest('.sheet-x') || t.closest('.sheet-back')) return false;
    if(grip.contains(t) || cab.contains(t)) return true;
    if(body.contains(t) && body.scrollTop <= 0){ desdeBody = true; return true; }
    return false;
  }
  function ini(e){ const p = e.touches ? e.touches[0] : e; desdeBody = false; if(!puede(e.target)) return; activo = true; y0 = p.clientY; dy = 0; t0 = Date.now(); sheet.style.transition = 'none'; }
  function mov(e){
    if(!activo) return;
    const p = e.touches ? e.touches[0] : e; const dd = p.clientY - y0;
    if(desdeBody && dd < 0){ fin(); return; }
    dy = Math.max(0, dd);
    if(dy > 0){ if(e.cancelable) e.preventDefault(); const vis = dy > 260 ? 260 + (dy - 260) * 0.35 : dy; sheet.style.transform = `translateY(${vis}px)`; ov.style.background = `rgba(4,4,6,${Math.max(0, 0.66 * (1 - Math.min(dy / 420, 1)))})`; }
  }
  function fin(){
    if(!activo) return; activo = false; sheet.style.transition = ''; ov.style.background = '';
    const vel = dy / Math.max(Date.now() - t0, 1);
    sheet.style.transform = '';
    if(dy > 120 || vel > 0.55) irAtrasOSalir();
    dy = 0;
  }
  sheet.addEventListener('touchstart', ini, { passive:true });
  sheet.addEventListener('touchmove', mov, { passive:false });
  sheet.addEventListener('touchend', fin); sheet.addEventListener('touchcancel', fin);
  sheet.addEventListener('mousedown', ini); window.addEventListener('mousemove', mov); window.addEventListener('mouseup', fin);
}
function listaConMas(filas, n, render, etiqueta){
  const id = 'l' + (++_gid);
  const vis = filas.slice(0, n).map(render).join('');
  const resto = filas.length - n;
  if(Array.isArray(etiqueta)) etiqueta = resto === 1 ? etiqueta[0] : etiqueta[1];   // v15: [singular, plural]
  return `<div class="list" id="${id}">${vis}</div>${resto > 0 ? `<button class="more" data-mas="${id}" data-n="${n}" style="align-self:center">Ver ${resto} ${etiqueta || 'más'}</button>` : ''}`;
}
/** Conecta los botones "Ver más" de un contenedor */
function enlazarMas(raiz, fuentes){
  $$('[data-mas]', raiz).forEach(b => b.addEventListener('click', () => {
    const f = fuentes[b.dataset.mas]; if(!f) return;
    $('#' + b.dataset.mas, raiz).insertAdjacentHTML('beforeend', f.filas.slice(+b.dataset.n).map(f.render).join(''));
    b.remove();
  }));
}

/** Presupuesto propio de una subcategoría: define, edita o muestra su estado del mes */
function htmlPresupuestoCat(cat2, actual){
  const monto = leerPresupuestosCat()[cat2];
  if(!monto){
    return `<div class="presu-cat">
      <div class="block-label">Presupuesto de esta subcategoría</div>
      <div class="form"><input id="presuCatIn" type="number" inputmode="decimal" placeholder="Ej. 500" aria-label="Presupuesto mensual para ${escapeHtml(cat2)}"><button class="btn solid sm" id="presuCatOk">Guardar</button></div>
    </div>`;
  }
  const pct = actual / monto * 100;
  const estado = pct >= 100 ? 'alto' : pct >= 90 ? 'justo' : 'ok';
  const etiqueta = estado === 'alto' ? 'Te pasaste' : estado === 'justo' ? 'Vas justo' : 'En camino';
  const col = estado === 'ok' ? TINTA.ok : (estado === 'justo' ? TINTA.justo : TINTA.alto);
  return `<div class="presu-cat">
    <div class="card-head" style="margin-bottom:0"><span class="block-label">Presupuesto · S/ ${fmtMonto(monto)}</span><span class="pill-state st-${estado}"><i></i>${etiqueta}</span></div>
    <div class="meter"><div class="fill gx" style="width:${Math.min(pct, 100).toFixed(1)}%;background:${col}"></div>${esMesActual(MES) ? `<div class="mark fi" style="--i:20;left:${(diaLimite(MES) / diasDelMes(MES) * 100).toFixed(1)}%" title="ritmo ideal a hoy"><i></i></div>` : ''}</div>
    <div class="scale"><span>S/ ${fmtMonto(actual)} de S/ ${fmtMonto(monto)}</span><span>${fmtPct(actual, monto)}</span></div>
    <button class="btn ghost sm" id="presuCatEdit" style="align-self:flex-start">Cambiar</button>
    <div id="presuCatForm"></div>
  </div>`;
}
function enlazarPresupuestoCat(body, cat2, actual){
  const wrap = $('#presuCatWrap', body);
  if(!wrap) return;
  // la hoja se abre encima de la lista de Subcategorías: al cambiar el
  // presupuesto, esa lista de atrás debe reflejarlo apenas se cierre
  const refrescarFondo = () => { if(typeof dibujarVista === 'function') dibujarVista(true); };
  const pintar = () => {
    wrap.innerHTML = htmlPresupuestoCat(cat2, actual);
    const inp = $('#presuCatIn', wrap), ok = $('#presuCatOk', wrap);
    const guardar = () => {
      const v = parseFloat(String(inp.value).replace(',', '.'));
      if(isNaN(v) || v <= 0){ inp.focus(); return; }
      guardarPresupuestoCat(cat2, v); pintar(); refrescarFondo();
    };
    if(ok){ ok.addEventListener('click', guardar); inp.addEventListener('keydown', e => { if(e.key === 'Enter') guardar(); }); }
    const edit = $('#presuCatEdit', wrap);
    if(edit) edit.addEventListener('click', () => {
      const f = $('#presuCatForm', wrap);
      if(f.innerHTML){ f.innerHTML = ''; return; }
      f.innerHTML = `<div class="form view-in"><input id="presuCatIn2" type="number" inputmode="decimal" value="${leerPresupuestosCat()[cat2]}" aria-label="Presupuesto mensual para ${escapeHtml(cat2)}"><button class="btn solid sm" id="presuCatOk2">Guardar</button><button class="btn ghost sm" id="presuCatDel">Quitar</button></div>`;
      const guardar2 = () => {
        const v = parseFloat(String($('#presuCatIn2', f).value).replace(',', '.'));
        if(isNaN(v) || v <= 0) return;
        guardarPresupuestoCat(cat2, v); pintar(); refrescarFondo();
      };
      $('#presuCatOk2', f).addEventListener('click', guardar2);
      $('#presuCatIn2', f).addEventListener('keydown', e => { if(e.key === 'Enter') guardar2(); });
      $('#presuCatDel', f).addEventListener('click', () => { guardarPresupuestoCat(cat2, 0); pintar(); refrescarFondo(); });
      $('#presuCatIn2', f).focus();
    });
  };
  pintar();
}

/** Pantalla centralizada: arma la Meta desde abajo, categoría por categoría, más un margen */
function categoriasParaPresupuesto(){
  return agrupar(ALL.filter(r => r.cat1 && r.cat1 !== 'Finanzas' && r.cat1 !== 'Terceros'), r => r.cat1)
    .map(g1 => ({ cat1: g1.clave, cat2s: agrupar(g1.filas, r => r.cat2 || '(sin definir)').map(g2 => g2.clave) }));
}
function htmlPresupuestoGeneral(){
  const grupos = categoriasParaPresupuesto();
  const presus = leerPresupuestosCat(), margen = leerMargen();
  // v16: para decidir el monto sin salir de la hoja: promedio de los meses completos anteriores y lo que va de este
  const previos = ventana(prevKey(MES), 6).filter(m => m < MES), delMes = filasMes(MES).filter(esGastoReal);
  const gastoCat = (rows, c1, c2) => suma(rows.filter(r => r.cat1 === c1 && (r.cat2 || '(sin definir)') === c2));
  const ayuda = (c1, c2) => {
    const prom = previos.length ? previos.reduce((a, m) => a + gastoCat(filasMes(m).filter(esGastoReal), c1, c2), 0) / previos.length : null;
    const ahora = gastoCat(delMes, c1, c2), presu = presus[c2];
    const bajo = presu && prom && presu < prom * 0.85;
    return `<span class="sub">${prom !== null ? `<span class="${bajo ? 't-justo' : ''}" ${bajo ? 'title="Tu presupuesto está por debajo de lo que sueles gastar aquí"' : ''}>prom.&nbsp;S/&nbsp;${fmtMonto(prom)}</span> · ` : ''}hoy&nbsp;S/&nbsp;${fmtMonto(ahora)}</span>`;
  };
  const filas = grupos.map(g1 => `
    <div class="cat-group">
      <div class="group-h">${icono(g1.cat1, colorDe(g1.cat1, 1), 15, 2.2)}<span>${escapeHtml(g1.cat1)}</span></div>
      <div class="list">${g1.cat2s.map(c2 => `
        <div class="row"><button type="button" class="row-tap-inner" data-abrir-cat1="${escapeHtml(g1.cat1)}" data-abrir-cat2="${escapeHtml(c2)}">${tile(c2, colorDe(c2, 2))}<span class="main"><span class="name">${escapeHtml(c2)}</span>${ayuda(g1.cat1, c2)}</span>${chev()}</button>
          <span class="presu-row-input"><span class="cur">S/</span><input type="number" inputmode="decimal" data-cat2="${escapeHtml(c2)}" value="${presus[c2] || ''}" placeholder="0" aria-label="Presupuesto mensual para ${escapeHtml(c2)}"></span>
        </div>`).join('')}</div>
    </div>`).join('');
  return `
    <p class="msg" style="font-size:14px;color:var(--label-2)">Presupuesta lo que puedas aterrizar por categoría; lo que no presupuestes se cubre con tu margen. Tu Meta es la suma de todo esto. Debajo de cada categoría ves tu promedio mensual y lo que llevas hoy${previos.length ? ' (en <span class="t-justo">amarillo</span> si el presupuesto está bajo tu promedio)' : ''}; tócala para ver su historial.</p>
    ${filas || '<div class="empty">Aún no hay categorías con movimientos.</div>'}
    <div>
      <div class="block-label">Margen adicional</div>
      <div class="row" style="border-bottom:none"><span class="tile" style="background:var(--accent-soft-2)">${svg('target', 18, TINTA.accent)}</span><span class="main"><span class="name">Imprevistos</span></span>
        <span class="presu-row-input"><span class="cur">S/</span><input id="presuMargenIn" type="number" inputmode="decimal" value="${margen || ''}" placeholder="0" aria-label="Margen adicional"></span>
      </div>
    </div>
    <div class="presu-total">
      <div class="line"><span>Presupuestado en categorías</span><span id="presuSumaCat">S/ ${fmtMonto(sumaPresupuestosCategoria())}</span></div>
      <div class="line"><span>Margen</span><span id="presuSumaMargen">S/ ${fmtMonto(margen)}</span></div>
      <div class="line total"><span>Meta total</span><span id="presuSumaTotal">S/ ${fmtMonto(sumaPresupuestosCategoria() + margen)}</span></div>
    </div>`;
}
/** v16: confirma que el monto quedó guardado: el campo destella en verde y aparece un check que se desvanece */
function marcarGuardado(inp){
  const w = inp.closest('.presu-row-input'); if(!w) return;
  w.classList.remove('guardado'); void w.offsetWidth; w.classList.add('guardado');
  if(!$('.ok-tick', w)) w.insertAdjacentHTML('beforeend', `<span class="ok-tick" aria-hidden="true">${svg('check', 13, 'currentColor', 3)}</span>`);
  clearTimeout(w._t); w._t = setTimeout(() => w.classList.remove('guardado'), 1600);
}
function enlazarPresupuestoGeneral(body){
  $$('[data-abrir-cat2]', body).forEach(b => b.addEventListener('click', () => abrirCat2(b.dataset.abrirCat1, b.dataset.abrirCat2)));
  const recalcular = () => {
    let sumaCat = 0;
    $$('[data-cat2]', body).forEach(inp => { const v = parseFloat(String(inp.value).replace(',', '.')); if(!isNaN(v) && v > 0) sumaCat += v; });
    const mIn = $('#presuMargenIn', body);
    const margen = mIn ? (parseFloat(String(mIn.value).replace(',', '.')) || 0) : 0;
    $('#presuSumaCat', body).textContent = 'S/ ' + fmtMonto(sumaCat);
    $('#presuSumaMargen', body).textContent = 'S/ ' + fmtMonto(margen);
    $('#presuSumaTotal', body).textContent = 'S/ ' + fmtMonto(sumaCat + margen);
  };
  $$('[data-cat2]', body).forEach(inp => {
    inp.addEventListener('input', recalcular);
    inp.addEventListener('blur', () => {
      const v = parseFloat(String(inp.value).replace(',', '.')), antes = Number(leerPresupuestosCat()[inp.dataset.cat2]) || 0;
      guardarPresupuestoCat(inp.dataset.cat2, isNaN(v) ? 0 : v);
      if((isNaN(v) ? 0 : v) !== antes) marcarGuardado(inp);
      render(true);
    });
    inp.addEventListener('keydown', e => { if(e.key === 'Enter') inp.blur(); });
  });
  const mIn = $('#presuMargenIn', body);
  if(mIn){
    mIn.addEventListener('input', recalcular);
    mIn.addEventListener('blur', () => {
      const v = parseFloat(String(mIn.value).replace(',', '.')), antes = leerMargen();
      guardarMargen(isNaN(v) ? 0 : v);
      if((isNaN(v) ? 0 : v) !== antes) marcarGuardado(mIn);
      render(true);
    });
    mIn.addEventListener('keydown', e => { if(e.key === 'Enter') mIn.blur(); });
  }
}
function abrirPresupuestoGeneral(){
  abrirHoja({ titulo: 'Presupuesto', html: htmlPresupuestoGeneral(), enlazar: enlazarPresupuestoGeneral, reabrir: abrirPresupuestoGeneral });
}

/** Detalle de un grupo de movimientos: subcategoría, sub-subcategoría, comercio o medio */
function hojaDetalle(opt){
  const k = MES, prev = prevKey(k);
  const meses = ventana(k, 6);
  const valores = meses.map(m => suma(filasMes(m).filter(opt.filtro)));
  const actual = valores[valores.length - 1];
  const anterior = suma(filasMes(prev).filter(opt.filtro));
  const conD = valores.filter(v => v > 0);
  const prom = conD.length ? conD.reduce((a, b) => a + b, 0) / conD.length : 0;
  const tend = calcularTendencia(valores);
  const todas = ALL.filter(opt.filtro);
  const delMes = filasMes(k).filter(opt.filtro).sort((a, b) => b.montoSoles - a.montoSoles);
  const maxV = Math.max(...valores, 0);
  const mesMax = meses[valores.indexOf(maxV)];
  const col = opt.color;
  const barras = barrasV(meses.map((m, i) => ({ v: valores[i], label: monthShort(m), color: i === meses.length - 1 ? col : alpha(col, 0.3), on: i === meses.length - 1 })), 150);
  let linea = '';
  if(meses.length > 1){
    const maxB = Math.max(...valores, 1), n = meses.length;
    const pts = tend.linea.map((v, i) => `${((i + 0.5) / n * 100).toFixed(2)},${(20 + (1 - v / maxB) * 130).toFixed(1)}`).join(' ');
    linea = `<svg viewBox="0 0 100 150" preserveAspectRatio="none" style="position:absolute;left:0;top:0;width:100%;height:150px;overflow:visible" aria-hidden="true"><polyline points="${pts}" fill="none" stroke="var(--label-3)" stroke-width="1.5" stroke-dasharray="4 4" vector-effect="non-scaling-stroke" class="fi" style="--i:8"/></svg>`;
  }
  let comp = '';
  if(opt.componer){
    const grupos = agrupar(delMes, opt.componer.clave).filter(g => g.clave);
    if(grupos.length > 1){
      comp = `<div><div class="block-label">Composición</div><div class="list">${grupos.map(g => `<button class="row" data-sub="${escapeHtml(g.clave)}">${tile(opt.componer.icono(g), opt.componer.color(g), true)}<span class="main"><span class="name">${escapeHtml(g.clave)}</span><span class="sub">${g.n} mov.</span></span><span class="right"><span class="amt">S/ ${fmtMonto(g.total)}</span><span class="date">${fmtPct(g.total, actual)}</span></span>${chev()}</button>`).join('')}</div></div>`;
    }
  }
  const html = `
    <div>
      <div class="hint">${opt.etiqueta || 'Gastado en'} ${monthLabel(k)}</div>
      <div class="big md" id="hojaNum">S/ ${fmtMonto(actual)}</div>
      <div class="chips">${deltaChip(actual, anterior, 'vs ' + monthShort(prev))}<span class="chip">prom. <b>S/ ${fmtMonto(prom)}</b></span><span class="chip">${textoTendencia(tend.pendiente, prom)}</span></div>
    </div>
    ${opt.presupuestoCat ? '<div id="presuCatWrap"></div>' : ''}
    <div style="display:flex;flex-direction:column;gap:8px">
      <div class="block-label">Últimos ${meses.length} meses</div>
      <div style="position:relative">${barras}${linea}</div>
      <div class="legend"><span><i style="background:${col}"></i>${monthShort(k)}</span><span><i style="background:${alpha(col, 0.3)}"></i>otros meses</span>${meses.length > 1 ? '<span><i class="dash"></i>tendencia</span>' : ''}</div>
    </div>
    <div class="metrics">
      <div class="metric"><span class="ml">Mes más alto</span><span class="mv">${mesMax && maxV > 0 ? monthShort(mesMax) : '-'}</span></div>
      <div class="metric"><span class="ml">Máximo mensual</span><span class="mv">S/ ${fmtMonto(maxV)}</span></div>
      <div class="metric"><span class="ml">${COMPLETO ? 'Total histórico' : 'Total ' + MESES.length + ' meses'}</span><span class="mv">S/ ${fmtMonto(suma(todas))}</span></div>
      <div class="metric"><span class="ml">Movimientos</span><span class="mv">${todas.length}</span></div>
    </div>
    ${comp}
    <div>
      <div class="block-label">${delMes.length} movimiento${delMes.length === 1 ? '' : 's'} en ${monthLabel(k)} · de mayor a menor</div>
      ${delMes.length ? listaConMas(delMes, 8, r => filaMov(r, { sub: r2 => [opt.subFila ? opt.subFila(r2) : r2.cat3, r2.medio].filter(Boolean).join(' · ') }), ['movimiento más', 'movimientos más']) : '<div class="empty">Sin movimientos este mes.</div>'}
    </div>`;
  abrirHoja({ titulo: opt.titulo, ruta: opt.ruta, colorRuta: opt.colorRuta, icono: opt.icono, color: col, html,
    reabrir: () => hojaDetalle(opt),
    enlazar: body => {
      contar($('#hojaNum', body), actual);
      if(opt.presupuestoCat) enlazarPresupuestoCat(body, opt.presupuestoCat, actual);
      const ids = $$('[data-mas]', body).map(b => b.dataset.mas);
      const fuentes = {}; if(ids[0]) fuentes[ids[0]] = { filas: delMes, render: r => filaMov(r, { sub: r2 => [opt.subFila ? opt.subFila(r2) : r2.cat3, r2.medio].filter(Boolean).join(' · ') }) };
      enlazarMas(body, fuentes);
      $$('[data-sub]', body).forEach(b => b.addEventListener('click', () => opt.componer.abrir(b.dataset.sub)));
    }
  });
}
function abrirCat2(cat1, cat2){
  hojaDetalle({
    titulo: cat2, ruta: cat1, colorRuta: colorDe(cat1, 1), icono: cat2, color: colorDe(cat2, 2),
    filtro: r => r.cat1 === cat1 && (r.cat2 || '(sin definir)') === cat2,
    presupuestoCat: cat2,
    componer: { clave: r => r.cat3 || '(sin definir)', icono: g => g.clave, color: g => colorDe(g.clave, 3), abrir: c3 => abrirCat3(cat1, cat2, c3) }
  });
}
function abrirCat3(cat1, cat2, cat3){
  hojaDetalle({ titulo: cat3, ruta: cat1 + ' › ' + cat2, colorRuta: colorDe(cat1, 1), icono: cat3, color: colorDe(cat3, 3),
    filtro: r => r.cat1 === cat1 && (r.cat2 || '(sin definir)') === cat2 && (r.cat3 || '(sin definir)') === cat3, subFila: () => '' });
}
function abrirComercio(nombre){
  const muestra = ALL.filter(r => r.comercio.toUpperCase() === nombre.toUpperCase());
  const r0 = muestra[muestra.length - 1] || {};
  hojaDetalle({ titulo: nombre, ruta: 'Comercio', icono: iconoFila(r0), color: colorFila(r0), etiqueta: 'Pagado en',
    filtro: r => r.comercio.toUpperCase() === nombre.toUpperCase(), subFila: r => r.cat3 || r.cat2 });
}
function abrirMedio(clave, color){
  hojaDetalle({ titulo: clave, ruta: 'Medio de pago', color, etiqueta: 'Pagado en',
    filtro: r => (r.medio || 'Sin registrar') === clave, subFila: r => r.cat3 || r.cat2,
    componer: { clave: r => r.cat2 || '(sin definir)', icono: g => g.clave, color: g => colorDe(g.clave, 2), abrir: c2 => { const f = ALL.find(r => r.cat2 === c2); if(f) abrirCat2(f.cat1, c2); } } });
}
function claveMedio(r){ return (r.medio || 'Sin registrar') + (r.tipo ? ' · ' + r.tipo : ''); }
function abrirListaMes(){
  const filas = filasMes(MES).sort((a, b) => b.fecha - a.fecha);
  const totDia = {}; filas.forEach(r => { const d = r.fecha.toDateString(); totDia[d] = (totDia[d] || 0) + r.montoSoles; });
  let html = '', dia = '';
  filas.forEach(r => {
    const d = r.fecha.toDateString();
    if(d !== dia){ dia = d; html += `<div class="day-h"><span>${NOMBRE_DIA[r.fecha.getDay()].replace(/^./, c => c.toUpperCase())} ${r.fecha.getDate()} ${MESES_CORTOS[r.fecha.getMonth()].toLowerCase()}</span><span>S/ ${fmtSol(totDia[d])}</span></div>`; }
    html += filaMov(r, { soloHora: true });
  });
  abrirHoja({ titulo: 'Movimientos de ' + monthLabel(MES), html: `<p class="hint" style="margin:0">${filas.length} movimiento${filas.length === 1 ? '' : 's'} · S/ ${fmtMonto(suma(filas))} en total</p><div class="list">${html || '<div class="empty">Sin movimientos.</div>'}</div>`, reabrir: abrirListaMes });
}

/* ============================================================
   INICIO
   ============================================================ */
function paginaInicio(){
  const k = MES, prev = prevKey(k);
  const filas = filasMes(k), gasto = filas.filter(esGastoReal), total = suma(gasto);
  const totalPrev = totalGasto(prev);
  const prev3 = ventana(prev, 3).filter(m => m < k).map(totalGasto).filter(v => v > 0);
  const prom3 = prev3.length ? prev3.reduce((a, b) => a + b, 0) / prev3.length : null;
  const dias = diaLimite(k), dm = diasDelMes(k), actual = esMesActual(k);
  const cat1 = agrupar(gasto, r => r.cat1).map(g => ({ n: g.clave, v: g.total, color: colorDe(g.clave, 1) }));

  let html = card(`
    ${head('Gasto del mes', `<span class="chip">${actual ? `día ${dias} de ${dm}` : 'mes cerrado'}</span>`)}
    <div class="big" id="heroNum">S/ ${fmtMonto(total)}</div>
    <div class="chips">${deltaChip(total, totalPrev, 'vs ' + monthShort(prev))}${prom3 ? `<span class="chip">prom. 3m <b>S/ ${fmtMonto(prom3)}</b></span>` : ''}</div>
    ${cat1.length ? stackBar(cat1) + `<div class="legend">${cat1.map(c => `<span><i style="background:${c.color}"></i>${escapeHtml(c.n)} <b>S/ ${fmtMonto(c.v)}</b></span>`).join('')}</div>` : ''}`, 'wide');

  html += htmlMeta(k, total, gasto);

  const alertas = calcularAlertas(k);
  if(alertas.length){
    html += card(`${head('Para tener en cuenta', `<span class="hint">${alertas.length} alerta${alertas.length === 1 ? '' : 's'}</span>`)}
      <div class="list">${alertas.map((a, i) => `<a class="row fi" style="--i:${i}" href="${a.href}${a.href.includes('?') ? '&' : '?'}mes=${k}">${`<span class="tile" style="background:${alpha(a.color, 0.12)}">${svg(a.ic, 18, a.color)}</span>`}<span class="main"><span class="name" style="white-space:normal">${a.titulo}</span><span class="sub" style="white-space:normal">${a.sub}</span></span>${chev()}</a>`).join('')}</div>`, 'tight');
  }

  const meses = ventana(k, 6);
  const vals = meses.map(totalGasto);
  if(meses.length >= 2){
    const tend = calcularTendencia(vals); const cd = vals.filter(v => v > 0);
    const prom = cd.length ? cd.reduce((a, b) => a + b, 0) / cd.length : 0;
    const tt = textoTendencia(tend.pendiente, prom);
    html += card(`${head('Tendencia · ' + meses.length + ' meses', `<a class="more" href="ritmo.html?mes=${k}">Ver en Ritmo ${chev()}</a>`)}
      <div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap"><span style="font-size:20px;font-weight:700;letter-spacing:-0.02em">S/ ${fmtMonto(total)}</span><span style="font-size:12.5px;font-weight:700" class="${tt.startsWith('sub') ? 't-up' : (tt.startsWith('baj') ? 't-down' : 'muted')}">${tt}</span></div>
      ${curvaSVG(vals, meses.map(monthShort), { meta: leerMeta(), aria: 'Gasto mensual de los últimos meses', tip: meses.map(m => monthLabel(m).replace(/^./, c => c.toUpperCase())) })}
      <div class="legend"><span><i style="background:${TINTA.accent}"></i>gasto mensual</span><span><i class="dash"></i>tendencia</span>${leerMeta() ? `<span><i class="k-meta"></i>meta</span>` : ''}<span class="tap-hint">toca el gráfico para ver cada mes</span></div>`);
  }

  const ult = filas.slice().sort((a, b) => b.fecha - a.fecha);
  html += card(`${head('Últimos movimientos', ult.length > 5 ? `<button class="more" id="verTodos">Ver los ${ult.length} ${chev()}</button>` : '')}
    <div class="list">${ult.slice(0, 5).map(r => filaMov(r)).join('') || '<div class="empty">Sin movimientos este mes.</div>'}</div>`, 'tight wide');

  html += `<p class="note">Los montos están en soles con el tipo de cambio del mes de cada movimiento. Inversiones y préstamos (rama Finanzas) y Terceros (la parte de un gasto compartido que te deben) no cuentan como gasto: es plata por cobrar o invertida.</p>`;
  $('#app').innerHTML = html;
  contar($('#heroNum'), total);
  enlazarMeta(k, total, gasto);
  const vt = $('#verTodos'); if(vt) vt.addEventListener('click', abrirListaMes);
}

/* ---------- meta mensual (se guarda en este dispositivo) ---------- */
function acumuladoHastaDia(k, dia){ return suma(filasMes(k).filter(r => esGastoReal(r) && r.fecha.getDate() <= dia)); }
function categoriaDesviada(k, gasto, factor){
  const previos = ventana(prevKey(k), 6).filter(m => m < k);
  if(previos.length < 2) return null;
  let peor = null;
  agrupar(gasto, r => r.cat2 || '(sin definir)').forEach(g => {
    const hist = previos.map(m => suma(filasMes(m).filter(r => esGastoReal(r) && (r.cat2 || '(sin definir)') === g.clave))).filter(v => v > 0);
    if(hist.length < 2) return;
    const prom = hist.reduce((a, b) => a + b, 0) / hist.length, proy = g.total * factor;
    if(proy > prom * 1.35 && proy - prom > 80 && (!peor || proy - prom > peor.exceso)) peor = { cat: g.clave, proy, prom, exceso: proy - prom };
  });
  return peor;
}
function htmlMeta(k, total, gasto){
  const meta = leerMeta();
  if(!meta){
    return card(`${head('Meta de gasto')}<p class="msg" style="font-size:14px;color:var(--label-2)">Define cuánto quieres gastar al mes y te aviso cómo vas, cuánto puedes gastar por día y qué categoría se está desviando.</p>
      <div class="form"><input id="metaIn" type="number" inputmode="decimal" placeholder="Ej. 2500" aria-label="Meta mensual en soles"><button class="btn solid" id="metaOk">Guardar</button></div>
      <button class="more" id="metaEdit">o arma tu presupuesto por categoría ${chev()}</button>`, 'wide');
  }
  const dm = diasDelMes(k), actual = esMesActual(k), dias = diaLimite(k), rest = actual ? dm - dias : 0;
  const ritmo = dias ? total / dias : 0, proy = actual ? ritmo * dm : total, restante = meta - total, porDia = rest > 0 ? restante / rest : 0;
  let estado = 'ok', etiqueta = 'En camino';
  if(proy > meta){
    estado = 'alto';
    etiqueta = !actual ? 'Te pasaste' : (restante <= 0 ? 'Ya te pasaste' : 'Vas a pasarte');
  }
  else if(proy > meta * 0.9){ estado = 'justo'; etiqueta = 'Vas justo'; }
  const col = estado === 'ok' ? TINTA.ok : (estado === 'justo' ? TINTA.justo : TINTA.alto);
  let msg;
  if(!actual){
    msg = total <= meta ? `Cerraste ${monthLabel(k)} en <b>S/ ${fmtMonto(total)}</b>, S/ ${fmtMonto(meta - total)} por debajo de tu meta.` : `Cerraste ${monthLabel(k)} en <b>S/ ${fmtMonto(total)}</b>, S/ ${fmtMonto(total - meta)} por encima de tu meta.`;
  } else if(restante <= 0){
    msg = `Ya pasaste tu meta de S/ ${fmtMonto(meta)} por <b>S/ ${fmtMonto(-restante)}</b>${rest ? `, y aún quedan ${rest} día${rest === 1 ? '' : 's'} del mes` : ''}.`;
  } else if(estado === 'alto'){
    msg = `Llevas <b>S/ ${fmtMonto(total)}</b> en ${dias} día${dias === 1 ? '' : 's'}. A este ritmo cierras en <b>S/ ${fmtMonto(proy)}</b>.`;
  } else if(estado === 'justo'){
    msg = `Llevas <b>S/ ${fmtMonto(total)}</b> en ${dias} día${dias === 1 ? '' : 's'}. Cierras cerca de la meta, en unos S/ ${fmtMonto(proy)}.`;
  } else {
    msg = `Llevas <b>S/ ${fmtMonto(total)}</b> en ${dias} día${dias === 1 ? '' : 's'}. A este ritmo cierras en <b>S/ ${fmtMonto(proy)}</b>, bajo tu meta.`;
  }
  const stats = actual
    ? `<div class="metric"><span class="ml">Llevas</span><span class="mv">S/ ${fmtMonto(total)}</span></div><div class="metric"><span class="ml">Proyección</span><span class="mv" style="color:${col}">S/ ${fmtMonto(proy)}</span></div><div class="metric"><span class="ml">Quedan</span><span class="mv">${rest} día${rest === 1 ? '' : 's'}</span></div>`
    : `<div class="metric"><span class="ml">Gastaste</span><span class="mv">S/ ${fmtMonto(total)}</span></div><div class="metric"><span class="ml">Meta</span><span class="mv">S/ ${fmtMonto(meta)}</span></div><div class="metric"><span class="ml">Diferencia</span><span class="mv" style="color:${col}">${total > meta ? '+' : '−'}S/ ${fmtMonto(Math.abs(total - meta))}</span></div>`;
  const prev = prevKey(k);
  let comp = '';
  if(actual){ const ant = acumuladoHastaDia(prev, dias); if(ant > 0) comp = `Al mismo día de ${MESES_LARGOS[+prev.split('-')[1] - 1]} llevabas S/ ${fmtMonto(ant)}.`; }
  const desv = categoriaDesviada(k, gasto, actual && dias ? dm / dias : 1);
  let pace = '';
  if(actual && rest > 0){
    pace = restante > 0
      ? `<div class="pace st-${estado}"><div class="pace-t"><div class="pt">Para no pasarte</div><div class="ps">gasta como máximo esto por día los ${rest} día${rest === 1 ? '' : 's'} que quedan</div></div><div class="pace-n"><b>S/ ${fmtMonto(porDia)}</b><span>por día</span></div></div>`
      : `<div class="pace st-${estado}"><div class="pace-t"><div class="pt">Para frenar</div><div class="ps">si desde hoy gastas la mitad de tu ritmo, cierras en S/ ${fmtMonto(total + ritmo / 2 * rest)}</div></div><div class="pace-n"><b>S/ ${fmtMonto(ritmo / 2)}</b><span>por día</span></div></div>`;
  }
  return card(`
    <div class="cartel st-${estado}"><b><i aria-hidden="true"></i>${etiqueta}</b><span>Meta S/ ${fmtMonto(meta)}</span></div>
    <h2 class="sr">Meta de gasto</h2>
    <p class="msg">${msg}</p>
    <div class="stat3">${stats}</div>
    <div>
      <div class="meter meter-meta" role="img" aria-label="Llevas ${fmtPct(total, meta)} de la meta${actual ? `; a este ritmo cierras en ${fmtPct(proy, meta)}; el ritmo ideal a hoy es ${fmtPct(dias, dm)}` : ''}">
        ${actual && proy > total ? `<div class="ghost gx" style="width:${Math.min(proy / meta * 100, 100).toFixed(1)}%;--c:${col}"></div>` : ''}
        <div class="fill gx" style="width:${Math.min(total / meta * 100, 100).toFixed(1)}%;background:${col}"></div>
        ${actual ? `<div class="mark fi" style="--i:24;left:${(dias / dm * 100).toFixed(1)}%" title="ritmo ideal: día ${dias} de ${dm}"><i></i></div>` : ''}
      </div>
      <div class="scale" style="margin-top:8px"><span>${fmtPct(total, meta)} usado</span>${actual ? '' : `<span>${dm} días</span>`}<span>S/ ${fmtMonto(meta)}</span></div>
      ${actual ? `<div class="legend meter-leg"><span><i style="background:${col}"></i>llevas</span>${proy > total ? `<span><i class="k-ghost" style="--c:${col}"></i>cierre: <b>${fmtPct(proy, meta)}</b></span>` : ''}<span><i class="k-mark"></i>ideal hoy (día ${dias})</span></div>` : ''}
    </div>
    ${comp ? `<div class="hint" style="font-size:13px">${comp}</div>` : ''}
    ${desv ? `<div class="flag">${tile(desv.cat, colorDe(desv.cat, 2), true)}<span><b>${escapeHtml(desv.cat)}</b> ${actual ? 'proyecta' : 'cerró en'} S/ ${fmtMonto(desv.proy)} cuando tu promedio es S/ ${fmtMonto(desv.prom)}.</span></div>` : ''}
    ${pace}
    <button class="btn" id="metaEdit">${svg('pencil', 15)}Gestionar presupuesto</button>`, 'wide');
}
function enlazarMeta(k, total, gasto){
  const guardar = () => {
    const inp = $('#metaIn'); const v = parseFloat(String(inp.value).replace(',', '.'));
    if(isNaN(v) || v <= 0){ inp.focus(); return; }
    guardarMargen(v); rehacerMeta(k, total, gasto);
  };
  const ok = $('#metaOk');
  if(ok){ ok.addEventListener('click', guardar); $('#metaIn').addEventListener('keydown', e => { if(e.key === 'Enter') guardar(); }); }
  const ed = $('#metaEdit');
  if(ed) ed.addEventListener('click', abrirPresupuestoGeneral);
}
function rehacerMeta(k, total, gasto){
  if(PAGINA === 'inicio'){ render(false); return; }
}

/* ---------- alertas automáticas ---------- */
function calcularAlertas(k){
  const out = [], prev = prevKey(k), filas = filasMes(k), gasto = filas.filter(esGastoReal), total = suma(gasto);
  const hayHistoria = primerMes() && primerMes() < k;
  // 0) presupuesto de subcategoría más excedido (si el usuario definió alguno)
  const presus = leerPresupuestosCat();
  let peorPresu = null;
  Object.keys(presus).forEach(cat2 => {
    const monto = presus[cat2]; if(!monto) return;
    const gastado = suma(gasto.filter(r => (r.cat2 || '(sin definir)') === cat2));
    if(gastado > monto && (!peorPresu || gastado - monto > peorPresu.exceso)) peorPresu = { cat2, monto, gastado, exceso: gastado - monto };
  });
  if(peorPresu) out.push({ tipo:'presupuesto', ic:'target', color:TINTA.alto, href:'gastos.html?vista=cat',
    titulo: `${escapeHtml(peorPresu.cat2)} superó su presupuesto`,
    sub: `S/ ${fmtMonto(peorPresu.gastado)} de S/ ${fmtMonto(peorPresu.monto)} este mes` });
  // 1) cambios de precio en cobros recurrentes
  detectarRecurrentes(ALL).forEach(rc => {
    const esteMes = rc.porMes[k]; const anterior = rc.porMes[prev];
    if(esteMes && anterior && anterior.montoSoles > 0 && (esteMes.cat2 === 'Fijo' || rc.estable)){
      const v = (esteMes.montoSoles - anterior.montoSoles) / anterior.montoSoles;
      if(Math.abs(v) > 0.03 && out.filter(a => a.tipo === 'precio').length < 1)
        out.push({ tipo:'precio', ic:'repeat', color: v > 0 ? TINTA.alto : TINTA.ok, href:'compromisos.html',
          titulo: `${escapeHtml(rc.nombre)} ${v > 0 ? 'subió' : 'bajó'} ${Math.round(Math.abs(v) * 100)}%`,
          sub: `pasó de S/ ${fmtSol(anterior.montoSoles)} a S/ ${fmtSol(esteMes.montoSoles)} este mes` });
    }
  });
  // 2) el grupo de días que más cambió vs el mes anterior
  if(hayHistoria){
    let mejor = null;
    GRUPOS_DIA.forEach(g => {
      const a = suma(gasto.filter(r => g.dias.includes(r.fecha.getDay()))) / Math.max(1, contarDias(k, g.dias));
      const b = suma(filasMes(prev).filter(r => esGastoReal(r) && g.dias.includes(r.fecha.getDay()))) / Math.max(1, contarDias(prev, g.dias));
      if(a > 0 && b > 0){ const v = (a - b) / b; if(Math.abs(v) >= 0.15 && (!mejor || Math.abs(v) > Math.abs(mejor.v))) mejor = { g, a, b, v }; }
    });
    if(mejor) out.push({ tipo:'grupo', ic: mejor.v > 0 ? 'up' : 'downtrend', color: mejor.v > 0 ? mejor.g.color : TINTA.ok, href:'ritmo.html',
      titulo: `Tu ${mejor.g.id === 'vd' ? 'fin de semana' : 'semana'} ${mejor.v > 0 ? 'subió' : 'bajó'} ${Math.round(Math.abs(mejor.v) * 100)}%`,
      sub: `${mejor.g.corto} promedia S/ ${fmtMonto(mejor.a)} por día; en ${MESES_LARGOS[+prev.split('-')[1] - 1]} eran S/ ${fmtMonto(mejor.b)}` });
  }
  // 3) gasto hormiga
  const horm = gasto.filter(r => r.montoSoles < 20);
  if(horm.length >= 8) out.push({ tipo:'hormiga', ic:'coins', color:TINTA.warn, href:'gastos.html?vista=com',
    titulo: `Gasto hormiga: S/ ${fmtMonto(suma(horm))}`, sub: `${horm.length} compras menores a S/ 20 este mes, el ${fmtPct(suma(horm), total)} de tu gasto` });
  // 4) comercios nuevos
  if(hayHistoria){
    const vistos = new Set(ALL.filter(r => monthKey(r.fecha) < k).map(r => r.comercio.toUpperCase()));
    const nuevos = agrupar(gasto.filter(r => r.comercio && !vistos.has(r.comercio.toUpperCase())), r => r.comercio);
    if(nuevos.length) out.push({ tipo:'nuevos', ic:'store', color:TINTA.info, href:'gastos.html?vista=com',
      titulo: `${nuevos.length} comercio${nuevos.length === 1 ? ' nuevo' : 's nuevos'}`,
      sub: nuevos.slice(0, 3).map(g => escapeHtml(g.clave)).join(', ') + (nuevos.length > 3 ? ` y ${nuevos.length - 3} más` : '') });
  }
  return out.slice(0, 3);
}

/* ============================================================
   GASTOS
   ============================================================ */
const VISTAS = [['cat', 'Categoría'], ['com', 'Comercio'], ['med', 'Medio de pago']];
let VISTA = null, BUSQ = '';
function segHTML(id, opciones, activa, etiqueta){
  const i = Math.max(0, opciones.findIndex(o => o[0] === activa));
  return `<div class="seg" role="group" aria-label="${etiqueta}" id="${id}"><span class="pill" style="width:calc((100% - 6px) / ${opciones.length});transform:translateX(${i * 100}%)"></span>${opciones.map(o => `<button type="button" data-v="${o[0]}" aria-pressed="${o[0] === activa}">${o[1]}</button>`).join('')}</div>`;
}
function enlazarSeg(id, alCambiar){
  const seg = $('#' + id); if(!seg) return;
  $$('button', seg).forEach((b, i) => b.addEventListener('click', () => {
    $$('button', seg).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    $('.pill', seg).style.transform = `translateX(${i * 100}%)`;
    alCambiar(b.dataset.v);
  }));
}
function paginaGastos(){
  if(!VISTA){
    let v = null; try{ v = new URLSearchParams(location.search).get('vista'); }catch(e){}
    VISTA = VISTAS.some(x => x[0] === v) ? v : (lsGet('finanzas_vista') || 'cat');
  }
  const k = MES, prev = prevKey(k), filas = filasMes(k), total = suma(filas), fin = suma(filas.filter(r => !esGastoReal(r))), terc = filas.some(r => r.cat1 === 'Terceros');
  $('#app').innerHTML = `
    <section class="anim" style="display:flex;flex-direction:column;gap:10px">
      <label class="search">${svg('search', 17, 'var(--label-3)')}<span class="sr">Buscar en todos tus movimientos</span><input type="search" id="q" placeholder="Buscar comercio, categoría o monto" autocomplete="off" value="${escapeHtml(BUSQ)}"><button type="button" class="clear" id="qx" aria-label="Borrar búsqueda" ${BUSQ ? '' : 'hidden'}><span>${svg('x', 10)}</span></button></label>
      ${segHTML('vista', VISTAS, VISTA, 'Ver gastos por')}
    </section>
    <div id="gRes"></div>
    <div id="gMain" ${BUSQ ? 'hidden' : ''}>
      ${card(`${head('Total del mes', `<span class="chip">${filas.length} movimiento${filas.length === 1 ? '' : 's'}</span>`)}
        <div class="big md" id="heroNum">S/ ${fmtMonto(total)}</div>
        <div class="chips">${deltaChip(total, suma(filasMes(prev)), 'vs ' + monthShort(prev))}${fin > 0 ? `<span class="chip">incluye Finanzas${terc ? ' y Terceros' : ''} <b>S/ ${fmtMonto(fin)}</b></span>` : ''}</div>`)}
      <div id="gVista" class="vista-cards"></div>
    </div>`;
  contar($('#heroNum'), total);
  dibujarVista(false);
  enlazarSeg('vista', v => { VISTA = v; lsSet('finanzas_vista', v); if(BUSQ){ BUSQ = ''; $('#q').value = ''; buscar(); } dibujarVista(true); });
  const q = $('#q');
  q.addEventListener('input', () => { BUSQ = q.value; buscar(); });
  $('#qx').addEventListener('click', () => { BUSQ = ''; q.value = ''; buscar(); q.focus(); });
  if(BUSQ) buscar();
}
function dibujarVista(cambio){
  const cont = $('#gVista'); if(!cont) return;
  const k = MES, filas = filasMes(k);
  let html = '';
  if(VISTA === 'cat') html = vistaCategorias(k, filas);
  else if(VISTA === 'com') html = vistaComercios(k, filas);
  else html = vistaMedios(k, filas);
  cont.innerHTML = html;
  if(cambio) $$('.anim', cont).forEach(e => { e.classList.add('in'); e.classList.add('view-in'); });
  const donutTotal = $('#donutTotal', cont);
  if(donutTotal) contar(donutTotal, suma(filas), v => 'S/ ' + fmtCorto(v));
  enlazarVista(cont); enlazarDonut(cont);
  activarAnimaciones(document.body.classList.contains('quiet'));
  ajustarTextoGraficos(cont); activarScrub(cont);
}
function vistaCategorias(k, filas){
  if(!filas.length) return card('<div class="empty">Sin movimientos este mes.</div>');
  const prev = prevKey(k), filasPrev = filasMes(prev);
  const c1 = agrupar(filas, r => r.cat1);
  const partes = c1.map(g => ({ n: g.clave, v: g.total, color: colorDe(g.clave, 1) }));
  const total = suma(filas);
  let subs = '';
  const maxC2 = Math.max(...agrupar(filas, r => r.cat1 + '|' + (r.cat2 || '(sin definir)')).map(g => g.total), 1);
  const presus = leerPresupuestosCat();
  c1.forEach(g1 => {
    let grupo = `<div class="group-h">${icono(g1.clave, colorDe(g1.clave, 1), 15, 2.2)}<span>${escapeHtml(g1.clave)}</span><span>S/ ${fmtMonto(g1.total)}</span></div>`;
    const c2 = agrupar(g1.filas, r => r.cat2 || '(sin definir)');
    grupo += '<div class="list">' + c2.map((g, i) => {
      const col = colorDe(g.clave, 2);
      const presu = presus[g.clave];
      const antes = suma(filasPrev.filter(r => r.cat1 === g1.clave && (r.cat2 || '(sin definir)') === g.clave));
      const dt = deltaTxt(g.total, antes);
      const pct = presu ? Math.min(g.total / presu * 100, 100) : (g.total / maxC2 * 100);
      const sobrePresu = presu && g.total >= presu;
      const barCol = !presu ? col : (sobrePresu ? TINTA.alto : (g.total >= presu * 0.9 ? TINTA.justo : TINTA.ok));   // v16: con presupuesto, la barra es semáforo
      const sub = presu
        ? `<span class="sub" style="color:${sobrePresu ? TINTA.alto : 'var(--label-3)'};font-weight:${sobrePresu ? 700 : 500}">S/ ${fmtMonto(g.total)} de S/ ${fmtMonto(presu)}</span>`
        : `<span class="sub">${g.n} mov.${dt ? ' · ' + dt : ''}</span>`;
      return `<button class="row" data-c1="${escapeHtml(g1.clave)}" data-c2="${escapeHtml(g.clave)}">${tile(g.clave, col)}<span class="main"><span class="name">${escapeHtml(g.clave)}</span>${sub}<span class="track row-track"><span class="gx" style="--i:${i};width:${pct.toFixed(1)}%;background:${barCol}"></span>${presu ? marcaRitmo(k, i) : ''}</span></span><span class="amt" style="min-width:56px;text-align:right">S/ ${fmtMonto(g.total)}</span>${chev()}</button>`;
    }).join('') + '</div>';
    subs += `<div class="cat-group">${grupo}</div>`;
  });
  return card(`${head('Reparto por categoría', `<span class="hint">${c1.length} categoría${c1.length === 1 ? '' : 's'}</span>`)}<div class="donut-row">${donutSVG(partes, 'S/ ' + fmtCorto(total), null, 'donutTotal')}${leyenda(partes)}</div><span class="tap-hint hint">toca una categoría para verla en la dona</span>`, 'wide')
       + card(`${head('Subcategorías', '<span class="hint hint-tap">toca para ver el detalle</span>')}${Object.keys(presus).length ? leyendaRitmo(k) : ''}<div class="sub-cols">${subs}</div>`, 'tight wide');
}
let _comFilas = [];
function vistaComercios(k, filas){
  if(!filas.length) return card('<div class="empty">Sin movimientos este mes.</div>');
  const vistos = new Set(ALL.filter(r => monthKey(r.fecha) < k).map(r => r.comercio.toUpperCase()));
  const hayHist = primerMes() && primerMes() < k;
  const coms = agrupar(filas.filter(r => r.comercio), r => r.comercio);
  const max = coms.length ? coms[0].total : 1;
  _comFilas = coms.map(g => {
    const r0 = agrupar(g.filas, r => iconoFila(r))[0].filas[0];
    const nuevo = hayHist && !vistos.has(g.clave.toUpperCase());
    return `<button class="row" data-com="${escapeHtml(g.clave)}">${tile(iconoFila(r0), colorFila(r0))}<span class="main"><span class="name" style="display:flex;align-items:center;gap:6px"><span style="overflow:hidden;text-overflow:ellipsis">${escapeHtml(g.clave)}</span>${nuevo ? '<span class="tag">nuevo</span>' : ''}</span><span class="track" style="margin-top:6px;height:5px"><span class="gx" style="width:${(g.total / max * 100).toFixed(1)}%;background:${colorFila(r0)}"></span></span></span><span class="right"><span class="amt">S/ ${fmtMonto(g.total)}</span><span class="date">${g.n} mov.</span></span>${chev()}</button>`;
  });
  const gasto = filas.filter(esGastoReal), horm = gasto.filter(r => r.montoSoles < 20);
  const hormPrev = suma(filasMes(prevKey(k)).filter(r => esGastoReal(r) && r.montoSoles < 20));
  const topH = agrupar(horm, r => r.comercio).slice(0, 3);
  let html = card(`${head('Dónde más gastaste', `<span class="hint">${coms.length} comercio${coms.length === 1 ? '' : 's'}</span>`)}
    <div class="list" id="comList">${_comFilas.slice(0, 8).join('')}</div>${coms.length > 8 ? `<button class="more" id="comMas" style="align-self:center">Ver los ${coms.length} comercios</button>` : ''}`, 'tight');
  if(horm.length) html += card(`${head('Gasto hormiga', '<span class="hint">compras menores a S/ 20</span>')}
    <div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap"><span class="mid">S/ ${fmtMonto(suma(horm))}</span><span class="hint">en ${horm.length} compra${horm.length === 1 ? '' : 's'} · ${fmtPct(suma(horm), suma(gasto))} del gasto</span></div>
    <div class="metrics"><div class="metric"><span class="ml">Ticket promedio</span><span class="mv">S/ ${fmt1(suma(horm) / horm.length)}</span></div><div class="metric"><span class="ml">vs ${monthShort(prevKey(k))}</span><span class="mv">${deltaTxt(suma(horm), hormPrev) || '-'}</span></div></div>
    <div class="list">${topH.map(g => `<button class="row" data-com="${escapeHtml(g.clave)}" style="min-height:48px">${tile(iconoFila(g.filas[0]), colorFila(g.filas[0]), true)}<span class="main"><span class="name">${escapeHtml(g.clave)}</span></span><span class="hint">${g.n} ${g.n === 1 ? 'vez' : 'veces'}</span><span class="amt" style="width:64px;text-align:right">S/ ${fmtMonto(g.total)}</span></button>`).join('')}</div>`);
  return html;
}
const COLORES_MEDIO = ['#5EA2FF', '#FF9440', '#2FD3C2', '#FF8ADF', '#C9A6FF', '#B9DDFF', '#E3C08F'];
function vistaMedios(k, filas){
  if(!filas.length) return card('<div class="empty">Sin movimientos este mes.</div>');
  // v16: un medio por fila (antes "BCP Visa", "BCP Visa · Débito" y "BCP Visa · Crédito" eran tres filas de tres colores)
  const med = agrupar(filas, r => r.medio || 'Sin registrar');
  const total = suma(filas);
  const conColor = med.filter(x => x.clave !== 'Sin registrar');
  const col = g => g.clave === 'Sin registrar' || conColor.indexOf(g) >= COLORES_MEDIO.length - 1 ? TINTA.neutro : COLORES_MEDIO[conColor.indexOf(g)];
  const partes = med.map(g => ({ n: g.clave, v: g.total, color: col(g) }));
  // desglose por tipo; "sin tipo" solo aparece si el medio también tiene débito/crédito (si no, no aporta)
  const desglose = g => { const t = agrupar(g.filas.filter(r => r.tipo), r => r.tipo); if(!t.length) return ''; const sinT = suma(g.filas.filter(r => !r.tipo));
    return t.map(x => `${escapeHtml(x.clave)}&nbsp;S/&nbsp;${fmtMonto(x.total)}`).concat(sinT > 0 ? [`sin tipo&nbsp;S/&nbsp;${fmtMonto(sinT)}`] : []).join(' + '); };
  const credito = filas.filter(r => norm(r.tipo) === 'credito');
  let html = card(`${head('Por medio de pago', `<span class="hint">${med.length} medio${med.length === 1 ? '' : 's'}</span>`)}
    ${stackBar(partes)}
    <div class="list">${med.map(g => {
      const ds = desglose(g);
      return `<button class="row" data-med="${escapeHtml(g.clave)}" data-col="${col(g)}"><span class="tile" style="background:${alpha(col(g), 0.14)}">${svg('card', 18, col(g))}</span><span class="main"><span class="name">${escapeHtml(g.clave)}</span><span class="sub">${g.n} mov.</span>${ds ? `<span class="split">${ds}</span>` : ''}</span><span class="right"><span class="amt">S/ ${fmtMonto(g.total)}</span><span class="date">${fmtPct(g.total, total)}</span></span>${chev()}</button>`;
    }).join('')}</div>`, 'tight');
  if(credito.length) html += card(`${head('Cargado a tarjeta de crédito')}
    <div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap"><span class="mid">S/ ${fmtMonto(suma(credito))}</span><span class="hint">${credito.length} consumo${credito.length === 1 ? '' : 's'} · ${fmtPct(suma(credito), total)} del mes</span></div>
    <p class="insight" style="margin:0">Estos consumos no salen de tu cuenta hoy: los pagas cuando llegue el estado de cuenta de la tarjeta.</p>`);
  if(med.some(g => g.clave === 'Sin registrar')) html += `<p class="note">"Sin registrar" son movimientos que entraron sin medio de pago (por ejemplo, los anteriores a que el bot empezara a guardarlo).</p>`;
  return html;
}
function enlazarVista(cont){
  $$('[data-c2]', cont).forEach(b => b.addEventListener('click', () => abrirCat2(b.dataset.c1, b.dataset.c2)));
  $$('[data-com]', cont).forEach(b => b.addEventListener('click', () => abrirComercio(b.dataset.com)));
  $$('[data-med]', cont).forEach(b => b.addEventListener('click', () => abrirMedio(b.dataset.med, b.dataset.col)));
  const mas = $('#comMas', cont);
  if(mas) mas.addEventListener('click', () => {
    const l = $('#comList', cont); l.insertAdjacentHTML('beforeend', _comFilas.slice(8).join(''));
    $$('[data-com]', l).slice(8).forEach(b => { b.addEventListener('click', () => abrirComercio(b.dataset.com)); $$('.gx', b).forEach(x => x.style.transform = 'none'); });
    mas.remove();
  });
}
/* ---------- búsqueda en todo el historial ---------- */
/** v16: marca lo que buscaste dentro de cada resultado (sin importar tildes ni mayúsculas) */
function resaltar(raiz, q){
  if(!q) return;
  $$('.row .name, .row .sub', raiz).forEach(el => {
    if(el.querySelector('mark')) return;
    const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); const nodos = []; let n;
    while((n = w.nextNode())) nodos.push(n);
    nodos.forEach(nd => {
      const txt = nd.data; let plano = '', mapa = [];
      for(let i = 0; i < txt.length; i++){ const c = txt[i].normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); for(const ch of c){ plano += ch; mapa.push(i); } }
      const at = plano.indexOf(q); if(at < 0) return;
      const ini = mapa[at], fin = mapa[at + q.length - 1] + 1;
      const r = document.createRange(); r.setStart(nd, ini); r.setEnd(nd, fin);
      const m = document.createElement('mark'); m.className = 'hl'; r.surroundContents(m);
    });
  });
}
function buscar(){
  const q = norm(BUSQ), res = $('#gRes'), main = $('#gMain');
  $('#qx').hidden = !q;
  if(!q){ res.innerHTML = ''; main.hidden = false; return; }
  main.hidden = true;
  const num = parseFloat(q.replace(',', '.'));
  const hits = ALL.filter(r => {
    const txt = norm([r.comercio, r.cat1, r.cat2, r.cat3, r.medio, r.tipo].join(' '));
    if(txt.includes(q)) return true;
    return !isNaN(num) && /^[\d.,]+$/.test(q) && [r.monto, r.montoSoles].some(v => String(Math.round(v * 100) / 100).startsWith(String(num)));
  }).sort((a, b) => b.fecha - a.fecha);
  const id = 'bRes';
  res.innerHTML = `<section class="card tight view-in" aria-live="polite">
    ${head('Resultados', `<span class="hint">${hits.length} movimiento${hits.length === 1 ? '' : 's'}${hits.length ? ' · S/ ' + fmtMonto(suma(hits)) : ''}</span>`)}
    ${hits.length ? listaConMas(hits, 30, r => filaMov(r, { sub: r2 => [r2.cat3 || r2.cat2, monthShortYear(monthKey(r2.fecha))].filter(Boolean).join(' · ') }), ['resultado más', 'resultados más']).replace(/id="l\d+"/, 'id="' + id + '"').replace(/data-mas="l\d+"/, 'data-mas="' + id + '"')
      : `<div class="empty">Sin resultados para “${escapeHtml(BUSQ)}”. Prueba con un comercio, una categoría o un monto.</div>`}
    <span class="hint" style="text-align:center;padding-top:8px">${COMPLETO ? 'Buscando en todo tu historial' : `Buscando en los últimos ${MESES.length} meses · para ir más atrás elige "Ver meses anteriores" en el selector de mes`}</span></section>`;
  enlazarMas(res, { [id]: { filas: hits, render: r => filaMov(r, { sub: r2 => [r2.cat3 || r2.cat2, monthShortYear(monthKey(r2.fecha))].filter(Boolean).join(' · ') }) } });
  resaltar(res, q);
  $$('[data-mas]', res).forEach(b => b.addEventListener('click', () => setTimeout(() => resaltar(res, q), 0)));
}

/* ============================================================
   RITMO
   ============================================================ */
let DIA_SEL = null, GRUPO = 'lj';
function porDia(k){
  const [y, m] = k.split('-').map(Number), dm = diasDelMes(k), v = new Array(dm + 1).fill(0), f = [];
  for(let i = 0; i <= dm; i++) f.push([]);
  filasMes(k).filter(esGastoReal).forEach(r => { const d = r.fecha.getDate(); v[d] += r.montoSoles; f[d].push(r); });
  return { v, f, y, m, dm };
}
function promedioDiaSemana(k){
  const { v, y, m } = porDia(k), lim = diaLimite(k), s = [0,0,0,0,0,0,0], n = [0,0,0,0,0,0,0];
  for(let d = 1; d <= lim; d++){ const wd = new Date(y, m - 1, d).getDay(); s[wd] += v[d]; n[wd]++; }
  return s.map((x, i) => n[i] ? x / n[i] : 0);
}
const VISTAS_RITMO = [['ritmo', 'Ritmo'], ['presu', 'Presupuesto']];
let VISTA_RITMO = null;
function paginaRitmo(){
  if(!VISTA_RITMO){
    let v = null; try{ v = new URLSearchParams(location.search).get('vista'); }catch(e){}
    VISTA_RITMO = VISTAS_RITMO.some(x => x[0] === v) ? v : (lsGet('finanzas_vista_ritmo') || 'ritmo');
  }
  $('#app').innerHTML = `
    <section class="anim" style="display:flex;flex-direction:column;gap:10px">
      ${segHTML('vistaRitmo', VISTAS_RITMO, VISTA_RITMO, 'Ver ritmo por')}
    </section>
    <div id="rVista"></div>`;
  dibujarVistaRitmo(false);
  enlazarSeg('vistaRitmo', v => { VISTA_RITMO = v; lsSet('finanzas_vista_ritmo', v); dibujarVistaRitmo(true); });
}
function dibujarVistaRitmo(cambio){
  const cont = $('#rVista'); if(!cont) return;
  const k = MES;
  if(VISTA_RITMO === 'presu'){
    cont.innerHTML = vistaRitmoPresupuesto(k);
    if(cambio) $$('.anim', cont).forEach(e => { e.classList.add('in'); e.classList.add('view-in'); });
    enlazarRitmoPresupuesto(cont, k);
  } else {
    const r = vistaRitmoActividad(k);
    cont.innerHTML = r.html;
    if(cambio) $$('.anim', cont).forEach(e => { e.classList.add('in'); e.classList.add('view-in'); });
    r.wire();
  }
  activarAnimaciones(document.body.classList.contains('quiet'));
  ajustarTextoGraficos(cont); activarScrub(cont);
}
function vistaRitmoActividad(k){
  const prev = prevKey(k), dm = diasDelMes(k), lim = diaLimite(k), actual = esMesActual(k);
  const total = totalGasto(k), prom = lim ? total / lim : 0;
  const promPrev = totalGasto(prev) / diasDelMes(prev);
  const meta = leerMeta(), metaDia = meta ? meta / dm : null;
  let chips = '';
  if(metaDia){ chips += `<span class="chip">meta S/ ${fmtMonto(metaDia)} por día</span>`; const dif = prom - metaDia; chips += `<span class="chip ${dif > 0 ? 'up' : 'down'}">${flecha(dif > 0)} S/ ${fmtMonto(Math.abs(dif))} ${dif > 0 ? 'sobre' : 'bajo'} la meta</span>`; }
  chips += deltaChip(prom, promPrev > 0 ? promPrev : null, 'vs ' + monthShort(prev));
  let html = card(`${head('Gasto promedio por día', `<span class="chip">${actual ? lim + ' días' : 'mes completo'}</span>`)}<div class="big" id="heroNum">S/ ${fmtMonto(prom)}</div><div class="chips">${chips}</div>`, 'wide');

  /* calendario */
  const pd = porDia(k);
  if(DIA_SEL === null || DIA_SEL > lim) DIA_SEL = lim;
  const pasados = []; for(let d = 1; d <= lim; d++) if(pd.v[d] > 0) pasados.push(pd.v[d]);
  const ord = pasados.slice().sort((a, b) => a - b);
  const nivel = v => { if(v <= 0) return -1; const q = ord.indexOf(v) / Math.max(1, ord.length); return q < 0.2 ? 0 : q < 0.4 ? 1 : q < 0.6 ? 2 : q < 0.8 ? 3 : 4; };
  const AL = [0.14, 0.28, 0.46, 0.7, 1];
  const off = (new Date(pd.y, pd.m - 1, 1).getDay() + 6) % 7;
  let cal = ['L','M','M','J','V','S','D'].map(x => `<span class="wd">${x}</span>`).join('') + '<span></span>'.repeat(off);
  for(let d = 1; d <= dm; d++){
    if(d > lim){ cal += `<span class="d fut"><span class="n">${d}</span></span>`; continue; }
    const lv = nivel(pd.v[d]), bg = lv < 0 ? 'var(--fill)' : alpha(TINTA.accent, AL[lv]);
    const wd = new Date(pd.y, pd.m - 1, d).getDay();
    cal += `<button type="button" class="d pp ${lv >= 2 ? 'dark' : 'light'}${actual && d === lim ? ' today' : ''}" style="--i:${d};background:${bg}" data-dia="${d}" aria-pressed="${d === DIA_SEL}" aria-label="${NOMBRE_DIA[wd]} ${d}, S/ ${fmtMonto(pd.v[d])}"><span class="n">${d}</span><span class="a">${pd.v[d] > 0 ? fmtCorto(pd.v[d]) : ''}</span></button>`;
  }
  let dMax = 1; for(let d = 1; d <= lim; d++) if(pd.v[d] > pd.v[dMax]) dMax = d;
  html += card(`${head(MESES_LARGOS[pd.m - 1].replace(/^./, c => c.toUpperCase()) + ' día por día', '<span class="hint">toca un día</span>')}
    <div class="cal">${cal}</div>
    <div class="cal-legend"><span class="sc">menos${AL.map(a => `<i style="background:${alpha(TINTA.accent, a)}"></i>`).join('')}más</span>${pd.v[dMax] > 0 ? `<span>Día más alto: <b style="color:var(--label)">${NOMBRE_DIA[new Date(pd.y, pd.m - 1, dMax).getDay()]} ${dMax} · S/ ${fmtMonto(pd.v[dMax])}</b></span>` : ''}</div>
    <div class="daybox" id="dayBox" aria-live="polite"></div>`, 'wide cal-card');

  /* días de la semana */
  const pds = promedioDiaSemana(k);
  const orden = [1,2,3,4,5,6,0];
  const items = orden.map(wd => { const g = GRUPOS_DIA.find(x => x.dias.includes(wd)); return { v: pds[wd], label: NOMBRE_DIA_CORTO[wd], color: g.color, txt: fmtMonto(pds[wd]) }; });
  html += card(`${head('Promedio por día de la semana', `<span class="hint">${monthShort(k)}</span>`)}
    ${barrasV(items, 170, { meta: metaDia })}
    <div class="legend">${GRUPOS_DIA.map(g => `<span><i style="background:${g.color}"></i>${g.nombre}</span>`).join('')}${metaDia ? `<span><i class="dash dash-meta"></i>meta S/ ${fmtMonto(metaDia)}</span>` : ''}</div>`);

  /* hora del día */
  const FR = [['Madrugada', '0-6', 0, 6], ['Mañana', '6-12', 6, 12], ['Mediodía', '12-15', 12, 15], ['Tarde', '15-19', 15, 19], ['Noche', '19-24', 19, 24]];
  const gasto = filasMes(k).filter(esGastoReal), conH = gasto.filter(r => tieneHora(r.fecha)), sinH = gasto.length - conH.length;
  if(conH.length >= 5){
    const tot = suma(conH);
    const fr = FR.map(f => { const rr = conH.filter(r => r.fecha.getHours() >= f[2] && r.fecha.getHours() < f[3]); return { f, rr, v: suma(rr) }; });
    const pico = fr.reduce((a, b) => b.v > a.v ? b : a);
    const top = agrupar(pico.rr, r => r.cat3 || r.cat2).slice(0, 2).map(g => g.clave);
    html += card(`${head('A qué hora gastas', '<span class="hint">% del gasto del mes</span>')}
      ${barrasV(fr.map(x => ({ v: x.v, label: `${x.f[0]}<br><small class="muted">${x.f[1]} h</small>`, txt: fmtPct(x.v, tot), color: x === pico ? TINTA.accent : alpha(TINTA.accent, 0.3), on: x === pico })), 140)}
      <p class="insight">Tu pico es <b>${pico.f[0].toLowerCase()}</b> (${pico.f[1]} h): ${fmtPct(pico.v, tot)} del gasto${top.length ? ', sobre todo ' + top.map(escapeHtml).join(' y ') : ''}.</p>
      ${sinH ? `<span class="hint">${sinH} movimiento${sinH === 1 ? '' : 's'} sin hora registrada no se cuentan aquí.</span>` : ''}`);
  }

  /* semana vs fin de semana */
  const gdat = GRUPOS_DIA.map(g => {
    const rr = gasto.filter(r => g.dias.includes(r.fecha.getDay())), n = contarDias(k, g.dias), t = suma(rr);
    const rp = filasMes(prev).filter(r => esGastoReal(r) && g.dias.includes(r.fecha.getDay())), np = contarDias(prev, g.dias);
    return { g, rr, n, t, prom: n ? t / n : 0, promPrev: np ? suma(rp) / np : 0 };
  });
  const maxP = Math.max(...gdat.map(x => x.prom), 1);
  const ratio = gdat[0].prom > 0 ? gdat[1].prom / gdat[0].prom : 0;
  html += card(`${head('Semana vs fin de semana')}
    <div class="vs">${gdat.map((x, i) => `<div class="r"><span class="l">${x.g.corto}</span><span class="t"><span class="gx" style="--i:${i};width:${(x.prom / maxP * 100).toFixed(1)}%;background:${x.g.color}"></span></span><span class="v">S/ ${fmtMonto(x.prom)}</span></div>`).join('')}
      <span class="hint">promedio por día${ratio > 1.05 ? ` · el fin de semana gastas ${ratio.toFixed(1)} veces más` : (ratio > 0 && ratio < 0.95 ? ' · el fin de semana gastas menos' : '')}</span></div>
    ${segHTML('grupo', GRUPOS_DIA.map(g => [g.id, g.corto]), GRUPO, 'Grupo de días')}
    <div id="grupoBox"></div>`, 'wide');
  const wire = () => {
  contar($('#heroNum'), prom);
  const pintarDia = () => {
    $$('.cal .d[data-dia]').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.dia === DIA_SEL)));
    const d = DIA_SEL, wd = new Date(pd.y, pd.m - 1, d).getDay(), v = pd.v[d], avg = pds[wd];
    const dif = avg > 0 ? Math.round((v / avg - 1) * 100) : null;
    const movs = pd.f[d].slice().sort((a, b) => b.montoSoles - a.montoSoles);
    $('#dayBox').innerHTML = `<div class="top-l"><div style="flex:1;min-width:0;display:flex;flex-direction:column"><span class="lbl">${actual && d === lim ? 'Hoy · ' : ''}${NOMBRE_DIA[wd].replace(/^./, c => c.toUpperCase())} ${d} ${MESES_CORTOS[pd.m - 1].toLowerCase()} · ${movs.length} movimiento${movs.length === 1 ? '' : 's'}</span><span class="val" id="dayVal">S/ ${fmtMonto(v)}</span></div>
      ${dif !== null && v > 0 ? `<div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex-shrink:0"><span class="chip ${dif >= 0 ? 'up' : 'down'}">${flecha(dif >= 0)} ${Math.abs(dif)}%</span><span class="lbl" style="text-align:right">vs tu ${NOMBRE_DIA[wd]} típico</span></div>` : ''}</div>
      ${movs.length ? `<div class="list view-in">${movs.slice(0, 5).map(r => filaMov(r, { soloHora: true })).join('')}</div>${movs.length > 5 ? `<span class="hint" style="text-align:center">y ${movs.length - 5} más</span>` : ''}` : '<span class="hint">No registraste gastos este día.</span>'}`;
    contar($('#dayVal'), v);
  };
  pintarDia();
  $$('.cal .d[data-dia]').forEach(b => b.addEventListener('click', () => { DIA_SEL = +b.dataset.dia; pintarDia(); }));
  const pintarGrupo = () => {
    const x = gdat.find(z => z.g.id === GRUPO);
    const meses = ventana(k, 6);
    const hist = meses.map(m => { const rr = filasMes(m).filter(r => esGastoReal(r) && x.g.dias.includes(r.fecha.getDay())); const n = contarDias(m, x.g.dias); return n ? suma(rr) / n : 0; });
    const top = agrupar(x.rr, r => r.cat3 || r.cat2 || '(sin definir)').slice(0, 5);
    const mx = top.length ? top[0].total : 1;
    $('#grupoBox').innerHTML = `<div class="view-in in" style="display:flex;flex-direction:column;gap:12px">
      <span class="hint">${x.g.desc} · ${x.n} día${x.n === 1 ? '' : 's'} ${actual ? 'hasta hoy' : 'en el mes'}</span>
      <div class="metrics"><div class="metric"><span class="ml">Promedio por día</span><span class="mv">S/ ${fmtMonto(x.prom)}</span></div><div class="metric"><span class="ml">vs ${monthShort(prev)}</span><span class="mv">${deltaTxt(x.prom, x.promPrev) || '-'}</span></div><div class="metric"><span class="ml">Total del grupo</span><span class="mv">S/ ${fmtMonto(x.t)}</span></div><div class="metric"><span class="ml">Movimientos</span><span class="mv">${x.rr.length}</span></div></div>
      ${meses.length > 1 ? `<div style="display:flex;flex-direction:column;gap:8px"><span class="block-label">Promedio diario · ${meses.length} meses</span>${barrasV(meses.map((m, i) => ({ v: hist[i], label: monthShort(m), color: i === meses.length - 1 ? x.g.color : alpha(x.g.color, 0.3), on: i === meses.length - 1, txt: fmtMonto(hist[i]) })), 110)}</div>` : ''}
      <div><span class="block-label">Qué te consume más</span><div class="list">${top.map((t, i) => `<div class="row" style="flex-wrap:wrap;min-height:52px">${tile(t.clave, colorDe(t.clave, 3), true)}<span class="main"><span class="name">${escapeHtml(t.clave)}</span><span class="track" style="margin-top:6px;height:5px"><span class="gx" style="--i:${i};width:${(t.total / mx * 100).toFixed(1)}%;background:${x.g.color}"></span></span></span><span class="amt">S/ ${fmtMonto(t.total)}</span></div>`).join('') || '<div class="empty">Sin gastos en estos días.</div>'}</div></div></div>`;
  };
  pintarGrupo();
  enlazarSeg('grupo', v => { GRUPO = v; pintarGrupo(); });
  };
  return { html, wire };
}

/** Línea de gasto acumulado del mes vs una línea ideal recta hacia la meta */
function ritmoPresupuestoSVG(dm, lim, cumActual, meta, alto){
  const W = 340, H = alto || 170, x0 = 16, x1 = W - 16, top = 22, bot = H - 22;
  const tope = Math.max(meta || 0, cumActual[lim] || 0) * 1.12 || 1;
  const xAt = d => dm > 1 ? x0 + (d - 1) / (dm - 1) * (x1 - x0) : (x0 + x1) / 2;
  const yAt = v => bot - Math.min(v, tope) / tope * (bot - top);
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Ritmo de gasto contra tu meta">`;
  if(meta) s += `<line x1="${xAt(1).toFixed(1)}" y1="${yAt(0).toFixed(1)}" x2="${xAt(dm).toFixed(1)}" y2="${yAt(meta).toFixed(1)}" stroke="var(--label-3)" stroke-width="1.4" stroke-dasharray="4 4" opacity="0.8" class="fi" style="--i:2"/>`;
  const pts = []; for(let d = 1; d <= lim; d++) pts.push(`${xAt(d).toFixed(1)},${yAt(cumActual[d]).toFixed(1)}`);
  if(pts.length > 1) s += `<path d="M${pts.join(' L')}" fill="none" stroke="${TINTA.accent}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" pathLength="1" class="dr"/>`;
  const ux = xAt(lim), uy = yAt(cumActual[lim] || 0);
  s += `<circle cx="${ux.toFixed(1)}" cy="${uy.toFixed(1)}" r="6" fill="${TINTA.accent}" class="live-ping"/><circle cx="${ux.toFixed(1)}" cy="${uy.toFixed(1)}" r="6" fill="${TINTA.accent}" stroke="var(--card)" stroke-width="2.5"/>`;
  s += `<text x="${ux.toFixed(1)}" y="${Math.max(12, uy - 12).toFixed(1)}" text-anchor="${lim >= dm - 1 ? 'end' : 'middle'}" font-size="11" font-weight="800" fill="var(--label)">S/ ${fmtCorto(cumActual[lim] || 0)}</text>`;
  // v16: hacia dónde vas. Línea punteada desde hoy hasta fin de mes al ritmo actual, con el color del semáforo
  if(meta && lim < dm && lim > 0){
    const proy = (cumActual[lim] || 0) / lim * dm, cP = proy > meta ? TINTA.alto : (proy > meta * 0.9 ? TINTA.justo : TINTA.ok);
    const px = xAt(dm), py = yAt(proy);
    s += `<line x1="${ux.toFixed(1)}" y1="${uy.toFixed(1)}" x2="${px.toFixed(1)}" y2="${py.toFixed(1)}" stroke="${cP}" stroke-width="2" stroke-dasharray="2 5" stroke-linecap="round" class="fi" style="--i:14"/>`;
    s += `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="4.5" fill="var(--card)" stroke="${cP}" stroke-width="2" class="pp" style="--i:10"/>`;
    s += `<text x="${(px - 8).toFixed(1)}" y="${Math.max(12, py - 10).toFixed(1)}" text-anchor="end" font-size="11" font-weight="800" fill="${cP}" class="fi" style="--i:16">cierre ~S/ ${fmtCorto(proy)}</text>`;
  }
  s += `<text x="${xAt(1).toFixed(1)}" y="${H - 4}" font-size="11" fill="var(--label-3)">día 1</text><text x="${xAt(dm).toFixed(1)}" y="${H - 4}" text-anchor="end" font-size="11" fill="var(--label-3)">día ${dm}</text>`;
  s += `</svg>`;
  const dd = []; for(let d = 1; d <= lim; d++) dd.push(d);
  const scrub = { w: W, top, bot, x: dd.map(d => +xAt(d).toFixed(1)), y: dd.map(d => +yAt(cumActual[d] || 0).toFixed(1)), v: dd.map(d => 'S/ ' + fmtMonto(cumActual[d] || 0)), l: dd.map(d => 'Acumulado al día ' + d),
    n: meta ? dd.map(d => { const ideal = meta * d / dm, dif = (cumActual[d] || 0) - ideal; return `S/ ${fmtMonto(Math.abs(dif))} ${dif > 0 ? 'sobre' : 'bajo'} el ritmo ideal`; }) : null,
    nc: meta ? dd.map(d => (cumActual[d] || 0) > meta * d / dm ? 't-up' : 't-down') : null };
  return `<div class="chart" data-scrub="${escapeHtml(JSON.stringify(scrub))}">${s}</div>`;
}
function vistaRitmoPresupuesto(k){
  const meta = leerMeta();
  if(!meta){
    return card(`${head('Presupuesto')}
      <p class="msg" style="font-size:14px;color:var(--label-2)">Todavía no configuras un presupuesto. Arma uno por categoría (o un margen general) para ver aquí tu cumplimiento mes a mes y tu ritmo de gasto contra tu meta.</p>
      <button class="btn solid" id="ritmoPresuCta">${svg('target', 15)}Configurar presupuesto</button>`, 'wide');
  }
  const dm = diasDelMes(k), lim = diaLimite(k), actual = esMesActual(k);
  const total = totalGasto(k), metaDia = meta / dm;
  const ritmoActual = lim ? total / lim : 0, dif = ritmoActual - metaDia;
  const proy = actual && lim ? total / lim * dm : total;
  const estado = proy > meta ? 'alto' : (proy > meta * 0.9 ? 'justo' : 'ok');
  const etiqueta = estado === 'ok' ? 'En camino' : estado === 'justo' ? 'Vas justo' : (!actual ? 'Te pasaste' : (total >= meta ? 'Ya te pasaste' : 'Vas a pasarte'));

  let html = card(`<div class="cartel st-${estado}"><b><i aria-hidden="true"></i>${etiqueta}</b><span>${actual ? `día ${lim} de ${dm}` : 'mes cerrado'}</span></div>
    ${head('Presupuesto')}
    <div class="big" id="presuHeroNum">S/ ${fmtMonto(total)}</div>
    <div class="chips"><span class="chip">de S/ ${fmtMonto(meta)}</span><span class="chip">ritmo ideal S/ ${fmtMonto(metaDia)}/día</span><span class="chip ${dif > 0 ? 'up' : 'down'}">${flecha(dif > 0)} S/ ${fmtMonto(Math.abs(dif))}/día ${dif > 0 ? 'sobre' : 'bajo'} tu ritmo ideal</span></div>`, 'wide');

  /* ritmo del mes: gasto acumulado día a día vs una línea recta hacia la meta */
  const pd = porDia(k);
  const cum = new Array(dm + 1).fill(0);
  let acc = 0; for(let d = 1; d <= dm; d++){ acc += pd.v[d]; cum[d] = acc; }
  const proyeccion = lim ? cum[lim] / lim * dm : cum[dm];
  html += card(`${head('Ritmo del mes', `<span class="hint">${actual ? 'proyectado S/ ' + fmtCorto(proyeccion) : 'cómo cerraste'}</span>`)}
    ${ritmoPresupuestoSVG(dm, lim, cum, meta, 170)}
    <div class="legend"><span><i style="background:${TINTA.accent}"></i>gasto acumulado</span><span><i class="dash dash-meta"></i>ritmo ideal</span>${actual ? `<span><i class="dash dot" style="border-color:${proyeccion > meta ? TINTA.alto : (proyeccion > meta * 0.9 ? TINTA.justo : TINTA.ok)}"></i>a este ritmo</span>` : ''}<span class="tap-hint">toca el gráfico para ver cada día</span></div>
    <p class="insight">${actual
      ? (proyeccion > meta ? `A este ritmo cerrarías en <b>S/ ${fmtMonto(proyeccion)}</b>, S/ ${fmtMonto(proyeccion - meta)} sobre tu meta.` : `A este ritmo cerrarías en <b>S/ ${fmtMonto(proyeccion)}</b>, bajo tu meta.`)
      : (total > meta ? `Cerraste S/ ${fmtMonto(total - meta)} sobre tu meta.` : `Cerraste S/ ${fmtMonto(meta - total)} bajo tu meta.`)}</p>`);

  /* categorías con presupuesto propio: cuáles están más cerca de pasarse este mes */
  const presus = leerPresupuestosCat(), claves = Object.keys(presus);
  if(claves.length){
    const filas = filasMes(k).filter(esGastoReal);
    const filasCat = claves.map(c2 => {
      const gastado = suma(filas.filter(r => (r.cat2 || '(sin definir)') === c2));
      const presu = presus[c2];
      return { c2, gastado, presu, pct: presu ? gastado / presu * 100 : 0 };
    }).sort((a, b) => b.pct - a.pct);
    html += card(`${head('Categorías con presupuesto', '<span class="hint hint-tap">toca para ver el detalle</span>')}${leyendaRitmo(k)}
      <div class="list">${filasCat.map((f, i) => {
        const col = colorDe(f.c2, 2), sobre = f.gastado >= f.presu;
        const barCol = sobre ? TINTA.alto : (f.gastado >= f.presu * 0.9 ? TINTA.justo : TINTA.ok);
        return `<button class="row" data-abrir-cat2="${escapeHtml(f.c2)}">${tile(f.c2, col)}<span class="main"><span class="name">${escapeHtml(f.c2)}</span><span class="sub" style="color:${sobre ? TINTA.alto : 'var(--label-3)'};font-weight:${sobre ? 700 : 500}">S/ ${fmtMonto(f.gastado)} de S/ ${fmtMonto(f.presu)}</span><span class="track row-track"><span class="gx" style="--i:${i};width:${Math.min(f.pct, 100).toFixed(1)}%;background:${barCol}"></span>${marcaRitmo(k, i)}</span></span><span class="amt" style="min-width:44px;text-align:right">${f.pct.toFixed(0)}%</span>${chev()}</button>`;
      }).join('')}</div>`, 'tight');
  }

  /* cumplimiento de meta: últimos meses, comparados contra la meta de hoy
     (se omite con menos de 2 meses de historia, igual que la Tendencia de Inicio) */
  const meses6 = ventana(k, 6);
  if(meses6.length >= 2){
    const totales = meses6.map(totalGasto);
    const dentro = totales.filter(t => t <= meta).length;
    const items = meses6.map((m, i) => {
      const on = i === meses6.length - 1, sobre = totales[i] > meta, base = sobre ? TINTA.alto : TINTA.ok;
      return { v: totales[i], label: monthShort(m), txt: fmtCorto(totales[i]), on, color: on ? base : alpha(base, 0.35) };
    });
    html += card(`${head('Cumplimiento de meta', `<span class="hint">${dentro} de ${meses6.length} mes${meses6.length === 1 ? '' : 'es'}</span>`)}
      ${barrasV(items, 150, { meta })}
      <div class="legend"><span><i style="background:${TINTA.ok}"></i>bajo la meta</span><span><i style="background:${TINTA.alto}"></i>sobre la meta</span><span><i class="dash dash-meta"></i>meta S/ ${fmtCorto(meta)}</span></div>`, 'wide');
  }

  html += `<p class="note">Tu meta es la suma de tus presupuestos por categoría más tu margen. El gasto histórico se compara contra la meta de hoy, no la que tenías configurada en ese momento.</p>`;
  return html;
}
function enlazarRitmoPresupuesto(cont, k){
  const cta = $('#ritmoPresuCta', cont);
  if(cta) cta.addEventListener('click', abrirPresupuestoGeneral);
  contar($('#presuHeroNum', cont), totalGasto(k));
  $$('[data-abrir-cat2]', cont).forEach(b => b.addEventListener('click', () => {
    const c2 = b.dataset.abrirCat2, f = ALL.find(r => (r.cat2 || '(sin definir)') === c2);
    if(f) abrirCat2(f.cat1, c2);
  }));
}

/* ============================================================
   COMPROMISOS
   ============================================================ */
function fijosDelMes(k){
  const marcados = leerFijosMarcados();
  const ventanaF = ventana(k, 3);
  const claves = new Set();
  ALL.forEach(r => { const m = monthKey(r.fecha); if(ventanaF.includes(m) && (r.cat2 === 'Fijo' || marcados.includes(r.comercio.toUpperCase())) && r.comercio) claves.add(r.comercio.toUpperCase()); });
  const actual = esMesActual(k), hoy = diaLimite(k);
  return Array.from(claves).map(c => {
    const del = ALL.filter(r => r.comercio.toUpperCase() === c);
    const esteMes = del.filter(r => monthKey(r.fecha) === k);
    const antes = del.filter(r => monthKey(r.fecha) < k).sort((a, b) => b.fecha - a.fecha);
    const ref = esteMes[esteMes.length - 1] || antes[0];
    if(!ref) return null;
    const pagado = esteMes.length > 0;
    const dia = antes[0] ? antes[0].fecha.getDate() : null;
    let estado, diaPago = null;
    if(pagado){ const f = esteMes.sort((a, b) => b.fecha - a.fecha)[0].fecha; diaPago = f.getDate(); estado = `pagado el ${f.getDate()} ${MESES_CORTOS[f.getMonth()].toLowerCase()}`; }
    else if(!actual) estado = 'no se registró este mes';
    else if(dia && dia > hoy) estado = `suele cobrarse el día ${dia}`;
    else estado = dia ? `el mes pasado fue el día ${dia} · aún no aparece` : 'aún no aparece';
    return { clave: c, nombre: ref.comercio, ref, pagado, monto: pagado ? suma(esteMes) : (antes[0] ? antes[0].montoSoles : 0), estado, dia: dia || 99, diaPago, marcado: marcados.includes(c) && ref.cat2 !== 'Fijo' };
  }).filter(Boolean).sort((a, b) => (a.pagado - b.pagado) || (a.dia - b.dia));
}
/** v16: el mes como una línea: cuándo se pagó cada fijo, cuándo suele llegar lo pendiente y dónde estás hoy */
function lineaCobros(k, fijos){
  const dm = diasDelMes(k), hoy = diaLimite(k), actual = esMesActual(k), pos = d => ((d - 0.5) / dm * 100).toFixed(2);
  const marcas = fijos.map(f => ({ f, d: f.pagado ? f.diaPago : (f.dia <= dm ? f.dia : null) })).filter(x => x.d).sort((a, b) => a.d - b.d);
  if(!marcas.length) return '';
  // cobros del mismo día y estado se juntan en un solo punto con el número adentro
  const grupos = []; marcas.forEach(x => { const g = grupos.find(y => y.d === x.d && y.ok === x.f.pagado); if(g) g.items.push(x.f); else grupos.push({ d: x.d, ok: x.f.pagado, items: [x.f] }); });
  const puntos = grupos.map((g, i) => `<span class="tl-m ${g.ok ? 'ok' : 'pend'}${g.items.length > 1 ? ' multi' : ''} pp" style="--i:${i};left:${pos(g.d)}%" title="Día ${g.d}: ${escapeHtml(g.items.map(f => f.nombre + ' S/ ' + fmtSol(f.monto)).join(', '))}${g.ok ? ' (pagado)' : ' (por pagar)'}">${g.items.length > 1 ? g.items.length : ''}</span>`).join('');
  const prox = actual ? marcas.filter(x => !x.f.pagado && x.d > hoy)[0] : null;
  const faltan = prox ? prox.d - hoy : 0;
  return `<div class="tl" role="img" aria-label="Cobros fijos del mes: ${escapeHtml(marcas.map(x => x.f.nombre + ' día ' + x.d + (x.f.pagado ? ' pagado' : ' por pagar')).join(', '))}">
      <div class="tl-track"><span class="tl-pasado gx" style="width:${actual ? pos(hoy + 0.5) : 100}%"></span></div>
      ${puntos}
      ${actual ? `<span class="tl-hoy fi" style="--i:12;left:${pos(hoy)}%"><i></i>hoy</span>` : ''}
      <div class="tl-ticks"><span>1</span><span>${Math.round(dm / 2)}</span><span>${dm}</span></div>
    </div>
    <div class="legend tl-leg"><span><i class="tl-k ok"></i>pagado</span><span><i class="tl-k pend"></i>por pagar</span>${prox ? `<span class="tl-next">Próximo: <b>${escapeHtml(prox.f.nombre)}</b> el día ${prox.d} (${faltan === 1 ? 'mañana' : 'en ' + faltan + ' días'}) · S/ ${fmtSol(prox.f.monto)}</span>` : ''}</div>`;
}
function paginaCompromisos(){
  const k = MES, filas = filasMes(k);
  const fijos = fijosDelMes(k), pag = fijos.filter(f => f.pagado), pend = fijos.filter(f => !f.pagado);
  const sPag = pag.reduce((s, f) => s + f.monto, 0), sPend = pend.reduce((s, f) => s + f.monto, 0);
  const pendientes = prestamosPendientes(PRESTAMOS);
  const grupos = agruparPrestamos(pendientes);   // v12: una fila por persona
  const porCobrar = grupos.reduce((s, g) => s + g.saldo, 0);
  const inv = filas.filter(r => r.cat2 === 'Inversiones y Ahorro'), pres = filas.filter(r => r.cat2 === 'Préstamos' || r.cat1 === 'Terceros');
  let html = card(`${head('Este mes', `<span class="hint">${monthLabel(k)}</span>`)}
    <div class="metrics">
      <div class="metric"><span class="ml">Gastos fijos</span><span class="mv" id="mFijos">S/ ${fmtMonto(sPag)}</span><span class="ms">${pag.length} de ${fijos.length} pagados</span></div>
      <div class="metric"><span class="ml">Por cobrar</span><span class="mv" id="mCobrar">S/ ${fmtMonto(porCobrar)}</span><span class="ms">${grupos.length} persona${grupos.length === 1 ? '' : 's'}</span></div>
      <div class="metric"><span class="ml">Invertido</span><span class="mv" id="mInv">S/ ${fmtMonto(suma(inv))}</span><span class="ms">${inv.length} movimiento${inv.length === 1 ? '' : 's'}</span></div>
      <div class="metric"><span class="ml">Prestado</span><span class="mv" id="mPres">S/ ${fmtMonto(suma(pres))}</span><span class="ms">${pres.length} movimiento${pres.length === 1 ? '' : 's'}</span></div>
    </div>`, 'wide');

  if(fijos.length){
    const pct = sPag + sPend > 0 ? sPag / (sPag + sPend) * 100 : 0;
    html += card(`${head('Gastos fijos', pend.length ? `<span class="hint">S/ ${fmtMonto(sPend)} por pagar</span>` : '<span class="hint">todo al día</span>')}
      <div style="display:flex;flex-direction:column;gap:6px"><div class="track" style="height:8px;border-radius:4px"><span class="gx" style="width:${pct.toFixed(1)}%;background:var(--down)"></span></div><span class="hint">S/ ${fmtMonto(sPag)} pagados de S/ ${fmtMonto(sPag + sPend)}${pend.length ? ` · falta${pend.length === 1 ? '' : 'n'} ${pend.length}` : ''}</span></div>
      ${lineaCobros(k, fijos)}
      <div class="list">${fijos.map(f => `<button class="row" data-com="${escapeHtml(f.nombre)}"><span class="tile" style="background:${f.pagado ? 'var(--down-soft)' : 'var(--warn-soft)'}">${svg(f.pagado ? 'check' : 'clock', 18, f.pagado ? 'var(--down)' : 'var(--warn)')}</span><span class="main"><span class="name">${escapeHtml(f.nombre)}</span><span class="sub" style="color:${f.pagado ? 'var(--down)' : 'var(--warn)'};font-weight:600;white-space:normal">${f.estado}</span></span><span class="right"><span class="amt">S/ ${fmtSol(f.monto)}</span><span class="date">${escapeHtml(f.ref.cat3 || f.ref.cat2)}${f.marcado ? ' · marcado' : ''}</span></span></button>`).join('')}</div>`, 'tight');
  } else {
    html += card(`${head('Gastos fijos')}<div class="empty">Aún no hay movimientos en la subcategoría Fijo.</div>`);
  }

  const marc = leerFijosMarcados();
  const rec = detectarRecurrentes(ALL).filter(rc => rc.ultimo.cat2 !== 'Fijo' && rc.estable).sort((a, b) => b.meses.length - a.meses.length || b.ultimo.montoSoles - a.ultimo.montoSoles);
  html += card(`${head('Recurrentes detectados', '<span class="hint">no están en tus fijos</span>')}
    <p class="hint" style="margin:2px 0 4px;line-height:1.45">Comercios que te cobran casi todos los meses. Si son fijos, márcalos para seguirlos arriba.</p>
    <div class="list" id="recList">${rec.map((rc, idx) => { const on = marc.includes(rc.clave); return `<div class="row"${idx >= 5 ? ' hidden data-extra' : ''}>${tile(iconoFila(rc.ultimo), colorFila(rc.ultimo))}<span class="main"><span class="name">${escapeHtml(rc.nombre)}</span><span class="sub">~S/ ${fmtSol(rc.ultimo.montoSoles)} · ${rc.meses.length} meses</span></span><button type="button" class="btn sm${on ? ' done' : ''}" data-fijo="${escapeHtml(rc.clave)}" aria-pressed="${on}">${on ? 'Marcado como fijo' : 'Marcar como fijo'}</button></div>`; }).join('') || '<div class="empty">No detecto otros cobros recurrentes.</div>'}</div>${rec.length > 5 ? `<button class="more" id="recMas" style="align-self:center">Ver ${rec.length - 5} más</button>` : ''}`, 'tight');

  if(pendientes.length){
    const orig = grupos.reduce((s, g) => s + g.original, 0), pagT = grupos.reduce((s, g) => s + g.pagado, 0);
    html += card(`${head('Préstamos por cobrar', `<span class="hint">${grupos.length} persona${grupos.length === 1 ? '' : 's'}</span>`)}
      <div class="mid" id="cobrarNum">S/ ${fmtMonto(porCobrar)}</div>
      <div class="chips">${pagT > 0 ? `<span class="chip">recuperado <b>S/ ${fmtMonto(pagT)}</b> · ${fmtPct(pagT, orig)}</span>` : '<span class="chip">sin abonos registrados</span>'}</div>
      <div>${grupos.map((g, i) => filaPersonaPrestamo(g, i)).join('')}</div>
      ${!HOJA_PRESTAMOS ? '<span class="hint">Calculado desde tus egresos: los abonos se ven cuando la hoja Prestamos tiene datos.</span>' : ''}`);
  }

  html += card(`${head('Finanzas del mes', '<span class="hint">solo montos registrados</span>')}
    <div class="list">
      <div class="row">${tile('Inversiones y Ahorro', colorDe('Inversiones y Ahorro', 2))}<span class="main"><span class="name">Inversiones y ahorro</span><span class="sub">${inv.length} movimiento${inv.length === 1 ? '' : 's'}</span></span><span class="amt">S/ ${fmtMonto(suma(inv))}</span></div>
      <div class="row">${tile('Préstamos', colorDe('Préstamos', 2))}<span class="main"><span class="name">Préstamos</span><span class="sub">${pres.length} movimiento${pres.length === 1 ? '' : 's'} · incluye compartidos</span></span><span class="amt">S/ ${fmtMonto(suma(pres))}</span></div>
    </div>`, 'tight');
  $('#app').innerHTML = html;
  contar($('#cobrarNum'), porCobrar);
  $$('[data-persona]').forEach(b => b.addEventListener('click', () => abrirPersonaPrestamos(b.dataset.persona)));
  contar($('#mFijos'), sPag);
  contar($('#mCobrar'), porCobrar);
  contar($('#mInv'), suma(inv));
  contar($('#mPres'), suma(pres));
  $$('[data-com]').forEach(b => b.addEventListener('click', () => abrirComercio(b.dataset.com)));
  const rm = $('#recMas'); if(rm) rm.addEventListener('click', () => { $$('#recList [data-extra]').forEach(e => { e.hidden = false; e.classList.add('view-in'); }); rm.remove(); });
  $$('[data-fijo]').forEach(b => b.addEventListener('click', () => {
    const l = leerFijosMarcados(), c = b.dataset.fijo, i = l.indexOf(c);
    if(i >= 0) l.splice(i, 1); else l.push(c);
    guardarFijosMarcados(l); render(true);
  }));
}

/* ============================================================
   PRÉSTAMOS AGRUPADOS POR PERSONA (v12)
   Una persona con varios préstamos (p.ej. varios gastos compartidos) es UNA fila con la suma;
   al tocarla se abre su detalle: cada préstamo con su comercio, fecha, monto y abonos.
   Montos: la fila de la persona es un total (sin decimales); cada préstamo, 1 decimal.
   ============================================================ */
function clavePersona(n){ return String(n || '').trim().toLowerCase(); }
function egresoDePrestamo(p){ return p.egresosId ? ALL.find(r => r.id === p.egresosId) || null : null; }
/** Monto del préstamo en soles: los que están en dólares se pasan con el tipo de cambio de su gasto de origen. */
function prestamoEnSoles(p, v){
  if(p.moneda !== 'USD') return v;
  const e = egresoDePrestamo(p);
  return e && e.monto ? v * e.montoSoles / e.monto : v;
}
function agruparPrestamos(lista){
  const mapa = new Map();
  (lista || []).forEach(p => {
    const k = clavePersona(p.persona);
    if(!mapa.has(k)) mapa.set(k, { clave: k, persona: p.persona, items: [] });
    mapa.get(k).items.push(p);
  });
  return Array.from(mapa.values()).map(g => {
    g.original = g.items.reduce((s, p) => s + prestamoEnSoles(p, p.original), 0);
    g.pagado = g.items.reduce((s, p) => s + prestamoEnSoles(p, p.pagado), 0);
    g.saldo = g.original - g.pagado;
    return g;
  }).sort((a, b) => b.saldo - a.saldo);
}
function avatarPersona(nombre){
  const col = colorDe(nombre, 3);
  return `<span class="av" style="background:${alpha(col, 0.16)};color:${col}">${escapeHtml(String(nombre).charAt(0).toUpperCase())}</span>`;
}
function filaPersonaPrestamo(g, i){
  const col = colorDe(g.persona, 3), pc = g.original ? g.pagado / g.original * 100 : 0, n = g.items.length;
  return `<button type="button" class="loan tap" data-persona="${escapeHtml(g.clave)}" aria-label="Ver los préstamos de ${escapeHtml(g.persona)}">
    <div class="lt"><span class="who">${avatarPersona(g.persona)}<span class="nm">${escapeHtml(g.persona)}</span>${n > 1 ? `<span class="cnt" aria-label="${n} préstamos">${n}</span>` : ''}</span><span class="amt" style="font-weight:700">S/ ${fmtMonto(g.saldo)}${chev()}</span></div>
    <div class="track"><span class="gx" style="--i:${i};width:${pc.toFixed(1)}%;background:${col}"></span></div>
    <div class="meta"><span>Prestado <b>S/ ${fmtMonto(g.original)}</b> · abonado <b>S/ ${fmtMonto(g.pagado)}</b></span><span>${pc.toFixed(0)}%</span></div>
  </button>`;
}
/** Una fila por préstamo: comercio y tipo de su gasto de origen, saldo (1 decimal), fecha y abonos. */
function filaPrestamoDetalle(p, saldado){
  const e = egresoDePrestamo(p);
  const nombre = e ? (e.comercio || '(sin comercio)') : 'Préstamo';
  const hoja = e && e.cat3 ? e.cat3.split(/[>·]/).map(x => x.trim()).filter(Boolean).pop() : '';
  const tipo = e ? (e.cat1 === 'Terceros' ? 'Compartido' + (hoja ? ' · ' + hoja : '') : 'Préstamo directo') : 'Préstamo';
  const soles = p.moneda !== 'USD' || (e && e.monto);
  const sb = soles ? 'S/' : '$';
  const saldo = prestamoEnSoles(p, p.original - p.pagado), orig = prestamoEnSoles(p, p.original), pag = prestamoEnSoles(p, p.pagado);
  const monto = saldado ? orig : saldo;
  const detalle = saldado ? 'saldado' : '';
  const icono = e ? tile(iconoFila(e), colorFila(e)) : tile('Préstamos', colorDe('Préstamos', 2));
  const cuerpo = `${icono}<span class="main"><span class="name">${escapeHtml(nombre)}</span><span class="sub">${!saldado && p.pagado > 0 ? `abonó ${sb} ${fmtSol(pag)} de ${sb} ${fmtSol(orig)}` : escapeHtml(tipo) + (detalle ? ' · ' + detalle : '')}</span></span><span class="right"><span class="amt">${sb} ${fmtSol(monto)}</span><span class="date">${p.fecha ? fechaRelativa(p.fecha) : ''}</span></span>`;
  return e && e.comercio
    ? `<button type="button" class="row${saldado ? ' dim' : ''}" data-com="${escapeHtml(e.comercio)}">${cuerpo}</button>`
    : `<div class="row${saldado ? ' dim' : ''}">${cuerpo}</div>`;
}
function abrirPersonaPrestamos(clave){
  const todos = (PRESTAMOS || []).filter(p => clavePersona(p.persona) === clave);
  if(!todos.length) return;
  const persona = todos[0].persona;
  const porFecha = (a, b) => (b.fecha || 0) - (a.fecha || 0);
  const pend = todos.filter(p => p.estado !== 'Pagado' && p.original - p.pagado > 0.01).sort(porFecha);
  const sald = todos.filter(p => !pend.includes(p)).sort(porFecha);
  const g = agruparPrestamos(pend)[0] || { saldo: 0, original: 0, pagado: 0, items: [] };
  const col = colorDe(persona, 3), pc = g.original ? g.pagado / g.original * 100 : 0;
  const html = `
    <div style="display:flex;flex-direction:column;gap:8px">
      <span class="block-label">Te debe</span>
      <div class="mid">S/ ${fmtMonto(g.saldo)}</div>
      <div class="chips"><span class="chip">${pend.length} préstamo${pend.length === 1 ? '' : 's'} pendiente${pend.length === 1 ? '' : 's'}</span>${g.pagado > 0 ? `<span class="chip">abonado <b>S/ ${fmtMonto(g.pagado)}</b> · ${fmtPct(g.pagado, g.original)}</span>` : ''}</div>
      ${pend.length ? `<div class="track" style="height:8px;border-radius:4px"><span class="gx" style="width:${pc.toFixed(1)}%;background:${col}"></span></div>` : ''}
    </div>
    ${pend.length ? `<div><div class="block-label">Pendientes</div><div class="list">${pend.map(p => filaPrestamoDetalle(p, false)).join('')}</div></div>` : ''}
    ${sald.length ? `<div><div class="block-label">Ya saldados</div><div class="list">${sald.map(p => filaPrestamoDetalle(p, true)).join('')}</div></div>` : ''}
    <p class="hint" style="margin:0">Toca un préstamo para ver ese comercio. Los abonos se registran desde /prestamos en Telegram.</p>`;
  abrirHoja({ titulo: persona, ruta: 'Préstamos por cobrar', html,
    enlazar: body => $$('[data-com]', body).forEach(b => b.addEventListener('click', () => abrirComercio(b.dataset.com))) });
}

/* ============================================================
   RESUMEN (v15) · los últimos meses de un vistazo
   Panorama del periodo, qué cambió contra el mes anterior (mismos
   días si el mes está en curso), categorías mes a mes y comercios.
   ============================================================ */
function kCorto(v){ return v >= 1000 ? (v / 1000).toFixed(v >= 10000 ? 0 : 1).replace(/\.0$/, '') + 'k' : fmtMonto(v); }
function paginaResumen(){
  const k = MES, meses = ventana(k, 6), actual = esMesActual(k), lim = diaLimite(k);
  if(meses.length < 2){
    $('#app').innerHTML = card(`${head('Resumen')}<div class="empty">El resumen compara meses: aparece cuando tengas al menos 2 meses con movimientos.</div>`, 'wide');
    return;
  }
  const filasP = ALL.filter(r => esGastoReal(r) && meses.includes(monthKey(r.fecha)));
  const totales = meses.map(totalGasto), total = totales.reduce((a, b) => a + b, 0);
  // los promedios y extremos usan solo meses completos: el mes en curso todavía no terminó
  const cerr = meses.map((m, i) => ({ m, v: totales[i] })).filter(x => !(actual && x.m === k) && x.v > 0);
  const prom = cerr.length ? cerr.reduce((a, x) => a + x.v, 0) / cerr.length : 0;
  const alto = cerr.length ? cerr.reduce((a, x) => x.v > a.v ? x : a) : null;
  const bajo = cerr.length ? cerr.reduce((a, x) => x.v < a.v ? x : a) : null;
  const meta = leerMeta(), dentro = meta ? cerr.filter(x => x.v <= meta).length : 0;
  const dias = meses.reduce((a, m) => a + (m === k ? lim : diasDelMes(m)), 0);
  const nombreMes = m => MESES_LARGOS[+m.split('-')[1] - 1].replace(/^./, c => c.toUpperCase());

  let html = card(`${head(`Últimos ${meses.length} meses`, `<span class="chip">${monthShort(meses[0])} a ${monthShort(k)}${actual ? ' (en curso)' : ''}</span>`)}
    <div class="big" id="resNum">S/ ${fmtMonto(total)}</div>
    <div class="metrics res-metrics">
      <div class="metric"><span class="ml">Promedio mensual</span><span class="mv">S/ ${fmtMonto(prom)}</span><span class="ms">${cerr.length} mes${cerr.length === 1 ? '' : 'es'} completo${cerr.length === 1 ? '' : 's'}</span></div>
      <div class="metric"><span class="ml">Por día</span><span class="mv">S/ ${fmtMonto(dias ? total / dias : 0)}</span><span class="ms">${dias} días</span></div>
      <div class="metric"><span class="ml">Mes más alto</span><span class="mv">${alto ? 'S/ ' + fmtMonto(alto.v) : '-'}</span><span class="ms">${alto ? nombreMes(alto.m) : ''}</span></div>
      <div class="metric"><span class="ml">Mes más bajo</span><span class="mv">${bajo ? 'S/ ' + fmtMonto(bajo.v) : '-'}</span><span class="ms">${bajo ? nombreMes(bajo.m) : ''}</span></div>
      ${meta ? `<div class="metric"><span class="ml">Dentro de la meta</span><span class="mv ${dentro === cerr.length ? 't-down' : (dentro === 0 ? 't-up' : '')}">${dentro} de ${cerr.length}</span><span class="ms">meta S/ ${fmtMonto(meta)}</span></div>` : ''}
      <div class="metric"><span class="ml">Movimientos</span><span class="mv">${filasP.length}</span><span class="ms">ticket prom. S/ ${fmt1(filasP.length ? total / filasP.length : 0)}</span></div>
    </div>`, 'wide');

  /* qué cambió: cada subcategoría contra el mes anterior (mismos días si el mes está en curso) */
  const prev = prevKey(k), clave = r => r.cat1 + '|' + (r.cat2 || '(sin definir)');
  const enK = filasMes(k).filter(r => esGastoReal(r) && (!actual || r.fecha.getDate() <= lim));
  const enP = filasMes(prev).filter(r => esGastoReal(r) && (!actual || r.fecha.getDate() <= lim));
  const mapa = {};
  enK.forEach(r => { const c = clave(r); (mapa[c] = mapa[c] || { a:0, b:0 }).a += r.montoSoles; });
  enP.forEach(r => { const c = clave(r); (mapa[c] = mapa[c] || { a:0, b:0 }).b += r.montoSoles; });
  const cambios = Object.entries(mapa).map(([c, v]) => ({ c1: c.split('|')[0], c2: c.split('|')[1], a: v.a, b: v.b, d: v.a - v.b }))
    .filter(x => Math.abs(x.d) >= 1).sort((x, y) => Math.abs(y.d) - Math.abs(x.d));
  const maxD = Math.max(1, ...cambios.map(x => Math.abs(x.d)));
  const sube = cambios.filter(x => x.d > 0).reduce((a, x) => a + x.d, 0), baja = -cambios.filter(x => x.d < 0).reduce((a, x) => a + x.d, 0);
  const filaCambio = (x, i) => `<button class="row" data-c1="${escapeHtml(x.c1)}" data-c2="${escapeHtml(x.c2)}">${tile(x.c2, colorDe(x.c2, 2))}<span class="main"><span class="name">${escapeHtml(x.c2)}</span><span class="sub">S/ ${fmtMonto(x.a)} ahora · S/ ${fmtMonto(x.b)} antes</span>
      <span class="div-track"><span class="div-bar ${x.d > 0 ? 'up' : 'down'} gx" style="--i:${i};width:${(Math.abs(x.d) / maxD * 50).toFixed(1)}%"></span></span></span>
      <span class="right"><span class="amt ${x.d > 0 ? 't-up' : 't-down'}">${x.d > 0 ? '+' : '-'}S/ ${fmtMonto(Math.abs(x.d))}</span><span class="date">${x.b > 0 ? (x.d > 0 ? '+' : '-') + Math.round(Math.abs(x.d) / x.b * 100) + '%' : 'nuevo'}</span></span>${chev()}</button>`;
  /* categorías mes a mes: mapa de calor (cada fila se compara contra su propio máximo) */
  const top = agrupar(filasP, clave).slice(0, 8);
  const celdas = top.map((g, fi) => {
    const vals = meses.map(m => suma(g.filas.filter(r => monthKey(r.fecha) === m))), con = vals.filter(v => v > 0);
    const mn = con.length ? Math.min(...con) : 0, mxv = Math.max(1, ...vals), rango = mxv - mn;
    const nivel = v => rango > mxv * 0.08 ? (v - mn) / rango : 0.35;   // fila casi pareja: tono medio uniforme
    const [c1, c2] = g.clave.split('|'), col = colorDe(c2, 2);
    return `<button class="heat-row" data-c1="${escapeHtml(c1)}" data-c2="${escapeHtml(c2)}" aria-label="${escapeHtml(c2)}: ${meses.map((m, i) => monthShort(m) + ' S/ ' + fmtMonto(vals[i])).join(', ')}">
      <span class="heat-name"><i style="background:${col}"></i>${escapeHtml(c2)}</span>
      ${vals.map((v, i) => `<span class="heat-c fi${meses[i] === k ? ' on' : ''}" style="--i:${fi + i};background:${v > 0 ? alpha(col, (0.14 + 0.66 * nivel(v)).toFixed(2)) : 'transparent'};color:${v > 0 && nivel(v) > 0.62 ? 'var(--ink)' : 'var(--label)'}">${v > 0 ? kCorto(v) : '-'}</span>`).join('')}
    </button>`;
  }).join('');
  html += card(`${head('Categorías mes a mes', '<span class="hint">más intenso = su mes más alto</span>')}
    <div class="heat" style="--n:${meses.length}">
      <div class="heat-row heat-h"><span class="heat-name"></span>${meses.map(m => `<span class="heat-c${m === k ? ' on' : ''}">${monthShort(m)}</span>`).join('')}</div>
      ${celdas}
    </div>`, 'wide');

  html += card(`${head('Qué cambió', `<span class="hint">vs ${actual ? 'mismos días de ' : ''}${monthShort(prev)}</span>`)}
    ${cambios.length ? `<div class="chips"><span class="chip up">${flecha(true)} subió S/ ${fmtMonto(sube)}</span><span class="chip down">${flecha(false)} bajó S/ ${fmtMonto(baja)}</span></div>
    ${listaConMas(cambios, 6, filaCambio, ['categoría más', 'categorías más'])}` : '<div class="empty">Sin cambios contra el mes anterior.</div>'}`, 'tight');

  /* comercios del periodo */
  const coms = agrupar(filasP.filter(r => r.comercio), r => r.comercio).slice(0, 8);
  const maxC = coms.length ? coms[0].total : 1;
  html += card(`${head('Tus comercios del periodo', `<span class="hint">${meses.length} meses</span>`)}
    <div class="list">${coms.map((g, i) => { const r0 = g.filas[0], nm = new Set(g.filas.map(r => monthKey(r.fecha))).size;
      return `<button class="row" data-com="${escapeHtml(g.clave)}">${tile(iconoFila(r0), colorFila(r0))}<span class="main"><span class="name">${escapeHtml(g.clave)}</span><span class="sub">${g.n} compra${g.n === 1 ? '' : 's'} · en ${nm} de ${meses.length} meses</span><span class="track row-track"><span class="gx" style="--i:${i};width:${(g.total / maxC * 100).toFixed(1)}%;background:${colorFila(r0)}"></span></span></span><span class="amt">S/ ${fmtMonto(g.total)}</span>${chev()}</button>`; }).join('') || '<div class="empty">Sin comercios en el periodo.</div>'}</div>`, 'tight');

  html += `<p class="note">El mes en curso cuenta en el total, pero no en el promedio ni en el mes más alto o más bajo, porque todavía no terminó.${actual ? ` "Qué cambió" compara los primeros ${lim} días de cada mes.` : ''}</p>`;
  $('#app').innerHTML = html;
  contar($('#resNum'), total);
  enlazarMas($('#app'), (() => { const id = ($('[data-mas]') || {}).dataset; return id ? { [id.mas]: { filas: cambios, render: filaCambio } } : {}; })());
  const enlazarFilas = raiz => {
    $$('[data-c2]', raiz).forEach(b => { if(b._ok) return; b._ok = 1; b.addEventListener('click', () => abrirCat2(b.dataset.c1, b.dataset.c2)); });
    $$('[data-com]', raiz).forEach(b => { if(b._ok) return; b._ok = 1; b.addEventListener('click', () => abrirComercio(b.dataset.com)); });
  };
  enlazarFilas($('#app'));
  $$('[data-mas]').forEach(b => b.addEventListener('click', () => setTimeout(() => { enlazarFilas($('#app')); $$('#app .gx').forEach(x => x.style.transform = 'none'); }, 0)));
}

/* ============================================================
   Arranque
   ============================================================ */
const PAGINAS = { inicio: paginaInicio, gastos: paginaGastos, ritmo: paginaRitmo, compromisos: paginaCompromisos, resumen: paginaResumen };
/* v13: un monto nunca se parte en dos líneas ("S/" arriba y "2,062" abajo): el espacio después de
   S/ o $ se vuelve no separable en todo lo que se dibuja (pestañas, hojas, contadores). */
const RE_MONEDA = /(S\/|\$) (?=[-\d])/g;
function fijarMonedas(nodo){
  if(nodo.nodeType === 3){ const v = nodo.data.replace(RE_MONEDA, '$1\u00a0'); if(v !== nodo.data) nodo.data = v; return; }
  if(nodo.nodeType !== 1) return;
  const w = document.createTreeWalker(nodo, NodeFilter.SHOW_TEXT);
  let n; while((n = w.nextNode())){ const v = n.data.replace(RE_MONEDA, '$1\u00a0'); if(v !== n.data) n.data = v; }
}
try{ new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(fijarMonedas))).observe(document.documentElement, { childList:true, subtree:true }); }catch(e){}

function render(quiet){
  document.body.classList.toggle('quiet', !!quiet);
  const y = window.scrollY;
  try{ PAGINAS[PAGINA](); }
  catch(err){ console.error(err); $('#app').innerHTML = `<div class="state">Algo falló al dibujar esta pestaña.<br><span style="font-size:12px">${escapeHtml(mensajeError(err))}</span></div>`; }
  activarAnimaciones(quiet);
  ajustarTextoGraficos(); activarScrub();
  if(quiet) window.scrollTo(0, y);
}
function cargar(data, info){
  // el presupuesto se sincroniza en cada respuesta del bot, incluso si los egresos no cambiaron
  // (algo muy común: edita la meta en Inicio y pasa a Gastos, que recarga la página)
  let presuCambio = false;
  // la copia guardada de los datos puede traer un presupuesto más viejo que el de este
  // dispositivo: solo manda la respuesta fresca del bot, y siempre encima van los pendientes
  if(data && data.presupuestos && info.origen === 'red' && !info.desdeCache){
    const antes = JSON.stringify(PRESUPUESTOS);
    PRESUPUESTOS = aplicarPendientesPresu(data.presupuestos);
    guardarPresupuestosCache(PRESUPUESTOS);
    presuCambio = antes !== JSON.stringify(PRESUPUESTOS);
  }
  if(INFO && !info.cambio){ INFO = info; estadoConexion('ok'); if(presuCambio) render(true); if(REFRESCO_MANUAL && info.origen === 'red'){ REFRESCO_MANUAL = false; aviso('Ya estás al día', 'ok'); } return; }
  const primera = !INFO;
  INFO = info;
  const antes = ALL.length;
  ALL = parseEgresos(data);
  if(!primera && info.origen === 'red'){
    const n = ALL.length - antes;
    if(n > 0) aviso(`${n} movimiento${n === 1 ? ' nuevo' : 's nuevos'}`, 'nuevo');
    else if(REFRESCO_MANUAL) aviso('Ya estás al día: sin movimientos nuevos', 'ok');
    REFRESCO_MANUAL = false;
  }
  COMPLETO = esHistorialCompleto(data);
  const pl = parsePrestamos(data);
  HOJA_PRESTAMOS = !!pl;
  PRESTAMOS = pl || prestamosDesdeEgresos(ALL);
  const set = new Set(ALL.map(r => monthKey(r.fecha)));
  set.add(monthKey(new Date()));
  MESES = Array.from(set).sort();
  const pref = MES || leerMesPreferido();
  MES = pref && MESES.includes(pref) ? pref : MESES[MESES.length - 1];
  llenarSelect(); actualizarLinks();
  render(!primera);
  estadoConexion(info.origen === 'red' ? 'ok' : 'sync');
}
function alFallarCarga(err, hayCache){
  if(REFRESCO_MANUAL){ REFRESCO_MANUAL = false; aviso('No se pudo actualizar. Revisa tu conexión.', 'error'); }
  if(hayCache){ estadoConexion('off'); return; }
  $('#app').innerHTML = `<div class="state">No se pudieron cargar los datos.<br><span style="font-size:12px">${escapeHtml(mensajeError(err))}</span><br><br><button class="btn" onclick="location.reload()">Reintentar</button></div>`;
  estadoConexion('off');
}
/** v16: aviso breve arriba (movimientos nuevos, al día, error). Entra y sale con transición; no bloquea nada. */
let REFRESCO_MANUAL = false, _aviso = null;
function aviso(texto, tipo){
  if(_aviso){ _aviso.remove(); _aviso = null; }
  const el = document.createElement('div');
  el.className = 'aviso aviso-' + (tipo || 'ok'); el.setAttribute('role', 'status');
  el.innerHTML = svg(tipo === 'error' ? 'alerta' : (tipo === 'nuevo' ? 'sube' : 'check'), 16);
  const t = document.createElement('span'); t.textContent = texto; el.appendChild(t);
  document.body.appendChild(el); _aviso = el;
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('on')));
  setTimeout(() => { el.classList.remove('on'); setTimeout(() => { el.remove(); if(_aviso === el) _aviso = null; }, 400); }, 3000);
}
/* v11: pide datos frescos al bot sin recargar la página (al volver a la app o al tocar el indicador). */
function refrescarDatos(forzar){
  if(CARGANDO_RED) return;
  if(!forzar && Date.now() - ULTIMA_RED < 60 * 1000) return;
  estadoConexion('sync');
  obtenerDatos(cargar, alFallarCarga, true);
}
function iniciarApp(){
  shell();
  obtenerDatos(cargar, alFallarCarga);
  // al volver a la app (desde Telegram, otra app o con el celular bloqueado) trae lo nuevo sola
  document.addEventListener('visibilitychange', () => { if(document.visibilityState === 'visible') refrescarDatos(false); });
  const live = $('#live'); if(live) live.addEventListener('click', () => { if(!CARGANDO_RED) REFRESCO_MANUAL = true; refrescarDatos(true); });
}

/* ---------- candado de acceso: se muestra una vez por dispositivo ---------- */
function mostrarGate(onUnlock){
  document.body.classList.add('gate-lock');
  const ov = document.createElement('div');
  ov.className = 'gate-ov';
  ov.innerHTML = `
    <div class="gate-card">
      ${logo381Html()}
      <h1>Finanzas</h1>
      <p class="hint">Ingresa la contraseña para entrar en este dispositivo</p>
      <form id="gateForm" class="gate-form" autocomplete="off">
        <input id="gateInput" type="password" inputmode="numeric" autocomplete="current-password" placeholder="Contraseña" aria-label="Contraseña">
        <button class="btn solid" type="submit">Entrar</button>
      </form>
      <p class="gate-err" id="gateErr" hidden>Contraseña incorrecta, intenta de nuevo.</p>
    </div>`;
  document.body.appendChild(ov);
  const card = $('.gate-card', ov), input = $('#gateInput', ov), err = $('#gateErr', ov);
  requestAnimationFrame(() => input.focus());
  $('#gateForm', ov).addEventListener('submit', e => {
    e.preventDefault();
    if(input.value === GATE_PASS){
      gateDesbloquear();
      document.body.classList.remove('gate-lock');
      ov.remove();
      onUnlock();
    } else {
      err.hidden = false;
      input.value = '';
      input.focus();
      card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
    }
  });
}

if(gatePasado()) iniciarApp(); else mostrarGate(iniciarApp);
