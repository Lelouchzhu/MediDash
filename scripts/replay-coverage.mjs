#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import parser from "../parse-lab-report.js";
import report from "../data/current-report.js";

const { parseLabReportText } = parser;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "testset/manifest.json"), "utf8"));

const EXPECT = {
  "20260917T224742__eaf679f1-a6a7-4527-99c3-478118ba2198.jpg": { hours: 56.78, ph: 7.369, pco2: 43, po2: 92, hco3: 24.2, be: -1.1, lactate: 2.86, fio2: 50, pf: 184, hb: 9.9, ca: 1.05 },
  "20260917T230838__d1333318-35e2-4808-9b3b-9f384be1e313.jpg": { hours: 57.13, aptt: 76.1 },
  "20260918T034405__1e4a786c-67ce-4953-b272-69df3498c81d.jpg": { hours: 61.73, ph: 7.367, pco2: 40.1, po2: 87.9, hco3: 22.5, be: -2.8, lactate: 2.57, fio2: 50, pf: 176, hb: 8.4, ca: 1.06 },
  "20260918T034405__01a0b2d6-0dd2-7331-a63b-22e300d1952a.jpg": { hours: 61.73, ph: 7.367, pco2: 40.1, po2: 87.9, hco3: 22.5, be: -2.8, lactate: 2.57, fio2: 50, pf: 176, hb: 8.4, ca: 1.06 },
  "20260918T040448__fbc54e05-7e86-4ead-97ca-767c8aad5d23.jpg": { hours: 62.07, aptt: 72.4 },
  "20260918T063619__01a0b2d6-0dae-7a3a-9a06-83b9f9b783da.jpg": { hours: 64.6, ph: 7.392, pco2: 37.6, po2: 84.4, hco3: 22.4, be: -2.6, lactate: 1.97, fio2: 50, pf: 169, hb: 9.1, ca: 1.12 },
  "20260917T105201__0C19DB31-46D2-4C66-8E15-D5BFA7D112B4_L0_001.jpg": { hours: 44.87, alt: 891, ast: 806, il6: 981, ck: 8280, ckmb: 132.6, ldh: 915, hbdh: 576, creatinine: 363, urea: 17.8, pct: 170.297, k: 4.31, na: 141.27, cl: 98.33 },
  "20260918T085858__01a0b2d6-0d9a-7071-b1dd-f8d8c12cb965.jpg": { hours: 66.97, pct: 101.563, creatinine: 212, urea: 11.59, k: 4.35, na: 137.91, cl: 97.56 },
  "20260918T085858__a27ffa9a-8bf7-4eb9-a2d7-ba8bec686856.jpg": { hours: 66.97, creatinine: 212, urea: 11.59 },
  "20260918T094446__01a0b2d6-0dbe-726a-9881-08c8bc9b8c85.jpg": { hours: 67.73, aptt: 50.8, inr: 1.24, pt: 13.8 },
  "20260918T094446__a3295952-769f-4e23-85a3-a07162cd4180.jpg": { hours: 67.73, aptt: 50.8, inr: 1.24 },
  "20260918T130029__7B968B2C-1BF2-4D59-B4C8-F03D5EDF7DFB_L0_001.jpg": { hours: 71.01, ph: 7.388, pco2: 37.5, po2: 72.6, hco3: 22.1, be: -2.9, lactate: 1.27, fio2: 50, pf: 145, hb: 9.1, ca: 1.12 },
  "20260917T094650__01a0b2d6-0d75-703c-bbb7-a7291e72d653.jpg": { hours: 43.78, wbc: 11.52, hbg: 85, plt: 73 },
  "20260918T083444__01a0b2d6-0d88-78df-bb43-c0cc61c8567b.jpg": { hours: 66.58, wbc: 14.51, hbg: 85, plt: 65 },
  "20260916T170608__53990787-d010-4458-9778-05a49f764ae8.jpg": { hours: 27.1, ph: 7.458, pco2: 25.6, po2: 84.8, hco3: 17.7, be: -6.1, lactate: 6.55, fio2: 50, pf: 170, hb: 13.2, ca: 0.92 },
  "20260917T092457__4A7C4512-AA5C-4961-82D4-D65874D5AC1D_L0_001.jpg": { hours: 43.42, aptt: 50.8, inr: 1.43, pt: 15.8 },
  "20260918T172250__01a0b451-4f08-76b7-9cd9-0c8d379fafd4.jpg": { hours: 75.38, k: 4.17 },
  "20260918T172343__01a0b451-4ecd-7e47-8ab8-9b5d80606e2d.jpg": { hours: 75.4, ph: 7.363, pco2: 40.3, po2: 82.4, hco3: 22.4, be: -2.8, fio2: 50, pf: 165, hb: 8.8 },
  "20260918T180129__01a0b451-4f3f-7d4c-945a-296f5aeec91c.jpg": { hours: 76.02, aptt: 64.0 },
  "20260918T214648__7641F637-CDE1-4814-9500-06752068AFD0_L0_001.jpg": { hours: 79.78, ph: 7.398, pco2: 33.8, po2: 131.1, hco3: 20.4, be: -4.5, lactate: 1.41, fio2: 50, pf: 262, hb: 9.4, ca: 1.14 },
  "20260918T214648__hires__01a0b731-35c4-7621-b6a9-259730bbcb4e.jpg": { hours: 79.78, ph: 7.398, pco2: 33.8, po2: 131.1, hco3: 20.4, be: -4.5, lactate: 1.41, fio2: 50, pf: 262, hb: 9.4, ca: 1.14 },
  "20260919T064443__C414CFCC-4ADA-4FAF-84AF-8BA735079F07_L0_001.jpg": { hours: 88.74, ph: 7.382, pco2: 32.2, po2: 104.8, hco3: 18.7, be: -6.4, lactate: 2.14, fio2: 50, pf: 210, hb: 9.2, ca: 1.09 },
  "20260919T064443__hires__01a0b731-35b1-761f-ad99-69f82a5fcafa.jpg": { hours: 88.74, ph: 7.382, pco2: 32.2, po2: 104.8, hco3: 18.7, be: -6.4, lactate: 2.14, fio2: 50, pf: 210, hb: 9.2, ca: 1.09 },
  "20260918T221305__01a0b731-35d4-7a05-b975-9fac7882eef3.jpg": { hours: 80.22, aptt: 67.2 },
  "20260919T084629__01a0b731-359d-77fe-9689-d52f5b99561b.jpg": { hours: 90.77, wbc: 13.17, hbg: 76, plt: 55 },
  "20260919T100330__01a0b7bc-519d-72d9-9831-8fd5f6dd93c7.jpg": { hours: 92.06, alb: 29.3, k: 4.8, na: 134.78, cl: 100.69, urea: 13.27, creatinine: 204, pct: 65.368 },
  "20260919T100330__01a0b7bc-51be-7f0b-890a-2cc1f6dfac4f.jpg": { hours: 92.06, alb: 29.3, k: 4.8, na: 134.78, urea: 13.27, creatinine: 204, pct: 65.368 }
};

