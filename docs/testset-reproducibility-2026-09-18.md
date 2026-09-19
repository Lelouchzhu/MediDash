# Testset reproducibility audit — 2026-09-18

Goal: from every screenshot in `testset/` (except family **oral** vitals/CRRT/urine/pressors), can dashboard numeric entries be re-derived?

**Scope:** `baseReadings` + `labReadings` in `index.html`. Imaging/ECG/urinalysis narrative-only items noted but not required in trend arrays.

**Method:** Vision re-read of labeled + unlabeled report images; match by report clock → relative hours from surgery end **2026-09-15 14:00**.

---

## Verdict

| Bucket | Result |
|--------|--------|
| All **19 ABG** trend points | **Image-backed** (after fixes below) |
| All **structured lab** trend points | **Image-backed** |
| Labeled set (17 files / ~14 unique clocks) | **Match** core values |
| Oral bedside data | **Excluded** (as requested) |
| Extra image values not previously in trends | **Backfilled** in this commit |

**Overall:** Yes — excluding oral reports, the dashboard numeric series is reproducible from the testset. One transcription error and several incomplete extractions were found and corrected.

---

## Fixes applied during audit

| Issue | Image evidence | Before | After |
|-------|----------------|--------|-------|
| Arterial ABG 21h32m lactate | `other/01a0a862-…` · 11:32 · cLac **7.55** | lac **7.35** | **7.55** |
| Early postop ABG clock | `other/01a0a84a-afd3-…` · **15:31:43** | h **1.22** / 1h13m | h **1.53** / 1h32m |
| HCO₃ at 7h11m | `other/01a0a7ba-cce6-…` · **14.60** | 14.5 | **14.6** |
| Incomplete lab rows | multiple chemistry/coag shots | only subset stored | backfilled K/Na/Cl, APTT/PT, CK-MB/LDH/HBDH, K **3.59** |

---

## ABG coverage map (`baseReadings`)

| h | Label | Report clock | Source image (under `testset/reports/`) | Core check |
|---|-------|--------------|------------------------------------------|------------|
| −18.85 | 术前18h51m | 2026-09-14 ~19:09–19:14 | `other/01a0a019-fc18-…` | lac5.05 PF181 Hb14.7 ✓ |
| 1.53 | 术后1h32m | 2026-09-15 15:31 | `other/01a0a84a-afd3-…` (dup `01a0a7ba-cd53-…`) | lac5.30 PF221 ✓ |
| 2.97 | 术后2h58m | 2026-09-15 16:58 | `other/01a0a84a-aff9-…` (dup `01a0a7ba-cd2f-…`) | lac6.63 PF156 ✓ |
| 3.00 | 术后3h00m | 2026-09-15 17:00 | `other/01a0a84a-b00d-…` (dup `01a0a7ba-cd1b-…`) | lac6.53 PF65 · quality uncertain ✓ |
| 7.18 | 术后7h11m | 2026-09-15 21:11 | `other/01a0a7ba-cce6-…` | lac6.93 PF157 ✓ |
| 9.82 | 术后9h49m | 2026-09-15 23:49 | `other/01a0a7ba-ccd5-…` | lac8.99 PF243 ✓ |
| 12.55 | 术后12h33m | 2026-09-16 02:33 | `other/01a0a7ba-ccae-…` | lac7.64 PF273 ✓ |
| 16.83 | 术后16h50m | 2026-09-16 06:50 | `other/01a0a84a-b037-…` (dup `01a0a7ba-ccf6-…`) | lac8.29 PF300 ✓ |
| 21.43 | 术后21h26m | 2026-09-16 11:26 | `other/01a0a84a-afc2-…` | venous · lac7.52 · pf null ✓ |
| 21.53 | 术后21h32m | 2026-09-16 11:32 | `other/01a0a862-…` | lac **7.55** PF214 ✓ |
| 27.10 | 术后27h06m | 2026-09-16 17:06 | `other/53990787-…` | lac6.55 PF170 ✓ |
| 31.47 | 术后31h28m | 2026-09-16 21:28 | `other/01a0ac5d-…` | lac5.82 PF180 ✓ |
| 40.68 | 术后40h41m | 2026-09-17 06:41 | `other/01a0ac6e-…` | lac3.25 PF158 ✓ |
| 49.95 | 术后49h57m | 2026-09-17 15:57 | `other/01a0ae6a-…` | lac2.27 PF181 ✓ |
| 56.78 | 术后56h47m | 2026-09-17 22:47 | `abg/20260917T224742__…` | lac2.86 PF184 ✓ |
| 61.73 | 术后61h44m | 2026-09-18 03:44 | `abg/20260918T034405__…` | lac2.57 PF176 ✓ |
| 64.60 | 术后64h36m | 2026-09-18 06:36 | `abg/20260918T063619__…` | lac1.97 PF169 ✓ |
| 71.01 | 术后71h00m | 2026-09-18 13:00 | `abg/20260918T130029__…` | lac1.27 PF145 ✓ |
| 75.40 | 术后75h23m | 2026-09-18 17:23 | `abg/20260918T172343__…` | **no lac** · PF165 Hb8.8 ✓ |

