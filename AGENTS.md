# MediDash — Cloud Agent Handoff

## Canonical repository

**All new lab results and dashboard updates must be committed and pushed to this repo (`Lelouchzhu/MediDash`) on `main`.**

Do **not** update `Lelouchzhu/Allmond` for clinical dashboard work.

## Read first

1. **[`CONTEXT.md`](CONTEXT.md)** — full clinical timeline, PCT naming traps, latest labs, update workflow  
2. This file — short operating rules  
3. **`index.html`** — live dashboard data

## Purpose

Self-contained mobile perioperative monitoring dashboard. **Not medical advice.**

## Clinical zero point

- Surgery end: **2026-09-15 14:00** (D0 10:00–14:00)
- Relative hours from surgery end

## Latest snapshot (see CONTEXT.md for detail)

- PCT **146.421 → 170.297 → 101.563** ng/mL  
- CRRT on; Cr 212; UO overnight 70 mL  
- Lactate 1.97; FiO₂ 50%; P/F 169  
- APTT 50.8; INR 1.24; Hb 85 g/L; PLT 65  

## How to update

Edit `index.html` (`baseReadings`, `labReadings`, cards, reports, timeline, questions), update `CONTEXT.md` if the clinical story changed, commit, push `main`.

## Preview

https://htmlpreview.github.io/?https://github.com/Lelouchzhu/MediDash/blob/main/index.html
