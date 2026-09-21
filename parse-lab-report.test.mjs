import assert from "node:assert/strict";
import test from "node:test";
import parser from "./parse-lab-report.js";

const { fileRejectionReason, parseLabReportText, relativeHoursFromDayClock } = parser;

test("parses English arterial blood gas abbreviations", () => {
  const parsed = parseLabReportText(`
    ART blood gas  术后66h10m
    pH 7.371
    pCO2 39.8
    pO2 91.2
    HCO3 22.1
    BE -2.4
    Lac 2.31
    FiO2 45
    tHb 8.6
    iCa 1.08
  `);
  assert.equal(parsed.kind, "abg");
  assert.equal(parsed.sample, "动脉");
  assert.equal(parsed.hours, 66.17);
  assert.equal(parsed.fields.ph, 7.371);
  assert.equal(parsed.fields.pco2, 39.8);
  assert.equal(parsed.fields.po2, 91.2);
  assert.equal(parsed.fields.hco3, 22.1);
  assert.equal(parsed.fields.be, -2.4);
  assert.equal(parsed.fields.lactate, 2.31);
  assert.equal(parsed.fields.fio2, 45);
  assert.equal(parsed.fields.hb, 8.6);
  assert.equal(parsed.fields.ca, 1.08);
  assert.equal(parsed.fields.pf, 203);
});

test("parses Chinese labels and OCR lookalikes", () => {
  const parsed = parseLabReportText(`
    动脉血  相对时间 70.5
    酸碱度 pH 7.355
    二氧化碳分压 PC02 41.0
    氧分压 PO2 88.0
    碳酸氢根 HC03 21.8
    碱剩余 BE —3.1
    乳酸 2.44
    吸入氧浓度 FiO2 0.50
    血红蛋白 84
    离子钙 1.04
  `);
  assert.equal(parsed.fields.ph, 7.355);
  assert.equal(parsed.fields.pco2, 41);
  assert.equal(parsed.fields.po2, 88);
  assert.equal(parsed.fields.hco3, 21.8);
  assert.equal(parsed.fields.be, -3.1);
  assert.equal(parsed.fields.lactate, 2.44);
  assert.equal(parsed.fields.fio2, 50);
  assert.equal(parsed.fields.hb, 8.4);
  assert.equal(parsed.fields.ca, 1.04);
  assert.equal(parsed.hours, 70.5);
});

test("parses coagulation critical values", () => {
  const parsed = parseLabReportText(`
    凝血报告 术后62h04m
    活化部分凝血活酶时间 APTT 72.4
    国际标准化比值 INR 1.43
    有危急值、结果已复查
  `);
  assert.equal(parsed.kind, "lab");
  assert.equal(parsed.labSample, "凝血");
  assert.equal(parsed.critical, true);
  assert.equal(parsed.fields.aptt, 72.4);
  assert.equal(parsed.fields.inr, 1.43);
  assert.equal(parsed.hours, 62.07);
});

test("parses biochemistry and converts creatinine mg/dL", () => {
  const parsed = parseLabReportText(`
    生化 D2 16:00
    肌酐 Crea 4.1
    尿素 17.8
    肌酸激酶 CK 8280
    谷丙转氨酶 ALT 891
    谷草转氨酶 AST 806
    IL-6 981
  `);
  assert.equal(parsed.kind, "lab");
  assert.equal(parsed.hours, relativeHoursFromDayClock(2, 16, 0));
  assert.equal(parsed.hours, 50);
  assert.equal(parsed.fields.creatinine, 362.4);
  assert.equal(parsed.fields.urea, 17.8);
  assert.equal(parsed.fields.ck, 8280);
  assert.equal(parsed.fields.alt, 891);
  assert.equal(parsed.fields.ast, 806);
  assert.equal(parsed.fields.il6, 981);
});

