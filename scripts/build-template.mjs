#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const indexPath = path.join(root, "index.html");
const parser = fs.readFileSync(path.join(root, "parse-lab-report.js"), "utf8");
const current = fs.readFileSync(path.join(root, "data/current-report.js"), "utf8");
const source = fs.readFileSync(indexPath, "utf8");

function inline(html) {
  return html.replace(
    '<script src="parse-lab-report.js"></script>\n  <script src="data/current-report.js"></script>',
    `<script>\n${parser}\n</script>\n  <script>\n${current}\n</script>`
  );
}

const TEMPLATE_MODE_DECL =
  /const TEMPLATE_MODE = window\.TEMPLATE_MODE === true\s*\|\|[\s\S]*?get\("mode"\) === "template";/;

function build({ out, templateMode, title, eyebrow }) {
  let html = source;
  if (templateMode) {
    html = html.replace('<html lang="zh-CN">', '<html lang="zh-CN" data-mode="template">');
    html = html.replace(TEMPLATE_MODE_DECL, "const TEMPLATE_MODE = true;");
  } else {
    html = html.replace(TEMPLATE_MODE_DECL, "const TEMPLATE_MODE = false;");
  }
  html = html.replace("<title>围手术期连续监测 Dashboard</title>", `<title>${title}</title>`);
  if (eyebrow) {
    html = html.replace(
      '<p class="eyebrow">Perioperative monitoring</p>',
      `<p class="eyebrow">${eyebrow}</p>`
    );
  }
  html = inline(html);
  const dest = path.join(root, out);
  fs.writeFileSync(dest, html);
  return { out, bytes: fs.statSync(dest).size, templateMode };
}

const built = [
  build({
    out: "live.html",
    templateMode: false,
    title: "围手术期连续监测 · 识图版",
    eyebrow: "Perioperative monitoring · 识图版"
  }),
  build({
    out: "template.html",
    templateMode: true,
    title: "空白监测模版",
    eyebrow: "Perioperative monitoring · 空白模版"
  })
];

console.log(JSON.stringify({ built }, null, 2));
