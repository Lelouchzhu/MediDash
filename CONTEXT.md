# MediDash — clinical & agent context handoff

This file is the **readable memory** for future Cloud Agents working on `Lelouchzhu/MediDash`.  
It summarizes decisions, data conventions, and clinical state from prior agent runs. It is **not** a full chat transcript dump.

**Source of truth repo:** `https://github.com/Lelouchzhu/MediDash` (not the Allmond fork)  
**Prior agent run (Allmond-bound, then continued here):** https://cursor.com/agents/bc-01a0a01a-a6eb-72c7-b052-ba5e14ed8b1b  
**Conversation summary (current):** [`docs/transcripts/2026-09-21-bc-01a0a01a-summary.md`](docs/transcripts/2026-09-21-bc-01a0a01a-summary.md)  
**Conversation summary (through 9/18 13:00 ABG):** [`docs/transcripts/2026-09-18-bc-01a0a01a-summary.md`](docs/transcripts/2026-09-18-bc-01a0a01a-summary.md)  
**大陆入口（提交号，不要用 @main）:** https://jsd.onmicrosoft.cn/gh/Lelouchzhu/MediDash@bdad82c/index.xhtml  
**备用国内镜像:** https://cdn.jsdmirror.com/gh/Lelouchzhu/MediDash@bdad82c/index.xhtml  
**海外备用:** https://htmlpreview.github.io/?https://github.com/Lelouchzhu/MediDash/blob/main/index.html  
国内 `@main` 镜像不会跟着 main 走。`bdad82c` 才是 9月23日15:45口述。顶栏是最新口述：术后193h45m · 血压 96/36。肌酐仍是 423，血滤约14:00已开。血气仍是乳酸 2.02、pH 7.327、P/F 167。

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
| **降钙素原 / PCT** (biochem) | **Procalcitonin** ng/mL | 41.1 → 63.4 → 146 → 170 → 102 → 65 → 36.9 → 28.8 → **18.701** |
| **血小板比积 / PCT** (CBC) | **Plateletcrit** % | latest **0.12%** (was 0.08%) |
| **氧合指数 pO2(a)/FO2(I)** | PaO₂/FiO₂ | morning ABG **169** |

A low-resolution ABG once caused “PCT 170” confusion with oxygenation index **169**. The **real** procalcitonin 170.297 is on the **2026-09-17 10:52** chemistry panel (same sheet as ALT/AST).

---

## Procalcitonin series (confirmed)

| Report time | Relative | PCT (ng/mL) |
|-------------|----------|-------------|
| 2026-09-15 09:49 | preop 4h10m | **41.1266** |
| 2026-09-15 16:44 | postop 2h44m | **63.3677** |
| 2026-09-16 09:44 | postop 19h44m | **146.421** |
| 2026-09-17 10:52 | postop 44h52m | **170.297** |
| 2026-09-18 08:58 | postop 66h58m | **101.563** |
| 2026-09-19 10:03 | postop 92h03m | **65.368** |
| 2026-09-21 09:18 | postop 139h18m | **36.8855** |
| 2026-09-22 09:54 | postop 163h54m | **28.783** |
| 2026-09-23 09:21 | postop 187h21m | **18.701** |

Trend: falling since the peak, still far above ref 0–0.05. The first 09:18 chemistry crop omitted PCT; the replacement screenshot of the **same clock** has it.

## Inflammation series (confirmed)

| Report time | Relative | CRP (mg/L) | IL-6 (pg/mL) |
|-------------|----------|------------|--------------|
| 2026-09-15 09:49 | preop 4h10m | **86.80** (ref 0–8) | — |
| 2026-09-17 10:52 | postop 44h52m | — | **981** |
| 2026-09-21 09:18 | postop 139h18m | **97.70** (ref 0–8) | **68.500** (ref 0–7) |

`metricConfig` now includes `crp`. Infection group metrics: `pct`, `crp`, `il6`, `wbc`.

---

## Latest clinical snapshot (as of last MediDash update)

### Support / vitals (family-reported)

