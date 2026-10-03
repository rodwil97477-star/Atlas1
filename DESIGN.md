---
name: Finanzas 381
description: Dark, poster-voiced personal finance dashboard in the 381 brand
colors:
  ground-381: "#101014"
  rail: "#0B0B0E"
  card: "#18181D"
  sunken: "#202027"
  raised: "#2A2A33"
  label: "#EEEFF2"
  label-2: "#BABCC5"
  label-3: "#8D8F9A"
  label-4: "#5D5F6A"
  celeste: "#5AC8FA"
  celeste-hover: "#7DD3FC"
  celeste-ink: "#03263B"
  verde-ok: "#7CFA9E"
  amarillo-justo: "#FFD84D"
  rojo-alto: "#FF5A5F"
  naranja-aviso: "#FFA94D"
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
  cartel-hero:
    fontFamily: "Anton, Arial Narrow, sans-serif"
    fontSize: "clamp(56px, 17vw, 76px)"
    fontWeight: 400
    lineHeight: 0.92
    letterSpacing: "0.005em"
  cartel-title:
    fontFamily: "Anton, Arial Narrow, sans-serif"
    fontSize: "clamp(32px, 10vw, 44px)"
    fontWeight: 400
    lineHeight: 0.95
    letterSpacing: "0.01em"
  cartel-band:
    fontFamily: "Anton, Arial Narrow, sans-serif"
    fontSize: "38px"
    fontWeight: 400
    lineHeight: 0.9
    letterSpacing: "0.01em"
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

**Creative North Star: "El Cartel 381"**

The dashboard reads the month the way a Lima chicha poster reads a concert: one loud, fluorescent band says where you stand, and everything around it stays calm and legible. The ground is the near-black of the 381 logo tile; the interface speaks in a light sky blue (celeste), the owner's favourite colour, so that green, yellow and red are free to mean only one thing: how the month is going. Loudness is rationed to the things that need a decision: the month total, the state of the budget, and figures that crossed a line.

It is a working tool opened several times a day on a phone. Density is that of a daily app (cards of 18px padding, 12px gaps), rows and labels use the platform's own sans for speed, and only headline figures, tab titles and the state band switch to the condensed poster face. Motion is unhurried and alive: cards float up with a soft blur, bars grow, chart dots pop in, and small live details keep breathing (the newest point of a chart pings, today's calendar day glows, the "en vivo" dot beats). Every loop is built on transform and opacity so it costs almost no battery.