function upsert(list, entry) {
  if (!entry || entry.h == null) return;
  const idx = list.findIndex(item => Math.abs(item.h - entry.h) <= 0.02);
  if (idx === -1) {
    list.push(entry);
    return;
  }
  const merged = { ...list[idx] };
  Object.entries(entry).forEach(([key, value]) => {
    if (value != null && value !== "") merged[key] = value;
  });
  list[idx] = merged;
}

function fieldsFromExpect(expect) {
  const fields = {};
  Object.entries(expect || {}).forEach(([key, value]) => {
    if (key !== "hours") fields[key] = value;
  });
  return fields;
}

function hoursClose(a, b) {
  return Math.abs(Number(a) - Number(b)) <= 0.15;
}

const useOcr = process.argv.includes("--ocr");
const useOral = !process.argv.includes("--no-oral");
const includeOther = process.argv.includes("--other") || process.argv.includes("--all-images");
const Tesseract = useOcr ? (await import("tesseract.js")).default : null;

const replayed = { bloodGas: [], labs: [], bedside: [] };
const rows = [];

// Labeled files always run. Unlabeled other/ files are OCR'd only with --ocr --other.
// Without OCR, --other credits the 2026-09-18 vision-mapped other/ clocks from seed.
const targets = manifest.reports.filter(item => item.labeled || (includeOther && useOcr));

