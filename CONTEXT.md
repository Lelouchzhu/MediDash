# MediDash — clinical & agent context handoff

This file is the **readable memory** for future Cloud Agents working on `Lelouchzhu/MediDash`.  
It summarizes decisions, data conventions, and clinical state from prior agent runs. It is **not** a full chat transcript dump.

**Source of truth repo:** `https://github.com/Lelouchzhu/MediDash` (not the Allmond fork)  
**Prior agent run (Allmond-bound, then continued here):** https://cursor.com/agents/bc-01a0a01a-a6eb-72c7-b052-ba5e14ed8b1b  
**Conversation summary (current):** [`docs/transcripts/2026-09-21-bc-01a0a01a-summary.md`](docs/transcripts/2026-09-21-bc-01a0a01a-summary.md)  
**Conversation summary (through 9/18 13:00 ABG):** [`docs/transcripts/2026-09-18-bc-01a0a01a-summary.md`](docs/transcripts/2026-09-18-bc-01a0a01a-summary.md)  
**大陆入口:** https://jsd.onmicrosoft.cn/gh/Lelouchzhu/MediDash@main/hub.xhtml  
**备用国内镜像:** https://cdn.jsdmirror.com/gh/Lelouchzhu/MediDash@main/hub.xhtml  
**海外备用:** https://htmlpreview.github.io/?https://github.com/Lelouchzhu/MediDash/blob/main/index.html

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
| **降钙素原 / PCT** (biochem) | **Procalcitonin** ng/mL | 146 → 170 → 102 → 65 → **36.9** |
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
| 2026-09-21 09:18 | postop 139h18m | **36.8855** |

Trend: falling since the peak, still far above ref 0–0.05. The first 09:18 chemistry crop omitted PCT; the replacement screenshot of the **same clock** has it.

## Inflammation series (confirmed)

| Report time | Relative | CRP (mg/L) | IL-6 (pg/mL) |
|-------------|----------|------------|--------------|
| 2026-09-17 10:52 | postop 44h52m | — | **981** |
| 2026-09-21 09:18 | postop 139h18m | **97.70** (ref 0–8) | **68.500** (ref 0–7) |

`metricConfig` now includes `crp`. Infection group metrics: `pct`, `crp`, `il6`, `wbc`.

---

## Latest clinical snapshot (as of last MediDash update)

### Support / vitals (family-reported)

- **Latest bedside (family oral after midday labs):** BP **150/55** (MAP≈87), pulse **106**
- Prior bedside (~postop 122h): BP 125/35 (MAP≈65), HR 100, RR 15–20
- **CRRT:** started 2026-09-20 ~16:00–18:00; family now says this run lasted **19 h 48 min** and **has stopped**. Pre-start settings were blood **130 mL/min**, UF **300 mL/h**. If start was 16:00, stop ≈ 11:48; if 18:00, stop ≈ 13:48 (confirm at bedside). Cumulative UF not confirmed. Prior stop was morning 2026-09-19.
- Urine overnight **50 mL** was **before** this restart. Family now: **still no urine after CRRT stop**.
- Vasopressors **weaned again**: norepinephrine **9 → 6 → 4 mL/h = 0.20 mg/h** + dopamine **10 → 8 → 7.5 mL/h**. Concentration remains **0.05 mg/mL** (9 mL/h = 0.45 mg/h; 6 mL/h = 0.30 mg/h). Do not invent dopamine mg/h.
- **Transfusion:** **4 units RBC**, B Rh-positive, family says **started same 16:00–18:00 window**. ABG Hb **7.7 at 17:48 → 10.4 at 22:16 → 10.7 at 06:52 → 8.9 at 10:53**. Evening CBC Hb **101** (19:05; morning was 100). Ask how many units finished.
- **K:** chemistry **3.93** at 09:18 (on CRRT). After stop, K may rebound up. Latest iCa **1.07** on 10:53 ABG. Evening WBC **18.61** (was 19.40).
- **Stool:** family-reported microscopy **WBC negative, RBC negative** (oral). Screenshot **2026-09-21 18:32** fecal occult blood (immunoassay) **positive**. Different tests; FOBT+ does not quantify or localize bleeding. Evening CBC Hb held at **101**.
- **Watch next:** urine after CRRT stop; potassium (may rebound); next Cr; stool color / whether FOBT changes management; WBC still high.