- **Latest bedside (family oral received 2026-09-23 15:45, postop 193h45m):** BP **96/36**, pulse **86**, respiratory rate **13**. No MAP was stated — do not invent one (the previous **55** was family-stated on 9/22). Norepinephrine still **2 mL/h = 0.10 mg/h**. Dopamine still **5 mL/h**. Family said pressors are unchanged from the morning. Do not convert dopamine to mg/h. Afternoon agitation increased (**反抗多**). Sedative output was increased; drug name and rate were not stated — do not invent them. No eye opening the whole time, as spoken, not a coma diagnosis. **呼吸正压 15–18** is still the **9/22 16:11** phrase; this afternoon did not restate a ventilator number.
- **Oral clocks** are message-receipt times (git commit UTC+8, or the chat timestamp), labeled 口述收到时间. They are not monitor sample clocks. The earliest five orals only had approximate postop hours, so their clocks stay approximate: 约9月16日00:00 / 12:00 / 19:00, 约9月17日10:00 / 16:00.
- **Dr. Zhao:** current BP is acceptable, circulation is okay, and the BP course looks stable. ICU focus now is blood pressure and the lungs, both relatively stable. If pressors can be stopped completely and the ventilator removed, and only the kidney problem remains, ICU is no longer required and care may shift to dialysis.
- Prior bedside (~postop 144h): BP 150/55 (MAP≈87), pulse 106, NE 4 + DA 7.5. Earlier ~122h: BP 125/35.
- **CRRT:** the 2026-09-20 ~16:00–18:00 run lasted **19 h 48 min** and then stopped. Pre-start settings on that run were blood **130 mL/min**, UF **300 mL/h**. Do not copy those settings onto the new run. Cumulative UF of the stopped run was not confirmed. Prior stop was morning 2026-09-19 (family said 凌晨; the oral was received 9/19 11:48 — keep both).
- **New run:** family said 血滤 started **约2026-09-23 14:00** (两点左右, postop **192h**). Blood flow, ultrafiltration, and anticoagulation were not stated. Still **anuric** at the 15:45 oral.
- Vasopressor series: norepinephrine **9 → 6 → 4 → 2 mL/h** (0.45 → 0.30 → 0.20 → **0.10 mg/h**) + dopamine **10 → 8 → 7.5 → 5 mL/h**. Concentration **0.05 mg/mL**. Do not invent dopamine mg/h.
- **Transfusion:** **4 units RBC**, B Rh-positive, family says **started same 16:00–18:00 window**. ABG Hb **7.7 at 17:48 → 10.4 at 22:16 → 10.7 at 06:52 → 8.9 at 10:53 → 10.2 at 06:41 → 9.9 at 18:30**. Evening CBC Hb **101** (19:05) → morning 9/22 **97**. Ask how many units finished.
- **K:** 3.93 (09:18, on CRRT) → **4.41** (22:50) → **4.49** (09:54 9/22) → **4.85** (21:13 9/22) → **5.09** (09:21 9/23) → **4.71** (16:47 9/23, dry chemistry, ref 3.5–5.3, no abnormal flag). Na **130.76↓** and Cl **94.37↓** were not redrawn on the 16:47 sheet. iCa on the 20:50 ABG is **1.04** (still below 1.15).
- **Kidney:** Cr **320 → 423**, urea **31.32 → 41.03** (critical, rechecked). Still **anuric** at 15:45. Blood filtration restarted about **14:00**; settings unknown.
- **Ultrasound 2026-09-23 10:19 (postop 188h19m):** bilateral lower-extremity arterial and venous color Doppler. Impression, in the report’s words: atherosclerosis with multiple plaques; **possible incomplete occlusion of both posterior tibial arteries**; subcutaneous edema. Larger plaques at the common femoral arteries, low/weak echo, about **1.1×0.2 cm (right)** and **1.4×0.4 cm (left)**. Left PTA and the distal right PTA show only intermittent punctate flow; other arteries fill well. PTA spectra are biphasic with reduced velocity; the other spectra are triphasic and within the stated normal velocity range. Accompanying deep veins and superficial veins in the scanned field: flow fills satisfactorily, **no abnormal echo**. The report does not write thrombus. Thigh subcutaneous thickness about **2.1 cm (right)** and **2.3 cm (left)**. This replaces the same-morning oral “ultrasound in progress.”
- **Stool:** microscopy WBC/RBC negative (oral). FOBT immunoassay **positive** 18:32 9/21. Family oral received 9/22 11:35: **3 stools yesterday, dark brown / 黑褐色**. Family oral received 9/23 15:45: **one stool today, black / 黑色**, still anuric. Color plus FOBT does not quantify or localize. Today’s 黑色 is a new stool, not a rename of the earlier 黑褐色.
- **Ultrasound oral gloss (received 15:45):** family said the lower-extremity study was normal, no thrombus, ordinary atherosclerosis in the elderly. This does **not** replace the 10:19 report (plaques, possible incomplete PTA occlusion, no abnormal venous echo).
- **Watch next:** BP **96/36** is still the 15:45 oral (no evening vitals); one black stool; CRRT settings since ~14:00 and anuria, with Cr **423** / urea **41.03** not redrawn; pH **7.345** still below 7.35 after a 16:27 dip to **7.298**; lactate back in range at **1.18**; FiO₂ now **60%**, P/F **139**; K **4.71** in range; Na **130.76** and Cl **94.37** not redrawn; iCa **1.04**; WBC **24.97** while PCT **18.701** still falling.

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
- **Judgment:** WBC slightly down, still high with neutrophilia. APTT easing toward ref. CBC Hb stable despite FOBT+ — not a large bleed on this snapshot; still ask about stool color. K and Cr after CRRT stop were still unchecked at this clock.
- Screenshots: `testset/reports/other/20260921T183228__0915680A-8202-4C78-B57D-C03CF3C68D68_L0_001.jpg`, `testset/reports/cbc/20260921T190522__F15281AC-0475-4441-BA34-E820C9B4DAD2_L0_001.jpg`, `testset/reports/coag/20260921T192039__E0EEF2FA-427C-4F72-9881-5377D8F49812_L0_001.jpg`

