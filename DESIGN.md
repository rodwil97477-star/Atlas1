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
  verde-381: "#7CFA9E"
  verde-381-hover: "#62E888"
  verde-ink: "#07210F"
  amarillo-chicha: "#FFD84D"
  rosa-chicha: "#FF5C7A"
  naranja-aviso: "#FFA94D"
  cian-info: "#5CE1E6"
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
    backgroundColor: "{colors.verde-381}"
    textColor: "{colors.verde-ink}"
    rounded: "{rounded.block}"
    padding: "0 16px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.verde-381-hover}"
  button-soft:
    backgroundColor: "rgba(124,250,158,0.11)"
    textColor: "{colors.verde-381}"
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
    backgroundColor: "{colors.verde-381}"
    textColor: "{colors.ground-381}"
    rounded: "{rounded.tag}"
    padding: "4px 8px"
---

# Design System: Finanzas 381

## Overview

**Creative North Star: "El Cartel 381"**

The dashboard reads the month the way a Lima chicha poster reads a concert: one loud, fluorescent band says where you stand, and everything around it stays calm and legible. The ground is the near-black of the 381 logo tile; the voice is the logo's green. Loudness is rationed to the things that need a decision: the month total, the state of the budget, and figures that crossed a line.

It is a working tool opened several times a day on a phone. Density is that of a daily app (cards of 18px padding, 12px gaps), rows and labels use the platform's own sans for speed, and only headline figures, tab titles and the state band switch to the condensed poster face. Motion is quiet: things arrive once, bars grow to show quantity, and nothing loops except the logo's dust trail.

**Key Characteristics:**
- Dark only, on the 381 ground (#101014), with tonal layers instead of shadows.
- One brand accent, the 381 green, which also means "on pace".
- A three-step state vocabulary borrowed from chicha posters: green, yellow, pink.
- Poster numerals (Anton) for the few numbers that matter most; system sans for everything you read in a list.
- Motion that confirms and explains, never decorates.

## Colors

A near-black ground with one fluorescent brand green and two fluorescent state colours; categories get their own full-spectrum set where every colour hints at its meaning and siblings are measurably distinct.

### Primary
- **Verde 381**: the brand. Primary buttons, current tab, selection, focus ring, the spending line in charts, and the "en camino" / spend-went-down state.

### Secondary
- **Amarillo Chicha**: "vas justo" (projection within 90 to 100% of the Meta), budget bars at 90% or more, the "Actualizando" connection state.
- **Rosa Chicha**: "te pasaste / vas a pasarte", spend that went up, over-budget rows, the Meta line in charts, gate errors.

### Tertiary
- **Naranja Aviso**: pending fixed charges and the ant-spending alert.
- **Cian Info**: the "nuevo" merchant tag and the new-merchant alert.

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
**The Three Lights Rule.** State is only ever green, yellow or pink, in that meaning. No other colour may say "good" or "bad".
**The Tell Them Apart Rule.** Two categories that can appear side by side (siblings, the stack bar, the donut) must be at least 0.10 apart in OKLab and stay distinguishable under colour-blind simulation. Measure before adding a colour.
**The No Borrowed Lights Rule.** Category colours stay clear of the exact state colours (OKLab distance at least 0.09 from the 381 green, chicha yellow and chicha pink).

## Typography

**Display Font:** Anton (self-hosted, `fonts/anton-latin.woff2`, with Arial Narrow fallback)
**Body Font:** the system UI sans (SF Pro on Apple, Segoe UI on Windows)

**Character:** A condensed poster face shouting a few numbers, over a quiet native sans that does all the reading. All figures use tabular numerals.

### Hierarchy
- **Cartel hero** (Anton 400, clamp(56px, 17vw, 76px), line-height 0.92): the month total, the budget total, sheet totals; 48 to 60px variant inside sheets; 40px for secondary figures (loans receivable, day value 46px).
- **Cartel title** (Anton 400, clamp(32px, 10vw, 44px), uppercase): the tab title next to the month selector; 52px on desktop.
- **Cartel band** (Anton 400, 38px, uppercase): the state word inside the state band only.
- **Cartel figure** (Anton 400, 34px, Verde 381): the daily cap in "Para no pasarte" / "Para frenar".
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
- **Primary:** Verde 381 fill with dark green ink, 44px tall, used once per view for the main commit (Guardar, Entrar, Configurar presupuesto).
- **Soft:** translucent green fill with green text for secondary actions (Gestionar presupuesto).
- **Ghost:** transparent with a hairline ring, for Cambiar / Quitar.
- **Feedback:** press scales to 0.97 in 140ms ease-out; hover (pointer devices only) deepens the fill.

### Chips
- **Style:** sunken fill, 8px corners, 12.5px label; up/down variants tint pink or green with a drawn arrow icon (never a text glyph).

### Cards / Containers
- **Corner Style:** 18px.
- **Background:** Card.
- **Shadow Strategy:** none; 1px top highlight.
- **Internal Padding:** 18px on phones, 22 by 24px on desktop.

### Inputs / Fields
- **Style:** sunken fill, 1px faint edge, 12px corners, 16px text to avoid iOS zoom.
- **Focus:** edge turns Verde 381; caret and selection are green.

### Navigation
- **Mobile:** floating frosted bar (82% card colour, 20px blur), four tabs with icon over label; current tab in green on a translucent green field.
- **Desktop:** sticky side rail on the darker Rail colour, icon and label in a row, hover lifts to a faint fill.

### State Band (signature)
The top of the Meta card (Inicio) and the Presupuesto card (Ritmo) is a full-width band in the state colour with the state word in Anton uppercase and the reference (Meta or day of month) in small dark text. Smaller contexts (the per-category budget inside a sheet) use the compact state tag: the same colour as a 6px-corner uppercase tag.

### Detail Sheet
Rises from the bottom on phones (420ms, cubic-bezier(0.32,0.72,0,1); exits in 300ms), drag to dismiss; on desktop it is a centred window that fades and scales from 0.97 in 220ms.

## Do's and Don'ts

### Do:
- **Do** put the state of the month in the band, in its colour, before any explanation.
- **Do** run `python3 tools/verificar_colores.py dashboard/data.js` after changing any category colour; it must report 0 problems (see The Tell Them Apart Rule).
- **Do** keep entrance motion to one pass: opacity plus 8px, 320ms cubic-bezier(0.23,1,0.32,1), 40ms stagger, bars growing from their base in 420ms.
- **Do** honour the global reduced-motion rule; every animation is plain CSS `animation`/`transition` so it switches off.
- **Do** use drawn SVG icons in one 2px stroke family.

### Don't:
- **Don't** use green, yellow or pink for anything that is not a state (see The Three Lights Rule).
- **Don't** set rows, chips, metrics or buttons in Anton.
- **Don't** add infinite decorative animations (pulsing dots, bobbing arrows, glowing bars); the only loops are the 381 logo trail and the "Actualizando" indicator.
- **Don't** reintroduce a light theme or the old violet accent.
