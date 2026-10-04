/* ============================================================
   PILOTO · Inicio con línea gráfica Apple (iOS Salud / Fitness / Wallet)
   Solo se usa en piloto.html (body.apple). Mismos datos y cálculos que Inicio;
   cambia la presentación: anillo de meta, listas agrupadas tipo iOS, tipografía del sistema.
   Se carga antes de app.js: las funciones de app.js se resuelven al llamar.
   ============================================================ */
function anilloMeta(pct, pctProy, pctIdeal, col){
  // anillo tipo Fitness: pista tenue del mismo color, avance sólido, cierre proyectado tenue y marca del ideal de hoy
  const R = 46, C = 2 * Math.PI * R, arco = p => (C * Math.max(0, Math.min(p, 1))).toFixed(1);
  const ang = pctIdeal * 360 - 90, rad = ang * Math.PI / 180;
  const mx = 60 + R * Math.cos(rad), my = 60 + R * Math.sin(rad);
  return `<svg class="ap-ring" viewBox="0 0 120 120" role="img" aria-label="Llevas ${Math.round(pct * 100)}% de la meta">
    <circle cx="60" cy="60" r="${R}" fill="none" stroke="${col}" stroke-opacity=".18" stroke-width="13"/>
    ${pctProy > pct ? `<circle class="ap-ring-proy" cx="60" cy="60" r="${R}" fill="none" stroke="${col}" stroke-opacity=".38" stroke-width="13" stroke-linecap="round" stroke-dasharray="${arco(pctProy)} ${C.toFixed(1)}" transform="rotate(-90 60 60)"/>` : ''}
    <circle class="ap-ring-val" cx="60" cy="60" r="${R}" fill="none" stroke="${col}" stroke-width="13" stroke-linecap="round" stroke-dasharray="${arco(pct)} ${C.toFixed(1)}" transform="rotate(-90 60 60)" style="--c:${C.toFixed(1)}"/>
    ${pctIdeal > 0 && pctIdeal < 1 ? `<circle cx="${mx.toFixed(1)}" cy="${my.toFixed(1)}" r="3.4" fill="var(--ap-bg)" stroke="var(--ap-label)" stroke-width="2"/>` : ''}
    <text x="60" y="58" text-anchor="middle" class="ap-ring-n">${Math.round(pct * 100)}%</text>
    <text x="60" y="76" text-anchor="middle" class="ap-ring-l">usado</text>
  </svg>`;
}
function apFila(href, ic, color, titulo, sub, extra){
  const tag = href ? 'a' : 'div';
  return `<${tag} class="ap-row"${href ? ` href="${href}"` : ''}><span class="ap-ic" style="--c:${color}">${svg(ic, 17, '#fff', 2.2)}</span><span class="ap-main"><span class="ap-t">${titulo}</span>${sub ? `<span class="ap-s">${sub}</span>` : ''}</span>${extra || ''}${href ? chev() : ''}</${tag}>`;
}
function paginaInicioApple(){
  const k = MES, prev = prevKey(k);
  const filas = filasMes(k), gasto = filas.filter(esGastoReal), total = suma(gasto);
  const totalPrev = totalGasto(prev);
  const prev3 = ventana(prev, 3).filter(m => m < k).map(totalGasto).filter(v => v > 0);
  const prom3 = prev3.length ? prev3.reduce((a, b) => a + b, 0) / prev3.length : null;
  const dias = diaLimite(k), dm = diasDelMes(k), actual = esMesActual(k), rest = actual ? dm - dias : 0;
  const cat1 = agrupar(gasto, r => r.cat1).map(g => ({ n: g.clave, v: g.total, color: colorDe(g.clave, 1) }));
  const meta = leerMeta();
  const AP = { ok:'#30D158', justo:'#FFD60A', alto:'#FF453A' };   // colores de sistema de iOS para el semáforo
  let html = '';

  /* tarjeta resumen: estado, total y anillo */
  if(meta){
    const ritmo = dias ? total / dias : 0, proy = actual ? ritmo * dm : total, restante = meta - total, porDia = rest > 0 ? restante / rest : 0;
    const estado = proy > meta ? 'alto' : (proy > meta * 0.9 ? 'justo' : 'ok');
    const etiqueta = estado === 'ok' ? 'En camino' : estado === 'justo' ? 'Vas justo' : (!actual ? 'Te pasaste' : (restante <= 0 ? 'Ya te pasaste' : 'Vas a pasarte'));
    const col = AP[estado], ic = estado === 'ok' ? 'check' : (estado === 'justo' ? 'clock' : 'up');
    const msg = !actual
      ? (total <= meta ? `Cerraste S/ ${fmtMonto(meta - total)} bajo tu meta.` : `Cerraste S/ ${fmtMonto(total - meta)} sobre tu meta.`)
      : (restante <= 0 ? `Pasaste tu meta por S/ ${fmtMonto(-restante)}.` : `A este ritmo cierras en S/ ${fmtMonto(proy)}${proy > meta ? `, S/ ${fmtMonto(proy - meta)} sobre tu meta` : ''}.`);
    const desv = categoriaDesviada(k, gasto, actual && dias ? dm / dias : 1);
    const ant = actual ? acumuladoHastaDia(prev, dias) : 0;
    const d = delta(total, totalPrev);
    html += `<section class="ap-card ap-hero anim" style="--st:${col}">
      <div class="ap-hero-top">
        <div class="ap-hero-txt">
          <span class="ap-state" style="color:${col}">${svg(ic, 15, col, 2.6)}${etiqueta}</span>
          <h2 class="sr">Gasto del mes</h2>
          <div class="ap-amount" id="heroNum">S/ ${fmtMonto(total)}</div>
          <span class="ap-of">de S/ ${fmtMonto(meta)}${actual ? ` · día ${dias} de ${dm}` : ''}</span>
        </div>
        ${anilloMeta(total / meta, proy / meta, actual ? dias / dm : 0, col)}
      </div>
      <p class="ap-msg">${msg}</p>
      ${actual && rest > 0 ? `<div class="ap-pace"><span><b>${restante > 0 ? 'Para no pasarte' : 'Para frenar'}</b><small>${restante > 0 ? `máximo por día, ${rest} día${rest === 1 ? '' : 's'} restantes` : `la mitad de tu ritmo, cierras en S/ ${fmtMonto(total + ritmo / 2 * rest)}`}</small></span><strong>S/ ${fmtMonto(restante > 0 ? porDia : ritmo / 2)}</strong></div>` : ''}
      <details class="ap-more">
        <summary><span class="ver">Ver detalle</span><span class="ocultar">Ocultar detalle</span><svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${SVG.down}</svg></summary>
        <div class="ap-more-body">
          <div class="ap-kv">
            ${actual ? `<div><span>Proyección</span><b style="color:${col}">S/ ${fmtMonto(proy)}</b></div><div><span>Ideal a hoy</span><b>S/ ${fmtMonto(meta * dias / dm)}</b></div>` : `<div><span>Diferencia</span><b style="color:${col}">${total > meta ? '+' : '−'}S/ ${fmtMonto(Math.abs(total - meta))}</b></div>`}
            ${d ? `<div><span>vs ${monthShort(prev)}</span><b>${d.sube ? '+' : '−'}${d.pct}%</b></div>` : ''}
            ${prom3 ? `<div><span>Promedio 3 meses</span><b>S/ ${fmtMonto(prom3)}</b></div>` : ''}
            ${dias ? `<div><span>Por día</span><b>S/ ${fmtMonto(total / (actual ? dias : dm))}</b></div>` : ''}
            ${ant > 0 ? `<div><span>Mismo día de ${monthShort(prev)}</span><b>S/ ${fmtMonto(ant)}</b></div>` : ''}
          </div>
          ${desv ? `<p class="ap-note"><b>${escapeHtml(desv.cat)}</b> ${actual ? 'proyecta' : 'cerró en'} S/ ${fmtMonto(desv.proy)}; su promedio es S/ ${fmtMonto(desv.prom)}.</p>` : ''}
          ${cat1.length ? `<div class="ap-split">${stackBar(cat1)}<div class="ap-split-l">${cat1.map(c => `<span><i style="background:${c.color}"></i>${escapeHtml(c.n)}<b>S/ ${fmtMonto(c.v)}</b></span>`).join('')}</div></div>` : ''}
        </div>
      </details>
      <button class="ap-btn" id="metaEdit">Gestionar presupuesto</button>
    </section>`;
  } else {
    html += `<section class="ap-card ap-hero anim">
      <h2 class="sr">Gasto del mes</h2>
      <div class="ap-amount" id="heroNum">S/ ${fmtMonto(total)}</div>
      <span class="ap-of">${actual ? `día ${dias} de ${dm}` : 'mes cerrado'}</span>
      <p class="ap-msg">Define cuánto quieres gastar al mes y te aviso cómo vas y cuánto puedes gastar por día.</p>
      <div class="ap-form"><input id="metaIn" type="number" inputmode="decimal" placeholder="Ej. 2500" aria-label="Meta mensual en soles"><button class="ap-btn solid" id="metaOk">Guardar</button></div>
      <button class="ap-link" id="metaEdit">o arma tu presupuesto por categoría</button>
    </section>`;
  }

  /* alertas como lista agrupada */
  const alertas = calcularAlertas(k);
  if(alertas.length){
    html += `<section class="ap-sec anim"><h2 class="ap-h">Para tener en cuenta</h2><div class="ap-group">${alertas.map(a => apFila(`${a.href}${a.href.includes('?') ? '&' : '?'}mes=${k}`, a.ic, a.color === TINTA.alto ? AP.alto : (a.color === TINTA.ok ? AP.ok : a.color), a.titulo, a.sub)).join('')}</div></section>`;
  }

  /* últimos movimientos estilo Wallet */
  const ult = filas.slice().sort((a, b) => b.fecha - a.fecha);
  html += `<section class="ap-sec anim"><div class="ap-h-row"><h2 class="ap-h">Últimos movimientos</h2>${ult.length > 5 ? `<button class="ap-link" id="verTodos">Ver todos</button>` : ''}</div>
    <div class="ap-group ap-tx">${ult.slice(0, 5).map(r => filaMov(r)).join('') || '<div class="empty">Sin movimientos este mes.</div>'}</div></section>`;

  /* accesos como filas de Ajustes */
  html += `<section class="ap-sec anim"><h2 class="ap-h">Más</h2><div class="ap-group">
    ${apFila(`presupuesto.html?mes=${k}`, 'target', '#0A84FF', 'Presupuesto', 'proyección y categorías')}
    ${apFila(`gastos.html?vista=dias&mes=${k}`, 'cal', '#FF9F0A', 'Tus días', 'calendario y horas')}
    ${apFila(`compromisos.html?mes=${k}`, 'repeat', '#BF5AF2', 'Compromisos', 'fijos y préstamos')}
    ${apFila(`historial.html?mes=${k}`, 'resumen', '#64D2FF', 'Historial', 'tendencia de 6 meses')}
  </div></section>`;

  html += `<p class="note">Los montos están en soles con el tipo de cambio del mes de cada movimiento. Inversiones y préstamos (rama Finanzas) y Terceros (la parte de un gasto compartido que te deben) no cuentan como gasto: es plata por cobrar o invertida.</p>`;
  $('#app').innerHTML = html;
  contar($('#heroNum'), total);
  enlazarMeta(k, total, gasto);
  const vt = $('#verTodos'); if(vt) vt.addEventListener('click', abrirListaMes);
}