### Coag — 2026-09-21 11:07 (postop 141h07m)

- APTT **51.8↑** sec (ref 21–45); rebound from **45.8** at 09:18
- Screenshot: `testset/reports/coag/20260921T110725__01a0c208-02ed-7967-8409-0a947755103f.jpg`

### Morning labs — 2026-09-22 09:15–09:54 (postop 163h15m–163h54m)

- **Coag 09:15:** APTT **40.2↑** sec. This sheet’s ref is **23.3–32.5**, not 21–45, so 40.2 is still high here (it would have sat inside the wider range). TT **16.5**, PT **12.7**, INR **1.13**, Fbg **3.22** — in range on this sheet.
- **Chemistry 09:54:** Cr **320.0↑** (was 231), urea **31.32** critical and rechecked (ref 3.1–8.8; was 22.09), PCT **28.783↑** (was 36.8855; procalcitonin, not plateletcrit), K **4.49**, Na **135.77↓**, Cl **96.68**.
- **Bedside:** overnight urine still **0**. CRRT on standby, family says it will be started later. Yesterday **3** stools, **黑褐色**.
- **Judgment:** creatinine and urea rebounded after the stop, with no urine, so the planned restart matches the labs. Potassium did not overshoot. PCT is still falling and still very high. Dark stool plus yesterday’s FOBT+ is the GI-bleed question; it does not by itself prove how much blood was lost. APTT improved numerically but remains above this lab’s tighter range.
- Screenshots: `testset/reports/coag/20260922T091531__01a0c727-d230-7f6a-9621-60f8797bf7e5.jpg`, `testset/reports/chemistry/20260922T095424__01a0c727-d24e-7b54-9c84-775bad64cb94.jpg`

### Morning CBC — 2026-09-22 08:28 (postop 162h28m)

- WBC **20.86↑** (was 18.61), Hb **97↓** g/L (was 101), HCT **26.2↓**, PLT **70↓** (was 69), NEUT% **94.6↑**, NEUT# **19.73↑**, lymph 0.65↓ / 3.1%↓, MONO% 2.2↓, MCHC **370↑**. Plateletcrit **0.08%** is not PCT.
- **Judgment:** WBC rose again after last night’s slight dip. CBC Hb eased 101→97; do not equate with later ABG Hb. PLT essentially flat at 70. Hero later moved to the 21:13 potassium (newer than this CBC and newer than the 21:03 ABG).
- Screenshot: `testset/reports/cbc/20260922T082854__01a0c89f-7a78-754d-9252-980e1cf30e11.jpg`

