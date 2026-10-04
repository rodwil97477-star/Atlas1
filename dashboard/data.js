/* ============================================================
   Finanzas · v7 · datos y utilidades compartidas
   Sin dependencias externas: todo el dibujo es SVG/CSS propio.
   ============================================================ */

/* Endpoint del bot (Apps Script Web App). Devuelve {egresos:[...], prestamos:[...]}
   leidos EN VIVO del Google Sheets. La URL no cambia al redesplegar el Web App. */
const API_URL = "https://script.google.com/macros/s/AKfycbzc9z1Y0rLP4kfV-29biQ5MQkH1AxdAOF2IVz18nXpa3Zu4gymunMmCz-QyPlDkiFhFtw/exec";

/* ---------- carga con copia local (abre al instante, luego refresca) ---------- */
const CACHE_KEY = 'finanzas_cache_v7';

function leerCache(){
  try{ const c = JSON.parse(localStorage.getItem(CACHE_KEY)); return (c && c.data && c.data.egresos) ? c : null; }catch(e){ return null; }
}
function guardarCache(data){
  try{ localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data: data })); }catch(e){ /* sin espacio: seguimos sin copia */ }
}
/* v11: la firma cubre TODOS los movimientos (antes solo los 5 últimos: si cambiabas la categoría de un
   gasto más antiguo, la respuesta fresca se descartaba y el cambio recién se veía en la siguiente carga). */
function firmaDatos(data){
  const txt = JSON.stringify([(data && data.egresos) || [], (data && data.prestamos) || []]);
  let h = 5381;
  for(let i = 0; i < txt.length; i++) h = ((h << 5) + h + txt.charCodeAt(i)) | 0;
  return txt.length + ':' + h;
}
/**
 * Llama a alListo(data, info) hasta dos veces:
 *  1) al instante con la copia guardada (si existe)
 *  2) con los datos frescos del bot, solo si cambiaron
 * info = { origen:'cache'|'red', at:timestamp, cambio:boolean }
 */
/* Por defecto se piden el mes en curso y los 6 anteriores (el JSON no crece para
   siempre). "Ver meses anteriores" pide todo el historial solo en esta sesión. */
const MESES_VENTANA = 6;
function quiereHistorialCompleto(){ try{ return sessionStorage.getItem('finanzas_todo') === '1'; }catch(e){ return false; } }
function pedirHistorialCompleto(){ try{ sessionStorage.setItem('finanzas_todo', '1'); }catch(e){} }
/** true si la respuesta trae todo el historial (o viene de un bot sin el parámetro meses) */
function esHistorialCompleto(data){ return !data || !('meses' in data) || Number(data.meses) === 0; }
/* v11: el bot tarda varios segundos en responder. Si otra pestaña acaba de traer los datos (hace menos de
   CACHE_FRESCA_MS), se usan esos y no se vuelve a esperar al bot: cambiar de pestaña es instantáneo. */
const CACHE_FRESCA_MS = 45 * 1000;
let CARGANDO_RED = false, ULTIMA_RED = 0;
async function obtenerDatos(alListo, alFallar, soloRed){
  const cache = soloRed ? null : leerCache();
  if(cache && Date.now() - cache.at < CACHE_FRESCA_MS){
    ULTIMA_RED = cache.at;
    // desdeCache: los movimientos son recientes, pero su presupuesto puede ser más viejo que el que
    // guardaste después en esta pestaña; ese no se aplica (v13)
    alListo(cache.data, { origen:'red', at: cache.at, cambio:true, desdeCache:true });
    return;
  }
  if(cache) alListo(cache.data, { origen:'cache', at: cache.at, cambio:true });
  CARGANDO_RED = true;
  try{
    const r = await fetch(API_URL + '?meses=' + (quiereHistorialCompleto() ? 0 : MESES_VENTANA), { cache:'no-store' });
    if(!r.ok) throw new Error('El bot respondió ' + r.status + '. Revisa que el Web App esté desplegado con acceso "Cualquier persona".');
    const data = await r.json();
    if(data && data.error) throw new Error('El bot devolvió un error: ' + data.error);
    if(!data || !data.egresos) throw new Error('El bot no devolvió la hoja de Egresos.');
    const cambio = !cache || firmaDatos(cache.data) !== firmaDatos(data);
    guardarCache(data);
    ULTIMA_RED = Date.now();
    CARGANDO_RED = false;
    alListo(data, { origen:'red', at: Date.now(), cambio: cambio });
  }catch(err){
    CARGANDO_RED = false;
    alFallar(err, !!cache || (typeof INFO !== 'undefined' && !!INFO));
  }
}

/* ---------- parsing ---------- */
const MESES_LARGOS = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const MESES_CORTOS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
const MESES_LARGOS_MAP = {enero:0,febrero:1,marzo:2,abril:3,mayo:4,junio:5,julio:6,agosto:7,septiembre:8,setiembre:8,octubre:9,noviembre:10,diciembre:11};