Convention: dashboard `be` usually follows **ABE** when both SBE and ABE are printed.

---

## Lab coverage map (`labReadings`)

| h | Sample | Report clock | Source | Notes |
|---|--------|--------------|--------|-------|
| −22.85 | 生化 | 2026-09-14 15:09–15:39 | `other/01a0a019-fbe6-…` | Cr121.8 urea10.99 + electrolytes |
| −18.45 | 凝血 | 2026-09-14 19:33 | `other/01a0a019-fba0-…` / `e76241e2-…` | INR0.93 (+ APTT/PT) |
| 2.87 | 生化 | 2026-09-15 16:52 | `other/01a0a84a-afe6-…` | CK5657 + CK-MB/LDH/HBDH |
| 10.18 | 生化 | 2026-09-16 00:10 | `other/01a0a7ba-ccc1-…` | K3.59 (was missing from trends) |
| 19.05 | 凝血 | 2026-09-16 09:03 | `other/01a0a84a-afb1-…` | INR2.11 + APTT57.9 PT23 |
| 19.73 | 生化 | 2026-09-16 09:44 | `other/01a0a84a-af8f-…` | PCT146.421 + Cr/urea/electrolytes |
| 43.42 | 凝血 | 2026-09-17 09:24 | `other/4A7C4512-…` | INR1.43 + APTT50.8 PT15.8 |
| 43.78 | 血常规 | 2026-09-17 09:46 | `cbc/20260917T094650__…` | WBC11.52 Hb85 PLT73 ✓ |
| 44.87 | 生化 | 2026-09-17 10:52 | `chemistry/20260917T105201__…` | PCT170.297 ALT891… ✓ |
| 57.13 | 凝血 | 2026-09-17 23:08 | `coag/20260917T230838__…` | APTT76.1 ✓ |
| 62.07 | 凝血 | 2026-09-18 04:04 | `coag/20260918T040448__…` | APTT72.4 ✓ |
| 66.58 | 血常规 | 2026-09-18 08:34 | `cbc/20260918T083444__…` | WBC14.51 Hb85 PLT65 ✓ |
| 66.97 | 生化 | 2026-09-18 08:58 | `chemistry/20260918T085858__…` | PCT101.563 Cr212 ✓ |
| 67.73 | 凝血 | 2026-09-18 09:44 | `coag/20260918T094446__…` | APTT50.8 INR1.24 ✓ |
| 75.38 | 生化 | 2026-09-18 17:22 | `chemistry/20260918T172250__…` | K4.17 ✓ |
| 76.02 | 凝血 | 2026-09-18 18:01 | `coag/20260918T180129__…` | APTT64.0 ✓ |

---

## Present in testset but not in trend arrays (OK / narrative)

- Preop CBC, amylase, lipase, troponin, myoglobin/CK-MB mass, D-dimer
- Urinalysis (BLD3+ PRO2+ GLU2+)
- ECG (ST depression, long QT, U wave)
- CT (portal venous gas / bowel ischemia), bedside US, chest CT narrative
- Many **duplicate** screenshots of the same report clock

## Oral-only (intentionally not image-reproducible)

- BP/HR/RR series, dual vasopressors ~½ max, CRRT 250/120/IV~200, urine 950→300→70→20 mL

---

## Testset hygiene notes

- `reports/other/` still holds **44 unlabeled** historical uploads; many are ABG/lab duplicates of labeled clocks or imaging.
- Recommend gradually promoting matched `other/` files into `abg|chemistry|coag|cbc|imaging/` with `labeled: true` and `extracted` blocks (same policy as recent evening reports).
- Local `tesseract` chi_sim OCR hung on this host; audit used vision re-read, not OCR.

## Follow-up from batch D (2026-09-18)

Promoted into labeled folders: coag `4A7C4512` (09:24 INR1.43 panel) and abg `53990787` (17:06 lac6.55). Dashboard already had these values (INR+APTT/PT backfilled in `0995b42`).

## Resolution pass (2026-09-19)

Higher-resolution copies of the 21:46 and 06:44 ABGs (3520×3772 vs prior 1079×1157) were archived as preferred. Re-read key values (lactate, P/F, pH, HCO3, BE, Hb, iCa, FiO2) **matched the existing extraction**; no dashboard correction. Uploads of K 4.17, APTT 64.0, and the 17:23 ABG were **byte-identical** to files already in the testset, so they are not higher resolution. Two additional 06:44 files were either the same high-res bytes or another 1079-wide copy.

Conclusion: once a full-frame screenshot is already sharp, extra pixels did not change recognized numbers. Higher resolution helps when the prior image is cropped, blurred, or watermark-heavy — not for these already-legible panels.

New unique reports in the same batch (not duplicates): APTT **67.2** at 22:13, CBC Hb **76** / PLT **55** / WBC **13.17** at 08:46.