### Peri-op archive — 2026-09-14 / 2026-09-15 (hires / missing early sheets)

None of these clocks existed in the labeled testset before this batch.

- **CBC 9/14 15:21 (preop 22h38m):** WBC **11.67↑**, Hb **130**, PLT **255**, lymph% **41↑**, lymph# **4.79↑**, plateletcrit 0.23. Matches the old “术前基础检查” note; now archived.
- **CBC 9/15 06:05 (preop 7h54m):** WBC **9.96↑**, Hb **159↑**, HCT **46.2↑**, PLT **335**, neut% **73.5**, neut **7.32↑**, plateletcrit 0.32.
- **Chemistry 9/15 09:49 (preop 4h10m):** ALT **23**, AST **49↑**, CRP **86.80↑**, PA **249↓**, ADA **23.4↑**, TP **57↓**, ALB **37.71**, TBIL **16.5**, PCT **41.1266↑**.
- **Serology 9/15 11:21 (preop 2h38m):** HIV / HCV / TP **negative**. HBsAg **0.003** (in range). HBcAb **>10↑** with HBsAg negative is an old-HBV pattern — background only, not a diagnosis.
- **CBC 9/15 15:49 (postop 1h49m):** WBC **6.97**, Hb **122**, PLT **249**, neut% **72.6**, plateletcrit 0.27.
- **Chemistry 9/15 16:44 (postop 2h44m):** ALT **719↑**, AST **1142↑**, AST/ALT **1.52**, TBIL **7.0**, ALB **23.1↓**, Cr **206↑**, urea **16.30↑**, K **4.775**, Na **140.855**, Cl **108.133↑**, PCT **63.3677↑** (rechecked). Keep separate from the **2.87** CK-only panel (CK 5657). Duplicate upload `01a0c89f-7a65` is identical sha/bytes; `preferred: false`, `superseded_by` the `79ef` file.
- Albumin series is now **37.71 → 23.1 → 29.3 → 35.8**. Liver **23/49 → 719/1142 → 891/806 → 159/82**.
- Screenshots: `testset/reports/cbc/20260914T152116__01a0c89f-7a1b-7fcb-82fa-afe627c9729a.jpg`, `testset/reports/cbc/20260915T060530__01a0c89f-7a09-78c0-bc0f-9d527d418b19.jpg`, `testset/reports/chemistry/20260915T094954__01a0c89f-7a2e-7658-8eb2-e5f88d112dfd.jpg`, `testset/reports/other/20260915T112144__01a0c89f-7a43-7464-9aa1-2bb185e6541f.jpg`, `testset/reports/cbc/20260915T154907__01a0c89f-7a54-743c-9851-ef39870f4fc5.jpg`, `testset/reports/chemistry/20260915T164416__01a0c89f-79ef-7e7a-8dc4-54586c128826.jpg` (preferred)

### Morning labs — 2026-09-23 09:06–09:26 (postop 187h06m–187h26m)