function parseNumeroEs(s){
  if(s===undefined||s===null||s==='') return 0;
  if(typeof s === 'number') return s;
  return parseFloat(String(s).replace(/\./g,'').replace(',', '.')) || parseFloat(s) || 0;
}
function parseFechaFlexible(str){
  if(!str) return null;
  str = String(str).trim();
  let m = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if(m) return new Date(+m[3], +m[1]-1, +m[2], +m[4], +m[5], +(m[6]||0));
  m = str.match(/^(\d{1,2}) de ([a-zñáéíóú]+) de (\d{4})\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if(m){
    const mes = MESES_LARGOS_MAP[m[2].toLowerCase()];
    let h = +m[4]; const ampm = m[6].toUpperCase();
    if(ampm==='PM' && h!==12) h+=12;
    if(ampm==='AM' && h===12) h=0;
    return new Date(+m[3], mes, +m[1], h, +m[5]);
  }
  const fb = new Date(str);
  return isNaN(fb) ? null : fb;
}
/* Prefiere el campo ISO que manda el bot (sin ambigüedad día/mes) */
function fechaDeFila(r, campo){
  const iso = r[campo + '__iso'];
  if(iso){
    const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})$/);
    if(m) return new Date(+m[1], +m[2]-1, +m[3], +m[4], +m[5], +m[6]);
  }
  return parseFechaFlexible(r[campo]);
}
/** "luis perales" / "LUIS PERALES" → "Luis Perales" (nombres de personas escritos a mano en Telegram). */
function nombrePropio(s){
  return String(s || '').trim().replace(/\s+/g, ' ').toLowerCase().replace(/(^|[\s-])(\S)/g, (m, a, c) => a + c.toUpperCase());
}
function parseEgresos(data){
  const filas = (data && data.egresos) || [];
  return filas.map(r => {
    const fecha = fechaDeFila(r, 'Fecha');
    return {
      fecha,
      monto: parseNumeroEs(r['Monto']),
      montoSoles: parseNumeroEs(r['Monto Soles']),
      comercio: String(r['Comercio']||'').trim(),
      cat1: String(r['Categoría']||'').trim(),
      cat2: String(r['Categoría']||'').trim() === 'Terceros' ? nombrePropio(r['Subcategoría']) : String(r['Subcategoría']||'').trim(),   // v13: "luis perales" = "Luis Perales"
      cat3: String(r['Sub-subcategoría']||'').trim().replace(/\.$/,'').split('>').map(x => x.trim()).filter(Boolean).join(' · '),   // v13: "Amigos > Comidas" se ve "Amigos · Comidas"
      moneda: String(r['Moneda']||'').trim(),
      estado: String(r['Estado']||'').trim(),
      medio: String(r['Medio de pago']||'').trim(),
      id: String(r['COL_ID'] || r['ID'] || '').trim(),   // v12: para unir cada préstamo con su gasto de origen
      tipo: String(r['Descripción']||'').trim()      // "Crédito" / "Débito" cuando viene de la tarjeta
    };
  }).filter(r => r.fecha && r.estado === 'Categorizado' && r.cat1 !== 'Prueba' && r.cat1 !== 'Movimiento propio');
}
function parsePrestamos(data){
  const filas = (data && data.prestamos) || [];
  if(!filas.length) return null;
  const cols = Object.keys(filas[0] || {});
  if(!cols.includes('Persona') || !cols.includes('MontoOriginal')) return null;
  const lista = filas.map(r => ({
    fecha: fechaDeFila(r, 'Fecha'),
    persona: nombrePropio(r['Persona']),
    original: parseNumeroEs(r['MontoOriginal']),
    pagado: parseNumeroEs(r['MontoPagado']),
    moneda: String(r['Moneda']||'PEN').trim(),
    estado: String(r['Estado']||'').trim(),
    egresosId: String(r['EgresosID']||'').trim()     // v12: gasto de Egresos que originó el préstamo
  })).filter(p => p.persona && p.original > 0);
  return lista.length ? lista : null;
}
/** Deduce préstamos desde Egresos cuando la hoja no está disponible (uno por gasto; se agrupan por persona al dibujar) */
function prestamosDesdeEgresos(filas){
  return filas.filter(r => (r.cat1 === 'Finanzas' && r.cat2 === 'Préstamos') || r.cat1 === 'Terceros').map(r => ({
    // en "Finanzas > Préstamos" la persona va en cat3; en un gasto compartido ("Terceros") va en cat2
    persona: (r.cat1 === 'Terceros' ? r.cat2 : r.cat3) || '(sin nombre)',
    original: r.montoSoles, pagado: 0, moneda: 'PEN', estado: 'Pendiente', fecha: r.fecha, egresosId: r.id
  }));
}
function prestamosPendientes(lista){
  return (lista||[]).filter(p => p.estado !== 'Pagado' && (p.original - p.pagado) > 0.01)
    .sort((a,b) => (b.original - b.pagado) - (a.original - a.pagado));
}

/** Gasto real = excluye inversiones y préstamos (rama Finanzas) */
/* Finanzas (inversiones y préstamos) y Terceros (la parte de un gasto compartido que te deben) no son gasto tuyo */
function esGastoReal(r){ return r.cat1 !== 'Finanzas' && r.cat1 !== 'Terceros'; }

