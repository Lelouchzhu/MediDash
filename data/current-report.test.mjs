import test from "node:test";
import assert from "node:assert/strict";
import report from "./current-report.js";

test("current report seed matches the updated live dashboard counts", () => {
  assert.equal(report.baseReadings.length, 21);
  assert.equal(report.labReadings.length, 18);
  assert.equal(report.bedsideReadings.length, 6);
  assert.equal(report.baseReadings.at(-1).lactate, 2.14);
  assert.equal(report.baseReadings.at(-1).pf, 210);
  assert.equal(report.labReadings.at(-1).hbg, 76);
  assert.equal(report.labReadings.find(row => row.h === 80.22).aptt, 67.2);
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
  assert.equal(report.seedRowsWithoutScreenshot("bedside").length, 6);
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
  assert.ok(coverage.gas.fullyCoveredRows >= 8, `gas ${coverage.gas.fullyCoveredRows}`);
  assert.ok(coverage.lab.fullyCoveredRows >= 12);
  assert.equal(coverage.bedside.missingRows, 6);
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