- **CBC 09:06:** WBC **24.97↑** (was 20.86), RBC **2.94↓**, Hb **94.0↓** g/L (was 97), HCT **26.6↓**, PLT **94.00↓** (was 70, still low), LYMPH% **2.6↓**, MONO% **2.6↓**, NEUT% **94.7↑**, NEUT# **23.65↑**, LYMPH# **0.65↓**, EOS% **0.0↓**. Plateletcrit **0.12%↓** (ref 0.17–0.35) is not procalcitonin.
- **Chemistry 09:21:** K **5.09** (ref 3.5–5.3, in range, not flagged; was 4.85), Na **130.76↓** (was 135.77), Cl **94.37↓** (was 96.68, now below 96–108), urea **41.03** critical and rechecked (was 31.32; ref 3.1–8.8), Cr **423.0↑** (was 320; ref 41–81), PCT **18.701↑** ng/mL (was 28.783; procalcitonin, ref 0–0.05).
- **Coag 09:26:** APTT **33.0↑** sec. This sheet’s ref is **23.3–32.5**, not 21–45, so 33.0 is still high (was 40.2). TT **16.9**, PT **12.4**, PT% **84.5**, INR **1.10**, Fbg **3.44** — in range on this sheet.
- **Oral, same morning, before the report:** ultrasound was in progress for lower-extremity veins. The formal study is the 10:19 Doppler below. No new urine on these sheets.
- **Judgment:** creatinine and urea rose further after CRRT remained on standby with no urine. Potassium did not leave 3.5–5.3. Sodium and chloride are both below range. WBC rose again while procalcitonin kept falling. CBC Hb eased 97→94; do not equate with ABG Hb 9.8. PLT rose 70→94 and is still low. APTT improved numerically and remains above this lab’s tighter range. The chemistry clock was the hero until the 10:19 Doppler.
- Screenshots: `testset/reports/cbc/20260923T090633__A7C6CB55-580E-4D0F-9970-67133DFB6429_L0_001.jpg`, `testset/reports/chemistry/20260923T092110__B95B724A-68C8-4F31-A6C6-8B453F6710C4_L0_001.jpg`, `testset/reports/coag/20260923T092632__79733D1D-DCFB-4502-B0A8-67B838117C8D_L0_001.jpg`

### Lower-extremity Doppler — 2026-09-23 10:19 (postop 188h19m)

- Study: bilateral lower-extremity arterial and venous color Doppler.
- **Impression:** atherosclerosis with multiple plaques; possible incomplete occlusion of both posterior tibial arteries; subcutaneous tissue thickened by edema. Keep the word **可能**.
- Plaques: several along the visualized arteries. The larger ones are in the common femoral arteries, low/weak echo, about **1.1 cm × 0.2 cm (right)** and **1.4 cm × 0.4 cm (left)**.
- Flow: left posterior tibial artery and the distal right posterior tibial artery show only intermittent punctate signals. Other arteries fill well. PTA waveforms are biphasic with reduced velocity. Remaining waveforms are triphasic, velocities described as within normal range from proximal to distal.
- Veins: accompanying deep veins and superficial veins in the displayed field fill satisfactorily and have **no abnormal echo**. The report does not write thrombus. Do not widen that into a whole-body exclusion.
- Edema: thicker at the thighs, about **2.1 cm (right)** and **2.3 cm (left)**.
- **Judgment:** this is the formal result of the morning ultrasound. The 15:45 family gloss (“正常、无血栓，老年人常见粥样动脉硬化”) does not replace these words. Hero pill later moved to the 15:45 bedside oral. Creatinine 423 stays on the kidney card.
- Screenshot: `testset/reports/imaging/20260923T101955__AA4638F0-E1EE-4DA9-A6B2-0D0D16BD5962_L0_001.jpg`

### Bedside oral — received 2026-09-23 15:45 (postop 193h45m)

No new screenshot on that oral. The evening labs below bring the manifest to **124**.

- BP **96/36**, pulse **86**, RR **13**. No MAP. Circulation card jumps to `sbp`.
- Pressors unchanged: norepinephrine **2 mL/h = 0.10 mg/h**, dopamine **5 mL/h**.
- Stool today: **one, black**. Still anuric.
- 血滤 started **约14:00** (postop 192h). No blood-flow, ultrafiltration, or anticoagulation number. Do not reuse 130 mL/min or UF 300.
- Afternoon: more fighting/agitation, sedative output increased, no eye opening. No drug name or rate.
- Family gloss of the Doppler does not replace plaque sizes or “不完全闭塞可能”.
- That oral is no longer the hero. The 20:50 arterial clock is newer. `latestNonBloodGasReport` is now the 16:47 potassium.
- `rr` is in `metricConfig` and the circulation group. Earlier respiratory rates were ranges and are not plotted.

### Evening ABG + potassium — 2026-09-23 16:27 / 16:47 / 17:43 / 20:50

No new urine, creatinine, pressor dose, or ventilator number on these sheets. 血滤 had started about 14:00; these sheets do not state flow or ultrafiltration.