/* ---------- formato ---------- */
function monthKey(d){ return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0'); }
function monthLabel(key){ const [y,m] = key.split('-').map(Number); return MESES_LARGOS[m-1] + ' ' + y; }
function monthShort(key){ const m = +key.split('-')[1]; return MESES_CORTOS[m-1]; }
function monthShortYear(key){ const [y,m] = key.split('-').map(Number); return MESES_CORTOS[m-1] + ' ' + y; }
function diasDelMes(key){ const [y,m] = key.split('-').map(Number); return new Date(y, m, 0).getDate(); }
function fmtMonto(n){ return Number(n||0).toLocaleString('en-US', {minimumFractionDigits:0, maximumFractionDigits:0}); }
function fmt1(n){ return Number(n||0).toLocaleString('en-US', {minimumFractionDigits:1, maximumFractionDigits:1}); }
/* Etiquetas de gráficos: son totales, así que sin decimales. Antes "4.8k" (con decimal); desde la regla de
   decimales van enteros ("4,832"), y solo desde 100 mil se abrevia sin decimal ("125k"). */
function fmtCorto(n){ return n >= 100000 ? Math.round(n/1000) + 'k' : fmtMonto(n); }
function fmtPct(part, whole){
  if(!whole) return '0%';
  const v = part/whole*100;
  if(v === 0) return '0%';
  return (v < 10 ? v.toFixed(1).replace(/\.0$/, '') : v.toFixed(0)) + '%';
}
function horaCorta(d){
  let h = d.getHours(); const ap = h>=12 ? 'p.m.' : 'a.m.'; h = h%12 || 12;
  return h + ':' + String(d.getMinutes()).padStart(2,'0') + ' ' + ap;
}
function tieneHora(d){ return !(d.getHours()===0 && d.getMinutes()===0 && d.getSeconds()===0); }
function fechaRelativa(d){
  const hoy = new Date(); const ay = new Date(); ay.setDate(hoy.getDate()-1);
  const mismo = (a,b) => a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
  let dia;
  if(mismo(d,hoy)) dia = 'Hoy';
  else if(mismo(d,ay)) dia = 'Ayer';
  else dia = NOMBRE_DIA_CORTO[d.getDay()] + ' ' + d.getDate() + ' ' + MESES_CORTOS[d.getMonth()].toLowerCase();
  return tieneHora(d) ? dia + ', ' + horaCorta(d) : dia;
}
function simbolo(r){ return r.moneda === 'USD' ? '$' : 'S/'; }
/* Todo se muestra en soles: los consumos en dólares usan "Monto Soles" (tipo de cambio del mes que guarda el bot) */
/* REGLA DE DECIMALES (Rodrigo, 2026-09-28), igual que en el bot:
   · un gasto/monto puntual (un movimiento, un cobro fijo, un préstamo, un ticket): SIEMPRE 1 decimal → fmtSol / montoTxt
   · un total (del mes, del día, de una categoría o subcategoría, meta, presupuesto, proyección, promedio por día): SIN decimales → fmtMonto */
function fmtSol(v){ return fmt1(v); }
function montoTxt(r){ return 'S/ ' + fmtSol(r.montoSoles); }
function delta(actual, anterior){
  if(anterior === null || anterior === undefined || anterior === 0) return null;
  const d = ((actual - anterior)/anterior)*100;
  return { pct: Math.round(Math.abs(d)), sube: d >= 0 };
}
function escapeHtml(t){
  return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
/** Traduce errores crudos del navegador (siempre en inglés) para no mezclar idiomas en la UI */
function mensajeError(err){
  const m = String((err && err.message) || err || '').trim();
  if(/Failed to fetch|NetworkError|Load failed|ERR_INTERNET_DISCONNECTED|ERR_NAME_NOT_RESOLVED|ERR_CONNECTION/i.test(m)) return 'No hay conexión a internet o el servidor no respondió.';
  if(/aborted/i.test(m)) return 'La solicitud tardó demasiado y se canceló.';
  if(/unexpected token|invalid json/i.test(m)) return 'El servidor devolvió una respuesta inválida.';
  return m || 'Ocurrió un error inesperado.';
}
function norm(t){ return String(t||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/\.$/,'').trim(); }

/* ---------- colores por concepto ---------- */
/* v14.1: paleta de categorías para fondo oscuro, validada con distancia de color OKLab (también
   simulando daltonismo): categorías hermanas se distinguen entre sí (Personal azul vs Social naranja)
   y cada color se asocia a lo que representa. Contraste mínimo 4.5:1 sobre las tarjetas. */
const COLOR_N1 = { 'personal':'#5EA2FF', 'social':'#FF9440', 'finanzas':'#2FD3C2', 'ingresos':'#9BE7D8', 'terceros':'#E7C9FF' };
const COLOR_N2 = {
  'fijo':'#5EA2FF', 'variable':'#FF8F5A', 'salud y bienestar':'#34D6B0', 'auto y movilidad':'#8E9AB8',
  'pareja':'#FF8ADF', 'amigos':'#FFB23E', 'trabajo':'#7C7CFF', 'inversiones y ahorro':'#9BE7FF', 'prestamos':'#C9A6FF'
};
const COLOR_N3 = {
  'vivienda':'#6F8BFF','servicios':'#FF9E3D','suscripciones':'#F7A6F0','seguros':'#2EC7B4','educacion':'#B9DDFF',
  'comida diaria':'#FF8F4F','ropa':'#E86FCB','cuidado personal':'#3DD6C3','mascotas':'#E3C08F','tecnologia':'#8994AE','ocio y hobbies':'#B595FF',
  'consultas medicas':'#8C8CFF','medicinas':'#39D3B5','deporte':'#FF9E4F',
  'combustible':'#FFA23E','cochera':'#8E98B0','mantenimiento y estetica':'#5FE3D2','peajes':'#F7E0B5','transporte publico':'#5E8FFF',
  'comida casual':'#FF9A52','comida especial':'#FF8ADF','regalos':'#B08CFF','escapadas':'#2EC7B4','detalles':'#FFD6BA',
  'comidas':'#FF9A52','diversion salidas':'#B08CFF','viajes paseos':'#3DD6C3',
  'almuerzos oficina':'#FFAA4C','transporte':'#5C8FFF','eventos':'#FFA3E8',
  'compra acciones etfs':'#2FD3C2','fondo de emergencia':'#7F9CFF'
};
/* v15: el celeste es el color de la interfaz (selección, acciones, gráficos). Verde, amarillo y rojo
   son solo semáforo: dicen cómo vas, nunca decoran. */
/* v18: el semáforo usa los colores de sistema de iOS (verde, amarillo, rojo, naranja).
   v20: modo día. Cada tema tiene su juego de tintas; en el claro van versiones más profundas
   para que el texto de color se lea sobre blanco (todas ≥4.5:1, salvo neutro que no es texto). */
const TINTAS = {
  oscuro: { accent:'#5AC8FA', ok:'#30D158', justo:'#FFD60A', alto:'#FF453A', warn:'#FF9F0A', info:'#5AC8FA', neutro:'#6B6E7A' },
  claro:  { accent:'#0B6FAE', ok:'#1A7F37', justo:'#9A6700', alto:'#D70015', warn:'#C2410C', info:'#0B6FAE', neutro:'#8E8E93' }
};
const TINTA = Object.assign({}, TINTAS[document.documentElement.dataset.tema === 'claro' ? 'claro' : 'oscuro']);
const TEMA_KEY = 'finanzas_tema';
function temaPreferido(){ try{ return localStorage.getItem(TEMA_KEY) || 'auto'; }catch(e){ return 'auto'; } }
function temaResuelto(pref){ pref = pref || temaPreferido(); return pref === 'auto' ? (matchMedia('(prefers-color-scheme: light)').matches ? 'claro' : 'oscuro') : pref; }
/** Aplica el tema: atributo en <html>, tintas para el JS, color de la barra del sistema. */
function aplicarTema(){
  const t = temaResuelto();
  document.documentElement.dataset.tema = t;
  document.documentElement.dataset.temaPref = temaPreferido();
  Object.assign(TINTA, TINTAS[t]);
  _colorTema = {};
  const m = document.querySelector('meta[name="theme-color"]'); if(m) m.setAttribute('content', t === 'claro' ? '#F2F2F7' : '#050506');
  return t;
}
/** En modo día, un color de categoría demasiado claro se oscurece hasta leerse sobre blanco (≥3:1, el mínimo para gráficos e íconos). */
let _colorTema = {};
function paraTema(hex){
  if(document.documentElement.dataset.tema !== 'claro' || !hex || hex[0] !== '#' || hex.length !== 7) return hex;
  if(_colorTema[hex]) return _colorTema[hex];
  const lin = c => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  const lum = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  let r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16), k = 0;
  while(1.05 / (lum(r, g, b) + 0.05) < 3 && k++ < 40){ r *= 0.94; g *= 0.94; b *= 0.94; }
  const h = '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase();
  return (_colorTema[hex] = h);
}
const PALETA_RESERVA = ['#5EA2FF','#FF9440','#2FD3C2','#FF8ADF','#C9A6FF','#E3C08F','#7C7CFF','#9BE7D8','#FF7D45','#8E9AB8','#F7A6F0','#B9DDFF'];
function _hash(t, n){ let h = 0; for(let i=0;i<t.length;i++) h = (h*31 + t.charCodeAt(i)) >>> 0; return h % n; }
function colorDe(nombre, nivel){
  const k = norm(nombre);
  if(nivel === 1 && COLOR_N1[k]) return paraTema(COLOR_N1[k]);
  if(nivel === 2 && COLOR_N2[k]) return paraTema(COLOR_N2[k]);
  if(nivel === 3 && COLOR_N3[k]) return paraTema(COLOR_N3[k]);
  return paraTema(COLOR_N2[k] || COLOR_N3[k] || COLOR_N1[k] || PALETA_RESERVA[_hash(k, PALETA_RESERVA.length)]);
}
function alpha(hex, a){
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${a})`;
}

/* ---------- íconos por categoría (v15: Tabler Icons, MIT, https://tabler.io/icons; trazo 24x24) ---------- */
const ICONOS = {
"personal": "M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2",
"social": "M10 13a2 2 0 1 0 4 0a2 2 0 0 0 -4 0M8 21v-1a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2v1M15 5a2 2 0 1 0 4 0a2 2 0 0 0 -4 0M17 10h2a2 2 0 0 1 2 2v1M5 5a2 2 0 1 0 4 0a2 2 0 0 0 -4 0M3 13v-1a2 2 0 0 1 2 -2h2",
"finanzas": "M3 21l18 0M3 10l18 0M5 6l7 -3l7 3M4 10l0 11M20 10l0 11M8 14l0 3M12 14l0 3M16 14l0 3",
"ingresos": "M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0M3 8a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2l0 -8M18 12h.01M6 12h.01",
"fijo": "M12.5 21h-6.5a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v3M16 3v4M8 3v4M4 11h12M20 14l2 2h-3M20 18l2 -2M19 16a3 3 0 1 0 2 5.236",
"variable": "M6.331 8h11.339a2 2 0 0 1 1.977 2.304l-1.255 8.152a3 3 0 0 1 -2.966 2.544h-6.852a3 3 0 0 1 -2.965 -2.544l-1.255 -8.152a2 2 0 0 1 1.977 -2.304M9 11v-5a3 3 0 0 1 6 0v5",
"salud y bienestar": "M3 5a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1l0 -10M7 20h10M9 16v4M15 16v4M7 10h2l2 3l2 -6l1 3h3",
"auto y movilidad": "M5 17a2 2 0 1 0 4 0a2 2 0 1 0 -4 0M15 17a2 2 0 1 0 4 0a2 2 0 1 0 -4 0M5 17h-2v-6l2 -5h9l4 5h1a2 2 0 0 1 2 2v4h-2m-4 0h-6m-6 -6h15m-6 0v-5",
"pareja": "M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572",
"amigos": "M5 5a2 2 0 1 0 4 0a2 2 0 1 0 -4 0M5 22v-5l-1 -1v-4a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4l-1 1v5M15 5a2 2 0 1 0 4 0a2 2 0 1 0 -4 0M15 22v-4h-2l2 -6a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1l2 6h-2v4",
"trabajo": "M3 9a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2l0 -9M8 7v-2a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2v2M12 12l0 .01M3 13a20 20 0 0 0 18 0",
"inversiones y ahorro": "M15 11v.01M5.173 8.378a3 3 0 1 1 4.656 -1.377M16 4v3.803a6.019 6.019 0 0 1 2.658 3.197h1.341a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-1.342c-.336 .95 -.907 1.8 -1.658 2.473v2.027a1.5 1.5 0 0 1 -3 0v-.583a6.04 6.04 0 0 1 -1 .083h-4a6.04 6.04 0 0 1 -1 -.083v.583a1.5 1.5 0 0 1 -3 0v-2l0 -.027a6 6 0 0 1 4 -10.473h2.5l4.5 -3",
"prestamos": "M7 10h14l-4 -4M17 14h-14l4 4",
"terceros": "M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0M6 21v-2a4 4 0 0 1 4 -4h3M16 22l5 -5M21 21.5v-4.5h-4.5",
"vivienda": "M5 12l-2 0l9 -9l9 9l-2 0M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6",
"servicios": "M3 12h1m8 -9v1m8 8h1m-15.4 -6.4l.7 .7m12.1 -.7l-.7 .7M9 16a5 5 0 1 1 6 0a3.5 3.5 0 0 0 -1 3a2 2 0 0 1 -4 0a3.5 3.5 0 0 0 -1 -3M9.7 17l4.6 0",
"suscripciones": "M4 12v-3a3 3 0 0 1 3 -3h13m-3 -3l3 3l-3 3M20 12v3a3 3 0 0 1 -3 3h-13m3 3l-3 -3l3 -3",
"seguros": "M11.46 20.846a12 12 0 0 1 -7.96 -14.846a12 12 0 0 0 8.5 -3a12 12 0 0 0 8.5 3a12 12 0 0 1 -.09 7.06M15 19l2 2l4 -4",
"educacion": "M22 9l-10 -4l-10 4l10 4l10 -4v6M6 10.6v5.4a6 3 0 0 0 12 0v-5.4",
"comida diaria": "M10 14a2 2 0 1 0 4 0a2 2 0 0 0 -4 0M5.001 8h13.999a2 2 0 0 1 1.977 2.304l-1.255 7.152a3 3 0 0 1 -2.966 2.544h-9.512a3 3 0 0 1 -2.965 -2.544l-1.255 -7.152a2 2 0 0 1 1.977 -2.304M17 10l-2 -6M7 10l2 -6",
"ropa": "M15 4l6 2v5h-3v8a1 1 0 0 1 -1 1h-10a1 1 0 0 1 -1 -1v-8h-3v-5l6 -2a3 3 0 0 0 6 0",
"cuidado personal": "M10 6v3M14 6v3M5 11a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2l0 -8M10 15a2 2 0 1 0 4 0a2 2 0 1 0 -4 0M9 3h6v3h-6l0 -3",
"mascotas": "M14.7 13.5c-1.1 -2 -1.441 -2.5 -2.7 -2.5c-1.259 0 -1.736 .755 -2.836 2.747c-.942 1.703 -2.846 1.845 -3.321 3.291c-.097 .265 -.145 .677 -.143 .962c0 1.176 .787 2 1.8 2c1.259 0 3 -1 4.5 -1s3.241 1 4.5 1c1.013 0 1.8 -.823 1.8 -2c0 -.285 -.049 -.697 -.146 -.962c-.475 -1.451 -2.512 -1.835 -3.454 -3.538M20.188 8.082a1.039 1.039 0 0 0 -.406 -.082h-.015c-.735 .012 -1.56 .75 -1.993 1.866c-.519 1.335 -.28 2.7 .538 3.052c.129 .055 .267 .082 .406 .082c.739 0 1.575 -.742 2.011 -1.866c.516 -1.335 .273 -2.7 -.54 -3.052l-.001 0M9.474 9c.055 0 .109 0 .163 -.011c.944 -.128 1.533 -1.346 1.32 -2.722c-.203 -1.297 -1.047 -2.267 -1.932 -2.267c-.055 0 -.109 0 -.163 .011c-.944 .128 -1.533 1.346 -1.32 2.722c.204 1.293 1.048 2.267 1.933 2.267M16.456 6.733c.214 -1.376 -.375 -2.594 -1.32 -2.722a1.164 1.164 0 0 0 -.162 -.011c-.885 0 -1.728 .97 -1.93 2.267c-.214 1.376 .375 2.594 1.32 2.722c.054 .007 .108 .011 .162 .011c.885 0 1.73 -.974 1.93 -2.267M5.69 12.918c.816 -.352 1.054 -1.719 .536 -3.052c-.436 -1.124 -1.271 -1.866 -2.009 -1.866c-.14 0 -.277 .027 -.407 .082c-.816 .352 -1.054 1.719 -.536 3.052c.436 1.124 1.271 1.866 2.009 1.866c.14 0 .277 -.027 .407 -.082",
"tecnologia": "M3 19l18 0M5 7a1 1 0 0 1 1 -1h12a1 1 0 0 1 1 1v8a1 1 0 0 1 -1 1h-12a1 1 0 0 1 -1 -1l0 -8",
"ocio y hobbies": "M12 5h3.5a5 5 0 0 1 0 10h-5.5l-4.015 4.227a2.3 2.3 0 0 1 -3.923 -2.035l1.634 -8.173a5 5 0 0 1 4.904 -4.019h3.4M14 15l4.07 4.284a2.3 2.3 0 0 0 3.925 -2.023l-1.6 -8.232M8 9v2M7 10h2M14 10h2",
"consultas medicas": "M6 4h-1a2 2 0 0 0 -2 2v3.5a5.5 5.5 0 0 0 11 0v-3.5a2 2 0 0 0 -2 -2h-1M8 15a6 6 0 1 0 12 0v-3M11 3v2M6 3v2M18 10a2 2 0 1 0 4 0a2 2 0 1 0 -4 0",
"medicinas": "M4.5 12.5l8 -8a4.94 4.94 0 0 1 7 7l-8 8a4.94 4.94 0 0 1 -7 -7M8.5 8.5l7 7",
"deporte": "M2 12h1M6 8h-2a1 1 0 0 0 -1 1v6a1 1 0 0 0 1 1h2M6 7v10a1 1 0 0 0 1 1h1a1 1 0 0 0 1 -1v-10a1 1 0 0 0 -1 -1h-1a1 1 0 0 0 -1 1M9 12h6M15 7v10a1 1 0 0 0 1 1h1a1 1 0 0 0 1 -1v-10a1 1 0 0 0 -1 -1h-1a1 1 0 0 0 -1 1M18 8h2a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-2M22 12h-1",
"combustible": "M14 11h1a2 2 0 0 1 2 2v3a1.5 1.5 0 0 0 3 0v-7l-3 -3M4 20v-14a2 2 0 0 1 2 -2h6a2 2 0 0 1 2 2v14M3 20l12 0M18 7v1a1 1 0 0 0 1 1h1M4 11l10 0",
"cochera": "M3 5a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-14M10 16v-8h2.667c.736 0 1.333 .895 1.333 2s-.597 2 -1.333 2h-2.667",
"mantenimiento y estetica": "M7 10h3v-3l-3.5 -3.5a6 6 0 0 1 8 8l6 6a2 2 0 0 1 -3 3l-6 -6a6 6 0 0 1 -8 -8l3.5 3.5",
"peajes": "M4 19l4 -14M16 5l4 14M12 8v-2M12 13v-2M12 18v-2",
"transporte publico": "M4 17a2 2 0 1 0 4 0a2 2 0 1 0 -4 0M16 17a2 2 0 1 0 4 0a2 2 0 1 0 -4 0M4 17h-2v-11a1 1 0 0 1 1 -1h14a5 7 0 0 1 5 7v5h-2m-4 0h-8M16 5l1.5 7l4.5 0M2 10l15 0M7 5l0 5M12 5l0 5",
"comida casual": "M12 21.5c-3.04 0 -5.952 -.714 -8.5 -1.983l8.5 -16.517l8.5 16.517a19.09 19.09 0 0 1 -8.5 1.983M5.38 15.866a14.94 14.94 0 0 0 6.815 1.634a14.944 14.944 0 0 0 6.502 -1.479M13 11.01v-.01M11 14v-.01",
"comida especial": "M12 3c1.918 0 3.52 1.35 3.91 3.151a4 4 0 0 1 2.09 7.723l0 7.126h-12v-7.126a4 4 0 1 1 2.092 -7.723a4 4 0 0 1 3.908 -3.151M6.161 17.009l11.839 -.009",
"regalos": "M3 9a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1l0 -2M12 8l0 13M19 12v7a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-7M7.5 8a2.5 2.5 0 0 1 0 -5a4.8 8 0 0 1 4.5 5a4.8 8 0 0 1 4.5 -5a2.5 2.5 0 0 1 0 5",
"escapadas": "M6 8a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2l0 -10M9 6v-1a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v1M6 10h12M6 16h12M9 20v1M15 20v1",
"detalles": "M9 12a3 3 0 1 0 6 0a3 3 0 1 0 -6 0M12 2a3 3 0 0 1 3 3c0 .562 -.259 1.442 -.776 2.64l-.724 1.36l1.76 -1.893c.499 -.6 .922 -1 1.27 -1.205a2.968 2.968 0 0 1 4.07 1.099a3.011 3.011 0 0 1 -1.09 4.098c-.374 .217 -.99 .396 -1.846 .535l-2.664 .366l2.4 .326c1 .145 1.698 .337 2.11 .576a3.011 3.011 0 0 1 1.09 4.098a2.968 2.968 0 0 1 -4.07 1.098c-.348 -.202 -.771 -.604 -1.27 -1.205l-1.76 -1.893l.724 1.36c.516 1.199 .776 2.079 .776 2.64a3 3 0 0 1 -6 0c0 -.562 .259 -1.442 .776 -2.64l.724 -1.36l-1.76 1.893c-.499 .601 -.922 1 -1.27 1.205a2.968 2.968 0 0 1 -4.07 -1.098a3.011 3.011 0 0 1 1.09 -4.098c.374 -.218 .99 -.396 1.846 -.536l2.664 -.366l-2.4 -.325c-1 -.145 -1.698 -.337 -2.11 -.576a3.011 3.011 0 0 1 -1.09 -4.099a2.968 2.968 0 0 1 4.07 -1.099c.348 .203 .771 .604 1.27 1.205l1.76 1.894c-1 -2.292 -1.5 -3.625 -1.5 -4a3 3 0 0 1 3 -3",
"comidas": "M4 15h16a4 4 0 0 1 -4 4h-8a4 4 0 0 1 -4 -4M12 4c3.783 0 6.953 2.133 7.786 5h-15.572c.833 -2.867 4.003 -5 7.786 -5M5 12h14",
"diversion salidas": "M3 17a3 3 0 1 0 6 0a3 3 0 0 0 -6 0M13 17a3 3 0 1 0 6 0a3 3 0 0 0 -6 0M9 17v-13h10v13M9 8h10",
"viajes paseos": "M16 10h4a2 2 0 0 1 0 4h-4l-4 7h-3l2 -7h-4l-2 2h-3l2 -4l-2 -4h3l2 2h4l-2 -7h3l4 7",
"almuerzos oficina": "M4 11h16a1 1 0 0 1 1 1v.5c0 1.5 -2.517 5.573 -4 6.5v1a1 1 0 0 1 -1 1h-8a1 1 0 0 1 -1 -1v-1c-1.687 -1.054 -4 -5 -4 -6.5v-.5a1 1 0 0 1 1 -1M12 4a2.4 2.4 0 0 0 -1 2a2.4 2.4 0 0 0 1 2M16 4a2.4 2.4 0 0 0 -1 2a2.4 2.4 0 0 0 1 2M8 4a2.4 2.4 0 0 0 -1 2a2.4 2.4 0 0 0 1 2",
"transporte": "M5 17a2 2 0 1 0 4 0a2 2 0 1 0 -4 0M15 17a2 2 0 1 0 4 0a2 2 0 1 0 -4 0M5 17h-2v-6l2 -5h9l4 5h1a2 2 0 0 1 2 2v4h-2m-4 0h-6m-6 -6h15m-6 0v-5",
"eventos": "M15 5l0 2M15 11l0 2M15 17l0 2M5 5h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-3a2 2 0 0 0 0 -4v-3a2 2 0 0 1 2 -2",
"compra acciones etfs": "M4 7a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v3a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1l0 -3M6 4l0 2M6 11l0 9M10 15a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v3a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1l0 -3M12 4l0 10M12 19l0 1M16 6a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1l0 -4M18 4l0 1M18 11l0 9",
"fondo de emergencia": "M8 12a4 4 0 1 0 8 0a4 4 0 1 0 -8 0M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0M15 15l3.35 3.35M9 15l-3.35 3.35M5.65 5.65l3.35 3.35M18.35 5.65l-3.35 3.35",
"_default": "M6.5 7.5a1 1 0 1 0 2 0a1 1 0 1 0 -2 0M3 6v5.172a2 2 0 0 0 .586 1.414l7.71 7.71a2.41 2.41 0 0 0 3.408 0l5.592 -5.592a2.41 2.41 0 0 0 0 -3.408l-7.71 -7.71a2 2 0 0 0 -1.414 -.586h-5.172a3 3 0 0 0 -3 3"
};
function icono(nombre, color, tam, grosor){
  const d = ICONOS[norm(nombre)] || ICONOS._default;
  tam = tam || 18;
  return `<svg width="${tam}" height="${tam}" viewBox="0 0 24 24" fill="none" stroke="${color||'currentColor'}" stroke-width="${grosor||2}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;
}
/** Ícono de la categoría más específica que tenga la fila */
function iconoFila(r){ return r.cat3 && ICONOS[norm(r.cat3)] ? r.cat3 : (r.cat2 || r.cat1); }
function colorFila(r){ return r.cat3 && COLOR_N3[norm(r.cat3)] ? colorDe(r.cat3,3) : colorDe(r.cat2 || r.cat1, 2); }
function tile(nombre, color, chico){
  return `<span class="tile${chico?' sm':''}" style="background:${alpha(color,0.14)}">${icono(nombre, color, chico?16:18)}</span>`;
}
const SVG = {
  info:'<path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0M12 9h.01M11 12h1v4h1"/>',
  wifiOff:'<path d="M12 18l.01 0M9.172 15.172a4 4 0 0 1 5.656 0M6.343 12.343a7.963 7.963 0 0 1 3.864 -2.14m4.163 .155a7.965 7.965 0 0 1 3.287 2M3.515 9.515a12 12 0 0 1 3.544 -2.455m3.101 -.92a12 12 0 0 1 10.325 3.374M3 3l18 18"/>',
  chev:'<path d="M4 2 8 6 4 10"/>', down:'<path d="M2 4.5 6 8.5 10 4.5"/>',
  home:'<path d="M5 12l-2 0l9 -9l9 9l-2 0M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6"/>',
  pie:'<path d="M10 3.2a9 9 0 1 0 10.8 10.8a1 1 0 0 0 -1 -1h-6.8a2 2 0 0 1 -2 -2v-7a.9 .9 0 0 0 -1 -.8M15 3.5a9 9 0 0 1 5.5 5.5h-4.5a1 1 0 0 1 -1 -1v-4.5"/>',
  pulse:'<path d="M3 12h4l3 8l4 -16l3 8h4"/>',
  cal:'<path d="M11.5 21h-5.5a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v6M16 3v4M8 3v4M4 11h16M15 19l2 2l4 -4"/>',
  resumen:'<path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2M9 5a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2M9 17v-5M12 17v-1M15 17v-3"/>',
  up:'<path d="M3 17l6 -6l4 4l8 -8M14 7l7 0l0 7"/>',
  downtrend:'<path d="M3 7l6 6l4 -4l8 8M21 10l0 7l-7 0"/>',
  coins:'<path d="M9 14c0 1.657 2.686 3 6 3s6 -1.343 6 -3s-2.686 -3 -6 -3s-6 1.343 -6 3M9 14v4c0 1.656 2.686 3 6 3s6 -1.344 6 -3v-4M3 6c0 1.072 1.144 2.062 3 2.598s4.144 .536 6 0c1.856 -.536 3 -1.526 3 -2.598c0 -1.072 -1.144 -2.062 -3 -2.598s-4.144 -.536 -6 0c-1.856 .536 -3 1.526 -3 2.598M3 6v10c0 .888 .772 1.45 2 2M3 11c0 .888 .772 1.45 2 2"/>',
  store:'<path d="M3 21l18 0M3 7v1a3 3 0 0 0 6 0v-1m0 1a3 3 0 0 0 6 0v-1m0 1a3 3 0 0 0 6 0v-1h-18l2 -4h14l2 4M5 21l0 -10.15M19 21l0 -10.15M9 21v-4a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v4"/>',
  target:'<path d="M11 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0M12 7a5 5 0 1 0 5 5M13 3.055a9 9 0 1 0 7.941 7.945M15 6v3h3l3 -3h-3v-3l-3 3M15 9l-3 3"/>',
  search:'<path d="M3 10a7 7 0 1 0 14 0a7 7 0 1 0 -14 0M21 21l-6 -6"/>',
  x:'<path d="M18 6l-12 12M6 6l12 12"/>',
  check:'<path d="M5 12l5 5l10 -10"/>',
  clock:'<path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0M12 7v5l3 3"/>',
  repeat:'<path d="M4 12v-3a3 3 0 0 1 3 -3h13m-3 -3l3 3l-3 3M20 12v3a3 3 0 0 1 -3 3h-13m3 3l-3 -3l3 -3"/>',
  card:'<path d="M3 8a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3l0 -8M3 10l18 0M7 15l.01 0M11 15l2 0"/>',
  pencil:'<path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4M13.5 6.5l4 4"/>',
  moon:'<path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454l0 .008"/>',
  atras:'<path d="M5 12l14 0M5 12l6 6M5 12l6 -6"/>',
  arribaF:'<path d="M12 5l0 14M18 11l-6 -6M6 11l6 -6"/>',
  abajoF:'<path d="M12 5l0 14M18 13l-6 6M6 13l6 6"/>',
  alerta:'<path d="M12 9v4M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0M12 16h.01"/>',
  calendario:'<path d="M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12M16 3v4M8 3v4M4 11h16M8 14v4M12 14v4M16 14v4"/>',
  sol:'<path d="M8 12a4 4 0 1 0 8 0a4 4 0 1 0 -8 0M3 12h1m8 -9v1m8 8h1m-9 8v1m-6.4 -15.4l.7 .7m12.1 -.7l-.7 .7m0 11.4l.7 .7m-12.1 -.7l-.7 .7"/>',
  luna:'<path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454l0 .008"/>',
  temaAuto:'<path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0M12 3v18M12 9l4.65 -4.65M12 14.3l7.37 -7.37M12 19.6l8.85 -8.85"/>',
  sube:'<path d="M17 7l-10 10M8 7l9 0l0 9"/>',
  baja:'<path d="M7 7l10 10M17 8l0 9l-9 0"/>'
};
function svg(nombre, tam, color, grosor){
  return `<svg width="${tam||16}" height="${tam||16}" viewBox="0 0 24 24" fill="none" stroke="${color||'currentColor'}" stroke-width="${grosor||2}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${SVG[nombre]}</svg>`;
}
function chev(){ return `<svg class="chev" width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${SVG.chev}</svg>`; }

