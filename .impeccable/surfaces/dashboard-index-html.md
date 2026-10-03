---
version: 1
slug: "dashboard-index-html"
primary_target: "dashboard/index.html"
related_targets: ["dashboard/gastos.html","dashboard/ritmo.html","dashboard/compromisos.html"]
---

# Surface brief: Finanzas dashboard (all four tabs)

Scope: whole app shell (Inicio, Gastos, Ritmo, Compromisos, Resumen), detail sheets, budget sheet, access gate. Visitor mode: Operate.
Audience/job: Rodrigo checks the month's state on his phone in seconds; edits budgets at month end.
Constraints: static HTML/CSS/vanilla JS, no build; every function, calculation, storage key and copy meaning preserved; card order inside a tab may change. Dark only, brand 381 (#7CFA9E on #101014), confirmed by the user.
Unresolved: real data never seen by the designer (previews used labelled mock data).

## Direction contract

THESIS: The state of the month reads like a Lima chicha poster: a full-width fluorescent band shouting where you stand. Refuses the category default of a grey dashboard with a tiny green "on track" chip.
OWN-WORLD: Ground #101014, cards #18181D, sunken #202027. Celeste #5AC8FA = interface (primary, selection, links, charts); traffic light only for state: green #7CFA9E on pace, yellow #FFD84D tight, red #FF5A5F over (v15, owner prefers blue). Logo keeps its 381 green. Anton (condensed poster face) only for headline figures, tab and sheet titles and the state band; system sans for every label, row and control. Tabler outline icons. Radii: cards 18, inner blocks 12, controls 10-12, state tags 6. Motion at v13 timings with transform/opacity-only live loops.
STORY: He opens the app, sees the month total in poster numerals and a coloured band telling him if he is on pace; one tap deeper explains which category caused it.
FIRST VIEWPORT: Header (animated 381 logo, connection pill), uppercase Anton tab title with month selector, "Gasto del mes" card with the total in Anton ~70px, delta chips and category stack bar; directly below the Meta card opening with the state band (e.g. VAS A PASARTE on pink) and the projection. Bottom floating tab bar on mobile, left rail on desktop.
FORM: Cartel chicha, position 6 of 7 on the grounded list (1 LED scoreboard, 2 arcade HUD, 3 boleta receipt, 4 split-flap board, 5 league table, 6 chicha poster, 7 savings passbook); seed key 97718b3a (degraded roll, no challengers).
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
