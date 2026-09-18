# MediDash — Cloud Agent Handoff

## Purpose

Self-contained mobile perioperative monitoring dashboard for family-side trend tracking after bowel ischemia surgery. **Not medical advice**; used to organize labs, vitals, and doctor questions.

## Repo layout

| Path | Role |
|------|------|
| `index.html` | Entire app (UI + data + charts + checklist). Edit this file for clinical updates. |
| `.cursor/environment.json` | Cloud Agent serve config (`python3 -m http.server 8080`). |
| `README.md` | Human preview / local run notes. |
| `AGENTS.md` | This handoff for future Cloud Agents. |

## Clinical zero point

- Surgery: **D0 10:00–14:00**
- Relative hours are measured from **surgery end 14:00**
- Patient data is de-identified (relative time only; no full identifiers in UI)

## Latest state at export (post-op ~62h)

Priority flags:

- **APTT critical**: 76.1 → **72.4 sec** (ref 21–45; rechecked). Ask about CRRT anticoagulation / bleeding.
- Lactate: 2.27 → 2.86 → **2.57** (still high)
- P/F: **176** on FiO₂ 50%
- Acid-base near normal: pH **7.367**, HCO₃⁻ 22.5, BE −2.8
- Hb **8.4** g/dL, Hct 25%, iCa 1.06
- Older open issues: Cr 363 / CRRT, IL-6 981, ALT/AST high, pressors (last visit BP 140/50, HR 100)

## How to update when new reports arrive

1. Read uploaded lab images / values.
2. Compute relative hours from surgery end (D0 14:00).
3. Update `index.html`:
   - `baseReadings` for arterial/venous blood gas points
   - `labReadings` for coag/biochem (e.g. APTT, INR, creatinine)
   - Status cards, insights, expandable reports, timeline, `doctorQuestions`, `latestNonBloodGasReport`
4. Commit, push to `main` (or a `cursor/...` feature branch + PR).
5. Verify at `http://localhost:8080/index.html` (terminal `dashboard` should already serve it).

## Preview

https://htmlpreview.github.io/?https://github.com/Lelouchzhu/MediDash/blob/main/index.html

## History note

Earlier work lived on a fork `Lelouchzhu/Allmond` (unrelated bioinformatics parent). **MediDash is the clean non-fork home.** Prefer continuing here.

Prior Allmond branch for reference only: `cursor/medical-dashboard-8b1b` / PR https://github.com/Lelouchzhu/Allmond/pull/2