/* ---------- tendencia (regresión lineal simple) ---------- */
function calcularTendencia(valores){
  const n = valores.length;
  if(n < 2) return { linea: valores.slice(), pendiente: 0 };
  let sx=0, sy=0, sxy=0, sxx=0;
  for(let i=0;i<n;i++){ sx+=i; sy+=valores[i]; sxy+=i*valores[i]; sxx+=i*i; }
  const den = n*sxx - sx*sx;
  if(!den) return { linea: valores.slice(), pendiente: 0 };
  const m = (n*sxy - sx*sy)/den, b = (sy - m*sx)/n;
  return { linea: valores.map((_,i)=> Math.max(0, m*i + b)), pendiente: m };
}
function textoTendencia(pendiente, promedio){
  if(!promedio) return 'sin datos';
  const rel = (pendiente / promedio) * 100;
  if(Math.abs(rel) < 4) return 'estable';
  return rel > 0 ? `subiendo ~${Math.abs(rel).toFixed(0)}% por mes` : `bajando ~${Math.abs(rel).toFixed(0)}% por mes`;
}

/* ---------- días de la semana ---------- */
const NOMBRE_DIA       = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
const NOMBRE_DIA_CORTO = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
const GRUPOS_DIA = [
  { id:'lj', nombre:'Lunes a jueves', corto:'Lun-Jue', dias:[1,2,3,4], get color(){ return paraTema('#5EA2FF'); }, desc:'semana de oficina' },
  { id:'vd', nombre:'Viernes a domingo', corto:'Vie-Dom', dias:[5,6,0], get color(){ return paraTema('#FF9440'); }, desc:'fin de semana largo' }
];
/** Día hasta el que cuenta el mes: hoy si es el mes en curso; si no, el último día */
function diaLimite(mesKey){
  const hoy = new Date();
  return monthKey(hoy) === mesKey ? Math.min(hoy.getDate(), diasDelMes(mesKey)) : diasDelMes(mesKey);
}
function esMesActual(mesKey){ return monthKey(new Date()) === mesKey; }
/** Cuántos días de esos weekdays ya transcurrieron en el mes */
function contarDias(mesKey, weekdays){
  const [y,m] = mesKey.split('-').map(Number);
  const lim = diaLimite(mesKey); let n = 0;
  for(let d = 1; d <= lim; d++) if(weekdays.includes(new Date(y, m-1, d).getDay())) n++;
  return n;
}

