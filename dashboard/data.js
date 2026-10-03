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
  return (v < 10 ? v.toFixed(1) : v.toFixed(0)) + '%';
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
const COLOR_N1 = { 'personal':'#5B5BD6', 'social':'#E0457B', 'finanzas':'#0D9488', 'ingresos':'#16A34A', 'terceros':'#D97706' };
const COLOR_N2 = {
  'fijo':'#3B7DD8', 'variable':'#F97316', 'salud y bienestar':'#10B981', 'auto y movilidad':'#64748B',
  'pareja':'#EC4899', 'amigos':'#F59E0B', 'trabajo':'#0891B2', 'inversiones y ahorro':'#16A34A', 'prestamos':'#8B5CF6'
};
const COLOR_N3 = {
  'vivienda':'#6366F1','servicios':'#F59E0B','suscripciones':'#8B5CF6','seguros':'#155E75','educacion':'#2563EB',
  'comida diaria':'#F97316','ropa':'#DB2777','cuidado personal':'#14B8A6','mascotas':'#A16207','tecnologia':'#475569','ocio y hobbies':'#7C3AED',
  'consultas medicas':'#0EA5E9','medicinas':'#10B981','deporte':'#22C55E',
  'combustible':'#DC2626','cochera':'#64748B','mantenimiento y estetica':'#0D9488','peajes':'#CA8A04','transporte publico':'#1D4ED8',
  'comida casual':'#FB923C','comida especial':'#E11D48','regalos':'#EC4899','escapadas':'#0891B2','detalles':'#F472B6',
  'comidas':'#EA580C','diversion salidas':'#A855F7','viajes paseos':'#2DD4BF',
  'almuerzos oficina':'#65A30D','transporte':'#3B82F6','eventos':'#D946EF',
  'compra acciones etfs':'#059669','fondo de emergencia':'#0284C7'
};
const PALETA_RESERVA = ['#4F46E5','#DB2777','#059669','#D97706','#7C3AED','#0891B2','#DC2626','#65A30D','#C026D3','#0284C7','#B45309','#15803D'];
function _hash(t, n){ let h = 0; for(let i=0;i<t.length;i++) h = (h*31 + t.charCodeAt(i)) >>> 0; return h % n; }
function colorDe(nombre, nivel){
  const k = norm(nombre);
  if(nivel === 1 && COLOR_N1[k]) return COLOR_N1[k];
  if(nivel === 2 && COLOR_N2[k]) return COLOR_N2[k];
  if(nivel === 3 && COLOR_N3[k]) return COLOR_N3[k];
  return COLOR_N2[k] || COLOR_N3[k] || COLOR_N1[k] || PALETA_RESERVA[_hash(k, PALETA_RESERVA.length)];
}
function alpha(hex, a){
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${a})`;
}

/* ---------- íconos (trazo, 24×24) por categoría ---------- */
const ICONOS = {
"personal": "M8 7.5a4 4 0 1 0 8 0a4 4 0 1 0 -8 0M4.5 21a7.5 7.5 0 0 1 15 0",
"social": "M5.5 8a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0 -7 0M2.5 20a6.5 6.5 0 0 1 13 0M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.2a6.5 6.5 0 0 1 3.5 5.8",
"finanzas": "M3 20h18M6 16v-3M10 16V9M14 16v-5M18 16V6",
"fijo": "M12 16.5V22M9 3h6l-1 6 3.5 3.5v2h-11v-2L10 9z",
"variable": "M21 12a9 9 0 0 1-15.4 6.4L3 16M3 21v-5h5M3 12a9 9 0 0 1 15.4-6.4L21 8M21 3v5h-5",
"salud y bienestar": "M19.5 13.5 12 21l-7.5-7.5A5 5 0 0 1 12 6a5 5 0 0 1 7.5 7.5zM4 12h3.5l2-3 3 5 2-2H20",
"auto y movilidad": "M5 17h14v-5l-2.2-5.2A1.5 1.5 0 0 0 15.4 6H8.6a1.5 1.5 0 0 0-1.4.8L5 12zM5 12h14M6 17a2 2 0 1 0 4 0a2 2 0 1 0 -4 0M14 17a2 2 0 1 0 4 0a2 2 0 1 0 -4 0",
"pareja": "M12 20s-7.5-4.6-9.2-9.3A4.8 4.8 0 0 1 12 6.8a4.8 4.8 0 0 1 9.2 3.9C19.5 15.4 12 20 12 20z",
"amigos": "M5.5 8a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0 -7 0M2.5 20a6.5 6.5 0 0 1 13 0M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.2a6.5 6.5 0 0 1 3.5 5.8",
"trabajo": "M5 7h14a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-9a2 2 0 0 1 2 -2zM8.5 7V5a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v2M3 12.5h18",
"inversiones y ahorro": "M3 17 9 11l4 4 8-8M15 7h6v6",
"prestamos": "M7 8h13l-3.5-3.5M17 16H4l3.5 3.5",
"terceros": "M7 8h13l-3.5-3.5M17 16H4l3.5 3.5",
"vivienda": "M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z",
"servicios": "M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z",
"suscripciones": "M17 2.5 20.5 6 17 9.5M3.5 11V9.5A3.5 3.5 0 0 1 7 6h13.5M7 21.5 3.5 18 7 14.5M20.5 13v1.5A3.5 3.5 0 0 1 17 18H3.5",
"seguros": "M12 3 4.5 6v5.5c0 4.6 3.2 8.2 7.5 9.5 4.3-1.3 7.5-4.9 7.5-9.5V6zm9 12 2 2 4-4",
"educacion": "M2.5 9 12 4.5 21.5 9 12 13.5zM6.5 11v5c0 1.5 2.5 3 5.5 3s5.5-1.5 5.5-3v-5",
"comida diaria": "M7 3v18M4.5 3v5a2.5 2.5 0 0 0 5 0V3M17 21V3c-2 1.5-3 4-3 7v3h3",
"ropa": "M8.5 3 4 5.5 2.5 10l3.5 1.5V21h12v-9.5l3.5-1.5L20 5.5 15.5 3a3.5 3.5 0 0 1-7 0z",
"cuidado personal": "M9.5 9h5a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-5a2 2 0 0 1 -2 -2v-8a2 2 0 0 1 2 -2zM10 9V6h4v3M11 3h2.5M10.5 14h3",
"mascotas": "M3.7 10a1.8 1.8 0 1 0 3.6 0a1.8 1.8 0 1 0 -3.6 0M7.7 5.5a1.8 1.8 0 1 0 3.6 0a1.8 1.8 0 1 0 -3.6 0M12.7 5.5a1.8 1.8 0 1 0 3.6 0a1.8 1.8 0 1 0 -3.6 0M16.7 10a1.8 1.8 0 1 0 3.6 0a1.8 1.8 0 1 0 -3.6 0M12 11c-3 0-5.5 4-5.5 6.5 0 1.7 1.3 2.5 2.8 2.5 1.2 0 1.8-.6 2.7-.6s1.5.6 2.7.6c1.5 0 2.8-.8 2.8-2.5C17.5 15 15 11 12 11z",
"tecnologia": "M5.5 5h13a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1 -1.5 1.5h-13a1.5 1.5 0 0 1 -1.5 -1.5v-8a1.5 1.5 0 0 1 1.5 -1.5zM2 19.5h20",
"ocio y hobbies": "M7.5 7h9a5 5 0 0 1 5 5v1a5 5 0 0 1 -5 5h-9a5 5 0 0 1 -5 -5v-1a5 5 0 0 1 5 -5zM7 10.5v4M5 12.5h4M15 11h.01M18 14h.01",
"consultas medicas": "M5 3v5a4 4 0 0 0 8 0V3M9 12v2a5 5 0 0 0 10 0v-1M17 11a2 2 0 1 0 4 0a2 2 0 1 0 -4 0",
"medicinas": "M10.5 20.5a4.95 4.95 0 0 1-7-7l10-10a4.95 4.95 0 0 1 7 7zm8.5 8.5 7 7",
"deporte": "M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11",
"combustible": "M4 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M3 21h12M4 10h10M14 8h2a2 2 0 0 1 2 2v6a1.5 1.5 0 0 0 3 0V9l-3-3",
"cochera": "M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1 -4 4h-10a4 4 0 0 1 -4 -4v-10a4 4 0 0 1 4 -4zM9.5 17V7H13a3 3 0 0 1 0 6H9.5",
"mantenimiento y estetica": "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.7 1.8 1.8.7-1.8.7L19 21l-.7-1.8-1.8-.7 1.8-.7z",
"peajes": "M6 21 9 3M18 21 15 3M12 5v2M12 11v2M12 17v2",
"transporte publico": "M7.5 3h9a2.5 2.5 0 0 1 2.5 2.5v10a2.5 2.5 0 0 1 -2.5 2.5h-9a2.5 2.5 0 0 1 -2.5 -2.5v-10a2.5 2.5 0 0 1 2.5 -2.5zM5 11h14M8 18v2.5M16 18v2.5M8.5 14.5h.01M15.5 14.5h.01",
"comida casual": "M12 21 3.5 6.5a17 17 0 0 1 17 0zM10 10h.01M14 12h.01M12 16h.01",
"comida especial": "M8 3h8l-.5 5a3.5 3.5 0 0 1-7 0zM12 11.5V20M8.5 20h7",
"regalos": "M4.5 8h15a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-15a1 1 0 0 1 -1 -1v-2a1 1 0 0 1 1 -1zM5 12v9h14v-9M12 8v13M12 8c-1.5-3.5-5.5-4-5-1.2.3 1.2 3 1.2 5 1.2 2 0 4.7 0 5-1.2.5-2.8-3.5-2.3-5 1.2z",
"escapadas": "M3 19V6M3 15h18v4M21 15v-3a3 3 0 0 0-3-3h-7v6M5 11a2 2 0 1 0 4 0a2 2 0 1 0 -4 0",
"detalles": "M12 21v-9M7 4c0 5 2 8 5 8s5-3 5-8l-2.5 2L12 3 9.5 6zM12 17c-2.5-2.5-5-2-6-1",
"comidas": "M7 3v18M4.5 3v5a2.5 2.5 0 0 0 5 0V3M17 21V3c-2 1.5-3 4-3 7v3h3",
"diversion salidas": "M9 18V5l11-2v13M4 18a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0M15 16a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0",
"viajes paseos": "M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z",
"almuerzos oficina": "M5 7h14a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-8a2 2 0 0 1 2 -2zM3 12h18M12 12v7M9 7V5h6v2",
"transporte": "M5 17h14v-5l-2.2-5.2A1.5 1.5 0 0 0 15.4 6H8.6a1.5 1.5 0 0 0-1.4.8L5 12zM5 12h14M6 17a2 2 0 1 0 4 0a2 2 0 1 0 -4 0M14 17a2 2 0 1 0 4 0a2 2 0 1 0 -4 0M10 3h4",
"eventos": "M3 8.5V6a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v2.5a2.5 2.5 0 0 0 0 5V18a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-4.5a2.5 2.5 0 0 0 0-5zM14 5v2M14 11v2M14 17v2",
"compra acciones etfs": "M3 17 9 11l4 4 8-8M15 7h6v6",
"fondo de emergencia": "M3 21h18M5 21V10M9.5 21V10M14.5 21V10M19 21V10M2.5 10 12 4l9.5 6z",
"_default": "M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9zM6.2 7.5a1.3 1.3 0 1 0 2.6 0a1.3 1.3 0 1 0 -2.6 0"
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
  return `<span class="tile${chico?' sm':''}" style="background:${alpha(color,0.12)}">${icono(nombre, color, chico?16:18)}</span>`;
}
const SVG = {
  home:'<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
  pie:'<path d="M21 12A9 9 0 1 1 12 3v9z"/><path d="M15 3.5A9 9 0 0 1 20.5 9H15z"/>',
  pulse:'<path d="M3 12h4l3-8 4 16 3-8h4"/>',
  cal:'<rect x="3" y="4.5" width="18" height="16.5" rx="2.5"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/><path d="m9 15 2 2 4-4"/>',
  chev:'<path d="M4 2 8 6 4 10"/>', down:'<path d="M2 4.5 6 8.5 10 4.5"/>',
  up:'<path d="M3 17 9 11l4 4 8-8"/><path d="M15 7h6v6"/>',
  downtrend:'<path d="M3 7 9 13l4-4 8 8"/><path d="M15 17h6v-6"/>',
  coins:'<circle cx="9" cy="9" r="6"/><path d="M15.5 9.3A6 6 0 1 1 9.3 15.5"/>',
  store:'<path d="M4 9.5 5.5 4h13L20 9.5"/><path d="M4 9.5h16v1a3 3 0 0 1-5.3 1.9A3 3 0 0 1 12 13.5a3 3 0 0 1-2.7-1.1A3 3 0 0 1 4 10.5z"/><path d="M5.5 13v7h13v-7"/>',
  target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  x:'<path d="M6 6l12 12M18 6 6 18"/>', check:'<path d="m5 12.5 4.5 4.5L19 7.5"/>', clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  repeat:'<path d="M17 2.5 20.5 6 17 9.5"/><path d="M3.5 11V9.5A3.5 3.5 0 0 1 7 6h13.5"/><path d="M7 21.5 3.5 18 7 14.5"/><path d="M20.5 13v1.5A3.5 3.5 0 0 1 17 18H3.5"/>',
  card:'<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19M6.5 15h4"/>',
  pencil:'<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
  moon:'<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  atras:'<path d="M19 12H5"/><path d="m11 18-6-6 6-6"/>'
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
  { id:'lj', nombre:'Lunes a jueves', corto:'Lun–Jue', dias:[1,2,3,4], color:'#3B7DD8', desc:'semana de oficina' },
  { id:'vd', nombre:'Viernes a domingo', corto:'Vie–Dom', dias:[5,6,0], color:'#EC4899', desc:'fin de semana largo' }
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