test("parses chem procalcitonin and ignores plateletcrit / P/F lookalikes", () => {
  const parsed = parseLabReportText(`
    生化 术后66h58m
    降钙素原 101.563
    ALT 891
  `);
  assert.equal(parsed.fields.pct, 101.563);

  const cbc = parseLabReportText("血常规 血小板比积 PCT 0.08%");
  assert.equal(cbc.fields.pct, undefined);

  const abg = parseLabReportText("动脉血 氧合指数 pO2(a)/FO2(I) 169 FiO2 50 pH 7.392 Lac 1.97");
  assert.equal(abg.fields.pf, 169);
  assert.equal(abg.fields.pct, undefined);
});

test("parses hospital LIS screenshots already stored on the dashboard", () => {
  const aptt = parseLabReportText(`
    报告时间: 2026-09-17 23:08:38
    活化部分凝血活酶时间测定 (APTT) APTT 76.1 秒
    有危急值、结果已复查
  `);
  assert.equal(aptt.hours, 57.14);
  assert.equal(aptt.fields.aptt, 76.1);
  assert.equal(aptt.critical, true);

  const abg = parseLabReportText(`
    报告时间: 2026-09-17 22:47:42
    酸碱度 pH 7.369
    二氧化碳分压 pCO2 43.00
    氧分压 pO2 92.00
    标准剩余碱 SBE -1.10
    血浆碳酸氢盐浓度 cHCO3-(P) 24.20
    实测总血红蛋白 ctHb 9.90 g/dl
    钙离子浓度 cCa2+ 1.05
    乳酸浓度 cLac 2.86
    吸入氧浓度 FO2(I) 50.00
    氧合指数 pO2(a)/FO2(I) 184.00
  `);
  assert.equal(abg.hours, 56.8);
  assert.equal(abg.fields.ph, 7.369);
  assert.equal(abg.fields.hco3, 24.2);
  assert.equal(abg.fields.fio2, 50);
  assert.equal(abg.fields.hb, 9.9);
  assert.equal(abg.fields.ca, 1.05);
  assert.equal(abg.fields.lactate, 2.86);
  assert.equal(abg.fields.pf, 184);

  const chem = parseLabReportText(`
    报告时间: 2026-09-17 10:52:01
    谷丙转氨酶 ALT 891.0
    谷草转氨酶 AST 806.0
    IL-6 981.00
    肌酸激酶 CK 8280.0
    尿素 Urea 17.80
    肌酐 Crea 363.0
  `);
  assert.equal(chem.hours, 44.87);
  assert.equal(chem.fields.alt, 891);
  assert.equal(chem.fields.ck, 8280);
  assert.equal(chem.fields.creatinine, 363);
});

