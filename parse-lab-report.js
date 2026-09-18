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
  const LAB_KEYS = ["aptt", "inr", "creatinine", "urea", "ck", "alt", "ast", "il6", "pct"];
  const SURGERY_END_HOUR = 14;

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
    inr: [0.5, 12],
    creatinine: [20, 2500],
    urea: [1, 80],
    ck: [10, 30000],
    alt: [5, 15000],
    ast: [5, 15000],
    il6: [1, 200000],
    pct: [0.01, 500]
  };

  function normalizeReportText(text) {
    return String(text || "")
      .replace(/\u00a0/g, " ")
      .replace(/[–—−－]/g, "-")
      .replace(/[：]/g, ":")
      .replace(/[Ｏ]/g, "O")
      .replace(/[０]/g, "0")
      .replace(/[，]/g, ",")
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

    assign(fields, "ph", takeNumber(raw.match(/(?:酸碱度|[^\w]|^)pH\b\s*[:=]?\s*(7[.,]\d{2,3})/i)));
    assign(fields, "pco2", takeNumber(raw.match(/(?:二氧化碳分压|p\s*C[O0]2|PC[O0]2)\s*[:=]?\s*(-?\d+(?:[.,]\d+)?)/i)));
    assign(fields, "po2", takeNumber(raw.match(/(?:氧分压|(?<![CF/cf])p\s*[O0]2)\s*[:=]?\s*(-?\d+(?:[.,]\d+)?)/i)));
    assign(fields, "hco3", takeNumber(raw.match(/(?:碳酸氢根|HC[O0]3-?)\s*[:=]?\s*(-?\d+(?:[.,]\d+)?)/i)));
    assign(fields, "be", takeNumber(raw.match(/(?:碱剩余|碱缺失|BEecf|SBE|\bBE\b)\s*[:=]?\s*(-?\d+(?:[.,]\d+)?)/i)));
    assign(fields, "lactate", takeNumber(raw.match(/(?:乳酸|Lac(?:tate)?|\bLAC\b)\s*[:=]?\s*(-?\d+(?:[.,]\d+)?)/i)));

    let fio2 = takeNumber(raw.match(/(?:吸入氧(?:浓度)?|FiO2|FIO2)\s*[:=]?\s*(-?\d+(?:[.,]\d+)?)/i));
    if (fio2 != null && fio2 > 0 && fio2 <= 1) fio2 = Math.round(fio2 * 100);
    assign(fields, "fio2", fio2);

    assign(fields, "pf", takeNumber(raw.match(/(?:氧合指数(?:\s*pO2\s*\(\s*a\s*\)\s*\/\s*F?O2(?:\s*\(\s*I\s*\))?)?|pO2\s*\(\s*a\s*\)\s*\/\s*F?O2(?:\s*\(\s*I\s*\))?|P\s*\/\s*F|\bPF\b)\s*[:=]?\s*(-?\d+(?:[.,]\d+)?)/i)));

    let hb = takeNumber(raw.match(/(?:血红蛋白|(?<![A-Z])t?Hb|\bHGB\b)\s*[:=]?\s*(-?\d+(?:[.,]\d+)?)/i));
    if (hb != null && hb > 25 && hb <= 250) hb = Number((hb / 10).toFixed(1));
    assign(fields, "hb", hb);

    assign(fields, "ca", takeNumber(raw.match(/(?:离子钙|游离钙|iCa|Ca\+\+)\s*[:=]?\s*(-?\d+(?:[.,]\d+)?)/i)));
    assign(fields, "aptt", takeNumber(raw.match(/(?:活化部分凝血活酶时间|a?PTT)\s*[:=]?\s*(-?\d+(?:[.,]\d+)?)/i)));
    assign(fields, "inr", takeNumber(raw.match(/(?:国际标准化比值|\bINR\b)\s*[:=]?\s*(-?\d+(?:[.,]\d+)?)/i)));

    let creatinine = takeNumber(raw.match(/(?:肌酐|Creatinine|Crea(?!tine)|\bCREA\b)\s*[:=]?\s*(-?\d+(?:[.,]\d+)?)/i));
    if (creatinine != null && creatinine > 0 && creatinine < 20) creatinine = Number((creatinine * 88.4).toFixed(1));
    assign(fields, "creatinine", creatinine);

    assign(fields, "urea", takeNumber(raw.match(/(?:尿素(?:氮)?|\bUrea\b|\bBUN\b)\s*[:=]?\s*(-?\d+(?:[.,]\d+)?)/i)));
    assign(fields, "ck", takeNumber(raw.match(/(?:肌酸激酶|\bCK\b(?!\s*-?\s*MB))\s*[:=]?\s*(-?\d+(?:[.,]\d+)?)/i)));
    assign(fields, "alt", takeNumber(raw.match(/(?:谷丙转氨酶|\bALT\b)\s*[:=]?\s*(-?\d+(?:[.,]\d+)?)/i)));
    assign(fields, "ast", takeNumber(raw.match(/(?:谷草转氨酶|\bAST\b)\s*[:=]?\s*(-?\d+(?:[.,]\d+)?)/i)));
    assign(fields, "il6", takeNumber(raw.match(/(?:白细胞介素-?6|IL\s*-?\s*6)\s*[:=]?\s*(-?\d+(?:[.,]\d+)?)/i)));

    // Chem procalcitonin only. Never take CBC 血小板比积 or ABG 氧合指数 as PCT.
    if (!/血小板比积/.test(raw)) {
      assign(fields, "pct", takeNumber(raw.match(/(?:降钙素原|Procalcitonin)\s*[:=]?\s*(-?\d+(?:[.,]\d+)?)/i)));
      if (fields.pct == null) {
        const pctMatch = raw.match(/\bPCT\b\s*[:=]?\s*(-?\d+(?:[.,]\d+)?)\s*(ng\s*\/\s*mL)?/i);
        const pctValue = takeNumber(pctMatch);
        if (pctValue != null && (pctMatch[2] || pctValue >= 1)) assign(fields, "pct", pctValue);
      }
    }

    if (fields.pf == null && fields.po2 != null && fields.fio2) {
      fields.pf = Math.round(fields.po2 / (fields.fio2 / 100));
    }

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
      labSample = fields.aptt != null || fields.inr != null ? "凝血" : "生化";
    }

    return {
      fields,
      hours: time.hours,
      label: time.label,
      sample,
      labSample,
      kind,
      critical: /危急值|critical/i.test(raw),
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
    relativeHoursFromDayClock,
    formatRelativeLabel,
    looksLikeImageFile,
    fileRejectionReason
  };
});