### Morning labs — 2026-09-21 09:16–09:18 (postop 139h16–18m)

- CBC: WBC **19.40↑**, Hb **100↓** g/L (was 67), HCT **27.6↓**, PLT **60↓**, NEUT% **93.5↑**, NEUT# **18.14↑**. Plateletcrit **0.08%** is not PCT.
- Chemistry: Cr **231↑** (was 314), urea **22.09↑** (was 25.69), ALT **159↑** (was 891; not 15.0), AST **82↑** (was 806), CK **434↑** (was 8280), CK-MB **23.7** (in ref 0–24), LDH **463↑**, ALB **35.8** (was 29.3), K **3.93**, Na **138.61** (was 130.8)
- Coag: APTT **45.8↑** (ref 23.3–32.5 on this sheet; was 51.1), INR **1.11**, PT 12.4, TT 15.3, Fbg 3.16
- Inflammation (same 09:18 window): CRP **97.70↑** mg/L (ref 0–8); IL-6 **68.500↑** pg/mL (ref 0–7; was **981** at postop 44h52m)
- **PCT (same 09:18 clock, replacement screenshot):** **36.8855↑** ng/mL (ref 0–0.05; was **65.368**). First crop `20260921T091831__01a0c1af-fc3b-7315-aadf-70e67871c38f.jpg` had no PCT row — superseded by `20260921T091831__01a0c208-0305-78b4-81e2-bc4fffb5f990.jpg`. ALT is **159.0**, not 15.0.
- Screenshots: `testset/reports/cbc/20260921T091627__01a0c1af-fc25-7dec-870a-ad821a3a57b7.jpg`, `testset/reports/chemistry/20260921T091831__01a0c208-0305-78b4-81e2-bc4fffb5f990.jpg` (preferred), `testset/reports/coag/20260921T091824__01a0c1af-fc51-7986-99a8-e7def9d0edeb.jpg`, `testset/reports/chemistry/20260921T091823__BBB64AB1-8E21-40A1-9564-A95CE7D6E1B0_L0_001.jpg`

### Evening labs — 2026-09-21 18:32–19:20 (postop 148h32m–149h20m)

- **FOBT 18:32:** occult blood immunoassay **positive** (abnormal flag A). Not the same as microscopy WBC/RBC.
- **CBC 19:05:** WBC **18.61↑** (was 19.40), Hb **101↓** g/L (was 100), HCT **28.6↓**, PLT **69↓** (was 60), NEUT% **94.4↑**, NEUT# **17.57↑**, lymph 0.80. Plateletcrit **0.08%** is not PCT.
- **Coag 19:20:** APTT **48.8↑** sec (ref 21–45; was 51.8). TT **14.4**, PT **11.7**, INR **0.977**, Fbg **4.37** — all in range.
- **Judgment:** WBC slightly down, still high with neutrophilia. APTT easing toward ref. CBC Hb stable despite FOBT+ — not a large bleed on this snapshot; still ask about stool color. K and Cr after CRRT stop remain unchecked.
- Screenshots: `testset/reports/other/20260921T183228__0915680A-8202-4C78-B57D-C03CF3C68D68_L0_001.jpg`, `testset/reports/cbc/20260921T190522__F15281AC-0475-4441-BA34-E820C9B4DAD2_L0_001.jpg`, `testset/reports/coag/20260921T192039__E0EEF2FA-427C-4F72-9881-5377D8F49812_L0_001.jpg`

### Coag — 2026-09-21 11:07 (postop 141h07m)