test("recovers hospital LIS OCR that dropped decimals or split labels", () => {
  const aptt = parseLabReportText("报告 时 间 : 2026-09-17 23:08:38 活化 部 分 凝血 活 酶 时 间 测 定 (APTT) APTT 76.1 sec 有 危急 值");
  assert.equal(aptt.hours, 57.14);
  assert.equal(aptt.fields.aptt, 76.1);
  assert.equal(aptt.critical, true);

  const apttDotless = parseLabReportText("APTT 761 sec 有危急值");
  assert.equal(apttDotless.fields.aptt, 76.1);

  const abg = parseLabReportText(`
    报告 时 间 : 2026-09-17 22:47:42
    酸碱度 | PH . 7.369 Aaid | 7.35-745
    二 氧化 左 分 压 PCO2 4ao0 mmHg 35-45
    氧 分 压 PO2 92.00 mmHg 80-100
    标准 剩余 碱 SBE -110 mmol/L | -3-3
    血浆 碳酸 氧 盐 浓度 | cHCO-3(p) 0 24.20 mmolL 22-26
    实测总血红蛋白 ctHb 9.90
    钙离子浓度 cCa2+ 1.05
    乳酸浓度 cLac 2.86
    吸入氧浓度 FO2(I) 50.00
    氧合指数 pO2(a)/FO2(I) 184.00
  `);
  assert.equal(abg.hours, 56.8);
  assert.equal(abg.fields.ph, 7.369);
  assert.equal(abg.fields.po2, 92);
  assert.equal(abg.fields.be, -1.1);
  assert.equal(abg.fields.hco3, 24.2);
  assert.equal(abg.fields.hb, 9.9);
  assert.equal(abg.fields.ca, 1.05);
  assert.equal(abg.fields.lactate, 2.86);
  assert.equal(abg.fields.fio2, 50);
  assert.equal(abg.fields.pf, 184);

  const chem = parseLabReportText(`
    报告 时 间 : 2026-09-17 10:52:01
    ALT 8910 UL T 0-40
    AST 8060 UL
    IL-6 981000 pg/ml 0-70
    CK 82800 UL
    Urea 17.80
    Crea 363.0
  `);
  assert.equal(chem.hours, 44.87);
  assert.equal(chem.fields.alt, 891);
  assert.equal(chem.fields.ast, 806);
  assert.equal(chem.fields.il6, 981);
  assert.equal(chem.fields.ck, 8280);
  assert.equal(chem.fields.urea, 17.8);
  assert.equal(chem.fields.creatinine, 363);

  const noRefRange = parseLabReportText("二氧化碳分压 PCO2 4ao0 mmHg 35-45 氧分压 PO2 9200 mmHg 80-100");
  assert.equal(noRefRange.fields.pco2, undefined);
  assert.equal(noRefRange.fields.po2, 92);

  const noNeighborSteal = parseLabReportText("PCO2 4ao0 mmHg 35-45 氧 分 压 PO2 92.00 mmHg 80-100");
  assert.equal(noNeighborSteal.fields.pco2, undefined);
  assert.equal(noNeighborSteal.fields.po2, 92);

  const portalHost = parseLabReportText("dtsyy.imedicalai.com 报告时间: 2026-09-17 10:52:01 ALT 891.0");
  assert.equal(portalHost.fields.ca, undefined);
  assert.equal(portalHost.fields.alt, 891);

  const laterPco2 = parseLabReportText("PCO2 4ao0 mmHg 35-45 体温纠正的PCO2 PCO2(T) 43.00 mmHg 32-46");
  assert.equal(laterPco2.fields.pco2, 43);

  const fio2Ocr = parseLabReportText("吸 氧 浓度 Fo2() 500 % 氧分压 PO2 92.00");
  assert.equal(fio2Ocr.fields.fio2, 50);
  assert.equal(fio2Ocr.fields.pf, 184);

  const chemOcr = parseLabReportText("尿素 测定 UREA 1780 mmol/L 肌 栈 测定 SCR 3630 umoL 乳酸 脱氧 LDH 9150 UL 备注 9");
  assert.equal(chemOcr.fields.urea, 17.8);
  assert.equal(chemOcr.fields.creatinine, 363);
  assert.equal(chemOcr.fields.lactate, undefined);
});

test("parses latest 13:00 hospital ABG already on the dashboard", () => {
  const parsed = parseLabReportText(`
    报告时间: 2026-09-18 13:00:29
    酸碱度 pH 7.388
    二氧化碳分压 pCO2 37.5
    氧分压 pO2 72.6
    血浆碳酸氢盐浓度 cHCO3-(P) 22.1
    标准剩余碱 SBE -2.9
    乳酸浓度 cLac 1.27
    吸入氧浓度 FO2(I) 50
    氧合指数 pO2(a)/FO2(I) 145
    实测总血红蛋白 ctHb 9.1
    钙离子浓度 cCa2+ 1.12
  `);
  assert.equal(parsed.hours, 71.01);
  assert.equal(parsed.fields.lactate, 1.27);
  assert.equal(parsed.fields.pf, 145);
  assert.equal(parsed.fields.po2, 72.6);
  assert.equal(parsed.fields.pct, undefined);
});

