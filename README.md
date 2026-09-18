# MediDash

Mobile-friendly perioperative monitoring dashboard for family-side trend tracking (blood gas, coagulation, organ labs, vitals, and a doctor discussion checklist).

> For caregiving coordination only — does **not** replace ICU judgment or formal medical records.

**This repository is the source of truth.** New lab results and dashboard updates should be pushed here (`Lelouchzhu/MediDash`), not to the old Allmond fork.

## Open locally

```bash
python3 -m http.server 8080
```

Then open [http://localhost:8080/index.html](http://localhost:8080/index.html).

## Cloud Agent

- Config: [`.cursor/environment.json`](.cursor/environment.json) starts a dashboard server on port **8080**.
- Handoff: [`AGENTS.md`](AGENTS.md) · clinical context: [`CONTEXT.md`](CONTEXT.md) · transcript summary: [`docs/transcripts/`](docs/transcripts/)
- Start Cloud Agents on **this** repository and ask them to read those files first.

## Preview

https://htmlpreview.github.io/?https://github.com/Lelouchzhu/MediDash/blob/main/index.html