- APTT **51.8↑** sec (ref 21–45); rebound from **45.8** at 09:18
- Screenshot: `testset/reports/coag/20260921T110725__01a0c208-02ed-7967-8409-0a947755103f.jpg`

### Arterial blood gas — latest 2026-09-21 10:53 (postop 140h53m)

- pH **7.515↑**, PCO₂ **33.00↓**, PO₂ **89.70**, HCO₃⁻ **26.00**, BE **+3.10** (ABE = SBE on this sheet)
- Lactate **1.54** (in ref 0.5–1.6; was 1.61). Phone-crop OCR had **1.554**; hires table is **1.54**.
- FiO₂ **50%**, P/F **179** (up from 161). This 179 is oxygenation index, not PCT.
- Hb **8.9↓** g/dL (was 10.7 at 06:52), Hct **26%↓**, iCa **1.07↓**
- Screenshot (preferred hires 3520×3772): `testset/reports/abg/20260921T105336__hires__01a0c258-8b2c-7572-b9e7-78adb4263c70.jpg`

### Arterial blood gas — 2026-09-21 06:52 (postop 136h52m)

- pH **7.485↑**, PCO₂ **28.8↓**, PO₂ **80.7**, HCO₃⁻ **21.2↓**, BE **−2.2** (ABE; SBE −1.4)
- Lactate **1.61↑** (down from 04:20’s 2.20; still just above 0.5–1.6)
- FiO₂ **50%**, P/F **161** (up from 151; still far below 400). This 161 is oxygenation index, not PCT.
- Hb **10.7↓** g/dL, Hct **31%↓**, iCa **1.08↓**
- Screenshot: `testset/reports/abg/20260921T065257__01a0c12e-1ecc-7bc1-b032-eade760dcb87.jpg`

### Coag / electrolytes — 2026-09-21 04:28–04:31 (postop 134h28–31m)

- APTT **51.1↑** sec (ref 21–45; was 52.4 at 01:25)
- K **4.20** mmol/L (ref 3.5–5.3)
- Screenshots: `testset/reports/coag/20260921T043124__01a0c12e-1ef3-79a1-b48a-d3d9b8dbadec.jpg`, `testset/reports/chemistry/20260921T042800__01a0c12e-1f07-70b4-a86e-c66090ef13dc.jpg`

### Arterial blood gas — 2026-09-21 04:20 (postop 134h20m)

- pH **7.483↑**, PCO₂ **28.6↓**, PO₂ **76.3↓**, HCO₃⁻ **21.0↓**, BE **−2.5** (ABE; SBE −1.7)
- Lactate **2.20↑** (peak of this night)
- FiO₂ **50%**, P/F **151**
- Hb **10.3**, Hct **30%**, iCa **1.06**
- Screenshot: `testset/reports/abg/20260921T042017__01a0c12e-1edf-738a-a9c0-2af432ab594d.jpg`

### Arterial blood gas — 2026-09-21 01:13 (postop 131h13m)

- pH **7.445**, PCO₂ **31.4↓**, PO₂ **98.0**, HCO₃⁻ **21.1↓**, BE **−3.0** (ABE; SBE −2.3)
- Lactate **1.92↑**
- FiO₂ **50%**, P/F **196**
- Hb **10.2**, Hct **30%**, iCa **1.05**
- Screenshot: `testset/reports/abg/20260921T011350__01a0c12e-1f46-7fa8-a529-b3967ba90982.jpg`

### Coag / electrolytes — 2026-09-21 01:23–01:25 (postop 131h23–25m)

- APTT **52.4↑** sec; K **4.24**
- Screenshots: `testset/reports/coag/20260921T012504__01a0c12e-1f17-7255-8629-d54e2c10f627.jpg`, `testset/reports/chemistry/20260921T012307__01a0c12e-1f2f-7986-8546-7731c8929d67.jpg`

### Arterial blood gas — 2026-09-20 22:16 (postop 128h16m)

