(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  root.MediDashLabParse = api;
  root.parseLabReportText = api.parseLabReportText;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const GAS_KEYS = ["ph", "pco2", "po2", "hco3", "be", "lactate", "fio2", "pf", "hb", "ca"];
  const LAB_KEYS = [
    "aptt", "inr", "pt", "creatinine", "urea", "ck", "ckmb", "ldh", "hbdh",
    "alt", "ast", "il6", "pct", "wbc", "plt", "hbg", "k", "na", "cl", "alb"
  ];
  const SURGERY_END_HOUR = 14;
  const SURGERY_END_MS = Date.parse("2026-09-15T14:00:00");

  const RANGES = {
    ph: [6.7, 7.8],
    pco2: [8, 130],
    po2: [15, 550],
    hco3: [4, 55],
    be: [-35, 25],
    lactate: [0.1, 30],
    fio2: [21, 100],
    pf: [40, 650],
    hb: [3, 25],
    ca: [0.5, 1.8],
    aptt: [10, 300],
    inr: [0.5, 8],
    pt: [8, 80],
    creatinine: [20, 2500],
    urea: [1, 80],
    ck: [10, 30000],
    ckmb: [0, 800],
    ldh: [50, 20000],
    hbdh: [50, 10000],
    alt: [5, 15000],
    ast: [5, 15000],
    il6: [1, 200000],
    pct: [0.01, 500],
    wbc: [0.5, 80],
    plt: [5, 1000],
    hbg: [30, 220],
    k: [1.5, 9],
    na: [110, 175],
    cl: [70, 140],
    alb: [8, 60]
  };

  function recoverOcrDigitToken(token) {
    const mapped = String(token)
      .replace(/[Oo]/g, "0")
      .replace(/[Il|]/g, "1")
      .replace(/[Ss]/g, "8")
      .replace(/[Bb]/g, "8")
      .replace(/[Z]/g, "2");
    if (!/^-?\d+(?:[.,]\d+)?$/.test(mapped)) return token;
    return mapped;
  }

  function normalizeReportText(text) {
    return String(text || "")
      .replace(/\u00a0/g, " ")
      .replace(/[–—−－]/g, "-")
      .replace(/[：]/g, ":")
      .replace(/[Ｏ]/g, "O")
      .replace(/[０]/g, "0")
      .replace(/[，]/g, ",")
      .replace(/\bPCTT\b/g, "PCT")
      .replace(/\bALBB?\b/g, "ALB")
      .replace(/\bUREAA\b/g, "UREA")
      .replace(/\bSCRR\b/g, "SCR")
      .replace(/\bNaa\b/g, "Na")
      .replace(/\bCLL\b/g, "CL")
      .replace(/\b(?=[A-Za-z0-9]*\d)[0-9OoIlSszB]{3,}\b/g, recoverOcrDigitToken)
      .replace(/(\d{2,4}):(\d{3})\b/g, "$1.$2")
      .replace(/\r/g, "\n");
  }

  function inRange(key, value) {
    const range = RANGES[key];
    return range ? value >= range[0] && value <= range[1] : Number.isFinite(value);
  }

  function takeNumber(match, index) {
    if (!match) return null;
    const raw = match[index == null ? 1 : index];
    if (raw == null || raw === "") return null;
    const value = Number(String(raw).replace(",", "."));
    return Number.isFinite(value) ? value : null;
  }

  function assign(fields, key, value, transform) {
    if (value == null) return;
    const next = transform ? transform(value) : value;
    if (next == null || !inRange(key, next)) return;
    if (fields[key] == null) fields[key] = next;
  }

  function recoverPh(value) {
    if (value == null) return null;
    if (value >= 6.7 && value <= 7.8) return value;
    if (value >= 670 && value <= 780) return Number((value / 100).toFixed(3));
    if (value >= 6700 && value <= 7800) return Number((value / 1000).toFixed(3));
    return null;
  }

  function recoverDroppedDot(value, typicalMax) {
    if (value == null || !Number.isFinite(value)) return null;
    if (value <= typicalMax) return value;
    if (!Number.isInteger(value)) return null;
    // LIS prints 981.00 / 891.0; OCR often drops the decimal → 981000 / 8910.
    if (value % 1000 === 0) {
      const next = value / 1000;
      if (next <= typicalMax) return Number(Number(next.toFixed(4)));
    }
    let current = value;
    for (let i = 0; i < 4 && current > typicalMax; i += 1) {
      current /= 10;
    }
    return current <= typicalMax ? Number(Number(current.toFixed(4))) : null;
  }

  function recoverBe(value) {
    if (value == null) return null;
    if (inRange("be", value)) return value;
    const abs = Math.abs(value);
    if (abs >= 100 && abs <= 999 && abs % 10 === 0) {
      const next = Number((value / 100).toFixed(2));
      if (inRange("be", next)) return next;
    }
    if (abs > 35) {
      const next = Number((value / 10).toFixed(2));
      if (inRange("be", next)) return next;
    }
    return null;
  }

  function pickCandidate(key, values, recover) {
    const recovered = [];
    (values || []).forEach(value => {
      let next = inRange(key, value) ? value : null;
      if (next == null && recover) next = recover(value);
      if (next != null && inRange(key, next)) recovered.push(next);
    });
    if (!recovered.length) return null;
    if (key === "wbc") {
      const decent = recovered.filter(value => value >= 2);
      return (decent.length ? decent : recovered)[0];
    }
    if (key === "fio2") {
      const typical = recovered.filter(value => value >= 21 && value <= 80);
      return (typical.length ? typical : recovered)[0];
    }
    if (key === "alt" || key === "ast") {
      const decent = recovered.filter(value => value >= 10);
      return (decent.length ? decent : recovered)[0];
    }
    if (key === "po2") {
      const decent = recovered.filter(value => value !== 50 || recovered.length === 1);
      return decent[0] ?? recovered[0];
    }
    return recovered[0];
  }

  function scanNumbersFrom(text, match, span) {
    const start = match.index + match[0].length;
    let slice = text.slice(start, start + (span || 80));
    const analyteRe = /(?:酸碱度|二氧化碳分压|氧分压|标准剩余碱|血浆碳酸|乳酸浓度|吸入氧|氧合指数|总血红蛋白|钙离子|谷丙|谷草|肌酐|尿素|白蛋白|降钙素原|血小板|白细胞|血红蛋白|钾测定|钠测定|氯测定|\b(?:PCO2|PO2|SBE|cLac|FiO2|ctHb|APTT|INR|ALT|AST|Crea|Urea|IL-?6|PCT|ALB|SCR|UREA)\b)/ig;
    const analytes = [...slice.matchAll(analyteRe)];
    if (analytes.length) {
      const first = analytes[0];
      if (first.index < 8 && analytes[1]) slice = slice.slice(0, analytes[1].index);
      else if (first.index >= 3) slice = slice.slice(0, first.index);
    }
    slice = slice.replace(/-?\d+(?:[.,]\d+)?\s*[-~～至]\s*-?\d+(?:[.,]\d+)?/g, " ");
    return [...slice.matchAll(/(?<![A-Za-z])-?\d+(?:[.,]\d+)?(?![A-Za-z])/g)]
      .map(item => Number(String(item[0]).replace(",", ".")))
      .filter(Number.isFinite);
  }

  function assignScanned(fields, key, text, labelRe, recover) {
    if (fields[key] != null) return;
    const flags = labelRe.flags.includes("g") ? labelRe.flags : `${labelRe.flags}g`;
    const re = new RegExp(labelRe.source, flags);
    let match;
    while ((match = re.exec(text))) {
      const picked = pickCandidate(key, scanNumbersFrom(text, match), recover);
      if (picked != null) {
        fields[key] = picked;
        return;
      }
      if (!match[0].length) re.lastIndex += 1;
    }
  }

  function relativeHoursFromDayClock(day, hour, minute, surgeryEndHour) {
    const endHour = surgeryEndHour == null ? SURGERY_END_HOUR : surgeryEndHour;
    return Number((day * 24 + hour + minute / 60 - endHour).toFixed(2));
  }

  function formatRelativeLabel(hours) {
    if (hours == null || !Number.isFinite(hours)) return null;
    const prefix = hours < 0 ? "术前" : "术后";
    const abs = Math.abs(hours);
    const whole = Math.floor(abs + 1e-9);
    let minutes = Math.round((abs - whole) * 60);
    let displayHours = whole;
    if (minutes === 60) {
      displayHours += 1;
      minutes = 0;
    }
    if (minutes === 0) return `${prefix}${displayHours}h`;
    return `${prefix}${displayHours}h${String(minutes).padStart(2, "0")}m`;
  }

  function parseRelativeHours(text) {
    const postop = text.match(/(?:术后|postop(?:erative)?)\s*(\d+(?:\.\d+)?)\s*(?:h|小时|时)?\s*(?:(\d{1,2})\s*(?:m|分|min)?)?/i);
    if (postop) {
      const hours = Number(postop[1]);
      const minutes = postop[2] != null ? Number(postop[2]) : 0;
      if (Number.isFinite(hours)) {
        const value = Number((hours + minutes / 60).toFixed(2));
        return { hours: value, label: formatRelativeLabel(value) };
      }
    }

    const preop = text.match(/术前\s*(\d+(?:\.\d+)?)\s*(?:h|小时|时)?\s*(?:(\d{1,2})\s*(?:m|分|min)?)?/i);
    if (preop) {
      const hours = Number(preop[1]);
      const minutes = preop[2] != null ? Number(preop[2]) : 0;
      if (Number.isFinite(hours)) {
        const value = Number((-(hours + minutes / 60)).toFixed(2));
        return { hours: value, label: formatRelativeLabel(value) };
      }
    }

    const relative = text.match(/相对(?:时间)?\s*[:=]?\s*(-?\d+(?:\.\d+)?)/);
    if (relative) {
      const value = Number(relative[1]);
      if (Number.isFinite(value)) return { hours: Number(value.toFixed(2)), label: formatRelativeLabel(value) };
    }

    const dayClock = text.match(/\bD\s*(\d+)\s+(\d{1,2}):(\d{2})\b/i);
    if (dayClock) {
      const value = relativeHoursFromDayClock(Number(dayClock[1]), Number(dayClock[2]), Number(dayClock[3]));
      return { hours: value, label: formatRelativeLabel(value) };
    }

    const reportClock = text.match(/(?:报告时间|检验时间|采样时间)?\s*[:=]?\s*(20\d{2})[-/.](\d{1,2})[-/.](\d{1,2})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?/);
    const compactClock = !reportClock && text.match(/(20\d{2})[-/.](\d{1,2})[-/.](\d{1,2})\s+(\d{2})(\d{2})(\d{2})\b/);
    const clock = reportClock || compactClock;
    if (clock) {
      const iso = `${clock[1]}-${String(clock[2]).padStart(2, "0")}-${String(clock[3]).padStart(2, "0")}T${String(clock[4]).padStart(2, "0")}:${clock[5]}:${String(clock[6] || "00").padStart(2, "0")}`;
      const hours = (Date.parse(iso) - SURGERY_END_MS) / 3600000;
      if (Number.isFinite(hours)) {
        const value = Number(hours.toFixed(2));
        return { hours: value, label: formatRelativeLabel(value) };
      }
    }

    return { hours: null, label: null };
  }

  function parseSample(text) {
    if (/静脉血|静脉|venous|\bVEN\b/i.test(text) && !/动脉/.test(text)) return "静脉";
    if (/动脉血|动脉|arterial|\bART\b/i.test(text)) return "动脉";
    return null;
  }

  function parseLabReportText(text) {
    const raw = normalizeReportText(text);
    const fields = {};

    assign(fields, "ph", recoverPh(takeNumber(raw.match(/(?:酸碱度|[^\w]|^)pH\b[\s.|:：]*?(7[.,]\d{2,3}|7\d{3})(?!\s*[-~])/i))));
    assign(fields, "pco2", recoverDroppedDot(takeNumber(raw.match(/(?:二氧化碳分压|p\s*C[O0]2|PC[O0]2)\s*[:=]?\s*(-?\d+(?:[.,]\d+)?)/i)), 80));
    assign(fields, "po2", recoverDroppedDot(takeNumber(raw.match(/(?:氧分压|(?<![CF/cf])p\s*[O0]2)\s*[:=]?\s*(-?\d+(?:[.,]\d+)?)/i)), 200));
    assign(fields, "hco3", takeNumber(raw.match(/(?:血浆碳酸氢盐(?:浓度)?(?:\s*c?HC[O0]-?3(?:\s*\(\s*P\s*\))?)?|碳酸氢根|c?HC[O0]3-?(?:\s*\(\s*P\s*\))?)\s*[:=]?\s*(-?\d+(?:[.,]\d+)?)/i)));
    assign(fields, "be", recoverBe(takeNumber(raw.match(/(?:碱剩余|碱缺失|BEecf|SBE|\bBE\b)\s*[:=]?\s*(-?\d+(?:[.,]\d+)?)/i))));
    assign(fields, "lactate", recoverDroppedDot(takeNumber(raw.match(/(?:乳酸(?!\s*脱)|乳酸浓度|cLac|clac|Lac(?:tate)?|\bLAC\b)\s*[:=]?\s*(-?\d+(?:[.,]\d+)?)/i)), 10));

    let fio2 = takeNumber(raw.match(/(?:吸\s*入?\s*氧\s*浓度(?:\s*FO2\s*\(\s*I?\s*\))?|FiO2|FIO2|FO2\s*\(\s*I\s*\))\s*[:=]?\s*(-?\d+(?:[.,]\d+)?)/i));
    if (fio2 != null && fio2 > 0 && fio2 <= 1) fio2 = Math.round(fio2 * 100);
    if (fio2 != null && fio2 > 100) fio2 = recoverDroppedDot(fio2, 100);
    if (fio2 === 100) fio2 = null;
    assign(fields, "fio2", fio2);

    assign(fields, "pf", takeNumber(raw.match(/(?:氧合指数(?:\s*pO2\s*\(\s*a\s*\)\s*\/\s*F?O2(?:\s*\(\s*I\s*\))?)?|pO2\s*\(\s*a\s*\)\s*\/\s*F?O2(?:\s*\(\s*I\s*\))?|P\s*\/\s*F|\bPF\b)\s*[:=]?\s*(-?\d+(?:[.,]\d+)?)/i)));

    assign(fields, "hbg", recoverDroppedDot(takeNumber(raw.match(/(?:血红蛋白测定|\bHGB\b)\s*[:=]?\s*(-?\d+(?:[.,]\d+)?)/i)), 200));
    if (fields.hbg == null) {
      const labeledHb = takeNumber(raw.match(/血红蛋白\s*[:=]?\s*(-?\d+(?:[.,]\d+)?)\s*(?:g\s*\/\s*[Ll])?/i));
      if (labeledHb != null && labeledHb >= 30) {
        const looksCbc = /白细胞|\bWBC\b|血小板|\bPLT\b/i.test(raw) && !/酸碱度|cLac|ctHb|吸入氧/i.test(raw);
        if (looksCbc) assign(fields, "hbg", labeledHb);
        else if (/酸碱度|pH\b|cLac|ctHb|吸入氧/i.test(raw)) assign(fields, "hb", Number((labeledHb / 10).toFixed(1)));
        else assign(fields, "hbg", labeledHb);
      }
    }

    let hb = takeNumber(raw.match(/(?:(?:实测)?总血红蛋白(?:\s*ctHb)?|ctHb|\btHb\b)\s*[:=]?\s*(-?\d+(?:[.,]\d+)?)/i));
    if (hb == null) hb = takeNumber(raw.match(/(?<![A-Za-z])Hb\b\s*[:=]?\s*(-?\d+(?:[.,]\d+)?)/));
    if (hb != null && hb > 25 && hb <= 250) {
      if (fields.hbg == null) assign(fields, "hbg", hb);
      hb = Number((hb / 10).toFixed(1));
    }
    assign(fields, "hb", hb);

    assign(fields, "ca", takeNumber(raw.match(/(?:离子钙|游离钙|钙离子(?:浓度)?(?:\s*cCa\s*2\s*\+)?|(?<![A-Za-z])iCa(?![A-Za-z])|cCa\s*2\s*\+|Ca\+\+)\s*[:=]?\s*(-?\d+(?:[.,]\d+)?)/i)));
    assign(fields, "aptt", takeNumber(raw.match(/(?:活化部分凝血活酶时间|a?PTT)\s*[:=]?\s*(-?\d+(?:[.,]\d+)?)/i)));
    assign(fields, "inr", takeNumber(raw.match(/(?:国际标准化比值|\bINR\b)\s*[:=]?\s*(-?\d+(?:[.,]\d+)?)/i)));
    assign(fields, "pt", takeNumber(raw.match(/(?:凝血酶原时间(?!\s*国际)|(?<![A-Z])\bPT\b(?!T))\s*[:=]?\s*(-?\d+(?:[.,]\d+)?)/i)));

    let creatinine = recoverDroppedDot(takeNumber(raw.match(/(?:肌酐|Creatinine|Crea(?!tine)|\bCREA\b|\bSCR\b)\s*[:=]?\s*(-?\d+(?:[.,]\d+)?)/i)), 2000);
    if (creatinine != null && creatinine > 0 && creatinine < 20) creatinine = Number((creatinine * 88.4).toFixed(1));
    assign(fields, "creatinine", creatinine);

    assign(fields, "urea", recoverDroppedDot(takeNumber(raw.match(/(?:尿素(?:氮)?|\bUREA\b|\bUrea\b|\bBUN\b)\s*[:=]?\s*(-?\d+(?:[.,]\d+)?)/i)), 80));
    assign(fields, "ck", recoverDroppedDot(takeNumber(raw.match(/(?:肌酸激酶|\bCK\b(?!\s*-?\s*MB))\s*[:=]?\s*(-?\d+(?:[.,]\d+)?)/i)), 20000));
    assign(fields, "ckmb", recoverDroppedDot(takeNumber(raw.match(/(?:肌酸激酶同工酶|CK\s*-?\s*MB)\s*[:=]?\s*(-?\d+(?:[.,]\d+)?)/i)), 800));
    assign(fields, "ldh", recoverDroppedDot(takeNumber(raw.match(/(?:乳酸脱氢酶|\bLDH\b)\s*[:=]?\s*(-?\d+(?:[.,]\d+)?)/i)), 8000));
    assign(fields, "hbdh", recoverDroppedDot(takeNumber(raw.match(/(?:羟丁酸脱氢酶|\bHBDH\b)\s*[:=]?\s*(-?\d+(?:[.,]\d+)?)/i)), 5000));
    assign(fields, "alt", recoverDroppedDot(takeNumber(raw.match(/(?:谷丙转氨酶|\bALT\b)\s*[:=]?\s*(-?\d+(?:[.,]\d+)?)/i)), 2000));
    assign(fields, "ast", recoverDroppedDot(takeNumber(raw.match(/(?:谷草转氨酶|\bAST\b)\s*[:=]?\s*(-?\d+(?:[.,]\d+)?)/i)), 2000));
    assign(fields, "il6", recoverDroppedDot(takeNumber(raw.match(/(?:白细胞介素-?6|IL?\s*[=-]?\s*6)\s*[:=]?\s*(-?\d+(?:[.,]\d+)?)/i)), 5000));
    assign(fields, "alb", recoverDroppedDot(takeNumber(raw.match(/(?:血清白蛋白|白蛋白|\bALB\b)\s*[:=]?\s*(-?\d+(?:[.,]\d+)?)/i)), 60));
    assign(fields, "k", recoverDroppedDot(takeNumber(raw.match(/(?:钾(?:测定)?|(?<![A-Zc])\bK\b(?!\s*-?\s*MB))\s*[:=]?\s*(-?\d+(?:[.,]\d+)?)/i)), 8));
    assign(fields, "na", recoverDroppedDot(takeNumber(raw.match(/(?:钠(?:测定)?|\bNa\b)\s*[:=]?\s*(-?\d+(?:[.,]\d+)?)/i)), 170));
    assign(fields, "cl", recoverDroppedDot(takeNumber(raw.match(/(?:氯(?:测定)?|(?<![A-Z])\bCl\b)\s*[:=]?\s*(-?\d+(?:[.,]\d+)?)/i)), 130));

    assignScanned(fields, "ph", raw, /酸碱度|pH\b/i, recoverPh);
    assignScanned(fields, "pco2", raw, /二氧化碳分压|p\s*C[O0]2|PC[O0]2/i, value => recoverDroppedDot(value, 80));
    assignScanned(fields, "po2", raw, /氧分压|(?<![CF/cf])p\s*[O0]2/i, value => recoverDroppedDot(value, 200));
    assignScanned(fields, "hco3", raw, /血浆碳酸|碳酸氢|cHC[O0]-?3/i);
    assignScanned(fields, "pf", raw, /氧合指数|pO2\s*\(\s*a\s*\)\s*\/\s*F?O2/i);
    assignScanned(fields, "be", raw, /标准剩余碱|碱剩余|SBE|\bBE\b/i, recoverBe);
    assignScanned(fields, "lactate", raw, /乳酸(?!\s*脱)|乳酸浓度|cLac|clac|\bLAC\b/i, value => recoverDroppedDot(value, 10));
    assignScanned(fields, "fio2", raw, /吸\s*入?\s*氧\s*浓度|FO2\s*\(\s*I?\s*\)|FiO2/i, value => {
      if (value > 0 && value <= 1) return Math.round(value * 100);
      const next = recoverDroppedDot(value, 100);
      return next === 100 ? null : next;
    });
    assignScanned(fields, "hb", raw, /总血红蛋白|ctHb|\btHb\b/i);
    assignScanned(fields, "ca", raw, /钙离子|离子钙|cCa\s*2\s*\+|(?<![A-Za-z])iCa(?![A-Za-z])/i);
    assignScanned(fields, "aptt", raw, /活化部分凝血|APTT/i, value => recoverDroppedDot(value, 180));
    assignScanned(fields, "inr", raw, /国际标准化比值|\bINR\b/i);
    assignScanned(fields, "pt", raw, /凝血酶原时间|(?<![A-Z])\bPT\b(?!T)/i);
    assignScanned(fields, "ck", raw, /肌酸激酶|\bCK\b(?!\s*-?\s*MB)/i, value => recoverDroppedDot(value, 20000));
    assignScanned(fields, "alt", raw, /谷丙转氨酶|\bALT\b/i, value => recoverDroppedDot(value, 2000));
    assignScanned(fields, "ast", raw, /谷草转氨酶|\bAST\b/i, value => recoverDroppedDot(value, 2000));
    assignScanned(fields, "il6", raw, /白细胞介素|IL?\s*[=-]?\s*6/i, value => recoverDroppedDot(value, 5000));
    assignScanned(fields, "creatinine", raw, /肌酐|\bSCR\b|Crea(?!tine)|\bCREA\b/i, value => recoverDroppedDot(value, 2000));
    assignScanned(fields, "urea", raw, /尿素|\bUREA\b|\bUrea\b/i, value => recoverDroppedDot(value, 80));
    assignScanned(fields, "alb", raw, /白蛋白|\bALB\b/i, value => recoverDroppedDot(value, 60));
    assignScanned(fields, "k", raw, /钾测定|(?<![A-Zc])\bK\b(?!\s*-?\s*MB)/i, value => recoverDroppedDot(value, 8));
    assignScanned(fields, "na", raw, /钠测定|\bNa\b/i, value => recoverDroppedDot(value, 170));
    assignScanned(fields, "cl", raw, /氯测定|(?<![A-Z])\bCl\b/i, value => recoverDroppedDot(value, 130));

    assign(fields, "wbc", recoverDroppedDot(takeNumber(raw.match(/(?:白细胞(?:计数)?|\bWBC\b)\s*[:=]?\s*(-?\d+(?:[.,]\d+)?)/i)), 40));
    if (fields.wbc != null && fields.wbc < 2) delete fields.wbc;
    assign(fields, "plt", recoverDroppedDot(takeNumber(raw.match(/(?:血小板计数|血小板(?!\s*比积)|\bPLT\b)\s*[:=]?\s*(-?\d+(?:[.,]\d+)?)/i)), 400));
    assignScanned(fields, "wbc", raw, /白细胞|\bWBC\b/i, value => recoverDroppedDot(value, 40));
    assignScanned(fields, "plt", raw, /血小板计数|\bPLT\b/i, value => recoverDroppedDot(value, 400));
    assignScanned(fields, "hbg", raw, /血红蛋白测定|\bHGB\b/i, value => recoverDroppedDot(value, 200));

    // Chem procalcitonin only. Never take CBC 血小板比积 or ABG 氧合指数 as PCT.
    if (!/血小板比积/.test(raw)) {
      assign(fields, "pct", takeNumber(raw.match(/(?:降钙素原|Procalcitonin)\s*[:=]?\s*(-?\d+(?:[.,]\d+)?)/i)));
      if (fields.pct == null) {
        const pctMatch = raw.match(/\bPCT\b\s*[:=]?\s*(-?\d+(?:[.,]\d+)?)\s*(ng\s*\/\s*mL)?/i);
        const pctValue = takeNumber(pctMatch);
        if (pctValue != null && (pctMatch[2] || pctValue >= 1)) assign(fields, "pct", pctValue);
      }
      assignScanned(fields, "pct", raw, /降钙素原|\bPCT\b/i, value => recoverDroppedDot(value, 500));
    }

    if (fields.pf == null && fields.po2 != null && fields.fio2) {
      fields.pf = Math.round(fields.po2 / (fields.fio2 / 100));
    }

    const looksAbg = fields.ph != null || fields.lactate != null || fields.fio2 != null || fields.po2 != null;
    if (looksAbg && fields.ck != null && !/肌酸激酶/.test(raw)) delete fields.ck;

    const time = parseRelativeHours(raw);
    const sample = parseSample(raw);
    const gasCount = GAS_KEYS.filter(key => fields[key] != null).length;
    const labCount = LAB_KEYS.filter(key => fields[key] != null).length;
    let kind = "unknown";
    if (gasCount && labCount) kind = "mixed";
    else if (gasCount) kind = "abg";
    else if (labCount) kind = "lab";

    let labSample = null;
    if (labCount) {
      if (fields.wbc != null || fields.plt != null || fields.hbg != null) labSample = "血常规";
      else if (fields.aptt != null || fields.inr != null || fields.pt != null) labSample = "凝血";
      else labSample = "生化";
    }

    return {
      fields,
      hours: time.hours,
      label: time.label,
      sample,
      labSample,
      kind,
      critical: /危急\s*值|critical/i.test(raw),
      matchedCount: gasCount + labCount,
      gasCount,
      labCount
    };
  }

  function looksLikeImageFile(file) {
    if (!file || typeof file.name !== "string") return false;
    const name = file.name.toLowerCase();
    const type = String(file.type || "").toLowerCase();
    if (type.startsWith("image/")) return true;
    return /\.(png|jpe?g|gif|webp|bmp|heic|heif)$/.test(name);
  }

  function fieldQuality(key, value) {
    if (value == null) return -1;
    if (key === "wbc" && value < 2) return 0;
    if ((key === "alt" || key === "ast") && value < 10) return 0;
    if (key === "fio2" && value === 100) return 1;
    if (key === "fio2" && value >= 21 && value <= 80) return 3;
    if (key === "po2" && value === 50) return 1;
    return 2;
  }

  function mergeParsedReports(primary, extra) {
    if (!primary) return extra || parseLabReportText("");
    if (!extra) return primary;
    const fields = { ...(primary.fields || {}) };
    Object.entries(extra.fields || {}).forEach(([key, value]) => {
      if (value == null) return;
      if (fields[key] == null || fieldQuality(key, value) > fieldQuality(key, fields[key])) {
        fields[key] = value;
      }
    });
    const hours = primary.hours != null ? primary.hours : extra.hours;
    const label = primary.label || extra.label;
    const sample = primary.sample || extra.sample;
    const gasCount = GAS_KEYS.filter(key => fields[key] != null).length;
    const labCount = LAB_KEYS.filter(key => fields[key] != null).length;
    let kind = "unknown";
    if (gasCount && labCount) kind = "mixed";
    else if (gasCount) kind = "abg";
    else if (labCount) kind = "lab";
    let labSample = primary.labSample || extra.labSample;
    if (labCount) {
      if (fields.wbc != null || fields.plt != null || fields.hbg != null) labSample = "血常规";
      else if (fields.aptt != null || fields.inr != null || fields.pt != null) labSample = "凝血";
      else labSample = "生化";
    }
    return {
      fields,
      hours,
      label,
      sample,
      labSample,
      kind,
      critical: Boolean(primary.critical || extra.critical),
      matchedCount: gasCount + labCount,
      gasCount,
      labCount
    };
  }

  function parseLabReportTexts(texts) {
    return (texts || [])
      .map(item => parseLabReportText(item))
      .reduce((acc, item) => mergeParsedReports(acc, item), null) || parseLabReportText("");
  }

  function preprocessLabImageData(imageData) {
    if (!imageData || !imageData.data) return imageData;
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const pink = r > 180 && b > 160 && g > 120 && r + b > g * 1.55 && max - min < 100;
      const blue = b > 180 && b > r && g < 230;
      if (pink || blue) {
        data[i] = data[i + 1] = data[i + 2] = 255;
      } else {
        const y = 0.299 * r + 0.587 * g + 0.114 * b;
        const v = y < 145 ? 0 : 255;
        data[i] = data[i + 1] = data[i + 2] = v;
      }
    }
    return imageData;
  }

  function fileRejectionReason(file) {
    if (!file) return "没有选择文件";
    if (file.size > 15 * 1024 * 1024) return "图片超过 15MB，请先压缩或改用截图";
    const name = String(file.name || "").toLowerCase();
    const type = String(file.type || "").toLowerCase();
    if (type === "application/pdf" || name.endsWith(".pdf")) return "暂不支持 PDF，请先截图后再导入";
    if (type.startsWith("text/") || name.endsWith(".txt")) return null;
    if (!looksLikeImageFile(file) && !name.endsWith(".txt")) return "请选择化验截图（PNG/JPG/WEBP）";
    return null;
  }

  return {
    GAS_KEYS,
    LAB_KEYS,
    parseLabReportText,
    parseLabReportTexts,
    mergeParsedReports,
    preprocessLabImageData,
    relativeHoursFromDayClock,
    formatRelativeLabel,
    looksLikeImageFile,
    fileRejectionReason
  };
});
