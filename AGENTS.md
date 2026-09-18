# MediDash — Cloud Agent Handoff

## Canonical repository

**All new lab results and dashboard updates must be committed and pushed to this repo (`Lelouchzhu/MediDash`) on `main` (or a `cursor/...` feature branch + PR).**

Do **not** continue updating `Lelouchzhu/Allmond` for clinical dashboard work.

## Purpose

Self-contained mobile perioperative monitoring dashboard for family-side trend tracking after bowel ischemia surgery. **Not medical advice**.

## Repo layout

| Path | Role |
|------|------|
| `index.html` | Entire app. Edit this for clinical updates. |
| `.cursor/environment.json` | Serves on port 8080. |
| `README.md` | Human run notes. |
| `AGENTS.md` | This handoff. |

## Clinical zero point

- Surgery: **D0 10:00–14:00** (end ≈ **2026-09-15 14:00**)
- Relative hours from surgery end

## Latest state (post-op ~67h44m)

- **PCT 146.4 → 170** (rising; first PCT 2026-09-16 09:44 = postop 19h44m)
- Lactate **1.97** (improving); FiO₂ **30%**, P/F **~281**
- **CRRT on**; Cr 363→**212**, urea **11.59**; overnight UO **70 mL**
- APTT critical cleared: 72.4→**50.8**; INR **1.24**, PT 13.8
- Hb **9.1**, iCa **1.12**; pressors slightly reduced
- IL-6 981 (older), ALT/AST still high from prior peak

## How to update

1. New reports → relative hours from D0 14:00
2. Update `baseReadings` / `labReadings`, status cards, insights, reports, timeline, `doctorQuestions`, `latestNonBloodGasReport`
3. Commit & push to **MediDash** `main`
4. Verify `http://localhost:8080/index.html`

## Preview

https://htmlpreview.github.io/?https://github.com/Lelouchzhu/MediDash/blob/main/index.html