- pH **7.420** (back in range), PCO₂ **27.5↓**, PO₂ **86.0**, HCO₃⁻ **17.4↓**, BE **−7.0** (ABE; SBE −5.9)
- Lactate **1.64↑** (just above ref 0.5–1.6; was 1.52)
- FiO₂ **50%**, P/F **172** (down from evening 188; still far below 400). This 172 is oxygenation index, not PCT.
- Hb **10.4↓** g/dL (was 7.7), Hct **31%↓**, iCa **1.05↓**
- Screenshot: `testset/reports/abg/20260920T221605__01a0bfbf-47c7-7b79-9021-63de7df46829.jpg`

### Coag / electrolytes — 2026-09-20 22:31 (postop 128h31m)

- APTT **49.2↑** sec (ref 21–45 on this sheet; was 45.9 at 08:51)
- K **4.50** mmol/L (ref 3.5–5.3; dry chemistry)
- Screenshots: `testset/reports/coag/20260920T223131__01a0bfbf-47b4-7c64-92dd-e07ae00e4cc8.jpg`, `testset/reports/chemistry/20260920T223137__01a0bfbf-4799-7d1b-8d0e-35cac0a9bf41.jpg`

### Arterial blood gas — 2026-09-20 17:48 (postop 123h48m)

- pH **7.339↓**, PCO₂ **29.9↓**, PO₂ **94.0**, HCO₃⁻ **15.7↓** (cHCO3-(p); tCO₂(B) 16.7), BE **−10.1** (ABE; SBE −9.1)
- Lactate **1.52** (in ref 0.5–1.6; was 1.33)
- FiO₂ **50%**, P/F **188** (improved vs morning 147; still far below 400). This 188 is oxygenation index, not PCT.
- Hb **7.7↓** g/dL (was 7.1), Hct **23%↓**, iCa **1.06↓**
- Screenshot (preferred hires 3520×3772): `testset/reports/abg/20260920T174824__hires__E52C65DD-C1D7-4471-92BE-DE877A9FFF96_L0_001.jpg`

### Arterial blood gas — 2026-09-20 06:46 (postop 112h46m)

- pH **7.366** (then in range), PCO₂ **26.5↓**, PO₂ **73.5↓**, HCO₃⁻ **14.8↓**, BE **−10.5** (ABE; SBE −9.5)
- Lactate **1.33** (in ref 0.5–1.6; was 1.87)
- FiO₂ **50%**, P/F **147** (worse than 165). This 147 is oxygenation index, not PCT.
- Hb **7.1↓** g/dL (was 10.1 about 8 h earlier), Hct **21%↓**, iCa **1.05↓** unchanged
- Screenshot: `testset/reports/abg/20260920T064628__798E6163-C1D5-4879-8B3E-B60C543EEB37_L0_001.jpg`

### Arterial blood gas — 2026-09-19 22:36 (postop 104h36m)

- pH **7.346↓**, PCO₂ **32.8↓**, PO₂ **82.7**, HCO₃⁻ **17.5↓**, BE **−8.1** (ABE; SBE −7.3)
- Lactate **1.87↑** (down from morning 2.14; still above 0.5–1.6)
- FiO₂ **50%**, P/F **165** (worse than morning 210; still far below 400). This 165 is oxygenation index, not PCT.
- Hb **10.1↓** g/dL, Hct **30%↓**, iCa **1.05↓**
- Screenshot: `testset/reports/abg/20260919T223643__01a0ba3b-075f-7f18-b222-e28323098d73.jpg`

### Arterial blood gas — 2026-09-19 06:44 (postop 88h44m)

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

### Chemistry — latest 2026-09-20 09:55 (postop 115h55m)

- Cr **314↑** (was 204), urea **25.69↑** (was 13.27)
- K **5.09**, Na **130.77↓**, Cl **96.24**
- Screenshot: `testset/reports/chemistry/20260920T095528__87367DCB-4771-429D-9168-98B3CF4CA5C1_L0_001.jpg`

### Chemistry — 2026-09-19 10:03 (postop 92h03m)

