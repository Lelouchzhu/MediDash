# MediDash — Cloud Agent Handoff

## Canonical repository

**All new lab results and dashboard updates must be committed and pushed to this repo (`Lelouchzhu/MediDash`) on `main`.**

Do **not** update `Lelouchzhu/Allmond` for clinical dashboard work.

## Purpose

Self-contained mobile perioperative monitoring dashboard. **Not medical advice.**

## Clinical zero point

- Surgery end: **2026-09-15 14:00** (D0 10:00–14:00)
- Relative hours from surgery end

## Latest corrected state (2026-09-18 morning)

- **Procalcitonin 146.421 → 101.563 ng/mL** at 2026-09-18 08:58 (postop 66h58m). Still extremely high. The earlier “170” was a misread of oxygenation index **169** on a low-resolution ABG.
- CBC “PCT” means **plateletcrit 0.08%**, not procalcitonin.
- ABG 2026-09-18 06:36: lactate **1.97**, FiO₂ **50%**, P/F **169**, pH 7.392, Hb 9.1, iCa 1.12
- CBC: 09-17 09:46 WBC 11.52 / Hb 85 / PLT 73 → 09-18 08:34 WBC **14.51** / Hb 85 / PLT **65** / neut ~91–95%
- CRRT on; Cr 212, urea 11.59; overnight UO 70 mL
- APTT 50.8, INR 1.24 (critical value cleared)
- Pressors slightly reduced

## How to update

Edit `index.html` (`baseReadings`, `labReadings`, cards, reports, timeline, questions), commit, push `main`.

## Preview

https://htmlpreview.github.io/?https://github.com/Lelouchzhu/MediDash/blob/main/index.html
