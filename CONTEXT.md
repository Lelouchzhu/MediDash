# MediDash — clinical & agent context handoff

This file is the **readable memory** for future Cloud Agents working on `Lelouchzhu/MediDash`.  
It summarizes decisions, data conventions, and clinical state from prior agent runs. It is **not** a full chat transcript dump.

**Source of truth repo:** `https://github.com/Lelouchzhu/MediDash` (not the Allmond fork)  
**Prior agent run (Allmond-bound):** https://cursor.com/agents/bc-01a0a01a-a6eb-72c7-b052-ba5e14ed8b1b  
**Conversation summary:** [`docs/transcripts/2026-09-18-bc-01a0a01a-summary.md`](docs/transcripts/2026-09-18-bc-01a0a01a-summary.md)  
**Preview:** https://htmlpreview.github.io/?https://github.com/Lelouchzhu/MediDash/blob/main/index.html

---

## What future agents must do

1. Edit **`index.html`** only for clinical dashboard updates (single-file app).
2. Commit and **push to `Lelouchzhu/MediDash`** (`main` or `cursor/...` feature branch).
3. Do **not** push clinical updates to `Lelouchzhu/Allmond` (that repo is a fork of unrelated bioinformatics code).
4. Serve locally via `.cursor/environment.json` → `python3 -m http.server 8080`.
5. Keep UI de-identified: prefer relative postop hours; clock times may be stored in notes when the family confirms them.

---

## Patient / case framing (family caregiving, not diagnosis)

- Elderly female; bowel ischemia / portal venous gas; emergency surgery.
- Family uses this dashboard to track ICU labs and prepare doctor questions.
- Dashboard disclaimer: **not medical advice**; does not replace ICU judgment.

## Time zero

| Event | Clock (local) | Notes |
|-------|---------------|--------|
| Surgery | D0 10:00–14:00 | End ≈ **2026-09-15 14:00** |
| Relative hours | from surgery **end** | `h` in `baseReadings` / `labReadings` |

Formula: `relative_h = (report_datetime − 2026-09-15 14:00)` in hours.

---

## Critical naming traps (do not confuse)

| Label in Chinese reports | Meaning | Example |
|--------------------------|---------|---------|
| **降钙素原 / PCT** (biochem) | **Procalcitonin** ng/mL | 146 → 170 → 102 |
| **血小板比积 / PCT** (CBC) | **Plateletcrit** % | 0.08% |
| **氧合指数 pO2(a)/FO2(I)** | PaO₂/FiO₂ | morning ABG **169** |

A low-resolution ABG once caused “PCT 170” confusion with oxygenation index **169**. The **real** procalcitonin 170.297 is on the **2026-09-17 10:52** chemistry panel (same sheet as ALT/AST).

---

## Procalcitonin series (confirmed)

| Report time | Relative | PCT (ng/mL) |
|-------------|----------|-------------|
| 2026-09-16 09:44 | postop 19h44m | **146.421** |
| 2026-09-17 10:52 | postop 44h52m | **170.297** |
| 2026-09-18 08:58 | postop 66h58m | **101.563** |

Trend: rise then fall; still far above ref 0–0.05.

---

## Latest clinical snapshot (as of last MediDash update)

### Support / vitals (family-reported)

- **CRRT** ongoing; overnight urine **70 mL** (was 950 → 300 → 70)
- Vasopressors **slightly reduced**; last visit-style BP mentioned historically 140/50, HR ~100 (confirm live doses)

### Arterial blood gas — 2026-09-18 06:36 (postop 64h36m)

- pH 7.392, PCO₂ 37.6, PO₂ 84.4, HCO₃⁻ 22.4, BE ≈ −2.6
- Lactate **1.97**, FiO₂ **50%**, P/F **169**
- Hb 9.1 g/dL, Hct 27%, iCa 1.12

### Chemistry — 2026-09-18 08:58 (postop 66h58m)

- PCT **101.563**, Cr **212**, urea **11.59**, K 4.35, Na 137.91, Cl 97.56

### CBC

| Time | WBC | Hb g/L | PLT | Notes |
|------|-----|--------|-----|-------|
| 2026-09-17 09:46 | 11.52 | 85 | 73 | neut% ~95 |
| 2026-09-18 08:34 | 14.51 | 85 | 65 | neut% ~91; plateletcrit 0.08% |

### Coagulation — 2026-09-18 09:44 (postop 67h44m)

- APTT **50.8** (was critical 76.1 → 72.4), PT 13.8, INR **1.24**, TT 12.6↓, Fbg 4.38

### Peak organ-injury panel — 2026-09-17 10:52 (postop 44h52m)

- ALT **891**, AST **806**, IL-6 **981**, CK **8280**, CK-MB 132.6, LDH 915, HBDH 576
- Cr 363, urea 17.80, PCT **170.297**
- K 4.31, Na 141.27, Cl 98.33

### Earlier highlights

- Lactate peak **8.99**; worst pH ~7.196 / BE −16.2 early postop
- Portal venous gas / mesenteric ischemia on CT preop; SpO₂ issues at home before admission
- Coag once critically prolonged (APTT 76.1 / 72.4) then improved

---

## How `index.html` is structured

| Data | Where |
|------|--------|
| ABG trend points | `baseReadings` (`h`, `ph`, `lactate`, `pf`, `hb`, `ca`, …) |
| Labs (Cr, INR, APTT, PCT, CBC…) | `labReadings` |
| Metric catalog + categories | `metricConfig` + `metricGroups` (分类汇总 sparklines + 详细趋势) |
| Status cards / insights / timeline / expandable reports | HTML sections near top/middle |
| Doctor checklist | `doctorQuestions` |
| Latest non-ABG clock for hero pill | `latestNonBloodGasReport` |
| Report screenshot archive | `testset/reports/` + `testset/manifest.json` |

Update flow when new reports arrive:

1. **Backup the screenshot** into `testset/reports/<category>/` (or `inbox/`) and register in `manifest.json`.
2. Read report clock → compute `h` from surgery end.
3. Append/update `baseReadings` / `labReadings`; ensure new fields exist in `metricConfig` + `metricGroups`.
4. Refresh status cards, insights, reports, timeline, checklist copy.
5. Commit message should name the key values (PCT, Cr, APTT, etc.).
6. Push **MediDash**.

**Naming traps:** 降钙素原 PCT ≠ 血小板比积 PCT ≠ 氧合指数 P/F.

---

## Repo history note

- Work started on `Lelouchzhu/Allmond` branch `cursor/medical-dashboard-8b1b` (PR #2), but Allmond is a **fork of rjorton/Allmond** (viral metagenomics scripts) — wrong long-term home.
- Clean non-fork home is **`Lelouchzhu/MediDash`**. All ongoing clinical updates go here.

---

## What is *not* automatically available to new agents

- Full Cursor chat bubbles / screenshots from prior runs are **not** injected unless copied into this repo (`testset/` for reports; `docs/transcripts/` for summaries).
- To continue work: start a **new Cloud Agent on MediDash**, and tell it to read `AGENTS.md` + `CONTEXT.md` first.
- Optional: paste a short “since CONTEXT.md” delta in the first user message when something changed after this file’s date.

**Last updated:** 2026-09-18 — added categorized all-metric trends + testset screenshot backup policy.
