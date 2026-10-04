---
name: Finanzas 381
description: Dark personal finance dashboard in an Apple-native line (iOS Health, Fitness, Wallet) with the 381 brand
colors:
  ground: "#050506"
  rail: "#0A0A0B"
  card: "#1C1C1E"
  sunken: "#2C2C2E"
  raised: "#3A3A3C"
  label: "#F5F5F7"
  label-2: "#C7C7CC"
  label-3: "#8E8E93"
  label-4: "#545458"
  celeste: "#5AC8FA"
  celeste-hover: "#7DD3FC"
  celeste-ink: "#03263B"
  verde-ok: "#30D158"
  amarillo-justo: "#FFD60A"
  rojo-alto: "#FF453A"
  naranja-aviso: "#FF9F0A"
  verde-logo-381: "#7CFA9E"
  cat-personal-azul: "#5EA2FF"
  cat-social-naranja: "#FF9440"
  cat-finanzas-turquesa: "#2FD3C2"
  cat-terceros-lila: "#E7C9FF"
  cat-pareja-fucsia: "#FF8ADF"
  cat-amigos-ambar: "#FFB23E"
  cat-trabajo-indigo: "#7C7CFF"
  cat-salud-menta: "#34D6B0"
  cat-auto-pizarra: "#8E9AB8"
  cat-inversion-cian: "#9BE7FF"
  cat-prestamo-lavanda: "#C9A6FF"
typography:
  large-title:
    fontFamily: "-apple-system, SF Pro Display, system-ui, sans-serif"
    fontSize: "34px (auto-fits down to 20px next to the month selector)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  hero-figure:
    fontFamily: "ui-rounded, SF Pro Rounded, -apple-system, system-ui, sans-serif"
    fontSize: "clamp(40px, 12vw, 48px); 44px on the Inicio summary"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.025em"
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Segoe UI, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 650
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Segoe UI, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 500
    lineHeight: 1.5
    fontFeature: "tnum"
  row:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Segoe UI, system-ui, sans-serif"
    fontSize: "14.5px"
    fontWeight: 600
    lineHeight: 1.35
    fontFeature: "tnum"
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Segoe UI, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 550
    lineHeight: 1.4
rounded:
  tag: "6px"
  control: "10px"
  block: "12px"
  card: "18px"
  sheet: "22px"
  pill: "999px"
spacing:
  xs: "6px"
  sm: "8px"
  md: "12px"
  lg: "14px"
  xl: "18px"
components:
  button-primary:
    backgroundColor: "{colors.celeste}"
    textColor: "{colors.celeste-ink}"
    rounded: "{rounded.block}"
    padding: "0 16px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.celeste-hover}"
  button-soft:
    backgroundColor: "rgba(90,200,250,0.12)"
    textColor: "{colors.celeste}"
    rounded: "{rounded.block}"
    padding: "0 16px"
    height: "44px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.label-2}"
    rounded: "{rounded.block}"
    height: "36px"
  card:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.card}"
    padding: "18px"
  input:
    backgroundColor: "{colors.sunken}"
    textColor: "{colors.label}"
    rounded: "{rounded.block}"
    height: "44px"
  chip:
    backgroundColor: "{colors.sunken}"
    textColor: "{colors.label-2}"
    rounded: "8px"
    padding: "6px 10px"
  state-tag:
    backgroundColor: "{colors.verde-ok}"
    textColor: "{colors.ground-381}"
    rounded: "{rounded.tag}"
    padding: "4px 8px"
---

# Design System: Finanzas 381

## Overview

**Creative North Star: "Native, then ours"**

Since v18 (2026-10) the app speaks the visual language its owner lives in every day on his iPhone: iOS Health, Fitness and Wallet. Large titles, grouped surfaces with continuous corners, the system type (SF Pro Display for titles, SF Pro Rounded for figures), Settings-style coloured icons and the iOS system colours for the traffic light. The 381 brand stays in the pixel logo and the celeste accent. The quality bar is detail: every figure sits on a tabular grid and is optically centred, separators run with equal margins on both sides, text never truncates, and nothing collides from 320px up (checked by an automated defect scanner on every tab).

It is a working tool opened several times a day on a phone. Motion is unhurried: the Meta ring draws once on entry, cards rise softly, "Ver detalle" expands with an ease-out, rows and buttons give press feedback. Loops use transform and opacity only.