- **ABG 16:27 (postop 194h27m):** pH **7.298↓**, PCO₂ **37.80**, PO₂ **93.00**, HCO₃⁻ **18.10↓**, ABE **−8.40** (SBE −7.70). Lactate **1.16** (back in 0.5–1.6; was 2.02). FiO₂ **60%** (was 50%). Printed 氧合指数 **155**. The row `pO2(a)/FO2(I) = 0.24` is a ratio, not P/F. Hb **9.70**, Hct **29%**, iCa **1.03↓**, temperature 37.0. PH(T) is also 7.298.
- **K 16:47 (postop 194h47m):** **4.71** mmol/L, dry chemistry, ref 3.5–5.3, empty abnormal column. Was **5.09**. Phone status-bar time is not this clock.
- **ABG 17:43 (postop 195h43m):** pH **7.301↓** (PH(T) **7.304↓**), PCO₂ **43.50**, PO₂ **84.10**, HCO₃⁻ **21.00↓**, ABE **−5.40** (SBE −5.20). Lactate **1.29**. FiO₂ **60%**. Printed 氧合指数 **140**. The 0.22 row is not P/F. Hb **9.80**, Hct **29%**, iCa **1.02↓**.
- **ABG 20:50 (postop 198h50m):** pH **7.345↓** (still below 7.35). PH(T) **7.351** sits inside 7.35–7.45 and is not flagged. The chart uses the uncorrected **7.345**, same row as every earlier point. PCO₂ **39.40**, PO₂ **83.60**, HCO₃⁻ **21.00↓**, ABE **−4.70** (SBE −4.30). Lactate **1.18**. FiO₂ **60%**. Printed 氧合指数 **139** (83.6 / 0.60). The 0.21 row is not P/F and not PCT. Hb **10.20**, Hct **30%**, iCa **1.04↓**.
- **Judgment:** lactate left the high flag. pH dipped at 16:27 and then moved toward 7.35 without crossing it on the uncorrected row. Base deficit eased −8.4 → −4.7 and is still outside −3 to 3. They raised FiO₂ to 60%; PO₂ stayed inside 80–100 while P/F fell 167 → 139. Potassium moved away from the top of 3.5–5.3. Do not equate ABG Hb 10.2 with CBC Hb 94. Hero pill follows this arterial clock: **最新：术后198h50m**. Creatinine 423 stays on the kidney card.
- Screenshots: `testset/reports/abg/20260923T162754__01a0ce89-bcf2-7183-a5fb-27af268d514c.jpg`, `testset/reports/chemistry/20260923T164753__01a0ce89-bcde-701e-9850-a91824e69425.jpg`, `testset/reports/abg/20260923T174330__01a0ce89-bd05-7b8b-99ba-5174bb7e2532.jpg`, `testset/reports/abg/20260923T205050__01a0ce89-bd1b-7219-9adc-0f57e8e26ab4.jpg`

### Morning ABG — 2026-09-23 06:38 (postop 184h38m)

- pH **7.327↓** (was 7.402), PCO₂ **34.90↓**, PO₂ **83.50**, HCO₃⁻ **17.90↓**, ABE **−8.10** (SBE −7.40)
- Lactate **2.02↑** (was **1.59**; ref 0.5–1.6)
- FiO₂ still **50%**. P/F **167** (printed pO2(a,T)/FO2(I); was 159). This 167 is oxygenation index, not PCT.
- Hb **9.80↓** g/dL (was 10.20), Hct **29%**, iCa **0.98↓**, sO₂ 94.9%
- **Judgment:** lactate left the reference again. pH left 7.35–7.45 and the base deficit roughly doubled versus last night (−4.9 → −8.1). PO₂ itself is inside 80–100, but P/F 167 on 50% oxygen is still far below 400. Do not equate ABG 9.8 with later CBC Hb 94. No potassium, creatinine, WBC, urine, or pressor dose on this sheet. This arterial clock was the hero until the 09:21 chemistry (Cr 423) replaced it.
- Screenshot (3520×3772): `testset/reports/abg/20260923T063825__95415F20-A766-4C47-A73D-FE4CD95D5808_L0_001.jpg`

### Night ABG + potassium — 2026-09-22 21:03 / 21:13 (postop 175h03m / 175h13m)

