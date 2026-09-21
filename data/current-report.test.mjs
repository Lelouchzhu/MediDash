import test from "node:test";
import assert from "node:assert/strict";
import report from "./current-report.js";

test("current report seed matches the updated live dashboard counts", () => {
  assert.equal(report.baseReadings.length, 29);
  assert.equal(report.labReadings.length, 33);
  assert.equal(report.bedsideReadings.length, 12);
  assert.equal(report.baseReadings.at(-1).lactate, 1.54);
  assert.equal(report.baseReadings.at(-1).pf, 179);
  const chem = report.labReadings.find(row => row.h === 139.31 && row.pct != null);
  assert.equal(chem.pct, 36.8855);
  assert.equal(chem.creatinine, 231);
  const inflam = report.labReadings.find(row => row.h === 139.31 && row.crp != null);
  assert.equal(inflam.crp, 97.7);
  assert.equal(inflam.il6, 68.5);
  assert.equal(report.labReadings.at(-1).aptt, 51.8);
  assert.equal(report.labReadings.find(row => row.h === 80.22).aptt, 67.2);
  assert.equal(report.bedsideReadings.at(-1).sbp, 150);
  assert.equal(report.bedsideReadings.at(-1).ne, 4);
  assert.equal(report.bedsideReadings.at(-1).da, 7.5);
  assert.equal(report.sampleOral.sbp, 120);
});

test("every gas and lab seed row is image-backed after the main audit", () => {
  for (const row of report.baseReadings) {
    assert.equal(report.isImageBacked(row.h, "gas"), true, `gas ${row.h}`);
  }
  for (const row of report.labReadings) {
    assert.equal(report.isImageBacked(row.h, "lab"), true, `lab ${row.h}`);
  }
  assert.equal(report.seedRowsWithoutScreenshot("gas").length, 0);
  assert.equal(report.seedRowsWithoutScreenshot("lab").length, 0);
  assert.equal(report.seedRowsWithoutScreenshot("bedside").length, 12);
});

test("perfect replay of seed plus oral fully covers the current report", () => {
  const coverage = report.compareCoverage({
    bloodGas: report.baseReadings,
    labs: report.labReadings,
    bedside: report.bedsideReadings
  });
  assert.equal(coverage.complete, true);
  assert.equal(coverage.labsComplete, true);
  assert.equal(coverage.fieldMatched, coverage.fieldTotal);
});

test("labeled-only replay still misses early other/ clocks and all oral", () => {
  const labeledGas = report.baseReadings.filter(row =>
    report.labeledTestsetHours.some(item => Math.abs(item.h - row.h) <= 0.15 && item.category === "abg")
  );
  const labeledLab = report.labReadings.filter(row =>
    report.labeledTestsetHours.some(item => Math.abs(item.h - row.h) <= 0.15 && item.category !== "abg")
  );
  const coverage = report.compareCoverage({
    bloodGas: labeledGas,
    labs: labeledLab,
    bedside: []
  });
  assert.equal(coverage.complete, false);
  assert.equal(coverage.labsComplete, false);
  assert.ok(coverage.gas.fullyCoveredRows >= 16, `gas ${coverage.gas.fullyCoveredRows}`);
  assert.ok(coverage.lab.fullyCoveredRows >= 24, `lab ${coverage.lab.fullyCoveredRows}`);
  assert.equal(coverage.bedside.missingRows, 12);
});

test("close ABG clocks stay distinct when both are replayed", () => {
  const close = report.baseReadings.filter(row => row.h === 2.97 || row.h === 3);
  const coverage = report.compareCoverage({
    bloodGas: close,
    labs: [],
    bedside: []
  });
  const scored = coverage.gas.rows.filter(row => row.h === 2.97 || row.h === 3);
  assert.equal(scored.length, 2);
  assert.ok(scored.every(row => row.covered), JSON.stringify(scored));
});

test("all image-backed hours plus oral complete the numeric report", () => {
  const coverage = report.compareCoverage({
    bloodGas: report.baseReadings,
    labs: report.labReadings,
    bedside: [report.sampleOral]
  });
  assert.equal(coverage.labsComplete, true);
  assert.equal(coverage.bedside.fullyCoveredRows, 1);
  assert.equal(coverage.complete, false);
});
