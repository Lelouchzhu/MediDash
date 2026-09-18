#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const indexPath = path.join(root, "index.html");
const outPath = path.join(root, "template.html");

let html = fs.readFileSync(indexPath, "utf8");
html = html.replace('<html lang="zh-CN">', '<html lang="zh-CN" data-mode="template">');
html = html.replace(
  "<title>围手术期连续监测 Dashboard</title>",
  "<title>空白监测模版</title>"
);
html = html.replace(
  /const TEMPLATE_MODE = window\.TEMPLATE_MODE === true\s*\|\|[\s\S]*?=== "template";/,
  "const TEMPLATE_MODE = true;"
);

const parser = fs.readFileSync(path.join(root, "parse-lab-report.js"), "utf8");
const current = fs.readFileSync(path.join(root, "data/current-report.js"), "utf8");
html = html.replace(
  '<script src="parse-lab-report.js"></script>\n  <script src="data/current-report.js"></script>',
  `<script>\n${parser}\n</script>\n  <script>\n${current}\n</script>`
);

fs.writeFileSync(outPath, html);
const bytes = fs.statSync(outPath).size;
console.log(JSON.stringify({ out: "template.html", bytes, inlined: true }, null, 2));
