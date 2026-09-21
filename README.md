# MediDash

Mobile-friendly perioperative monitoring dashboard for family-side trend tracking. **This repository is the source of truth.** New lab results, report screenshots (`testset/`), and dashboard updates go here (`Lelouchzhu/MediDash` on `main`), not to the old Allmond fork.

> For caregiving coordination only — does **not** replace ICU judgment or formal medical records.

## What the dashboard shows

Single-file [`index.html`](index.html):

- **Status cards** for circulation/support, kidney, infection, coagulation, and oxygenation
- **分类汇总** — sparklines for every metric, grouped by system
- **循环与支持** — dedicated blood-pressure and vasopressor charts from oral `vitalReadings` (plus MAP / HR / NE / DA in the category picker)
- **详细趋势** — pick a category, then a metric
- **Doctor discussion checklist** (`doctorQuestions`) for rounds
- Timeline, expandable report notes, and a hero pill driven by the newer of the last arterial vs `latestNonBloodGasReport`

Categories: 循环/支持, 灌注/酸碱, 氧合, 感染/炎症, 肾脏, 凝血/血细胞, 肝/肌酶, 电解质.

## Naming traps

Do **not** mix these three “PCT-looking” numbers:

| Label on the sheet | Meaning |
|--------------------|---------|
| **降钙素原 / PCT** (chemistry) | Procalcitonin ng/mL |
| **血小板比积 / PCT** (CBC) | Plateletcrit % |
| **氧合指数 pO2(a)/FO2(I)** | PaO₂/FiO₂ |

Norepinephrine concentration is **0.05 mg/mL** (9 mL/h = 0.45 mg/h; 6 = 0.30; 4 = 0.20). Do not invent dopamine mg/h or body weight.

## Open locally

```bash
python3 -m http.server 8080
```

Then open:

- Live report (dev): [http://localhost:8080/index.html](http://localhost:8080/index.html)
- 识图版 standalone: [http://localhost:8080/live.html](http://localhost:8080/live.html)
- 空白版 standalone: [http://localhost:8080/template.html](http://localhost:8080/template.html)
- Preview hub: [http://localhost:8080/previews.html](http://localhost:8080/previews.html)

Add a new result from a lab screenshot or oral bedside note: **添加最新结果**. The add form includes BP, pulse, NE/DA mL/h, CRP, CRRT, and urine. Images stay on the device; only parsed numbers are saved in this browser.

The empty template is for replay tests: import every file in `testset/` plus oral notes, then read the coverage panel against the current seeded report. Rebuild both standalone pages after `index.html` edits:

```bash
node scripts/build-template.mjs             # writes live.html + template.html
node scripts/replay-coverage.mjs            # labeled LIS files only
node scripts/replay-coverage.mjs --other    # also credit mapped other/ early clocks
```

Parser checks:

```bash
node --test parse-lab-report.test.mjs
```

## Preview

`main` stays the canonical live report (do not overwrite it from feature work):

https://htmlpreview.github.io/?https://github.com/Lelouchzhu/MediDash/blob/main/index.html

Feature-branch standalone pages (识图版 + 空白版), not on `main`:

- **大陆入口**: https://jsd.onmicrosoft.cn/gh/Lelouchzhu/MediDash@cn/hub.xhtml
- 备用国内镜像: https://cdn.jsdmirror.com/gh/Lelouchzhu/MediDash@cn/hub.xhtml
- Hub: https://htmlpreview.github.io/?https://github.com/Lelouchzhu/MediDash/blob/cursor/empty-template-replay-b98e/previews.html
- 识图版: https://htmlpreview.github.io/?https://github.com/Lelouchzhu/MediDash/blob/cursor/empty-template-replay-b98e/live.html
- 空白版: https://htmlpreview.github.io/?https://github.com/Lelouchzhu/MediDash/blob/cursor/empty-template-replay-b98e/template.html

## Cloud Agent / handoff

Start Cloud Agents on **this** repository and read these first:

| File | Role |
|------|------|
| [`AGENTS.md`](AGENTS.md) | Operating rules: MediDash `main` only, testset backup, same-clock/hires replace, `node --check` |
| [`CONTEXT.md`](CONTEXT.md) | Living clinical memory (timeline, latest labs, bedside) |
| [`docs/transcripts/`](docs/transcripts/) | Dated conversation summaries (newest first) |
| [`testset/`](testset/) | Screenshot archive + `manifest.json` (currently 96 reports) |

Config: [`.cursor/environment.json`](.cursor/environment.json) starts the dashboard server on port **8080**.

Clinical zero: surgery end **2026-09-15 14:00**. Every new screenshot is copied into `testset/reports/<category>/`, registered in `manifest.json`, then extracted into `index.html`.