- **ABG 21:03:** pH **7.402** (unchanged, in range), PCO₂ **32.70↓**, PO₂ **79.30↓**, HCO₃⁻ **19.90↓**, ABE **−4.90** (SBE −4.20)
- Lactate **1.59** (in ref 0.5–1.6; was **1.46**). Sitting against the upper limit.
- FiO₂ **50%** (was 45% at 18:30). P/F **159** (printed pO2(a,T)/FO2(I)). This 159 is oxygenation index, not PCT.
- Hb **10.20** g/dL (was 9.90), Hct **30%**, iCa **0.99↓**, sO₂ 95.1%
- **K 21:13:** **4.85** mmol/L (dry chemistry, ref 3.5–5.3; was 4.49). Still in range. This clock is newer than the ABG, so the hero pill follows **术后175h13m · 钾 4.85**.
- **Judgment:** lactate stayed inside the reference and moved up toward 1.6. They put FiO₂ back to 50% and P/F eased 169→159. pH held while HCO₃⁻/ABE went more negative. Potassium rose and did not leave the range. No new urine, creatinine, WBC, or pressor dose on these sheets.
- Screenshots: `testset/reports/abg/20260922T210306__01a0c965-14e7-7260-b2fd-0a363b44f52e.jpg`, `testset/reports/chemistry/20260922T211325__01a0c965-1506-7475-98f8-9f84d61dd42c.jpg`

### Evening ABG — 2026-09-22 18:30 (postop 172h31m)

- pH **7.402** (in 7.35–7.45), PCO₂ **33.90↓**, PO₂ **76.00↓**, HCO₃⁻ **20.60↓**, ABE **−4.10** (SBE −3.60)
- Lactate **1.46** (in ref 0.5–1.6; was **2.12** at 06:41)
- FiO₂ **45%** (was 50%), P/F **169** (76 / 0.45). This 169 is oxygenation index, not PCT.
- Hb **9.90↓** g/dL (was 10.2), Hct **29%↓**, iCa **1.00↓**, sO₂ 94.1%
- **Judgment:** lactate is back in range. They lowered FiO₂ a step; P/F only moved 156→169 and is still far below 400. pH stayed in range while HCO₃⁻/ABE went more negative than this morning. Do not equate ABG 9.9 with CBC 97. No new urine, creatinine, pressors, or WBC on this sheet.
- Screenshot (3520×3772): `testset/reports/abg/20260922T183052__01a0c8f4-1777-768d-bbe2-c96ee2e66856.jpg`

### Overnight ABG + potassium — 2026-09-21 22:40 to 2026-09-22 06:41

Built on the other agents' mainland `index.xhtml` pipeline (`5131212`). Clinical numbers below are new.

- **ABG 22:40 (postop 152h40m):** pH **7.463↑**, PCO₂ **31.50↓**, PO₂ **69.50↓**, HCO₃⁻ **22.10**, ABE **−1.70** (SBE −1.00), lactate **1.93↑**, FiO₂ **50%**, P/F **139** (oxygenation index, not PCT), Hb **11.70↓** g/dL, Hct **34%↓**, iCa **0.99↓**
- **K 22:50 (postop 152h50m):** **4.41** mmol/L (ref 3.5–5.3). Rebound from **3.93** after CRRT stop, still inside the range.
- **ABG 06:41 (postop 160h41m):** pH **7.449** (back in 7.35–7.45), PCO₂ **32.60↓**, PO₂ **77.80↓**, HCO₃⁻ **22.10**, ABE **−1.90** (SBE −1.40), lactate **2.12↑**, FiO₂ **50%**, P/F **156**, Hb **10.20↓** g/dL, Hct **30%↓**, iCa **1.02↓**
- **Judgment:** lactate left the reference again (1.54 → 1.93 → 2.12). Oxygenation dipped to 139 then 156, still far below 400. ABG Hb rose to 11.7 then eased to 10.2; do not equate with CBC 101. Potassium rebound stayed in range. No new urine or creatinine.
- Screenshots: `testset/reports/abg/20260921T224007__01a0c65d-807d-73bf-a7cc-dcccb27e359d.jpg`, `testset/reports/chemistry/20260921T225059__01a0c65d-808f-7496-84de-302c2fae5811.jpg`, `testset/reports/abg/20260922T064140__01a0c65d-8069-7ba0-a4cb-fc6932f7750f.jpg`

