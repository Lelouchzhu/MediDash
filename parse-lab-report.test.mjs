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

test("does not treat a photo caption as a report", () => {
  const parsed = parseLabReportText("family visit at the bedside, no numbers");
  assert.equal(parsed.matchedCount, 0);
  assert.equal(parsed.kind, "unknown");
});

test("rejects PDFs and oversized files before OCR", () => {
  assert.match(fileRejectionReason({ name: "report.pdf", type: "application/pdf", size: 1000 }), /PDF/);
  assert.match(fileRejectionReason({ name: "shot.png", type: "image/png", size: 20 * 1024 * 1024 }), /15MB/);
  assert.equal(fileRejectionReason({ name: "shot.png", type: "image/png", size: 80_000 }), null);
  assert.equal(fileRejectionReason({ name: "values.txt", type: "text/plain", size: 200 }), null);
});
