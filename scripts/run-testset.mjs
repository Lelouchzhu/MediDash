#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import os from "node:os";
import parser from "../parse-lab-report.js";

const { parseLabReportText, parseLabReportTexts } = parser;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "testset/manifest.json"), "utf8"));

const EXPECT = {
  "20260917T224742__eaf679f1-a6a7-4527-99c3-478118ba2198.jpg": { hours: 56.78, ph: 7.369, po2: 92, hco3: 24.2, be: -1.1, lactate: 2.86, fio2: 50, pf: 184 },
  "20260917T230838__d1333318-35e2-4808-9b3b-9f384be1e313.jpg": { hours: 57.13, aptt: 76.1 },
  "20260918T034405__1e4a786c-67ce-4953-b272-69df3498c81d.jpg": { hours: 61.73, lactate: 2.57, fio2: 50, pf: 176 },
  "20260918T034405__01a0b2d6-0dd2-7331-a63b-22e300d1952a.jpg": { hours: 61.73, lactate: 2.57, fio2: 50, pf: 176 },
  "20260918T040448__fbc54e05-7e86-4ead-97ca-767c8aad5d23.jpg": { hours: 62.07, aptt: 72.4 },
  "20260918T063619__01a0b2d6-0dae-7a3a-9a06-83b9f9b783da.jpg": { hours: 64.6, lactate: 1.97, fio2: 50, pf: 169, hb: 9.1 },
  "20260917T105201__0C19DB31-46D2-4C66-8E15-D5BFA7D112B4_L0_001.jpg": { hours: 44.87, alt: 891, ast: 806, il6: 981, ck: 8280, creatinine: 363, pct: 170.297 },
  "20260918T085858__01a0b2d6-0d9a-7071-b1dd-f8d8c12cb965.jpg": { hours: 66.97, pct: 101.563, creatinine: 212, urea: 11.59 },
  "20260918T085858__a27ffa9a-8bf7-4eb9-a2d7-ba8bec686856.jpg": { hours: 66.97, creatinine: 212, urea: 11.59 },
  "20260918T094446__01a0b2d6-0dbe-726a-9881-08c8bc9b8c85.jpg": { hours: 67.73, aptt: 50.8, inr: 1.24 },
  "20260918T094446__a3295952-769f-4e23-85a3-a07162cd4180.jpg": { hours: 67.73, aptt: 50.8, inr: 1.24 },
  "20260918T130029__7B968B2C-1BF2-4D59-B4C8-F03D5EDF7DFB_L0_001.jpg": { hours: 71.01, ph: 7.388, pco2: 37.5, po2: 72.6, hco3: 22.1, be: -2.9, lactate: 1.27, fio2: 50, pf: 145, hb: 9.1, ca: 1.12 },
  "20260917T094650__01a0b2d6-0d75-703c-bbb7-a7291e72d653.jpg": { hours: 43.78, wbc: 11.52, hbg: 85, plt: 73 },
  "20260918T083444__01a0b2d6-0d88-78df-bb43-c0cc61c8567b.jpg": { hours: 66.58, wbc: 14.51, hbg: 85, plt: 65 },
  "20260919T100330__01a0b7bc-519d-72d9-9831-8fd5f6dd93c7.jpg": { hours: 92.06, alb: 29.3, k: 4.8, na: 134.78, cl: 100.69, urea: 13.27, creatinine: 204, pct: 65.368 },
  "20260919T100330__01a0b7bc-51be-7f0b-890a-2cc1f6dfac4f.jpg": { hours: 92.06, alb: 29.3, k: 4.8, na: 134.78, urea: 13.27, creatinine: 204, pct: 65.368 }
};

function preprocessCopy(abs) {
  const dest = path.join(os.tmpdir(), `medidash-pre-${path.basename(abs)}`);
  const result = spawnSync("python3", [path.join(root, "scripts/preprocess-lab-image.py"), abs, dest], { encoding: "utf8" });
  if (result.status !== 0) return null;
  return dest;
}

function close(a, b) {
  if (a == null || b == null) return false;
  return Math.abs(Number(a) - Number(b)) <= 0.03;
}

const labeled = manifest.reports.filter(item => item.labeled && EXPECT[item.id]);
const ocr = process.argv.includes("--ocr");
const Tesseract = ocr ? (await import("tesseract.js")).default : null;
const rows = [];

for (const item of labeled) {
  const abs = path.join(root, "testset", item.path);
  let text = "";
  let parsed = null;
  if (ocr) {
    console.error("OCR", item.id);
    const first = await Tesseract.recognize(abs, "chi_sim+eng");
    const cleanedPath = preprocessCopy(abs);
    let secondText = "";
    if (cleanedPath && fs.existsSync(cleanedPath)) {
      const second = await Tesseract.recognize(cleanedPath, "chi_sim+eng");
      secondText = second.data.text || "";
    }
    text = [first.data.text || "", secondText].filter(Boolean).join("\n\n---\n\n");
    parsed = parseLabReportTexts([first.data.text || "", secondText]);
  }
  const expect = EXPECT[item.id];
  const checks = {};
  if (parsed) {
    for (const [key, expected] of Object.entries(expect)) {
      const got = key === "hours" ? parsed.hours : parsed.fields[key];
      checks[key] = { expected, got: got ?? null, ok: close(got, expected) };
    }
  }
  rows.push({
    id: item.id,
    category: item.category,
    report_time: item.report_time,
    expect,
    hours: parsed?.hours ?? null,
    fields: parsed?.fields ?? null,
    critical: parsed?.critical ?? null,
    matchedCount: parsed?.matchedCount ?? null,
    checks: parsed ? checks : null,
    ocrChars: text.length
  });
}

const dest = process.argv.includes("--out")
  ? process.argv[process.argv.indexOf("--out") + 1]
  : "/tmp/medidash-e2e/testset-last-run.json";
const summary = {
  ocr,
  labeled: rows.length,
  passed: rows.filter(row => row.checks && Object.values(row.checks).every(check => check.ok)).length,
  partial: rows.filter(row => row.checks && Object.values(row.checks).some(check => check.ok) && Object.values(row.checks).some(check => !check.ok)).length,
  rows
};
fs.writeFileSync(dest, JSON.stringify(summary, null, 2));
console.log(JSON.stringify({ dest, labeled: summary.labeled, passed: summary.passed, partial: summary.partial, ocr: summary.ocr }, null, 2));
if (ocr) {
  for (const row of rows) {
    const failed = Object.entries(row.checks || {}).filter(([, check]) => !check.ok).map(([key, check]) => `${key}:${check.got}`);
    console.log(`${row.category} ${row.report_time} matched=${row.matchedCount} miss=${failed.join(",") || "none"}`);
  }
}