### Arterial blood gas — 2026-09-21 10:53 (postop 140h53m)

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
- Albumin **29.3↓** g/L (ref 34–48) on this sheet. GLB and A/G blank. Earlier points are now archived: **37.71** (preop 4h10m) and **23.1** (postop 2h44m). Series: **37.71 → 23.1 → 29.3 → 35.8**.
- Preferred screenshot: `testset/reports/chemistry/20260919T100330__01a0b7bc-519d-72d9-9831-8fd5f6dd93c7.jpg`

### Chemistry — 2026-09-18 08:58 (postop 66h58m)

- PCT **101.563**, Cr **212**, urea **11.59**, K 4.35, Na 137.91, Cl 97.56

### CBC series

| Time | WBC | Hb g/L | PLT | Notes |
|------|-----|--------|-----|-------|
| 2026-09-14 15:21 | 11.67 | 130 | 255 | preop 22h38m; lymph% 41 / 4.79; plateletcrit 0.23% |
| 2026-09-15 06:05 | 9.96 | 159 | 335 | preop 7h54m; HCT 46.2; neut% 73.5 / 7.32; plateletcrit 0.32% |
| 2026-09-15 15:49 | 6.97 | 122 | 249 | postop 1h49m; neut% 72.6; plateletcrit 0.27% |
| 2026-09-17 09:46 | 11.52 | 85 | 73 | neut% ~95 |
| 2026-09-18 08:34 | 14.51 | 85 | 65 | neut% ~91; plateletcrit 0.08% |
| 2026-09-19 08:46 | 13.17 | 76 | 55 | neut% 87.9; plateletcrit 0.06% |
| 2026-09-20 08:23 | **17.42** | **67** | **60** | HCT 19.7; neut% **89.0** / neut 15.50; lymph 0.56; plateletcrit **0.07%** (not procalcitonin) |
| 2026-09-21 09:16 | **19.40** | **100** | **60** | HCT 27.6; neut% **93.5** / neut 18.14; lymph 0.50; plateletcrit **0.08%** (not procalcitonin) |
| 2026-09-21 19:05 | **18.61** | **101** | **69** | HCT 28.6; neut% **94.4** / neut 17.57; lymph 0.80; plateletcrit **0.08%** (not procalcitonin) |
| 2026-09-22 08:28 | **20.86** | **97** | **70** | HCT 26.2; neut% **94.6** / neut 19.73; lymph 0.65; plateletcrit **0.08%** (not procalcitonin) |
| 2026-09-23 09:06 | **24.97** | **94** | **94** | HCT 26.6; neut% **94.7** / neut 23.65; lymph 0.65; plateletcrit **0.12%** (not procalcitonin) |

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
| Bedside BP / HR / RR / pressors | `vitalReadings` (oral). `h` and the clock label are the **message receipt** time when one is known. The first five points stay approximate. The 9/23 15:45 point has no MAP. |
| Metric catalog + categories | `metricConfig` + `metricGroups` (分类汇总 sparklines + 详细趋势). First group is **循环/支持** (`map`, `sbp`, `dbp`, `hr`, `rr`, `ne`, `da`). Dedicated BP + pressor charts sit under 循环与支持. |
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

**Last updated:** 2026-09-23 20:50 arterial blood gas (postop **198h50m**). Lactate **2.02 → 1.16 → 1.29 → 1.18** (back in 0.5–1.6). Uncorrected pH **7.298 → 7.301 → 7.345**, still below 7.35; 20:50 PH(T) **7.351** is inside 7.35–7.45 and the chart keeps **7.345**. HCO₃⁻ **21.0**, ABE **−4.7**. FiO₂ **60%**, printed P/F **155 → 140 → 139**. Do not use the 0.24 / 0.22 / 0.21 ratio rows as P/F. ABG Hb **10.2**, iCa **1.04**. Dry-chemistry K **4.71** at 16:47, still in 3.5–5.3. Cr **423**, urea **41.03**, WBC **24.97**, PCT **18.701**, APTT **33.0** unchanged. Bedside oral still BP **96/36** at 15:45. Hero pill **最新：术后198h50m**.