- PCT **65.368** (was 101.563), Cr **204.0** (rechecked; was 212), urea **13.27** (was 11.59)
- K **4.80**, Na **134.78↓** (ref 137–147), Cl **100.69**
- Albumin **29.3↓** g/L (ref 34–48) on this sheet. GLB and A/G blank. Family confirms albumin was measured **at least twice**; the earlier result is **not** in the archived screenshots, so the trend still has only this point.
- Preferred screenshot: `testset/reports/chemistry/20260919T100330__01a0b7bc-519d-72d9-9831-8fd5f6dd93c7.jpg`

### Chemistry — 2026-09-18 08:58 (postop 66h58m)

- PCT **101.563**, Cr **212**, urea **11.59**, K 4.35, Na 137.91, Cl 97.56

### CBC series

| Time | WBC | Hb g/L | PLT | Notes |
|------|-----|--------|-----|-------|
| 2026-09-17 09:46 | 11.52 | 85 | 73 | neut% ~95 |
| 2026-09-18 08:34 | 14.51 | 85 | 65 | neut% ~91; plateletcrit 0.08% |
| 2026-09-19 08:46 | 13.17 | 76 | 55 | neut% 87.9; plateletcrit 0.06% |
| 2026-09-20 08:23 | **17.42** | **67** | **60** | HCT 19.7; neut% **89.0** / neut 15.50; lymph 0.56; plateletcrit **0.07%** (not procalcitonin) |
| 2026-09-21 09:16 | **19.40** | **100** | **60** | HCT 27.6; neut% **93.5** / neut 18.14; lymph 0.50; plateletcrit **0.08%** (not procalcitonin) |
| 2026-09-21 19:05 | **18.61** | **101** | **69** | HCT 28.6; neut% **94.4** / neut 17.57; lymph 0.80; plateletcrit **0.08%** (not procalcitonin) |

Screenshot: `testset/reports/cbc/20260920T082350__AB9B583D-80E7-4A01-8AB1-2BC6564410ED_L0_001.jpg`

Agrees in direction with the 06:46 ABG Hb 7.1 g/dL / Hct 21%. Do not equate the two methods point for point.

### Coagulation — 2026-09-20 08:51 (postop 114h51m)

- APTT **45.9↑** (this sheet’s ref **23.3–32.5**), down from 67.2
- PT **11.8**, INR **1.03**, TT **16.6**, fibrinogen **4.02** — all in range
- Screenshot: `testset/reports/coag/20260920T085123__EAF483F6-82EA-49BB-882F-74F7602D7C31_L0_001.jpg`

### Coagulation — 2026-09-18 22:13 (postop 80h13m)

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
| Bedside BP / HR / pressors | `vitalReadings` (oral; approximate `h`) |
| Metric catalog + categories | `metricConfig` + `metricGroups` (分类汇总 sparklines + 详细趋势). First group is **循环/支持** (`map`, `sbp`, `dbp`, `hr`, `ne`, `da`). Dedicated BP + pressor charts sit under 循环与支持. |
| Status cards / insights / timeline / expandable reports | HTML sections near top/middle |
| Doctor checklist | `doctorQuestions` |
| Latest non-ABG clock for hero pill | `latestNonBloodGasReport` |
| Report screenshot archive | `testset/reports/` + `testset/manifest.json` |

Update flow when new reports arrive:

1. **Backup the screenshot** into `testset/reports/<category>/` (or `inbox/`) and register in `manifest.json`.
2. Read report clock → compute `h` from surgery end.
3. Append/update `baseReadings` / `labReadings` / `vitalReadings`; ensure new fields exist in `metricConfig` + `metricGroups`.
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

**Last updated:** 2026-09-21 evening — CBC WBC **18.61** / Hb **101** / PLT **69**; APTT **48.8**; FOBT immunoassay **positive**. Oral bedside unchanged (NE 4, DA 7.5, BP 150/55). CRRT still stopped, still no urine.