test("ignores CBC PCT 0.08 even when 血小板比积 is missing from OCR", () => {
  const parsed = parseLabReportText("报告时间: 2026-09-17 09:46:50 WBC 11.52 PLT 73 PCT 0.08% HGB 85");
  assert.equal(parsed.fields.wbc, 11.52);
  assert.equal(parsed.fields.hbg, 85);
  assert.equal(parsed.fields.plt, 73);
  assert.equal(parsed.fields.pct, undefined);
});

test("parses CBC without treating plateletcrit as procalcitonin", () => {
  const parsed = parseLabReportText(`
    报告时间: 2026-09-18 08:34:44
    白细胞 WBC 14.51
    血红蛋白测定 HGB 85
    血小板 PLT 65
    血小板比积 PCT 0.08%
  `);
  assert.equal(parsed.hours, 66.58);
  assert.equal(parsed.fields.wbc, 14.51);
  assert.equal(parsed.fields.hbg, 85);
  assert.equal(parsed.fields.plt, 65);
  assert.equal(parsed.fields.pct, undefined);
});

test("recovers compact report clocks and colon decimals from testset OCR", () => {
  const compact = parseLabReportText("ABE: 2026-09-18 130020 PH 7.35-745 PCO2 3750 clac 127");
  assert.equal(compact.hours, 71.01);
  assert.equal(compact.fields.pco2, 37.5);
  assert.equal(compact.fields.lactate, 1.27);
  assert.equal(compact.fields.ph, undefined);

  const pctColon = parseLabReportText("报告时间: 2026-09-17 10:52:01 降钙素原测定 PCT 170:297 ng/ml I=6 981.000");
  assert.equal(pctColon.fields.pct, 170.297);
  assert.equal(pctColon.fields.il6, 981);
});

test("parses English postop hour labels", () => {
  const parsed = parseLabReportText("ART postop 66h10m\npH 7.371\nLac 2.31");
  assert.equal(parsed.hours, 66.17);
  assert.equal(parsed.label, "术后66h10m");
});

test("does not treat a photo caption as a report", () => {
  const parsed = parseLabReportText("family visit at the bedside, no numbers");
  assert.equal(parsed.matchedCount, 0);
  assert.equal(parsed.kind, "unknown");
});

test("parses 10:03 chemistry LIS codes including albumin", () => {
  const parsed = parseLabReportText(`
    报告时间: 2026-09-19 10:03:30
    血清白蛋白测定 ALB 29.3 g/L
    钾测定 K 4.80 mmol/L
    钠测定 Na 134.78 mmol/L
    氯测定 CL 100.69 mmol/L
    尿素测定 UREA 13.27 mmol/L
    肌酐测定 SCR 204.0 umol/L
    降钙素原测定 PCT 65.368 ng/ml
  `);
  assert.equal(parsed.hours, 92.06);
  assert.equal(parsed.fields.alb, 29.3);
  assert.equal(parsed.fields.k, 4.8);
  assert.equal(parsed.fields.na, 134.78);
  assert.equal(parsed.fields.cl, 100.69);
  assert.equal(parsed.fields.urea, 13.27);
  assert.equal(parsed.fields.creatinine, 204);
  assert.equal(parsed.fields.pct, 65.368);
});

test("recovers garbled ALT and ignores WBC exponent 1", () => {
  const chem = parseLabReportText("报告时间: 2026-09-17 10:52:01 谷丙转氨酶 ALT S9I0 UL IL-6 981.00");
  assert.equal(chem.fields.alt, 891);
  assert.equal(chem.fields.il6, 981);

  const cbc = parseLabReportText("白细胞 WBC 11.52 10^9/L 1 血红蛋白测定 HGB 85 血小板 PLT 73");
  assert.equal(cbc.fields.wbc, 11.52);
  assert.equal(cbc.fields.hbg, 85);
  assert.equal(cbc.fields.plt, 73);

  const fio2 = parseLabReportText("吸入氧浓度 FO2(I) 50.00 氧分压 pO2 87.9 mmHg 80-100");
  assert.equal(fio2.fields.fio2, 50);
  assert.equal(fio2.fields.po2, 87.9);
});

