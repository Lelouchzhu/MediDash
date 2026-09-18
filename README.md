# MediDash

Mobile-friendly perioperative monitoring dashboard for family-side trend tracking (blood gas, coagulation, organ labs, vitals, and a doctor discussion checklist).

> For caregiving coordination only — does **not** replace ICU judgment or formal medical records.

## Open locally

```bash
python3 -m http.server 8080
```

Then open [http://localhost:8080/index.html](http://localhost:8080/index.html).

## Cloud Agent

- Config: [`.cursor/environment.json`](.cursor/environment.json) starts a dashboard server on port **8080**.
- Handoff for continuing work: [`AGENTS.md`](AGENTS.md)
- Start a new Cloud Agent on **this** repository (`Lelouchzhu/MediDash`), not the old Allmond fork.

## Preview

https://htmlpreview.github.io/?https://github.com/Lelouchzhu/MediDash/blob/main/index.html
