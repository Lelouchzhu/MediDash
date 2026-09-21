# MediDash — Cloud Agent Handoff

## Canonical repository

**All new lab results and dashboard updates must be committed and pushed to this repo (`Lelouchzhu/MediDash`) on `main`.**

Do **not** update `Lelouchzhu/Allmond` for clinical dashboard work.

## Read first

1. **[`CONTEXT.md`](CONTEXT.md)** — clinical timeline, PCT naming traps, latest labs
2. **[`testset/README.md`](testset/README.md)** — **mandatory screenshot backup + extraction testset**
3. **[`docs/transcripts/`](docs/transcripts/)** — prior agent conversation summaries (start with the newest dated file)
4. This file — short operating rules
5. **`index.html`** — live dashboard (categorized trends + screenshot ingest)
6. **[`README.md`](README.md)** — product overview for humans starting the repo

## Purpose

Self-contained mobile perioperative monitoring dashboard for family-side trend tracking after bowel ischemia surgery. **Not medical advice.**

## Repo layout

| Path | Role |
|------|------|
| `index.html` | Live dashboard (seeded report + screenshot ingest + oral add form). |
| `live.html` | Standalone 识图版 (inlined parser + seed). Built by `node scripts/build-template.mjs`. |
| `template.html` | Standalone 空白版 (no seed labs). Same builder. |
| `previews.html` | Public hub with htmlpreview / raw.githack links for both pages. |
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
- Relative hours from surgery end: `h = (report_datetime − 2026-09-15 14:00)`

## Naming traps (do not confuse)

| Label | Meaning | Do not treat as |
|-------|---------|-----------------|
| 降钙素原 / PCT (chem) | Procalcitonin ng/mL | Plateletcrit or P/F |
| 血小板比积 / PCT (CBC) | Plateletcrit % | Procalcitonin |
| 氧合指数 pO2(a)/FO2(I) | PaO₂/FiO₂ | Procalcitonin |

`be` on ABG sheets is **ABE** (this machine also prints SBE — store ABE).

## Norepinephrine concentration

Family-confirmed **0.05 mg/mL**. Convert only NE. **Do not invent dopamine mg/h.** **Do not invent weight.**

| mL/h | mg/h |
|------|------|
| 9 | 0.45 |
| 6 | 0.30 |
| 4 | 0.20 |

If the family only said “high / about half”, leave mL blank rather than guessing.

## Latest snapshot (see CONTEXT.md)

- Chemistry 09:18 (139h18m): PCT **36.8855**, Cr **231**, ALB **35.8**, CRP **97.7**, IL-6 **68.5**
- ABG 10:53 (140h53m): lactate **1.54**, P/F **179**, Hb **8.9**, pH **7.515**
- CBC 09:16: Hb **100**, WBC **19.40**, PLT **60**
- APTT **51.8** (141h07m)
- Norepinephrine **4 mL/h = 0.20 mg/h** + dopamine **7.5 mL/h**; BP **150/55**; CRRT this run **19h48min** then stopped, still no urine

## Mandatory on every new report image

1. Copy screenshot → `testset/reports/<category>/` (or `inbox/`). Name `{YYYYMMDDTHHMMSS}__{original}` when the clock is known. Hires copies use `__hires__` in the filename (typical 3520×3772).
2. Register in `testset/manifest.json` (`count++`, `labeled`, `extracted`, `relative_h`).
3. Extract values into `index.html`:
   - `baseReadings` — ABG
   - `labReadings` — chem / CBC / coag / inflammation
   - `vitalReadings` — oral BP / HR / pressors (approximate `h`)
   - cards, insights, timeline, `doctorQuestions`
   - `latestNonBloodGasReport` when a non-ABG clock is newer than the last arterial
   - new fields also go in `metricConfig` + `metricGroups`
4. Update `CONTEXT.md` if the clinical story changed.
5. Syntax-check the dashboard script: extract the `<script>` body to `/tmp/medidash-check.js` and run `node --check /tmp/medidash-check.js`.
6. Commit + push **MediDash `main`**. Do not print tokens.

### Same-clock replace and hires

- **Keep the old file.** Never delete a superseded screenshot.
- Old entry: `preferred: false` and `superseded_by` (or a SUPERSEDED note).
- New entry: `preferred: true`. For a sharper copy of the same sheet, prefix `__hires__`.
- Prefer the **hires printed table** over phone-crop OCR (example: 10:53 lactate OCR 1.554 → hires **1.54**).
- OCR from video/computer-use often garbles Chinese (e.g. 36.9 → 96.39). Trust the code + the sheet.
- Do **not** infinitely slice tall phone crops (a 1080×15826 ABG once filled the disk). Use a finite slice loop.

Never confuse chem **PCT / 降钙素原**, CBC **血小板比积 / PCT**, and ABG **氧合指数 / P/F**.

## Dashboard trends

`index.html` has **分类汇总** (all metrics by system with sparklines) plus **详细趋势** (pick category → pick metric).

Categories: **循环/支持**, 灌注/酸碱, 氧合, 感染/炎症, 肾脏, 凝血/血细胞, 肝/肌酶, 电解质.

- First `metricGroups` entry is **循环/支持**: `map`, `sbp`, `dbp`, `hr`, `ne`, `da`.
- BP/pressor oral points live in `vitalReadings` and also draw dedicated `#bpTrend` / `#pressorTrend` via `renderMultiSeriesChart`.
- `ne` / `da` use `noRef` (oral mL/h, not a lab reference).
- Infection group: `pct`, `crp`, `il6`, `wbc`.

## Family-side screenshot ingest (local only)

The add-result dialog accepts a new test-result screenshot without waiting for a Cloud Agent:

- Entry: **添加最新结果 → 从化验截图导入**
- Accepts camera, album, drag-and-drop, clipboard paste, or pasted report text
- Rejects PDF / files over 15MB; HEIC may preview-fail — ask for a system screenshot
- Client-side OCR (`chi_sim+eng`) fills the form when it can; review signs and hours before save
- Images are previewed only; they are not uploaded and not written into `localStorage`
- Oral / bedside fields: SBP/DBP, pulse, RR, NE/DA mL/h, pressors, CRRT dehydrate/HF/IV, urine
- Lab form also has CRP next to PCT (do not confuse chem PCT / CBC plateletcrit / ABG P/F)
- Standalone pages: `live.html` (识图版, seeded) and `template.html` (空白版); or `index.html?mode=template` (separate `localStorage`)
- Coverage: `node scripts/replay-coverage.mjs` against `data/current-report.js`
- Regression: `fixtures/` synthetic shots plus labeled files in `testset/reports/`

## Preview

`main` (canonical; do not overwrite from feature branches):

https://htmlpreview.github.io/?https://github.com/Lelouchzhu/MediDash/blob/main/index.html

Feature-branch web pages (`cursor/empty-template-replay-b98e`, not `main`):

- Hub: https://htmlpreview.github.io/?https://github.com/Lelouchzhu/MediDash/blob/cursor/empty-template-replay-b98e/previews.html
- 识图版: https://htmlpreview.github.io/?https://github.com/Lelouchzhu/MediDash/blob/cursor/empty-template-replay-b98e/live.html
- 空白版: https://htmlpreview.github.io/?https://github.com/Lelouchzhu/MediDash/blob/cursor/empty-template-replay-b98e/template.html
- Backup: https://raw.githack.com/Lelouchzhu/MediDash/cursor/empty-template-replay-b98e/live.html · https://raw.githack.com/Lelouchzhu/MediDash/cursor/empty-template-replay-b98e/template.html
