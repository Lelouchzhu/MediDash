(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  root.MediDashCurrentReport = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const GAS_KEYS = ["ph", "pco2", "po2", "hco3", "be", "lactate", "fio2", "pf", "hb", "ca"];
  const LAB_KEYS = [
    "aptt", "inr", "pt", "creatinine", "urea", "ck", "ckmb", "ldh", "hbdh",
    "alt", "ast", "il6", "pct", "wbc", "plt", "hbg", "k", "na", "cl"
  ];
  const BEDSIDE_KEYS = [
    "sbp", "dbp", "hr", "rrLow", "rrHigh", "map", "pressors", "pressorNote",
    "crrt", "crrtDehydrate", "crrtHf", "ivRate", "urineMl", "urineWindow", "notes"
  ];

  const baseReadings = [
    { h: -18.85, label: "术前18h51m", sample: "动脉", ph: 7.384, pco2: 29.7, po2: 59.8, hco3: 17.3, be: -7.7, lactate: 5.05, fio2: 33, pf: 181, hb: 14.7, ca: 1.18 },
    { h: 1.53, label: "术后1h32m", sample: "动脉", ph: 7.196, pco2: 31.5, po2: 110.6, hco3: 11.9, be: -16.2, lactate: 5.30, fio2: 50, pf: 221, hb: 13.0, ca: 1.15 },
    { h: 2.97, label: "术后2h58m", sample: "动脉", ph: 7.380, pco2: 25.0, po2: 78.1, hco3: 14.5, be: -10.7, lactate: 6.63, fio2: 50, pf: 156, hb: 13.4, ca: 1.02 },
    { h: 3.00, label: "术后3h00m", sample: "待核实", ph: 7.302, pco2: 35.0, po2: 32.5, hco3: 16.9, be: -9.5, lactate: 6.53, fio2: 50, pf: 65, hb: 13.7, ca: 1.04, quality: "uncertain" },
    { h: 7.18, label: "术后7h11m", sample: "动脉", ph: 7.436, pco2: 22.2, po2: 78.7, hco3: 14.6, be: -9.6, lactate: 6.93, fio2: 50, pf: 157, hb: 11.1, ca: .94 },
    { h: 9.82, label: "术后9h49m", sample: "动脉", ph: 7.476, pco2: 25.0, po2: 121.4, hco3: 18.0, be: -5.5, lactate: 8.99, fio2: 50, pf: 243, hb: 11.5, ca: .93 },
    { h: 12.55, label: "术后12h33m", sample: "动脉", ph: 7.522, pco2: 18.9, po2: 136.6, hco3: 15.2, be: -7.7, lactate: 7.64, fio2: 50, pf: 273, hb: 11.2, ca: .91 },
    { h: 16.83, label: "术后16h50m", sample: "动脉", ph: 7.541, pco2: 21.2, po2: 120.1, hco3: 17.8, be: -4.8, lactate: 8.29, fio2: 40, pf: 300, hb: 11.1, ca: .91 },
    { h: 21.43, label: "术后21h26m", sample: "静脉", ph: 7.452, pco2: 26.5, po2: 26.6, hco3: 18.1, be: -5.9, lactate: 7.52, fio2: null, pf: null, hb: 15.2, ca: .96 },
    { h: 21.53, label: "术后21h32m", sample: "动脉", ph: 7.528, pco2: 20.5, po2: 64.1, hco3: 16.7, be: -6.1, lactate: 7.55, fio2: 30, pf: 214, hb: 13.4, ca: .91 },
    { h: 27.10, label: "术后27h06m", sample: "动脉", ph: 7.458, pco2: 25.6, po2: 84.8, hco3: 17.7, be: -6.1, lactate: 6.55, fio2: 50, pf: 170, hb: 13.2, ca: .92 },
    { h: 31.47, label: "术后31h28m", sample: "动脉", ph: 7.397, pco2: 33.6, po2: 90.1, hco3: 20.2, be: -4.6, lactate: 5.82, fio2: 50, pf: 180, hb: 9.2, ca: .88 },
    { h: 40.68, label: "术后40h41m", sample: "动脉", ph: 7.415, pco2: 33.8, po2: 79.2, hco3: 21.2, be: -3.4, lactate: 3.25, fio2: 50, pf: 158, hb: 9.5, ca: .99 },
    { h: 49.95, label: "术后49h57m", sample: "动脉", ph: 7.403, pco2: 32.7, po2: 90.6, hco3: 19.9, be: -4.8, lactate: 2.27, fio2: 50, pf: 181, hb: 8.8, ca: .98 },
    { h: 56.78, label: "术后56h47m", sample: "动脉", ph: 7.369, pco2: 43.0, po2: 92.0, hco3: 24.2, be: -1.1, lactate: 2.86, fio2: 50, pf: 184, hb: 9.9, ca: 1.05 },
    { h: 61.73, label: "术后61h44m", sample: "动脉", ph: 7.367, pco2: 40.1, po2: 87.9, hco3: 22.5, be: -2.8, lactate: 2.57, fio2: 50, pf: 176, hb: 8.4, ca: 1.06 },
    { h: 64.6, label: "术后64h36m", sample: "动脉", ph: 7.392, pco2: 37.6, po2: 84.4, hco3: 22.4, be: -2.6, lactate: 1.97, fio2: 50, pf: 169, hb: 9.1, ca: 1.12 },
    { h: 71.01, label: "术后71h00m", sample: "动脉", ph: 7.388, pco2: 37.5, po2: 72.6, hco3: 22.1, be: -2.9, lactate: 1.27, fio2: 50, pf: 145, hb: 9.1, ca: 1.12 },
    { h: 75.4, label: "术后75h23m", sample: "动脉", ph: 7.363, pco2: 40.3, po2: 82.4, hco3: 22.4, be: -2.8, fio2: 50, pf: 165, hb: 8.8 },
    { h: 79.78, label: "术后79h47m", sample: "动脉", ph: 7.398, pco2: 33.8, po2: 131.1, hco3: 20.4, be: -4.5, lactate: 1.41, fio2: 50, pf: 262, hb: 9.4, ca: 1.14 },
    { h: 88.74, label: "术后88h44m", sample: "动脉", ph: 7.382, pco2: 32.2, po2: 104.8, hco3: 18.7, be: -6.4, lactate: 2.14, fio2: 50, pf: 210, hb: 9.2, ca: 1.09 }
  ];

  const labReadings = [
    { h: -22.85, label: "术前22h51m", sample: "生化", creatinine: 121.8, urea: 10.99, k: 4.02, na: 141, cl: 104 },
    { h: -18.45, label: "术前18h27m", sample: "凝血", inr: .93, aptt: 26.1, pt: 11.1 },
    { h: 2.87, label: "术后2h52m", sample: "生化", ck: 5657, ckmb: 228.5, ldh: 1660, hbdh: 669 },
    { h: 10.18, label: "术后10h11m", sample: "生化", k: 3.59 },
    { h: 19.05, label: "术后19h03m", sample: "凝血", inr: 2.11, aptt: 57.9, pt: 23.0 },
    { h: 19.73, label: "术后19h44m", sample: "生化", creatinine: 263, urea: 15.95, pct: 146.421, k: 4.43, na: 142.28, cl: 99.53 },
    { h: 43.42, label: "术后43h25m", sample: "凝血", inr: 1.43, aptt: 50.8, pt: 15.8 },
    { h: 44.87, label: "术后44h52m", sample: "生化", creatinine: 363, urea: 17.80, ck: 8280, ckmb: 132.6, ldh: 915, hbdh: 576, alt: 891, ast: 806, il6: 981, pct: 170.297, k: 4.31, na: 141.27, cl: 98.33 },
    { h: 57.13, label: "术后57h08m", sample: "凝血", aptt: 76.1, critical: true },
    { h: 62.07, label: "术后62h04m", sample: "凝血", aptt: 72.4, critical: true },
    { h: 43.78, label: "术后43h47m", sample: "血常规", wbc: 11.52, plt: 73, hbg: 85 },
    { h: 66.58, label: "术后66h35m", sample: "血常规", wbc: 14.51, plt: 65, hbg: 85 },
    { h: 66.97, label: "术后66h58m", sample: "生化", creatinine: 212, urea: 11.59, k: 4.35, na: 137.91, cl: 97.56, pct: 101.563 },
    { h: 67.73, label: "术后67h44m", sample: "凝血", aptt: 50.8, inr: 1.24, pt: 13.8 },
    { h: 75.38, label: "术后75h22m", sample: "生化", k: 4.17 },
    { h: 76.02, label: "术后76h01m", sample: "凝血", aptt: 64.0 },
    { h: 80.22, label: "术后80h13m", sample: "凝血", aptt: 67.2 },
    { h: 90.77, label: "术后90h46m", sample: "血常规", wbc: 13.17, plt: 55, hbg: 76 }
  ];

  const bedsideReadings = [
    { h: 10, label: "术后夜间", sbp: 101, dbp: 33, hr: 160, pressors: "dual", pressorNote: "高剂量", source: "oral" },
    { h: 22, label: "术后约22h", sbp: 90, dbp: 30, hr: 130, map: 50, pressors: "dual", pressorNote: "双升压药", source: "oral" },
    { h: 29, label: "术后约29h", sbp: 100, dbp: 30, hr: 140, map: 53, pressors: "dual", source: "oral" },
    { h: 44, label: "术后约44h", sbp: 110, dbp: 35, hr: 110, map: 58, pressors: "reduced", pressorNote: "升压药减量", source: "oral" },
    { h: 50, label: "术后约50h", sbp: 140, dbp: 50, hr: 100, map: 80, pressors: "unknown", pressorNote: "单次探视读数", source: "oral" },
    {
      h: 73,
      label: "术后约73h · 床旁口述",
      sbp: 120,
      dbp: 35,
      hr: 109,
      rrLow: 15,
      rrHigh: 19,
      map: 63,
      pressors: "dual",
      pressorNote: "各约最大允许量½",
      crrt: "on",
      crrtDehydrate: 250,
      crrtHf: 120,
      ivRate: 200,
      urineMl: 20,
      urineWindow: "今晨起",
      notes: "粗算净负约50 mL/h，待床旁核对",
      source: "oral"
    }
  ];

  const sampleOral = bedsideReadings[bedsideReadings.length - 1];

  // Officially labeled LIS files (folders abg/chemistry/coag/cbc plus promoted copies).
  const labeledTestsetHours = [
    { h: 27.1, category: "abg", id: "20260916T170608__53990787-d010-4458-9778-05a49f764ae8.jpg" },
    { h: 43.42, category: "coag", id: "20260917T092457__4A7C4512-AA5C-4961-82D4-D65874D5AC1D_L0_001.jpg" },
    { h: 43.78, category: "cbc", id: "20260917T094650__01a0b2d6-0d75-703c-bbb7-a7291e72d653.jpg" },
    { h: 44.87, category: "chemistry", id: "20260917T105201__0C19DB31-46D2-4C66-8E15-D5BFA7D112B4_L0_001.jpg" },
    { h: 56.78, category: "abg", id: "20260917T224742__eaf679f1-a6a7-4527-99c3-478118ba2198.jpg" },
    { h: 57.13, category: "coag", id: "20260917T230838__d1333318-35e2-4808-9b3b-9f384be1e313.jpg" },
    { h: 61.73, category: "abg", id: "20260918T034405__01a0b2d6-0dd2-7331-a63b-22e300d1952a.jpg" },
    { h: 62.07, category: "coag", id: "20260918T040448__fbc54e05-7e86-4ead-97ca-767c8aad5d23.jpg" },
    { h: 64.6, category: "abg", id: "20260918T063619__01a0b2d6-0dae-7a3a-9a06-83b9f9b783da.jpg" },
    { h: 66.58, category: "cbc", id: "20260918T083444__01a0b2d6-0d88-78df-bb43-c0cc61c8567b.jpg" },
    { h: 66.97, category: "chemistry", id: "20260918T085858__01a0b2d6-0d9a-7071-b1dd-f8d8c12cb965.jpg" },
    { h: 67.73, category: "coag", id: "20260918T094446__01a0b2d6-0dbe-726a-9881-08c8bc9b8c85.jpg" },
    { h: 71.01, category: "abg", id: "20260918T130029__7B968B2C-1BF2-4D59-B4C8-F03D5EDF7DFB_L0_001.jpg" },
    { h: 75.38, category: "chemistry", id: "20260918T172250__01a0b451-4f08-76b7-9cd9-0c8d379fafd4.jpg" },
    { h: 75.4, category: "abg", id: "20260918T172343__01a0b451-4ecd-7e47-8ab8-9b5d80606e2d.jpg" },
    { h: 76.02, category: "coag", id: "20260918T180129__01a0b451-4f3f-7d4c-945a-296f5aeec91c.jpg" },
    { h: 79.78, category: "abg", id: "20260918T214648__hires__01a0b731-35c4-7621-b6a9-259730bbcb4e.jpg" },
    { h: 80.22, category: "coag", id: "20260918T221305__01a0b731-35d4-7a05-b975-9fac7882eef3.jpg" },
    { h: 88.74, category: "abg", id: "20260919T064443__hires__01a0b731-35b1-761f-ad99-69f82a5fcafa.jpg" },
    { h: 90.77, category: "cbc", id: "20260919T084629__01a0b731-359d-77fe-9689-d52f5b99561b.jpg" }
  ];

  // Early clocks live in unlabeled other/ but were vision-matched in the 2026-09-18 audit.
  const otherImageHours = [
    { h: -18.85, kind: "gas", id: "01a0a019-fc18-79de-8975-5316a657400e.jpg" },
    { h: 1.53, kind: "gas", id: "01a0a84a-afd3-75a7-8988-4be259cf80bf.jpg" },
    { h: 2.97, kind: "gas", id: "01a0a84a-aff9-7322-8af2-7db92f270c15.jpg" },
    { h: 3.00, kind: "gas", id: "01a0a84a-b00d-74ad-aee2-081752b302c0.jpg" },
    { h: 7.18, kind: "gas", id: "01a0a7ba-cce6-7f8e-be2a-ad121c4c44a4.jpg" },
    { h: 9.82, kind: "gas", id: "01a0a7ba-ccd5-75e4-b9de-fcc6906f7636.jpg" },
    { h: 12.55, kind: "gas", id: "01a0a7ba-ccae-7603-aebd-6652f960c209.jpg" },
    { h: 16.83, kind: "gas", id: "01a0a84a-b037-7dc5-8029-bb6f0d4a91ee.jpg" },
    { h: 21.43, kind: "gas", id: "01a0a84a-afc2-7c8c-8bc9-e38f480212d3.jpg" },
    { h: 21.53, kind: "gas", id: "01a0a862-c995-719d-9d03-376988932dcb.jpg" },
    { h: 31.47, kind: "gas", id: "01a0ac5d-e6be-7d69-b83e-6b137d585771.jpg" },
    { h: 40.68, kind: "gas", id: "01a0ac6e-fd90-77f8-bec4-ff85bc28172a.jpg" },
    { h: 49.95, kind: "gas", id: "01a0ae6a-3258-7363-87d0-d794c703d59e.jpg" },
    { h: -22.85, kind: "lab", id: "01a0a019-fbe6-746c-8d65-6a58ee56536d.jpg" },
    { h: -18.45, kind: "lab", id: "01a0a019-fba0-7288-a38e-7d89fde0feee.jpg" },
    { h: 2.87, kind: "lab", id: "01a0a84a-afe6-7822-b577-e32af03f6c89.jpg" },
    { h: 10.18, kind: "lab", id: "01a0a7ba-ccc1-7498-b6d1-eb58c016347f.jpg" },
    { h: 19.05, kind: "lab", id: "01a0a84a-afb1-70ea-acb5-085fd0369a30.jpg" },
    { h: 19.73, kind: "lab", id: "01a0a84a-af8f-7264-be3e-3519352554a4.jpg" }
  ];

  const HOUR_TOL = 0.15;

  function hoursClose(a, b) {
    return Math.abs(Number(a) - Number(b)) <= HOUR_TOL;
  }

  function imageBackedHours(kind) {
    const labeledKind = labeledTestsetHours.filter(item => {
      if (kind === "gas") return item.category === "abg";
      if (kind === "lab") return item.category !== "abg";
      return false;
    }).map(item => ({ h: item.h, kind, id: item.id, labeled: true }));
    const other = otherImageHours.filter(item => item.kind === kind);
    return [...labeledKind, ...other];
  }

  function isImageBacked(h, kind) {
    return imageBackedHours(kind).some(item => hoursClose(item.h, h));
  }

  function flattenFields(rows, keys, kind) {
    const items = [];
    rows.forEach(row => {
      keys.forEach(key => {
        if (row[key] != null && row[key] !== "") {
          items.push({
            kind,
            h: row.h,
            key,
            value: row[key],
            label: row.label || null,
            sample: row.sample || null
          });
        }
      });
    });
    return items;
  }

  function valuesClose(key, expected, got) {
    if (expected == null || got == null) return false;
    const a = Number(expected);
    const b = Number(got);
    if (!Number.isFinite(a) || !Number.isFinite(b)) {
      return String(expected) === String(got);
    }
    const abs = Math.abs(a - b);
    if (["pct", "ph", "inr", "ca", "lactate", "urea"].includes(key)) return abs <= 0.02;
    if (["ck", "alt", "ast", "il6", "ldh", "hbdh", "ckmb", "creatinine", "hbg"].includes(key)) {
      return abs <= 1 || abs / Math.max(Math.abs(a), 1) <= 0.01;
    }
    return abs <= 0.15;
  }

  function findMatch(replayRows, seedItem, keys) {
    const candidates = (replayRows || []).filter(row => hoursClose(row.h, seedItem.h));
    if (!candidates.length) return null;
    return candidates.find(row => valuesClose(seedItem.key, seedItem.value, row[seedItem.key]))
      || candidates.find(row => keys.some(key => row[key] != null))
      || candidates[0];
  }

  function scoreGroup(seedRows, replayRows, keys, kind) {
    const items = flattenFields(seedRows, keys, kind);
    const details = items.map(item => {
      const match = findMatch(replayRows, item, keys);
      const got = match ? match[item.key] : null;
      const ok = valuesClose(item.key, item.value, got);
      const nearHour = Boolean(match);
      return {
        ...item,
        got,
        ok,
        nearHour,
        status: ok ? "matched" : nearHour ? "wrong" : "missing"
      };
    });
    const matched = details.filter(item => item.ok).length;
    const rows = seedRows.map(row => {
      const replay = (replayRows || []).find(item => hoursClose(item.h, row.h));
      const rowKeys = keys.filter(key => row[key] != null);
      const matchedKeys = rowKeys.filter(key => replay && valuesClose(key, row[key], replay[key]));
      return {
        h: row.h,
        label: row.label,
        kind,
        covered: rowKeys.length > 0 && matchedKeys.length === rowKeys.length,
        partial: matchedKeys.length > 0 && matchedKeys.length < rowKeys.length,
        matchedKeys,
        missingKeys: rowKeys.filter(key => !matchedKeys.includes(key)),
        hasReplayHour: Boolean(replay)
      };
    });
    return {
      kind,
      seedRows: seedRows.length,
      seedFields: items.length,
      matchedFields: matched,
      fieldRate: items.length ? matched / items.length : 1,
      fullyCoveredRows: rows.filter(row => row.covered).length,
      partialRows: rows.filter(row => row.partial).length,
      missingRows: rows.filter(row => !row.hasReplayHour).length,
      rows,
      details
    };
  }

  function seedRowsWithoutScreenshot(kind) {
    if (kind === "bedside") {
      return bedsideReadings.map(row => ({
        h: row.h,
        label: row.label,
        kind,
        reason: "oral-only"
      }));
    }
    const rows = kind === "gas" ? baseReadings : labReadings;
    return rows.filter(row => !isImageBacked(row.h, kind)).map(row => ({
      h: row.h,
      label: row.label,
      kind,
      reason: "no-screenshot"
    }));
  }

  function compareCoverage(replayed, options) {
    const opts = options || {};
    const gas = scoreGroup(baseReadings, replayed.bloodGas || [], GAS_KEYS, "gas");
    const lab = scoreGroup(labReadings, replayed.labs || [], LAB_KEYS, "lab");
    const bedside = scoreGroup(bedsideReadings, replayed.bedside || [], BEDSIDE_KEYS, "bedside");
    const screenshotGaps = [
      ...seedRowsWithoutScreenshot("gas"),
      ...seedRowsWithoutScreenshot("lab")
    ];
    const oralRequired = seedRowsWithoutScreenshot("bedside");
    const fieldTotal = gas.seedFields + lab.seedFields + bedside.seedFields;
    const fieldMatched = gas.matchedFields + lab.matchedFields + bedside.matchedFields;
    const labsComplete = gas.missingRows === 0 && lab.missingRows === 0
      && gas.fullyCoveredRows === gas.seedRows && lab.fullyCoveredRows === lab.seedRows;
    const complete = fieldTotal > 0 && fieldMatched === fieldTotal;
    return {
      complete,
      labsComplete,
      fieldTotal,
      fieldMatched,
      fieldRate: fieldTotal ? fieldMatched / fieldTotal : 1,
      gas,
      lab,
      bedside,
      screenshotGaps,
      oralRequired,
      notes: opts.notes || [
        "main 审计后：全部血气/化验趋势点都有截图（含 other/ 早期图）。",
        "血压、脉搏、CRRT、尿量只存在口述，必须走添加表单。",
        "粉红危急行 OCR 仍可能丢字，空白模版不会编造缺失数字。"
      ]
    };
  }

  return {
    surgeryEnd: "2026-09-15T14:00:00",
    GAS_KEYS,
    LAB_KEYS,
    BEDSIDE_KEYS,
    baseReadings,
    labReadings,
    bedsideReadings,
    sampleOral,
    labeledTestsetHours,
    otherImageHours,
    imageBackedHours,
    isImageBacked,
    flattenFields,
    valuesClose,
    compareCoverage,
    seedRowsWithoutScreenshot
  };
});
