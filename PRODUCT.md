# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

One person (Rodrigo) tracking his own money. He logs expenses through a Telegram bot that writes to Google Sheets, then opens this PWA on his phone (installed to the home screen) and occasionally on a desktop browser to see where the month stands. Typical moments: a quick glance after paying something, a check before a weekend, and a sit-down review at month end to set or adjust budgets.

## Product Purpose

"Finanzas": a personal finance dashboard that answers, at a glance, how much he has spent this month, whether he is on track against his budget (Meta), where the money went, what fixed charges are pending, and who owes him money. Success is knowing the state of the month in seconds and deciding what to adjust.

## Positioning

Built around his own categorisation tree (cat1 > cat2 > cat3), his bot, and his rituals. Budgets are composed bottom-up: per-subcategory amounts plus a free margin add up to the monthly Meta, and every screen compares real spend against that pace.

## Operating Context

- Data arrives live from a Google Apps Script endpoint (`egresos`, `prestamos`, `presupuestos`); a local copy opens instantly, then refreshes.
- Five tabs, one question each (reorganised 2026-10, v17): Inicio "¿cómo voy?" (one hero card with month total, Meta state, projection and Personal/Social split; alerts; latest movements; shortcuts), Presupuesto "¿me alcanza?" (state and per-day pace, month curve, categories against their budget, what the margin covers), Gastos "¿en qué, dónde, cómo y cuándo?" (search plus one row of sub-tabs: Categoría with ant spending, Pagos with merchants and payment methods, whose sheet splits credit and debit, and Días with the calendar, hours and week vs weekend), Compromisos "¿qué tengo que pagar o cobrar?" (month summary, loans receivable, then fixed charges; a fixed charge only counts if it was paid this month or last month; recurring detection was removed because the Telegram bot covers it), Historial "¿cómo vengo?" (six-month summary, one trend chart with Meta compliance, categories month by month, what changed, merchants). Old ritmo.html and resumen.html redirect. Each piece of information lives in one place; Inicio only summarises and links.
- v21 (2026-10, owner request): Compromisos was removed and its content redistributed, nothing dropped. Loans receivable live in Inicio below the latest movements (the "Más" shortcuts were removed as redundant with the tab bar); this month's lending shows in the same section. Fixed charges live inside the "Fijo" detail sheet (tap Fijo in Gastos > Categoría > Subcategorías): paid count, progress, month timeline and the full list, open by default. Gastos is now Categoría · Días: the Pagos sub-tab is gone and its content sits inside Categoría as "Dónde más gastas" (real spending only, above Gasto hormiga) and "Con qué pagaste" (with the credit-card total inside). The new fourth tab, Inversiones "¿estoy invirtiendo lo que me propuse?", shows the broker portfolio from the screenshots sent to the bot (Portafolio sheet, USD) in soles at today's exchange rate, positions, evolution, contributions, and a 1/5/10/15-year estimate at the portfolio's current return (gain over cost; 7% a year only before the first screenshot). In a payment method's sheet, tapping Crédito or Débito lists that month's purchases of that kind. The monthly investment target (USD, key `__inversion__`) is budgeted in the same Presupuesto ecosystem but never counts toward the Meta: it is tracked as a discipline (done / on time / missing, streak, last six months) in Inversiones, Presupuesto, and an Inicio alert. Fondo de emergencia is shown apart and does not count toward the target. The bot must send `portafolio` and `tc` (see tools/bot-inversiones.gs).
