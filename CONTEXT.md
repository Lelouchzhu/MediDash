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
| **降钙素原 / PCT** (biochem) | **Procalcitonin** ng/mL | 146 → 170 → 102 → **65** |
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
| 2026-09-19 10:03 | postop 92h03m | **65.368** |

Trend: falling since the peak, still far above ref 0–0.05.

---

## Latest clinical snapshot (as of last MediDash update)

### Support / vitals (family-reported)

- **Latest bedside (~postop 73h, not re-reported):** BP **120/35** (MAP≈63), HR **109**, RR **15–19**
- **CRRT stopped** early morning 2026-09-19 (family). Before stop: dehydrate/replacement ~**250 mL/h**, hemofiltration **120 mL/h**; IV fluids ~**200 mL/h**
- Urine: 950 → 300 → 70 → morning 20 mL → **overnight 0**. **Diuretics increased today**
- Vasopressors (family, confirmed): norepinephrine **9 mL/h = 0.45 mg/h** (= **7.5 μg/min**). At an assumed 50 kg that is ~**0.15 μg/kg/min** — **moderate-low, not a high dose** (high-dose thresholds are often ≥0.5–1 μg/kg/min). The earlier ~0.5 mg/h estimate is superseded. Second agent status unknown. BP last reported 120/35.

### Arterial blood gas — latest 2026-09-19 06:44 (postop 88h44m)

- pH 7.382, PCO₂ 32.2↓, PO₂ **104.8↑**, HCO₃⁻ **18.7↓**, BE **−6.4** (ABE)
- Lactate **2.14↑** (back above 0.5–1.6; was 1.41 at 21:46)
- FiO₂ **50%**, P/F **210** (worse than last night’s 262; still below 400)
- Hb **9.2↓** g/dL, Hct **27%↓**, iCa **1.09↓**
- Screenshot: `testset/reports/abg/20260919T064443__C414CFCC-4ADA-4FAF-84AF-8BA735079F07_L0_001.jpg`

### Arterial blood gas — 2026-09-18 21:46 (postop 79h47m)

- pH 7.398, PCO₂ 33.8↓, PO₂ **131.1↑**, HCO₃⁻ **20.4↓**, BE −4.5 (ABE)
- Lactate **1.41** (in ref 0.5–1.6)
- FiO₂ **50%**, P/F **262**
- Hb **9.4↓** g/dL, Hct **28%↓**, iCa **1.14↓**
- Screenshot: `testset/reports/abg/20260918T214648__7641F637-CDE1-4814-9500-06752068AFD0_L0_001.jpg`

### Arterial blood gas — 2026-09-18 17:23 (postop 75h23m)

- pH 7.363, PCO₂ 40.3, PO₂ **82.4**, HCO₃⁻ 22.4, BE −2.8 (SBE)
- **Lactate not printed on this report** (then next known lac **1.41** at 21:46)
- FiO₂ **50%**, P/F **165** (improved vs 13:00’s 145)
- Hb **8.8↓** g/dL, Hct **26%↓**; tCO₂ 23.6↓; A-a gradient ↑; no iCa on sheet
- Screenshot: `testset/reports/abg/20260918T172343__01a0b451-4ecd-7e47-8ab8-9b5d80606e2d.jpg`

### Arterial blood gas — 2026-09-18 13:00 (postop 71h00m)

- pH 7.388, PCO₂ 37.5, PO₂ **72.6↓**, HCO₃⁻ 22.1, BE −2.9
- Lactate **1.27** (in ref 0.5–1.6), FiO₂ **50%**, P/F **145↓**
- Hb 9.1 g/dL, Hct 27%, iCa 1.12
- Screenshot: `testset/reports/abg/20260918T130029__7B968B2C-1BF2-4D59-B4C8-F03D5EDF7DFB_L0_001.jpg`

### Arterial blood gas — 2026-09-18 06:36 (postop 64h36m)

- pH 7.392, PCO₂ 37.6, PO₂ 84.4, HCO₃⁻ 22.4, BE ≈ −2.6
- Lactate **1.97**, FiO₂ **50%**, P/F **169**
- Hb 9.1 g/dL, Hct 27%, iCa 1.12

### Potassium — 2026-09-18 17:22 (postop 75h22m)

- K **4.17** mmol/L (ref 3.5–5.3) — normal single-item report
- Screenshot: `testset/reports/chemistry/20260918T172250__01a0b451-4f08-76b7-9cd9-0c8d379fafd4.jpg`

### Chemistry — 2026-09-19 10:03 (postop 92h03m)

- PCT **65.368** (was 101.563), Cr **204.0** (rechecked; was 212), urea **13.27** (was 11.59)
- K **4.80**, Na **134.78↓** (ref 137–147), Cl **100.69**
- Albumin **29.3↓** g/L (ref 34–48). GLB and A/G blank on the sheet
- Preferred screenshot: `testset/reports/chemistry/20260919T100330__01a0b7bc-519d-72d9-9831-8fd5f6dd93c7.jpg`

### Chemistry — 2026-09-18 08:58 (postop 66h58m)

- PCT **101.563**, Cr **212**, urea **11.59**, K 4.35, Na 137.91, Cl 97.56

### CBC — latest 2026-09-19 08:46 (postop 90h46m)

| Time | WBC | Hb g/L | PLT | Notes |
|------|-----|--------|-----|-------|
| 2026-09-17 09:46 | 11.52 | 85 | 73 | neut% ~95 |
| 2026-09-18 08:34 | 14.51 | 85 | 65 | neut% ~91; plateletcrit 0.08% |
| 2026-09-19 08:46 | **13.17** | **76** | **55** | neut% 87.9; plateletcrit **0.06%** |

Screenshot: `testset/reports/cbc/20260919T084629__01a0b731-359d-77fe-9689-d52f5b99561b.jpg`

### Coagulation — latest 2026-09-18 22:13 (postop 80h13m)

- APTT **67.2↑** (this sheet’s ref **21–45**)
- Prior same evening 18:01: APTT **64.0** (that sheet’s ref 23.3–32.5)
- Screenshot: `testset/reports/coag/20260918T221305__01a0b731-35d4-7a05-b975-9fac7882eef3.jpg`

### Coagulation — 2026-09-18 09:44 (postop 67h44m)

- APTT **50.8**, PT 13.8, INR **1.24**, TT 12.6↓, Fbg 4.38

### Peak organ-injury panel — 2026-09-17 10:52 (postop 44h52m)

- ALT **891**, AST **806**, IL-6 **981**, CK **8280**, CK-MB 132.6, LDH 915, HBDH 576
- Cr 363, urea 17.80, PCT **170.297**
- K 4.31, Na 141.27, Cl 98.33

### Earlier highlights

- Lactate peak **8.99**; worst pH ~7.196 / BE −16.2 early postop
- Portal venous gas / mesenteric ischemia on CT preop; SpO₂ issues at home before admission
- Coag critically prolonged (APTT 76.1 / 72.4) → improved to 50.8 → **rebounced to 64.0**

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

**Last updated:** 2026-09-19 — chemistry 10:03 PCT 65.368 / Cr 204 / urea 13.27 / ALB 29.3 / Na 134.78; CRRT stopped overnight, urine 0, diuretics increased; norepinephrine 9 mL/h = 0.45 mg/h (moderate-low).
