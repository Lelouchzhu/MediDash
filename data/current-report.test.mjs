import test from "node:test";
import assert from "node:assert/strict";
import report from "./current-report.js";

test("current report seed matches the live dashboard counts", () => {
  assert.equal(report.baseReadings.length, 18);
  assert.equal(report.labReadings.length, 13);
  assert.equal(report.bedsideReadings.length, 6);
  assert.equal(report.sampleOral.sbp, 120);
  assert.equal(report.sampleOral.dbp, 35);
  assert.equal(report.sampleOral.hr, 109);
  assert.equal(report.sampleOral.crrtDehydrate, 250);
  assert.equal(report.sampleOral.urineMl, 20);
});

test("perfect replay of seed plus oral fully covers the current report", () => {
  const coverage = report.compareCoverage({
    bloodGas: report.baseReadings,
    labs: report.labReadings,
    bedside: report.bedsideReadings
  });
  assert.equal(coverage.complete, true);
  assert.equal(coverage.fieldMatched, coverage.fieldTotal);
  assert.equal(coverage.gas.missingRows, 0);
  assert.equal(coverage.lab.missingRows, 0);
  assert.equal(coverage.bedside.missingRows, 0);
});

test("screenshot-only replay cannot reproduce oral or early labs", () => {
  const labeledGas = report.baseReadings.filter(row =>
    report.labeledTestsetHours.some(item => Math.abs(item.h - row.h) <= 0.15)
  );
  const labeledLab = report.labReadings.filter(row =>
    report.labeledTestsetHours.some(item => Math.abs(item.h - row.h) <= 0.15)
  );
  const coverage = report.compareCoverage({
    bloodGas: labeledGas,
    labs: labeledLab,
    bedside: []
  });
  assert.equal(coverage.complete, false);
  assert.ok(coverage.screenshotGaps.length >= 10);
  assert.equal(coverage.bedside.missingRows, 6);
  assert.ok(coverage.oralRequired.every(item => item.reason === "oral-only"));
  assert.ok(coverage.screenshotGaps.some(item => item.h === 19.73));
  assert.ok(coverage.screenshotGaps.some(item => item.h === 1.22));
});

test("oral sample plus labeled hours covers latest bedside and late labs", () => {
  const labeledGas = report.baseReadings.filter(row =>
    report.labeledTestsetHours.some(item => Math.abs(item.h - row.h) <= 0.15)
  );
  const labeledLab = report.labReadings.filter(row =>
    report.labeledTestsetHours.some(item => Math.abs(item.h - row.h) <= 0.15)
  );
  const coverage = report.compareCoverage({
    bloodGas: labeledGas,
    labs: labeledLab,
    bedside: [report.sampleOral]
  });
  assert.equal(coverage.bedside.fullyCoveredRows, 1);
  assert.ok(coverage.lab.fullyCoveredRows >= 6);
  assert.ok(coverage.gas.fullyCoveredRows >= 4);
  assert.equal(coverage.complete, false);
});