**Key Characteristics:**
- Dark only, on the 381 ground (#101014), with tonal layers instead of shadows.
- One interface accent, celeste; the 381 green lives on in the logo and as the "on pace" light.
- A three-light state vocabulary: green on pace, yellow tight, red over.
- Poster numerals (Anton) for the few numbers that matter most; system sans for everything you read in a list.
- Unhurried motion with live details, tuned to the owner's taste (v13 timings), never repainting in a loop.

## Colors

A near-black ground with one celeste interface accent and a green/yellow/red traffic light; categories get their own full-spectrum set where every colour hints at its meaning and siblings are measurably distinct.

### Primary
- **Celeste**: the interface. Primary and soft buttons, current tab, selection, focus ring, links, the spending line and calendar heat, the "nuevo" tag, today's ring in the calendar.

### Secondary (traffic light, information only)
- **Verde OK**: "en camino", spend that went down, "en vivo", paid fixed charges.
- **Amarillo Justo**: "vas justo" (projection within 90 to 100% of the Meta), budget bars at 90% or more, the "Actualizando" connection state.
- **Rojo Alto**: "te pasaste / vas a pasarte", spend that went up, over-budget rows, the Meta line in charts, gate errors.
- The "Para no pasarte / Para frenar" box takes the colour of the month's state, so a green box always means the month is going well.

### Tertiary
- **Naranja Aviso**: pending fixed charges and the ant-spending alert.
- **Verde logo 381**: only inside the 381 logo mark.

### Categories
Each category colour suggests what it is and is clearly different from its siblings (checked with OKLab distance, including colour-blind simulation; every sibling pair is at least 0.10 apart, 0.045 under deuteranopia/protanopia, and 4.5:1 on Card).
- **Level 1:** Personal blue, Social orange, Finanzas turquoise, Terceros lilac (Ingresos pale mint).
- **Personal:** Fijo blue, Variable coral, Salud mint, Auto slate.
- **Social:** Pareja fuchsia, Amigos amber, Trabajo indigo.
- **Finanzas:** Inversiones light cyan, Préstamos lavender.
- **Sub-subcategories** follow the same logic (food in oranges, home and transport in blues, health in mint and teal, gifts and events in pink/violet); see `COLOR_N3` in data.js.
- **Weekday groups:** Lun-Jue blue, Vie-Dom orange. Payment methods and unknown categories draw from a 12-colour reserve set in the same family.

### Neutral
- **381 Ground**: page background and the logo tile.
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

**Display Font:** Anton (self-hosted, `fonts/anton-latin.woff2`, with Arial Narrow fallback)
**Body Font:** the system UI sans (SF Pro on Apple, Segoe UI on Windows)

**Character:** A condensed poster face shouting a few numbers, over a quiet native sans that does all the reading. All figures use tabular numerals.

### Hierarchy
- **Cartel hero** (Anton 400, clamp(56px, 17vw, 76px), line-height 0.92): the month total, the budget total, sheet totals; 48 to 60px variant inside sheets; 40px for secondary figures (loans receivable, day value 46px).
- **Cartel title** (Anton 400, clamp(32px, 10vw, 44px), uppercase): the tab title next to the month selector; 52px on desktop.
- **Cartel band** (Anton 400, 38px, uppercase): the state word inside the state band only.
- **Cartel figure** (Anton 400, 34px, in the state colour): the daily cap in "Para no pasarte" / "Para frenar".
- **Sheet title** (Anton 400, 30px, uppercase): the title of every detail sheet.
- **Title** (650, 15px): card headings, in sentence case.
- **Body** (500, 15px, 1.5): explanatory sentences inside cards, max 62ch.
- **Row** (600, 14.5px): list item names and amounts (700).
- **Label** (550, 12px): metric labels, captions, axis labels.

### Named Rules
**The Few Loud Numbers Rule.** Anton is reserved for tab and sheet titles, at most one hero figure per card, the daily cap and the state band. Rows, chips, metrics, buttons and labels always use the system sans.
**The No Eyebrow Rule.** Card headings are real headings in sentence case; there are no small uppercase tracked labels above them.

## Layout

Single column on phones (max 560px, 16px side gutters, 12px between cards, bottom padding that clears the floating tab bar). From 880px the tab bar becomes a 232px sticky side rail and the content column is 720px; from 1150px cards flow into an auto-fit grid of 420px minimum columns with 20px gaps, and cards marked wide span the full row. Grid rows align to the top: cards keep their natural height rather than stretching to match a taller neighbour. List rows put the progress bar under the name so names never truncate. Inside cards the rhythm is 14px between blocks (6px in list-heavy "tight" cards).

## Elevation & Depth

Flat and tonal. Depth comes from stepping surfaces (ground, card, sunken, raised) plus a 1px top highlight on cards (`inset 0 1px 0 rgba(255,255,255,0.05)`). Real shadows exist only on things that float above the page: the mobile tab bar (`0 12px 32px rgba(0,0,0,0.55)` plus a 1px light outline) and the detail sheet.

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
The top of the Meta card (Inicio) and the Presupuesto card (Ritmo) is a full-width band in the state colour with the state word in Anton uppercase (a pulsing dot precedes it when over budget) and the reference (Meta or day of month) in small dark text. Smaller contexts (the per-category budget inside a sheet) use the compact state tag: the same colour as a 6px-corner uppercase tag.

### Detail Sheet
Rises from the bottom on phones (550ms, cubic-bezier(0.32,0.72,0,1)), drag to dismiss; on desktop it is a centred window that fades and scales from 0.96 in 350ms.

### Icons
Tabler Icons (MIT), outline, 2px stroke on a 24px grid, copied as paths into data.js (no runtime dependency). Each category has its own pictogram (basket for groceries, gas pump for fuel, piggy bank for savings...); navigation uses the same family.

### Resumen (fifth tab)
The last six months: period total in Anton with six metric tiles, a months-by-category heat map (intensity = that category's own highest month; on phones the name sits above its row), "Qué cambió" with diverging bars (red right for increases, green left for decreases, same days of the previous month while a month is in progress) and the period's merchants.

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
- **Don't** set rows, chips, metrics or buttons in Anton.
- **Don't** speed motion up below the v13 timings; the owner prefers the slower feel.
- **Don't** reintroduce a light theme, the old violet accent, or green as the interface colour.
