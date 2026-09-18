# MediDash — Cloud Agent Handoff

## Canonical repository

**All new lab results and dashboard updates must be committed and pushed to this repo (`Lelouchzhu/MediDash`) on `main`.**

Do **not** update `Lelouchzhu/Allmond` for clinical dashboard work.

## Read first

1. **[`CONTEXT.md`](CONTEXT.md)** — clinical timeline, PCT naming traps, latest labs  
2. **[`testset/README.md`](testset/README.md)** — **mandatory screenshot backup + extraction testset**  
3. **[`docs/transcripts/`](docs/transcripts/)** — prior agent conversation summaries  
4. This file — short operating rules  
5. **`index.html`** — live dashboard (categorized trends for all metrics)

## Purpose

Self-contained mobile perioperative monitoring dashboard. **Not medical advice.**

## Clinical zero point

- Surgery end: **2026-09-15 14:00** (D0 10:00–14:00)
- Relative hours from surgery end

## Mandatory on every new report image

1. Copy screenshot → `testset/reports/<category>/` (or `inbox/`)
2. Register in `testset/manifest.json`
3. Extract values into `index.html` (`baseReadings` / `labReadings` + cards/timeline)
4. Update `CONTEXT.md` if the clinical story changed
5. Commit + push **MediDash**

## Dashboard trends

`index.html` now has **分类汇总** (all metrics by system with sparklines) plus **详细趋势** (pick category → pick metric). Categories: 灌注/酸碱, 氧合, 感染/炎症, 肾脏, 凝血/血细胞, 肝/肌酶, 电解质.

## Preview

https://htmlpreview.github.io/?https://github.com/Lelouchzhu/MediDash/blob/main/index.html