/* ---------- cobros recurrentes (misma regla que /fijos del bot) ---------- */
const FIJO_MIN_MESES = 3, FIJO_COBERTURA = 0.6;
function mesesEntre(a, b){ const x = a.split('-').map(Number), y = b.split('-').map(Number); return (y[0]-x[0])*12 + (y[1]-x[1]); }
function detectarRecurrentes(filas){
  const por = {};
  filas.forEach(r => {
    if(!esGastoReal(r)) return;
    const k = r.comercio.toUpperCase().trim(); if(!k) return;
    (por[k] = por[k] || []).push(r);
  });
  const out = [];
  Object.keys(por).forEach(k => {
    const porMes = {};
    por[k].slice().sort((a,b)=>a.fecha-b.fecha).forEach(r => { porMes[monthKey(r.fecha)] = r; });
    const meses = Object.keys(porMes).sort();
    if(meses.length < FIJO_MIN_MESES) return;
    const vida = mesesEntre(meses[0], meses[meses.length-1]) + 1;
    if(meses.length / vida < FIJO_COBERTURA) return;
    const ult = porMes[meses[meses.length-1]];
    // "estable": un cobro por mes y montos parecidos (suscripciones, servicios), no compras sueltas
    const montos = meses.map(m => porMes[m].montoSoles).sort((a,b)=>a-b);
    const med = montos[Math.floor(montos.length/2)] || 0;
    const parecidos = med > 0 && montos.every(v => Math.abs(v - med) / med <= 0.15);
    const estable = parecidos && por[k].length / meses.length <= 1.5;
    out.push({ clave:k, nombre: ult.comercio, meses, porMes, ultimo: ult, estable });
  });
  return out;
}