**Key Characteristics:**
- Dark only, on a near-black ground (#050506) with #1C1C1E grouped surfaces; no shadows except on floating material (tab bar, sheet).
- One interface accent, celeste; green/yellow/red (iOS system colours) mean on pace, tight and over.
- Fitness-style Meta ring on Inicio: used share, projected close and a tick for today's ideal pace; the percentage alone in the centre.
- State as coloured text with its icon (Health style), not a poster band.
- System type throughout: SF Pro Display titles, SF Pro Rounded figures, SF Pro Text for reading.

## Colors

A near-black ground with #1C1C1E grouped surfaces, one celeste interface accent and the iOS green/yellow/red traffic light; categories get their own full-spectrum set where every colour hints at its meaning and siblings are measurably distinct.

### Primary
- **Celeste**: the interface. Primary and soft buttons, current tab, selection, focus ring, links, the spending line and calendar heat, the "nuevo" tag, today's ring in the calendar.

### Secondary (traffic light, information only)
- **Verde OK**: "en camino", spend that went down, paid fixed charges. (The "En vivo" connection pill is celeste: it is interface status, not a verdict.)
- **Amarillo Justo**: "vas justo" (projection within 90 to 100% of the Meta), budget bars at 90% or more, the "Actualizando" connection state.
- **Rojo Alto**: "te pasaste / vas a pasarte", spend that went up, over-budget rows, the Meta line in charts, gate errors.
- The "Para no pasarte / Para frenar" box takes the colour of the month's state, so a green box always means the month is going well.

### Tertiary
- **Naranja Aviso**: pending fixed charges and the ant-spending alert.
- **Verde logo 381**: only inside the 381 logo mark (numerals as a #A8FFC4 to #5FEA89 vertical gradient around it).

### Categories
Each category colour suggests what it is and is clearly different from its siblings (checked with OKLab distance, including colour-blind simulation; every sibling pair is at least 0.10 apart, 0.045 under deuteranopia/protanopia, and 4.5:1 on Card).
- **Level 1:** Personal blue, Social orange, Finanzas turquoise, Terceros lilac (Ingresos pale mint).
- **Personal:** Fijo blue, Variable coral, Salud mint, Auto slate.
- **Social:** Pareja fuchsia, Amigos amber, Trabajo indigo.
- **Finanzas:** Inversiones light cyan, Préstamos lavender.
- **Sub-subcategories** follow the same logic (food in oranges, home and transport in blues, health in mint and teal, gifts and events in pink/violet); see `COLOR_N3` in data.js.
- **Weekday groups:** Lun-Jue blue, Vie-Dom orange. Payment methods and unknown categories draw from a 12-colour reserve set in the same family.

### Neutral
- **Ground**: page background (#050506).
- **Rail**: desktop side navigation, a step darker than the ground.
- **Card**: every card surface.
- **Sunken**: metric tiles, inputs, segmented-control track, chips, inner blocks.
- **Raised**: the selected segment and hover on round icon buttons.
- **Label / Label-2 / Label-3**: primary text, secondary text, captions (all at least 4.5:1 on Card). **Label-4** is for chevrons and future-day outlines only, never text that must be read.

### Named Rules
**The Three Lights Rule.** Green, yellow and red mean on pace, tight and over, and nothing else. The interface itself is celeste, so a coloured element is either the interface or a verdict, never ambiguous.
**The Tell Them Apart Rule.** Two categories that can appear side by side (siblings, the stack bar, the donut) must be at least 0.10 apart in OKLab and stay distinguishable under colour-blind simulation. Measure before adding a colour.
**The No Borrowed Lights Rule.** Category colours stay clear of the celeste accent and the three lights (OKLab distance at least 0.09).

## Typography

**Titles:** SF Pro Display (system stack). **Figures:** SF Pro Rounded (`ui-rounded`), tabular numerals. **Reading:** SF Pro Text. On non-Apple devices the platform UI sans stands in. No web fonts are downloaded.

### Hierarchy
- **Large title** (700, 34px, -0.02em): the tab title; shrinks automatically (to 20px minimum) when it would touch the month selector.
- **Hero figure** (Rounded 700, 40 to 48px): the month total, budget total, sheet totals. **Secondary figure** (Rounded 700, 30px). **Daily cap** (Rounded 700, 28px).
- **Ring percentage** (Rounded 700, 25px, centred with `dominant-baseline: central`).
- **Card title** (650, 17px) with its supporting fact on a second line in Label-3 (13px), Health style; links ("Ver todos") stay on the right.
- **Section header outside a group** (Display 700, 22px) on Inicio's grouped lists.
- **Row** (500, 16px) with sub-line 13px; names wrap to two lines instead of truncating. Amounts Rounded 600, 16px.
- **Small text** keeps neutral tracking; negative tracking only at 17px and above.

### Named Rules
**The No Truncation Rule.** Names and labels never end in an ellipsis on screens 320px and up; they wrap, or the layout gives them room.
**The Centred Figure Rule.** A figure inside a shape (ring, donut) is the only thing in it and is optically centred; supporting words go outside.
**The No Eyebrow Rule.** Card headings are real headings in sentence case; there are no small uppercase tracked labels above them.

## Layout

Single column on phones (max 560px, 16px side gutters, 12px between cards, bottom padding that clears the floating tab bar). From 880px the tab bar becomes a 232px sticky side rail and the content column is 720px; from 1150px cards flow into an auto-fit grid of 420px minimum columns with 20px gaps, and cards marked wide span the full row. Grid rows align to the top: cards keep their natural height rather than stretching to match a taller neighbour. List rows put the progress bar under the name so names never truncate. Inside cards the rhythm is 14px between blocks (6px in list-heavy "tight" cards).

## Elevation & Depth

Flat and tonal, like iOS grouped lists: depth comes from stepping surfaces (ground, card, sunken, raised) with no card outlines. Translucent material (`backdrop-filter: blur(24px) saturate(180%)`, solid fallback under reduced transparency) and a real shadow exist only on what floats: the tab bar and the detail sheet. Separators are 1px `rgba(84,84,88,.55)` and always run with equal margins on both sides of their group.

### Named Rules
**The Float-Only Shadow Rule.** A shadow means "this is above the page" (tab bar, sheet). Cards never carry a drop shadow.

## Shapes

Softly squared. Cards 18px, inner blocks and inputs 12px, small buttons and calendar days 8 to 10px, state tags and chart bars 4 to 6px. Full pills are reserved for the connection indicator. The state band takes the card's top corners and runs edge to edge.

## Components

### Buttons
- **Shape:** gently squared (12px; 10px for small).
- **Primary:** Celeste fill with dark navy ink, 44px tall, used once per view for the main commit (Guardar, Entrar, Configurar presupuesto).
- **Soft:** translucent green fill with green text for secondary actions (Gestionar presupuesto).
- **Ghost:** transparent with a hairline ring, for Cambiar / Quitar.
- **Feedback:** press scales to 0.97 in 140ms ease-out; hover (pointer devices only) deepens the fill.

### Chips
- **Style:** sunken fill, 8px corners, 12.5px label; up/down variants tint red or green with a drawn arrow icon (never a text glyph).

### Cards / Containers
- **Corner Style:** 18px.
- **Background:** Card.
- **Shadow Strategy:** none; 1px top highlight.
- **Internal Padding:** 18px on phones, 22 by 24px on desktop.

### Inputs / Fields
- **Style:** sunken fill, 1px faint edge, 12px corners, 16px text to avoid iOS zoom.
- **Focus:** edge turns celeste; caret and selection are celeste.

### Navigation
- **Mobile:** floating frosted bar (82% card colour, 20px blur), five tabs (Inicio, Gastos, Ritmo, Compromisos, Resumen) with icon over label; current tab in celeste on a translucent celeste field. Slides up on load (700ms).
- **Desktop:** sticky side rail on the darker Rail colour, icon and label in a row, hover lifts to a faint fill.

### State Band (signature)
Since v18 the month's state is coloured text with its icon (trend-up when over, clock when tight, check on pace) at the top of the Inicio summary and the Presupuesto card, with the reference (day of month) in Label-3 on the right. Smaller contexts (the per-category budget inside a sheet) use a pill tinted in the state colour.

### Detail Sheet
Rises from the bottom on phones (550ms, cubic-bezier(0.32,0.72,0,1)), drag to dismiss; on desktop it is a centred window that fades and scales from 0.96 in 350ms.

### Icons
Tabler Icons (MIT), outline, 2px stroke on a 24px grid, copied as paths into data.js (no runtime dependency). Each category has its own pictogram (basket for groceries, gas pump for fuel, piggy bank for savings...); navigation uses the same family.

### Quiet by default (v17)
- Colour on a change only when it matters: deltas under 15% are grey; red and green are kept for real moves and for the traffic light.
- Neutral facts are plain grey text, not pills; pills are only for coloured changes.
- Metrics are rows divided by hairlines, never boxes inside a card.
- The state is coloured text with an icon, not a band.
- Inicio shows only state, total, meter and "Para no pasarte"; the rest sits behind "Ver detalle".
- Usage hints ("toca para…") show for the first three visits; page footnotes sit behind "Cómo se calcula".

### Logo 381
Pixel mark: solid 6x10-cell numerals (2-cell stroke, clipped corners, 7/200 cell) in a true italic `skewX(-12)`, logo green gradient, on a ground-coloured halo. Behind them run three currents of pixel breeze gusts: each gust is nine cells that step up or down one row halfway, from a faint celeste tail to a pale-cyan head. In the header (34px) and the gate (56px) each current is its own layer that slides exactly one gust period on a slow linear loop (6.5 to 9.5s, with a gentle opacity breath); numerals never move. Only transform and opacity are animated, so the global reduced-motion rule freezes it on the same pose as the static icon. Geometry lives in `tools/logo381.py`; never redraw it by hand.

### Historial (fifth tab, formerly Resumen)
The last six months, now also holding the single trend chart (curve, Meta line and a pill per month marked within/over the Meta): period total in SF Pro Rounded with six metrics, a months-by-category heat map (intensity = that category's own highest month; on phones the name sits above its row), "Qué cambió" with diverging bars (red right for increases, green left for decreases, same days of the previous month while a month is in progress) and the period's merchants.

### Data details (v16)
Small pieces that add information, each with its own motion:
- **Meta bar:** what you have spent (solid), where you will close at this pace (translucent fill with a 1.5px outline in the state colour, grows 1.1 s after the fill) and the ideal-pace mark (appears last, blinks softly). A legend names all three.
- **Ideal-pace tick:** a 2px mark on every budget bar (Gastos subcategories, Ritmo budget categories, the category sheet meter) at today's share of the month, so "ahead of pace" is visible before a budget is exceeded.
- **Touch layer on line charts:** touching, dragging, hovering or arrowing over Tendencia and Ritmo del mes shows a hairline guide, a dot and a raised card with the value, the month or day, and the distance to the Meta or ideal pace (green under, red over). Guide and card follow with a 160ms ease-out.
- **Close projection:** Ritmo del mes extends the accumulated line from today to the end of the month as a dotted line in the state colour, ending in "cierre ~S/ X".
- **Interactive donut:** tapping a legend row or a slice pins that category (others fade to 18%); its amount and share replace the total in the centre with a short rise. Hover previews on desktop.
- **Fixed-charge timeline:** the month as a line with today's position; paid charges are green dots, pending ones orange rings, same-day charges merge into one dot with a count, plus the next charge and how many days away.
- **Notice:** a pill that drops from the top (450ms) for new movements after a refresh, "ya estás al día" on a manual refresh, or a connection error.
- **Saved feedback:** a budget field flashes green with a check that pops in when a changed amount is saved.
- **Search highlight:** the matched text is marked in celeste inside each result, ignoring accents and case.
- **Month list:** each day header carries that day's total.
- **Payment methods:** one row per method with its debit/credit split, at most six colours plus grey.

## Do's and Don'ts

### Do:
- **Do** put the state of the month in the band, in its colour, before any explanation.
- **Do** run `python3 tools/verificar_colores.py dashboard/data.js` after changing any category colour; it must report 0 problems (see The Tell Them Apart Rule).
- **Do** keep the v13 rhythm: cards fadeUp 800ms (18px, slight blur) with 70ms stagger capped at 350ms, bars 900ms to 1s, lines draw in 1.2s, dots pop with a gentle overshoot, numbers count up in 1.2s, curve cubic-bezier(.16,1,.3,1).
- **Do** build every loop (pings, glows, rings, beating dots, bobbing arrows) on transform or opacity of its own layer; never animate box-shadow, which made the old version burn about 2 s of CPU every 5 s.
- **Do** honour the global reduced-motion rule; every animation is plain CSS `animation`/`transition` so it switches off.
- **Do** take new icons from Tabler (outline) so the stroke family stays consistent.

### Don't:
- **Don't** use green, yellow or red for anything that is not a state (see The Three Lights Rule).
- **Don't** truncate a name with an ellipsis or put a second word inside the Meta ring.
- **Don't** speed motion up below the v13 timings; the owner prefers the slower feel.
- **Don't** reintroduce a light theme, the old violet accent, or green as the interface colour.
