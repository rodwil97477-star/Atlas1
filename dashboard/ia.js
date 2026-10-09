/* ============================================================
   Finanzas · ia.js · Asesor IA de Inversiones (Gemini)
   Archivo NUEVO: no modifica ni reemplaza nada del dashboard. Se activa solo en la
   pestaña Inversiones y agrega una tarjeta con el botón "Analizar portafolio". Al tocarlo
   corre el mismo análisis que /detalle del bot y se despliega un chat para preguntar.
   Usa los colores, tipografías y componentes del dashboard (variables CSS, modo día/noche).
   Habla con el bot por la misma URL (API_URL) con accion 'consultarIA'. La clave se crea
   con /claveia en Telegram y se pega una sola vez en cada dispositivo.
   ============================================================ */
(function(){
  'use strict';
  if(!document.body || document.body.getAttribute('data-page') !== 'inversiones') return;
  if(typeof API_URL === 'undefined') return;

  var LS_CLAVE = 'finanzas_ia_clave', LS_CHAT = 'finanzas_ia_chat_v1';
  var TIMEOUT_MS = 110000, MAX_MSGS = 40;
  function sugerencias(){
    var meta = (typeof leerMetaInversion === 'function' && leerMetaInversion()) || 0;
    return ['¿Qué cambiarías primero?', '¿Qué riesgo no estoy viendo?', meta ? '¿Cómo reparto los ' + Math.round(meta) + ' USD de este mes?' : '¿Cómo reparto mi aporte de este mes?'];
  }
  var ERRORES = {
    sin_clave: 'El bot aún no tiene clave. Escribe /claveia en Telegram.',
    clave: 'Esa clave no es correcta. Escribe /claveia en Telegram para una nueva.',
    bloqueado: 'Demasiados intentos con clave incorrecta hoy. Prueba mañana o crea una clave nueva con /claveia.',
    limite: 'Llegaste al límite de consultas de hoy. Vuelve mañana.',
    ocupado: 'Hay otra consulta en curso. Espera un momento y vuelve a intentar.',
    sin_activos: 'Aún no hay activos registrados. Manda una foto de tu portafolio al bot.',
    gemini: 'Gemini no pudo responder ahora. Intenta de nuevo en unos minutos.',
    red: 'No se pudo conectar con el bot. Revisa tu conexión.',
    tiempo: 'Tardó demasiado en responder. Intenta de nuevo.'
  };

  /* ---------- estado ---------- */
  var st = { abierto:false, cargando:false, msgs:[], ts:0, activos:0, restantes:null, error:'', pideClave:false };
  function lsGet(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
  function lsSet(k, v){ try{ localStorage.setItem(k, v); }catch(e){} }
  function lsDel(k){ try{ localStorage.removeItem(k); }catch(e){} }
  (function restaurar(){
    try{
      var o = JSON.parse(lsGet(LS_CHAT) || 'null');
      if(o && Array.isArray(o.msgs) && o.msgs.length){ st.msgs = o.msgs.slice(-MAX_MSGS); st.ts = o.ts || 0; st.activos = o.activos || 0; }
    }catch(e){}
  })();
  function guardar(){ lsSet(LS_CHAT, JSON.stringify({ msgs: st.msgs.slice(-MAX_MSGS), ts: st.ts, activos: st.activos })); }

  /* ---------- estilos (solo clases .ia-*, con las variables del dashboard) ---------- */
  var css = [
    '.ia-card{ position:relative; overflow:hidden; }',
    '.ia-card::before{ content:""; position:absolute; inset:0 0 auto 0; height:120px; pointer-events:none; background:radial-gradient(110% 100% at 100% 0%, color-mix(in srgb, var(--accent) 15%, transparent), transparent 70%); }',
    '.ia-card > *{ position:relative; }',
    '.ia-top{ display:flex; align-items:center; gap:12px; }',
    '.ia-ic{ width:38px; height:38px; border-radius:50%; flex-shrink:0; display:grid; place-items:center; background:var(--accent-soft-2); color:var(--accent); }',
    '.ia-ic svg{ display:block; }',
    '.ia-top-t{ display:flex; flex-direction:column; gap:1px; min-width:0; }',
    '.ia-top-t .card-title{ line-height:1.2; }',
    '.ia-lead{ margin:0; font-size:15px; line-height:1.45; color:var(--label-2); text-wrap:pretty; }',
    '.ia-go{ align-self:stretch; justify-content:center; width:100%; }',
    '.ia-go svg{ flex-shrink:0; }',
    '.ia-key{ display:flex; flex-direction:column; gap:10px; }',
    '.ia-key .ap-form input, .ia-in{ letter-spacing:0; }',
    /* el panel del chat se despliega con la altura animada (0fr → 1fr) */
    '.ia-fold{ display:grid; grid-template-rows:0fr; transition:grid-template-rows .55s var(--ease-drawer); }',
    '.ia-fold.on{ grid-template-rows:1fr; }',
    '.ia-fold > div{ overflow:hidden; min-height:0; }',
    '.ia-chat{ display:flex; flex-direction:column; gap:12px; padding-top:2px; }',
    '.ia-meta{ display:flex; align-items:center; justify-content:space-between; gap:8px; font-size:12.5px; color:var(--label-3); letter-spacing:0; }',
    '.ia-log{ display:flex; flex-direction:column; gap:10px; max-height:min(62vh, 560px); overflow-y:auto; -webkit-overflow-scrolling:touch; overscroll-behavior:contain; padding:2px 0 4px; scroll-behavior:smooth; }',
    '.ia-m{ max-width:92%; padding:11px 14px; border-radius:18px; font-size:15px; line-height:1.5; letter-spacing:0; overflow-wrap:anywhere; text-wrap:pretty; animation:iaIn .42s var(--ease-out) both; }',
    '.ia-m p{ margin:0; } .ia-m p + p{ margin-top:8px; }',
    '.ia-m.ia-bot{ align-self:flex-start; background:var(--sunken); color:var(--label); border-bottom-left-radius:6px; }',
    '.ia-m.ia-yo{ align-self:flex-end; background:var(--accent-soft-2); color:var(--label); border-bottom-right-radius:6px; font-weight:500; }',
    '.ia-m.ia-big{ max-width:100%; }',
    '.ia-m.ia-err{ background:var(--alto-soft); color:var(--label); }',
    '.ia-tag{ display:inline-block; margin:0 1px; padding:0 6px; border-radius:999px; font-size:11px; font-weight:700; letter-spacing:.02em; vertical-align:1px; background:var(--fill); color:var(--label-2); }',
    '.ia-tag.t-hecho{ background:var(--ok-soft); color:var(--ok); }',
    '.ia-tag.t-expect{ background:var(--accent-soft); color:var(--accent); }',
    '.ia-tag.t-infer{ background:var(--justo-soft); color:var(--justo); }',
    '.ia-tag.t-rumor{ background:var(--alto-soft); color:var(--alto); }',
    '.ia-dots{ display:inline-flex; gap:5px; align-items:center; height:22px; }',
    '.ia-dots i{ width:7px; height:7px; border-radius:50%; background:var(--label-3); animation:iaDot 1.2s ease-in-out infinite; }',
    '.ia-dots i:nth-child(2){ animation-delay:.18s; } .ia-dots i:nth-child(3){ animation-delay:.36s; }',
    '.ia-wait{ display:block; margin-top:6px; font-size:12.5px; color:var(--label-3); }',
    '.ia-chips{ display:flex; flex-wrap:wrap; gap:8px; }',
    '.ia-chip{ border:0; border-radius:999px; min-height:36px; padding:0 14px; background:var(--accent-soft); color:var(--accent); font:500 14px var(--font-ui); letter-spacing:-0.01em; cursor:pointer; text-align:left; transition:transform .16s var(--ease-out), background-color .2s ease; }',
    '.ia-chip:active{ transform:scale(.97); }',
    '.ia-chip:disabled{ opacity:.45; cursor:default; }',
    '.ia-send{ display:flex; gap:8px; align-items:center; }',
    '.ia-in{ flex:1; min-width:0; min-height:46px; border-radius:23px; border:0; background:var(--sunken); color:var(--label); padding:0 16px; font:16px var(--font-ui); caret-color:var(--accent); }',
    '.ia-in::placeholder{ color:var(--label-3); }',
    '.ia-in:focus{ outline:2px solid var(--accent); outline-offset:0; }',
    '.ia-sb{ width:46px; height:46px; border-radius:50%; border:0; flex-shrink:0; display:grid; place-items:center; background:var(--accent); color:var(--accent-ink); cursor:pointer; transition:transform .16s var(--ease-out), opacity .2s ease; }',
    '.ia-sb:active{ transform:scale(.92); }',
    '.ia-sb:disabled{ opacity:.4; cursor:default; }',
    '.ia-foot{ display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:2px 12px; }',
    '.ia-link{ border:0; background:none; padding:8px 0; min-height:36px; color:var(--accent); font:400 14px var(--font-ui); cursor:pointer; }',
    '.ia-link.mute{ color:var(--label-3); }',
    '.ia-cap{ margin:0; font-size:12.5px; line-height:1.45; color:var(--label-3); letter-spacing:0; text-wrap:pretty; }',
    '.ia-msg-err{ margin:0; font-size:13.5px; font-weight:600; color:var(--alto); }',
    '@keyframes iaIn{ from{ opacity:0; transform:translateY(8px) scale(.985); } to{ opacity:1; transform:none; } }',
    '@keyframes iaDot{ 0%,80%,100%{ opacity:.25; transform:translateY(0); } 40%{ opacity:1; transform:translateY(-3px); } }',
    '@media (min-width:1150px){ .ia-card{ grid-column:1 / -1; } }',
    '@media (prefers-reduced-motion: reduce){ .ia-fold{ transition:none; } .ia-log{ scroll-behavior:auto; } }'
  ].join('\n');
  var estilo = document.createElement('style'); estilo.id = 'ia-css'; estilo.textContent = css; document.head.appendChild(estilo);

  /* ---------- utilidades de DOM (el texto del modelo nunca entra como HTML) ---------- */
  function el(tag, cls, txt){ var n = document.createElement(tag); if(cls) n.className = cls; if(txt != null) n.textContent = txt; return n; }
  var SVG_NS = 'http://www.w3.org/2000/svg';
  function icono(d, size, fill){
    var s = document.createElementNS(SVG_NS, 'svg');
    s.setAttribute('width', size); s.setAttribute('height', size); s.setAttribute('viewBox', '0 0 24 24');
    s.setAttribute('fill', fill ? 'currentColor' : 'none'); s.setAttribute('stroke', fill ? 'none' : 'currentColor');
    s.setAttribute('stroke-width', '2'); s.setAttribute('stroke-linecap', 'round'); s.setAttribute('stroke-linejoin', 'round'); s.setAttribute('aria-hidden', 'true');
    var p = document.createElementNS(SVG_NS, 'path'); p.setAttribute('d', d); s.appendChild(p); return s;
  }
  var D_CHISPA = 'M12 2.5l1.9 5.6a3 3 0 0 0 1.9 1.9l5.6 1.9-5.6 1.9a3 3 0 0 0-1.9 1.9L12 21.5l-1.9-5.8a3 3 0 0 0-1.9-1.9L2.5 11.9l5.7-1.9a3 3 0 0 0 1.9-1.9L12 2.5z';
  var D_ENVIAR = 'M12 19V5M5 12l7-7 7 7';
  var TAGS = { 'HECHO':'t-hecho', 'EXPECTATIVA':'t-expect', 'INFERENCIA':'t-infer', 'RUMOR':'t-rumor' };

  /* párrafos + etiquetas [HECHO] [EXPECTATIVA] [INFERENCIA] [RUMOR] como pastillas */
  function llenarTexto(cont, texto){
    String(texto).replace(/\r/g, '').split(/\n+/).forEach(function(linea){
      linea = linea.trim(); if(!linea) return;
      var p = document.createElement('p');
      linea.split(/(\[(?:HECHO|EXPECTATIVA|INFERENCIA|RUMOR)\])/).forEach(function(trozo){
        var m = /^\[(HECHO|EXPECTATIVA|INFERENCIA|RUMOR)\]$/.exec(trozo);
        if(m) p.appendChild(el('span', 'ia-tag ' + TAGS[m[1]], m[1].toLowerCase()));
        else if(trozo) p.appendChild(document.createTextNode(trozo));
      });
      cont.appendChild(p);
    });
  }

  function hace(ts){
    if(!ts) return '';
    var min = Math.max(0, Math.round((Date.now() - ts) / 60000));
    if(min < 1) return 'ahora';
    if(min < 60) return 'hace ' + min + ' min';
    var h = Math.round(min / 60); if(h < 24) return 'hace ' + h + ' h';
    var d = Math.round(h / 24); return 'hace ' + d + ' día' + (d === 1 ? '' : 's');
  }

  /* ---------- llamada al bot ---------- */
  function llamar(modo, mensajes){
    var ctl = ('AbortController' in window) ? new AbortController() : null;
    var t = setTimeout(function(){ if(ctl) ctl.abort(); }, TIMEOUT_MS);
    var body = { accion:'consultarIA', clave: lsGet(LS_CLAVE) || '', modo: modo };
    if(mensajes) body.mensajes = mensajes;
    // sin cabeceras: es una petición simple (igual que el guardado de presupuestos), sin preflight
    return fetch(API_URL, { method:'POST', body: JSON.stringify(body), signal: ctl ? ctl.signal : undefined })
      .then(function(r){ return r.json(); })
      .then(function(d){ clearTimeout(t); return d; })
      .catch(function(e){ clearTimeout(t); return { ok:false, error: (e && e.name === 'AbortError') ? 'tiempo' : 'red' }; });
  }

  function historialParaBot(){
    return st.msgs.filter(function(m){ return !m.err; }).slice(-10).map(function(m){ return { rol: m.rol === 'yo' ? 'user' : 'model', texto: m.texto }; });
  }

  function procesarRespuesta(d, alOk){
    st.cargando = false;
    if(d && d.ok){
      st.error = ''; st.pideClave = false;
      if(typeof d.restantes === 'number') st.restantes = d.restantes;
      if(d.activos) st.activos = d.activos;
      alOk(d);
    } else {
      var c = (d && d.error) || 'gemini';
      if(c === 'clave' || c === 'sin_clave'){ lsDel(LS_CLAVE); st.pideClave = true; }
      st.error = ERRORES[c] || ERRORES.gemini;
    }
    dibujar(true);
  }

  function analizar(){
    if(st.cargando) return;
    if(!lsGet(LS_CLAVE)){ st.pideClave = true; st.abierto = false; dibujar(); return; }
    st.cargando = true; st.error = ''; st.abierto = true;
    st.msgs = []; st.pendiente = 'analisis';
    dibujar(true);
    llamar('analisis').then(function(d){
      st.pendiente = null;
      procesarRespuesta(d, function(r){ st.msgs = [{ rol:'bot', texto:r.texto, big:true }]; st.ts = Date.now(); guardar(); });
    });
  }

  function preguntar(texto){
    texto = String(texto || '').trim().slice(0, 600);
    if(!texto || st.cargando) return;
    st.msgs.push({ rol:'yo', texto:texto });
    st.cargando = true; st.error = ''; st.pendiente = 'chat';
    guardar(); dibujar(true);
    llamar('chat', historialParaBot()).then(function(d){
      st.pendiente = null;
      procesarRespuesta(d, function(r){ st.msgs.push({ rol:'bot', texto:r.texto }); guardar(); });
    });
  }

  function borrar(){ st.msgs = []; st.ts = 0; st.error = ''; st.abierto = false; lsDel(LS_CHAT); dibujar(); }

  /* ---------- tarjeta ---------- */
  var raiz = el('section', 'card ia-card wide'); raiz.id = 'iaCard'; raiz.setAttribute('aria-label', 'Asesor IA del portafolio');
  var fold = null, log = null, input = null;

  function cabecera(){
    var top = el('div', 'ia-top');
    var ic = el('span', 'ia-ic'); ic.appendChild(icono(D_CHISPA, 20, true));
    var t = el('div', 'ia-top-t');
    t.appendChild(el('h2', 'card-title', 'Asesor IA'));
    t.appendChild(el('span', 'hint', 'Gemini · con búsqueda en la web'));
    top.appendChild(ic); top.appendChild(t);
    return top;
  }

  function formClave(){
    var f = el('div', 'ia-key');
    f.appendChild(el('p', 'ia-lead', 'Para usar la IA, escribe /claveia en tu bot de Telegram y pega aquí la clave que te manda. Se pide una sola vez en este dispositivo.'));
    var form = el('form', 'ap-form'); form.setAttribute('autocomplete', 'off');
    var inp = el('input'); inp.type = 'password'; inp.placeholder = 'Clave de la IA'; inp.setAttribute('aria-label', 'Clave de la IA');
    inp.autocapitalize = 'off'; inp.setAttribute('autocorrect', 'off'); inp.spellcheck = false; inp.name = 'ia-clave';
    var b = el('button', 'ap-btn solid', 'Guardar'); b.type = 'submit';
    form.appendChild(inp); form.appendChild(b);
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var v = inp.value.trim().toLowerCase(); if(!v) return;
      lsSet(LS_CLAVE, v); st.pideClave = false; st.error = '';
      analizar();
    });
    f.appendChild(form);
    if(st.error) f.appendChild(el('p', 'ia-msg-err', st.error));
    return f;
  }

  function burbuja(m){
    var b = el('div', 'ia-m ' + (m.rol === 'yo' ? 'ia-yo' : 'ia-bot') + (m.big ? ' ia-big' : ''));
    if(m.rol === 'yo') b.textContent = m.texto; else llenarTexto(b, m.texto);
    return b;
  }

  function burbujaEspera(){
    var b = el('div', 'ia-m ia-bot'); b.setAttribute('role', 'status');
    var d = el('span', 'ia-dots'); d.setAttribute('aria-hidden', 'true'); d.appendChild(el('i')); d.appendChild(el('i')); d.appendChild(el('i'));
    b.appendChild(d);
    b.appendChild(el('span', 'ia-wait', st.pendiente === 'analisis' ? 'Analizando tu portafolio con datos de la web… puede tardar hasta un minuto.' : 'Pensando…'));
    return b;
  }

  function panelChat(){
    var c = el('div', 'ia-chat');
    var meta = el('div', 'ia-meta');
    var info = st.ts ? ('Análisis ' + hace(st.ts) + (st.activos ? ' · ' + st.activos + ' activo' + (st.activos === 1 ? '' : 's') : '')) : '';
    meta.appendChild(el('span', null, info));
    c.appendChild(meta);

    log = el('div', 'ia-log'); log.setAttribute('role', 'log'); log.setAttribute('aria-live', 'polite');
    st.msgs.forEach(function(m){ log.appendChild(burbuja(m)); });
    if(st.cargando) log.appendChild(burbujaEspera());
    if(st.error && !st.pideClave){ var e = el('div', 'ia-m ia-bot ia-err'); e.appendChild(el('p', null, st.error)); log.appendChild(e); }
    c.appendChild(log);

    if(st.msgs.length === 1 && !st.cargando){
      var chips = el('div', 'ia-chips');
      sugerencias().forEach(function(s){
        var b = el('button', 'ia-chip', s); b.type = 'button';
        b.addEventListener('click', function(){ preguntar(s); });
        chips.appendChild(b);
      });
      c.appendChild(chips);
    }

    var form = el('form', 'ia-send'); form.setAttribute('autocomplete', 'off');
    input = el('input', 'ia-in'); input.type = 'text'; input.placeholder = 'Pregunta sobre tu portafolio…'; input.maxLength = 600;
    input.setAttribute('aria-label', 'Tu pregunta'); input.enterKeyHint = 'send'; input.disabled = st.cargando || !st.msgs.length;
    var sb = el('button', 'ia-sb'); sb.type = 'submit'; sb.setAttribute('aria-label', 'Enviar'); sb.disabled = st.cargando || !st.msgs.length;
    sb.appendChild(icono(D_ENVIAR, 20, false));
    form.appendChild(input); form.appendChild(sb);
    form.addEventListener('submit', function(e){ e.preventDefault(); var v = input.value; input.value = ''; preguntar(v); });
    c.appendChild(form);

    var foot = el('div', 'ia-foot');
    var izq = el('div');
    var bAct = el('button', 'ia-link', 'Actualizar análisis'); bAct.type = 'button'; bAct.disabled = st.cargando;
    bAct.addEventListener('click', analizar);
    var bBor = el('button', 'ia-link mute', 'Cerrar y borrar'); bBor.type = 'button';
    bBor.addEventListener('click', borrar);
    izq.appendChild(bAct); foot.appendChild(izq); foot.appendChild(bBor);
    c.appendChild(foot);

    var cap = 'Es una opinión generada por IA con información pública; no es asesoría financiera.';
    if(typeof st.restantes === 'number') cap += ' Te quedan ' + st.restantes + ' consultas hoy.';
    c.appendChild(el('p', 'ia-cap', cap));
    return c;
  }

  function dibujar(bajar){
    var yaAbierto = fold && fold.classList.contains('on');
    raiz.textContent = '';
    raiz.appendChild(cabecera());
    fold = null; log = null; input = null;

    if(st.pideClave){
      raiz.appendChild(formClave());
    } else {
      var hayChat = st.msgs.length > 0 || st.cargando || st.abierto;
      if(!hayChat || !st.abierto){
        raiz.appendChild(el('p', 'ia-lead', st.msgs.length
          ? 'Tienes un análisis ' + hace(st.ts) + '. Ábrelo para seguir la conversación o pide uno nuevo.'
          : 'Corre el mismo análisis de /detalle, con tesis, oportunidades y calendario, y después pregúntale lo que quieras sobre tu portafolio.'));
        var go = el('button', 'btn solid ia-go'); go.type = 'button';
        go.appendChild(icono(D_CHISPA, 18, true));
        go.appendChild(document.createTextNode(st.msgs.length ? 'Abrir conversación' : 'Analizar portafolio'));
        go.addEventListener('click', function(){ if(st.msgs.length){ st.abierto = true; dibujar(true); } else analizar(); });
        raiz.appendChild(go);
        if(st.msgs.length){
          var nuevo = el('button', 'ia-link', 'Hacer un análisis nuevo'); nuevo.type = 'button'; nuevo.addEventListener('click', analizar);
          raiz.appendChild(nuevo);
        }
        if(st.error){ raiz.appendChild(el('p', 'ia-msg-err', st.error)); }
      } else {
        fold = el('div', 'ia-fold' + (yaAbierto ? ' on' : ''));
        var inner = el('div'); inner.appendChild(panelChat()); fold.appendChild(inner);
        raiz.appendChild(fold);
        if(!yaAbierto) requestAnimationFrame(function(){ requestAnimationFrame(function(){ if(fold) fold.classList.add('on'); }); });
        if(bajar && log){
          requestAnimationFrame(function(){
            if(!log) return;
            var ult = log.lastElementChild;
            if(st.msgs.length === 1 && !st.cargando && ult) log.scrollTop = 0;
            else log.scrollTop = log.scrollHeight;
          });
        }
      }
    }
  }

  /* ---------- colocación: justo debajo de la primera tarjeta; si la página se vuelve a dibujar, se reinserta ---------- */
  function colocar(){
    var app = document.getElementById('app'); if(!app) return;
    if(!app.firstElementChild || app.querySelector('.state, .skel-wrap')) return;   // cargando o con error: no tocar
    if(raiz.parentNode === app) return;
    var primera = app.firstElementChild;
    if(primera.nextSibling) app.insertBefore(raiz, primera.nextSibling); else app.appendChild(raiz);
  }
  function arrancar(){
    var app = document.getElementById('app'); if(!app) return;
    dibujar();
    colocar();
    new MutationObserver(colocar).observe(app, { childList:true });
    // la leyenda "hace X min" se refresca al volver a la app
    document.addEventListener('visibilitychange', function(){ if(!document.hidden && !st.cargando && !st.pideClave) dibujar(); });
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar); else arrancar();
})();