/* ---------- preferencias locales ---------- */
const MES_KEY = 'finanzas_mes_activo', FIJOS_KEY = 'finanzas_fijos_marcados';
function lsGet(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
function lsSet(k, v){ try{ localStorage.setItem(k, v); }catch(e){} }
function lsDel(k){ try{ localStorage.removeItem(k); }catch(e){} }

/* ---------- candado de acceso (solo para desalentar el acceso casual: se
   pide una vez por dispositivo/navegador y queda recordado en localStorage;
   no es seguridad real, cualquiera con acceso al código o a localStorage
   puede saltarlo) ---------- */
const GATE_KEY = 'finanzas_gate_ok_v2', GATE_PASS = '97477';   // v13: contraseña nueva; la llave nueva pide la clave otra vez en cada dispositivo
try{ localStorage.removeItem('finanzas_gate_ok'); }catch(e){}
function gatePasado(){ return lsGet(GATE_KEY) === '1'; }
function gateDesbloquear(){ lsSet(GATE_KEY, '1'); }
function leerMesPreferido(){
  try{ const p = new URLSearchParams(location.search).get('mes'); if(p) return p; }catch(e){}
  return lsGet(MES_KEY);
}
function leerFijosMarcados(){ try{ return JSON.parse(lsGet(FIJOS_KEY)) || []; }catch(e){ return []; } }
function guardarFijosMarcados(l){ lsSet(FIJOS_KEY, JSON.stringify(l)); }

/* ---------- presupuesto: por categoría + margen, sincronizado entre dispositivos ----------
   La Meta general = suma de los presupuestos por categoría + margen. Todo vive en el mismo
   Sheet (vía el Web App del bot), así es el mismo presupuesto entres donde entres.
   localStorage solo hace de caché: abre al instante y sigue funcionando sin conexión;
   si un guardado falla por falta de red, el valor no se pierde y se reintenta solo en la
   próxima carga de datos. */
const PRESU_CLAVE_MARGEN = '__margen__';
const PRESU_CACHE_KEY = 'finanzas_presupuestos_v2';
const PRESU_MIGRADO_KEY = 'finanzas_presu_migrado_v2';
let PRESUPUESTOS = { categorias:{}, margen:0 };

function leerPresupuestosCache(){
  try{
    const v = JSON.parse(lsGet(PRESU_CACHE_KEY));
    return (v && typeof v === 'object') ? { categorias: v.categorias || {}, margen: Number(v.margen) || 0 } : { categorias:{}, margen:0 };
  }catch(e){ return { categorias:{}, margen:0 }; }
}
function guardarPresupuestosCache(p){ lsSet(PRESU_CACHE_KEY, JSON.stringify(p)); }

/** Trae al formato nuevo lo que el usuario ya tenía guardado solo en este dispositivo (una sola vez).
    Antes, la Meta y los presupuestos por categoría eran independientes; ahora la Meta es su suma.
    Para que a nadie le cambie el número el día que se actualiza, el margen se calcula como
    "lo que faltaba de la meta vieja para llegar a lo que ya tenía presupuestado por categoría",
    nunca la meta vieja completa (eso duplicaría lo ya cubierto por las categorías). */
function migrarPresupuestosViejos(){
  if(lsGet(PRESU_MIGRADO_KEY)) return null;
  lsSet(PRESU_MIGRADO_KEY, '1');
  let categorias = {}, metaVieja = 0;
  try{ categorias = JSON.parse(lsGet('finanzas_presupuestos_categoria')) || {}; }catch(e){}
  try{ metaVieja = parseFloat(lsGet('finanzas_presupuesto_mensual')) || 0; }catch(e){}
  if(!Object.keys(categorias).length && !metaVieja) return null;
  const sumaVieja = Object.values(categorias).reduce((a, b) => a + (Number(b) || 0), 0);
  const margen = Math.max(0, metaVieja - sumaVieja);
  return { categorias, margen };
}

function sumaPresupuestosCategoria(){
  return Object.values(PRESUPUESTOS.categorias || {}).reduce((a, b) => a + (Number(b) || 0), 0);
}
function leerMargen(){ return Number(PRESUPUESTOS.margen) || 0; }
function leerMeta(){ const v = sumaPresupuestosCategoria() + leerMargen(); return v > 0 ? v : null; }
function leerPresupuestosCat(){ return PRESUPUESTOS.categorias || {}; }

/* Cambios que todavía no confirmó el bot. Viven en localStorage hasta que el bot responde, así
   un guardado no se pierde si cambias de pestaña (la página se recarga y el envío se corta) o si
   no hay señal: se reintentan solos en la próxima carga. (auditoría 2026-09-27) */
/* v13 · ARREGLO "Imprevistos se sube a miles": un pendiente viejo (de otro dispositivo o de una versión
   anterior, p.ej. la meta antigua 2,500/3,000 que se migró como margen) se quedaba sin confirmar y se
   reenviaba en CADA carga, pisando lo último que guardaste. Ahora cada cambio lleva la hora en que lo
   hiciste (ts): el bot se queda con el más nuevo, un pendiente se descarta apenas el bot muestra ese
   valor o uno posterior, y los pendientes sin hora (de versiones anteriores) se descartan sin reenviar. */
const PRESU_PEND_KEY = 'finanzas_presu_pendientes_v2';
const PRESU_PEND_TTL = 7 * 24 * 60 * 60 * 1000;
try{ localStorage.removeItem('finanzas_presu_pendientes'); }catch(e){}   // formato viejo, sin hora: fuera
function leerPendientesPresu(){
  let p = {};
  try{ p = JSON.parse(lsGet(PRESU_PEND_KEY)) || {}; }catch(e){ p = {}; }
  const out = {};
  // ts = hora del cambio (1 = migración: la más vieja posible); creado = cuándo se anotó el pendiente (para caducar)
  Object.keys(p).forEach(c => { const v = p[c]; if(v && typeof v === 'object' && v.ts && Date.now() - (v.creado || v.ts) < PRESU_PEND_TTL) out[c] = { monto: Number(v.monto) || 0, ts: Number(v.ts), creado: Number(v.creado || v.ts) }; });
  return out;
}
function guardarPendientesPresu(p){ lsSet(PRESU_PEND_KEY, JSON.stringify(p)); }
/** Lo que manda el bot + lo que aún no confirmó. Un pendiente gana solo si es MÁS NUEVO que lo que el
    bot tiene para esa clave; si el bot ya tiene ese valor o uno posterior, el pendiente se borra. */
function aplicarPendientesPresu(p){
  const out = { categorias: Object.assign({}, (p && p.categorias) || {}), margen: Number(p && p.margen) || 0 };
  const act = (p && p.actualizado) || null;   // null = bot anterior a v24 (sin fechas)
  const pend = leerPendientesPresu();
  let cambio = false;
  Object.keys(pend).forEach(c => {
    const m = pend[c].monto;
    const enBot = c === PRESU_CLAVE_MARGEN ? out.margen : (Number(out.categorias[c]) || 0);
    const tBot = act ? Number(act[c] || 0) : 0;
    if(act && (enBot === m || tBot >= pend[c].ts)){ delete pend[c]; cambio = true; return; }   // confirmado o superado
    if(c === PRESU_CLAVE_MARGEN) out.margen = m;
    else if(m > 0) out.categorias[c] = m;
    else delete out.categorias[c];
  });
  if(cambio) guardarPendientesPresu(pend);
  return out;
}

/** Manda el cambio al bot en segundo plano (sin bloquear la UI, que ya se actualizó optimista).
    keepalive: el envío sobrevive aunque la página se cierre o cambies de pestaña. */
function sincronizarPresupuesto(clave, monto, ts){
  ts = ts || Date.now();
  const pend = leerPendientesPresu(); pend[clave] = { monto, ts, creado: (pend[clave] && pend[clave].ts === ts && pend[clave].creado) || Date.now() }; guardarPendientesPresu(pend);
  fetch(API_URL, { method:'POST', keepalive:true, body: JSON.stringify({ accion:'guardarPresupuesto', clave, monto, ts }) })
    .then(r => r.json())
    .then(res => {
      if(!res || !res.presupuestos) return;   // bot sin la versión nueva: queda pendiente
      const p2 = leerPendientesPresu();
      if(p2[clave] && p2[clave].ts === ts) delete p2[clave];
      guardarPendientesPresu(p2);
      PRESUPUESTOS = aplicarPendientesPresu(res.presupuestos);
      guardarPresupuestosCache(PRESUPUESTOS);
    })
    .catch(() => {});
}
function reintentarPendientesPresu(){
  const pend = leerPendientesPresu();
  Object.keys(pend).forEach(c => sincronizarPresupuesto(c, pend[c].monto, pend[c].ts));   // con su hora original
}
function guardarPresupuestoCat(cat2, monto){
  monto = Number(monto) || 0;
  if((Number(PRESUPUESTOS.categorias[cat2]) || 0) === monto) return;   // sin cambio: no se manda nada
  if(monto > 0) PRESUPUESTOS.categorias[cat2] = monto; else delete PRESUPUESTOS.categorias[cat2];
  guardarPresupuestosCache(PRESUPUESTOS);
  sincronizarPresupuesto(cat2, monto);
}
function guardarMargen(monto){
  monto = Number(monto) || 0;
  if((Number(PRESUPUESTOS.margen) || 0) === monto) return;
  PRESUPUESTOS.margen = monto;
  guardarPresupuestosCache(PRESUPUESTOS);
  sincronizarPresupuesto(PRESU_CLAVE_MARGEN, monto);
}
(function initPresupuestos(){
  reintentarPendientesPresu();   // primero lo que quedó sin confirmar de una visita anterior
  const migrado = migrarPresupuestosViejos();
  PRESUPUESTOS = migrado || leerPresupuestosCache();
  if(migrado){
    guardarPresupuestosCache(PRESUPUESTOS);
    // v13: lo migrado va con la hora más vieja posible: solo llena lo que el bot no tenga, nunca pisa
    // un presupuesto que ya pusiste (antes un dispositivo nuevo subía la meta antigua como Imprevistos)
    Object.keys(migrado.categorias).forEach(c => sincronizarPresupuesto(c, migrado.categorias[c], 1));
    if(migrado.margen) sincronizarPresupuesto(PRESU_CLAVE_MARGEN, migrado.margen, 1);
  }
  PRESUPUESTOS = aplicarPendientesPresu(PRESUPUESTOS);
})();

const REDUCIR_MOVIMIENTO = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