test("merges two OCR passes and prefers the better WBC", () => {
  const merged = parser.parseLabReportTexts([
    "报告时间: 2026-09-17 09:46:50 白细胞 WBC 1 血小板 PLT 73",
    "白细胞 WBC 11.52 血红蛋白测定 HGB 85 血小板 PLT 73"
  ]);
  assert.equal(merged.hours, 43.78);
  assert.equal(merged.fields.wbc, 11.52);
  assert.equal(merged.fields.hbg, 85);
  assert.equal(merged.fields.plt, 73);
});

test("parses 09:18 chemistry including PCT 36.8855 and CRP 97.7", () => {
  const chem = parseLabReportText(`
    报告时间: 2026-09-21 09:18:31
    谷丙转氨酶 ALT 159.0
    谷草转氨酶 AST 82.0
    肌酐测定 SCR 231.0 umol/L
    尿素测定 UREA 22.09 mmol/L
    血清白蛋白测定 ALB 35.8 g/L
    降钙素原测定 PCT 36.8855 ng/ml
    钾测定 K 3.93 mmol/L
  `);
  assert.equal(chem.hours, 139.31);
  assert.equal(chem.fields.pct, 36.8855);
  assert.equal(chem.fields.creatinine, 231);
  assert.equal(chem.fields.alb, 35.8);
  assert.equal(chem.fields.alt, 159);
  assert.equal(chem.fields.k, 3.93);

  const inflam = parseLabReportText(`
    报告时间: 2026-09-21 09:18:23
    C反应蛋白 CRP 97.70 mg/L
    白细胞介素-6 IL-6 68.500 pg/ml
  `);
  assert.equal(inflam.hours, 139.31);
  assert.equal(inflam.fields.crp, 97.7);
  assert.equal(inflam.fields.il6, 68.5);
  assert.equal(inflam.fields.pct, undefined);
});

test("parses 10:53 ABG and 11:07 APTT from the updated testset", () => {
  const abg = parseLabReportText(`
    报告时间: 2026-09-21 10:53:36
    酸碱度 pH 7.515
    二氧化碳分压 pCO2 33.00
    氧分压 pO2 89.70
    血浆碳酸氢盐浓度 cHCO3-(P) 26.00
    标准剩余碱 SBE 3.10
    乳酸浓度 cLac 1.54
    吸入氧浓度 FO2(I) 50.00
    氧合指数 pO2(a)/FO2(I) 179.00
    实测总血红蛋白 ctHb 8.90
    钙离子浓度 cCa2+ 1.07
  `);
  assert.equal(abg.hours, 140.89);
  assert.equal(abg.fields.lactate, 1.54);
  assert.equal(abg.fields.pf, 179);
  assert.equal(abg.fields.hb, 8.9);
  assert.equal(abg.fields.ph, 7.515);
  assert.equal(abg.fields.pct, undefined);

  const coag = parseLabReportText(`
    报告时间: 2026-09-21 11:07:25
    活化部分凝血活酶时间测定 (APTT) APTT 51.8 秒
  `);
  assert.equal(coag.hours, 141.12);
  assert.equal(coag.fields.aptt, 51.8);
});

test("rejects PDFs and oversized files before OCR", () => {
  assert.match(fileRejectionReason({ name: "report.pdf", type: "application/pdf", size: 1000 }), /PDF/);
  assert.match(fileRejectionReason({ name: "shot.png", type: "image/png", size: 20 * 1024 * 1024 }), /15MB/);
  assert.equal(fileRejectionReason({ name: "shot.png", type: "image/png", size: 80_000 }), null);
  assert.equal(fileRejectionReason({ name: "values.txt", type: "text/plain", size: 200 }), null);
});