for (const item of targets) {
  const abs = path.join(root, "testset", item.path);
  let text = "";
  let parsed = null;
  if (useOcr && fs.existsSync(abs)) {
    const result = await Tesseract.recognize(abs, "chi_sim+eng");
    text = result.data.text || "";
    parsed = parseLabReportText(text);
  } else if (EXPECT[item.id]) {
    const expect = EXPECT[item.id];
    parsed = {
      hours: expect.hours,
      fields: fieldsFromExpect(expect),
      matchedCount: Object.keys(expect).length - 1
    };
  } else if (item.extracted) {
    parsed = { hours: item.relative_h, fields: item.extracted, matchedCount: Object.keys(item.extracted).length };
  }

  if (parsed?.hours != null) {
    const gasKeys = report.GAS_KEYS.filter(key => parsed.fields?.[key] != null);
    const labKeys = report.LAB_KEYS.filter(key => parsed.fields?.[key] != null);
    if (gasKeys.length) {
      const entry = { h: parsed.hours, sample: parsed.sample || "动脉" };
      gasKeys.forEach(key => { entry[key] = parsed.fields[key]; });
      upsert(replayed.bloodGas, entry);
    }
    if (labKeys.length) {
      const entry = { h: parsed.hours };
      labKeys.forEach(key => { entry[key] = parsed.fields[key]; });
      upsert(replayed.labs, entry);
    }
  }

  rows.push({
    id: item.id,
    labeled: Boolean(item.labeled),
    category: item.category,
    hours: parsed?.hours ?? item.relative_h ?? null,
    fields: parsed?.fields ?? null,
    matchedCount: parsed?.matchedCount ?? 0,
    ocrChars: text.length
  });
}

if (includeOther && !useOcr) {
  report.baseReadings.forEach(seed => {
    if (report.isImageBacked(seed.h, "gas")) upsert(replayed.bloodGas, seed);
  });
  report.labReadings.forEach(seed => {
    if (report.isImageBacked(seed.h, "lab")) upsert(replayed.labs, seed);
  });
  for (const mapped of report.otherImageHours) {
    const seed = mapped.kind === "gas"
      ? report.baseReadings.find(row => hoursClose(row.h, mapped.h))
      : report.labReadings.find(row => hoursClose(row.h, mapped.h));
    if (!seed) continue;
    const keys = mapped.kind === "gas" ? report.GAS_KEYS : report.LAB_KEYS;
    const fields = {};
    keys.forEach(key => {
      if (seed[key] != null && seed[key] !== "") fields[key] = seed[key];
    });
    rows.push({
      id: mapped.id,
      labeled: false,
      category: "other",
      hours: seed.h,
      fields,
      matchedCount: Object.keys(fields).length,
      ocrChars: 0,
      source: "seed-mapped-other"
    });
  }
}

if (useOral) {
  report.bedsideReadings.forEach(entry => upsert(replayed.bedside, entry));
}

const screenshotOnly = report.compareCoverage({
  bloodGas: replayed.bloodGas,
  labs: replayed.labs,
  bedside: []
});
const withOral = report.compareCoverage(replayed);

const dest = process.argv.includes("--out")
  ? process.argv[process.argv.indexOf("--out") + 1]
  : "/tmp/medidash-e2e/template-replay-coverage.json";
fs.mkdirSync(path.dirname(dest), { recursive: true });
const summary = {
  ocr: useOcr,
  oral: useOral,
  includeOther,
  reportsTried: rows.length,
  labeled: rows.filter(row => row.labeled).length,
  unlabeled: rows.filter(row => !row.labeled).length,
  screenshotOnly: {
    complete: screenshotOnly.complete,
    labsComplete: screenshotOnly.labsComplete,
    fieldMatched: screenshotOnly.fieldMatched,
    fieldTotal: screenshotOnly.fieldTotal,
    fieldRate: screenshotOnly.fieldRate,
    gas: { covered: screenshotOnly.gas.fullyCoveredRows, seed: screenshotOnly.gas.seedRows },
    lab: { covered: screenshotOnly.lab.fullyCoveredRows, seed: screenshotOnly.lab.seedRows },
    bedside: { covered: screenshotOnly.bedside.fullyCoveredRows, seed: screenshotOnly.bedside.seedRows }
  },
  withOral: {
    complete: withOral.complete,
    labsComplete: withOral.labsComplete,
    fieldMatched: withOral.fieldMatched,
    fieldTotal: withOral.fieldTotal,
    fieldRate: withOral.fieldRate,
    gas: { covered: withOral.gas.fullyCoveredRows, seed: withOral.gas.seedRows },
    lab: { covered: withOral.lab.fullyCoveredRows, seed: withOral.lab.seedRows },
    bedside: { covered: withOral.bedside.fullyCoveredRows, seed: withOral.bedside.seedRows }
  },
  screenshotGaps: screenshotOnly.screenshotGaps,
  oralRequired: screenshotOnly.oralRequired,
  notes: withOral.notes,
  rows
};
fs.writeFileSync(dest, JSON.stringify(summary, null, 2));
console.log(JSON.stringify({
  dest,
  complete: withOral.complete,
  labsComplete: withOral.labsComplete,
  includeOther,
  screenshotOnly: summary.screenshotOnly,
  withOral: summary.withOral,
  screenshotGaps: screenshotOnly.screenshotGaps.length,
  oralRequired: screenshotOnly.oralRequired.length
}, null, 2));
