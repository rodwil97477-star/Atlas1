/* ============================================================
   Cambio para el bot (Apps Script) · pestaña Inversiones del dashboard (v21)
   ------------------------------------------------------------
   El dashboard necesita dos datos más en la respuesta del doGet:
     portafolio  -> las filas de la hoja "Portafolio" (Fecha, Ticker, Cantidad,
                    ValorActual, GananciaUSD, GananciaPct), tal como las guarda
                    manejarFotoPortafolio cuando le mandas una captura.
     tc          -> el tipo de cambio dólar a soles de hoy.

   Qué hacer (2 pasos, sin tocar nada más):

   1) Pega la función tipoCambioDelDia() de abajo en cualquier parte del script.

   2) En tu doGet, dentro del objeto `salida`, agrega estas dos líneas
      (deja tal cual lo que ya tengas, por ejemplo egresos, prestamos y presupuestos):

        const salida = {
          meses: meses,
          egresos: leerHoja(ss.getSheets()[0], desde),
          prestamos: leerHoja(ss.getSheetByName(PRESTAMOS_SHEET_NAME), null),
          // ...lo que ya tengas aquí (presupuestos, etc.)...
          portafolio: leerHoja(ss.getSheetByName(PORTAFOLIO_SHEET_NAME), null),   // NUEVO
          tc: tipoCambioDelDia()                                                  // NUEVO
        };

   Después: Implementar > Administrar implementaciones > editar > Versión nueva.
   La URL del Web App no cambia.

   Meta de inversión
   ------------------------------------------------------------
   El dashboard guarda tu meta de inversión mensual (en dólares) con la misma
   acción guardarPresupuesto que ya usa, bajo la clave "__inversion__". No hace
   falta cambiar nada para que se guarde. Solo si el bot calcula tu meta de gasto
   sumando TODAS las claves de la hoja de presupuestos (para el resumen diario o
   /meta), salta esa clave en la suma, igual que ya haces con "__margen__":

        if (clave === '__inversion__') return;   // invertir no es gastar
   ============================================================ */

/** Tipo de cambio USD -> PEN de hoy. Se guarda 6 horas en caché para que el
    dashboard no espere a open.er-api.com en cada carga. */
function tipoCambioDelDia() {
  const cache = CacheService.getScriptCache();
  const guardado = cache.get('TC_USD_PEN');
  if (guardado) return Number(guardado);
  const tc = obtenerTipoCambioUSDPEN();   // ya existe en el bot
  if (tc) cache.put('TC_USD_PEN', String(tc), 6 * 60 * 60);
  return tc || null;
}
