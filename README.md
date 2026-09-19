# MediDash

Mobile-friendly perioperative monitoring dashboard for family-side trend tracking (blood gas, coagulation, organ labs, vitals, and a doctor discussion checklist).

> For caregiving coordination only — does **not** replace ICU judgment or formal medical records.

**This repository is the source of truth.** New lab results, **report screenshots** (`testset/`), and dashboard updates should be pushed here (`Lelouchzhu/MediDash`), not to the old Allmond fork.

## Open locally

```bash
python3 -m http.server 8080
```

Then open:

- Live report (dev): [http://localhost:8080/index.html](http://localhost:8080/index.html)
- 识图版 standalone: [http://localhost:8080/live.html](http://localhost:8080/live.html)
- 空白版 standalone: [http://localhost:8080/template.html](http://localhost:8080/template.html)
- Preview hub: [http://localhost:8080/previews.html](http://localhost:8080/previews.html)

Add a new result from a lab screenshot or oral bedside note: **添加最新结果**. The add form includes BP, pulse, CRRT, and urine. Images stay on the device; only parsed numbers are saved in this browser.

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

## Cloud Agent

- Config: [`.cursor/environment.json`](.cursor/environment.json) starts a dashboard server on port **8080**.
- Handoff: [`AGENTS.md`](AGENTS.md) · clinical context: [`CONTEXT.md`](CONTEXT.md) · transcript summary: [`docs/transcripts/`](docs/transcripts/)
- Screenshot backup / extraction testset: [`testset/`](testset/)
- Start Cloud Agents on **this** repository and ask them to read those files first.

## Preview

`main` stays the canonical live report (do not overwrite it from feature work):

https://htmlpreview.github.io/?https://github.com/Lelouchzhu/MediDash/blob/main/index.html

Feature-branch standalone pages (识图版 + 空白版), not on `main`:

- Hub: https://htmlpreview.github.io/?https://github.com/Lelouchzhu/MediDash/blob/cursor/empty-template-replay-b98e/previews.html
- 识图版: https://htmlpreview.github.io/?https://github.com/Lelouchzhu/MediDash/blob/cursor/empty-template-replay-b98e/live.html
- 空白版: https://htmlpreview.github.io/?https://github.com/Lelouchzhu/MediDash/blob/cursor/empty-template-replay-b98e/template.html
- Backup (raw.githack): [识图版](https://raw.githack.com/Lelouchzhu/MediDash/cursor/empty-template-replay-b98e/live.html) · [空白版](https://raw.githack.com/Lelouchzhu/MediDash/cursor/empty-template-replay-b98e/template.html)
