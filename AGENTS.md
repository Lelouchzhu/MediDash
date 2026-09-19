# MediDash — Cloud Agent Handoff

## Canonical repository

**All new lab results and dashboard updates must be committed and pushed to this repo (`Lelouchzhu/MediDash`) on `main`.**

Do **not** update `Lelouchzhu/Allmond` for clinical dashboard work.

## Read first

1. **[`CONTEXT.md`](CONTEXT.md)** — clinical timeline, PCT naming traps, latest labs
2. **[`testset/README.md`](testset/README.md)** — **mandatory screenshot backup + extraction testset**
3. **[`docs/transcripts/`](docs/transcripts/)** — prior agent conversation summaries
4. This file — short operating rules
5. **`index.html`** — live dashboard (categorized trends + screenshot ingest)

## Purpose

Self-contained mobile perioperative monitoring dashboard for family-side trend tracking after bowel ischemia surgery. **Not medical advice.**

## Repo layout

| Path | Role |
|------|------|
| `index.html` | Live dashboard (seeded report + screenshot ingest + oral add form). |
| `template.html` | Empty replay shell (no seed labs). Rebuild with `node scripts/build-template.mjs`. |
| `data/current-report.js` | Extract of the live seed + oral bedside series for coverage compare. |
| `CONTEXT.md` | Living clinical memory and naming traps. |
| `docs/transcripts/` | Dated summaries of long agent runs (not full chat dumps). |
| `testset/` | Archived report screenshots + `manifest.json` for re-extraction tests. |
| `parse-lab-report.js` | Shared parser for blood-gas / coag / biochem screenshot or pasted text. |
| `parse-lab-report.test.mjs` | Parser unit tests (`node --test parse-lab-report.test.mjs`). |
| `fixtures/` | De-identified synthetic screenshots for ingest tests. |
| `.cursor/environment.json` | Cloud Agent serve config (`python3 -m http.server 8080`). |
| `README.md` | Human preview / local run notes. |
| `AGENTS.md` | This handoff for future Cloud Agents. |

## Clinical zero point

- Surgery end: **2026-09-15 14:00** (D0 10:00–14:00)
- Relative hours from surgery end

## Latest snapshot (see CONTEXT.md)

- ABG 06:44 (88h44m): lactate **2.14**, P/F **210**, FiO₂ 50%
- CBC 08:46 (90h46m): Hb **76**, PLT **55**, WBC 13.17
- APTT **67.2** (80h13m); was 64.0 at 76h
- Bedside ~73h: BP **120/35**, HR **109**, dual pressors ~½ max
- CRRT on; urine since morning **20 mL**
- PCT **146.421 → 170.297 → 101.563**; Cr 212

## Mandatory on every new report image

1. Copy screenshot → `testset/reports/<category>/` (or `inbox/`)
2. Register in `testset/manifest.json`
3. Extract values into `index.html` (`baseReadings` / `labReadings` + cards/timeline)
4. Update `CONTEXT.md` if the clinical story changed
5. Commit + push **MediDash**

Never confuse chem **PCT / 降钙素原**, CBC **血小板比积 / PCT**, and ABG **氧合指数 / P/F**.

## Dashboard trends

`index.html` has **分类汇总** (sparklines by system) plus **详细趋势** (pick category → metric). Categories: 灌注/酸碱, 氧合, 感染/炎症, 肾脏, 凝血/血细胞, 肝/肌酶, 电解质.

## Family-side screenshot ingest (local only)

The add-result dialog accepts a new test-result screenshot without waiting for a Cloud Agent:

- Entry: **添加最新结果 → 从化验截图导入**
- Accepts camera, album, drag-and-drop, clipboard paste, or pasted report text
- Rejects PDF / files over 15MB; HEIC may preview-fail — ask for a system screenshot
- Client-side OCR (`chi_sim+eng`) fills the form when it can; review signs and hours before save
- Images are previewed only; they are not uploaded and not written into `localStorage`
- Oral / bedside fields: SBP/DBP, pulse, RR, pressors, CRRT dehydrate/HF/IV, urine
- Empty replay page: `template.html` or `index.html?mode=template` (separate `localStorage`)
- Coverage: `node scripts/replay-coverage.mjs` against `data/current-report.js`
- Regression: `fixtures/` synthetic shots plus labeled files in `testset/reports/`

## Preview

https://htmlpreview.github.io/?https://github.com/Lelouchzhu/MediDash/blob/main/index.html
