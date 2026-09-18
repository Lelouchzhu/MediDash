# MediDash — Cloud Agent Handoff

## Canonical repository

**All new lab results and dashboard updates must be committed and pushed to this repo (`Lelouchzhu/MediDash`) on `main`.**

Do **not** update `Lelouchzhu/Allmond` for clinical dashboard work.

## Read first

1. **[`CONTEXT.md`](CONTEXT.md)** — full clinical timeline, PCT naming traps, latest labs, update workflow
2. **[`docs/transcripts/2026-09-18-bc-01a0a01a-summary.md`](docs/transcripts/2026-09-18-bc-01a0a01a-summary.md)** — prior agent conversation summary (劝说/择院 → ICU 监测 → dashboard → MediDash 迁移)
3. This file — short operating rules
4. **`index.html`** — live dashboard data

## Purpose

Self-contained mobile perioperative monitoring dashboard for family-side trend tracking after bowel ischemia surgery. **Not medical advice.**

## Repo layout

| Path | Role |
|------|------|
| `index.html` | Entire app (UI + data + charts + checklist). Edit this file for clinical updates. |
| `CONTEXT.md` | Living clinical memory and naming traps. |
| `docs/transcripts/` | Dated summaries of long agent runs (not full chat dumps). |
| `parse-lab-report.js` | Shared parser for blood-gas / coag / biochem screenshot or pasted text. |
| `parse-lab-report.test.mjs` | Parser unit tests (`node --test parse-lab-report.test.mjs`). |
| `fixtures/` | De-identified synthetic screenshots for ingest tests. Never store real clinical photos. |
| `.cursor/environment.json` | Cloud Agent serve config (`python3 -m http.server 8080`). |
| `README.md` | Human preview / local run notes. |
| `AGENTS.md` | This handoff for future Cloud Agents. |

## Clinical zero point

- Surgery end: **2026-09-15 14:00** (D0 10:00–14:00)
- Relative hours from surgery end

## Latest snapshot (see CONTEXT.md for detail)

- PCT **146.421 → 170.297 → 101.563** ng/mL
- CRRT on; Cr 212; UO overnight 70 mL
- Lactate 1.97; FiO₂ 50%; P/F 169
- APTT 50.8; INR 1.24; Hb 85 g/L; PLT 65

## How to update

1. Read uploaded lab images / values. If a turn has no image, say so and do not invent labs.
2. Compute `h` from surgery end **2026-09-15 14:00**.
3. Update `index.html` (`baseReadings`, `labReadings`, cards, reports, timeline, `doctorQuestions`, `latestNonBloodGasReport`).
4. Update `CONTEXT.md` if the clinical story changed.
5. Commit, push `main` (or a `cursor/...` feature branch + PR).
6. Verify at `http://localhost:8080/index.html`.

**Do not commit real clinical photos.** Never confuse chem **PCT / 降钙素原**, CBC **血小板比积 / PCT**, and ABG **氧合指数 / P/F**.

## Family-side screenshot ingest (local only)

The add-result dialog accepts a new test-result screenshot without waiting for a Cloud Agent:

- Entry: **添加最新结果 → 从化验截图导入**
- Accepts camera, album, drag-and-drop, clipboard paste, or pasted report text
- Rejects PDF / files over 15MB; HEIC may preview-fail — ask for a system screenshot
- Client-side OCR fills the form when it can; review signs and hours before save
- Images are previewed only; they are not uploaded and not written into `localStorage`

Use `fixtures/sample-abg-screenshot.png` and `fixtures/sample-coag-screenshot.png` to regression-test acceptance.

## Preview

https://htmlpreview.github.io/?https://github.com/Lelouchzhu/MediDash/blob/main/index.html
