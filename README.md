# MediDash

Mobile-friendly perioperative monitoring dashboard for family-side trend tracking. **This repository is the source of truth.** New lab results, report screenshots (`testset/`), and dashboard updates go here (`Lelouchzhu/MediDash` on `main`), not to the old Allmond fork.

> For caregiving coordination only — does **not** replace ICU judgment or formal medical records.

## What the dashboard shows

Single-file [`index.html`](index.html):

- **Status cards** for circulation/support, kidney, infection, coagulation, and oxygenation
- **分类汇总** — sparklines for every metric, grouped by system
- **循环与支持** — dedicated blood-pressure and vasopressor charts from oral `vitalReadings` (plus MAP / HR / NE / DA in the category picker)
- **详细趋势** — pick a category, then a metric
- **Doctor discussion checklist** (`doctorQuestions`) for rounds
- Timeline, expandable report notes, and a hero pill driven by the newer of the last arterial vs `latestNonBloodGasReport`

Categories: 循环/支持, 灌注/酸碱, 氧合, 感染/炎症, 肾脏, 凝血/血细胞, 肝/肌酶, 电解质.

## Naming traps

Do **not** mix these three “PCT-looking” numbers:

| Label on the sheet | Meaning |
|--------------------|---------|
| **降钙素原 / PCT** (chemistry) | Procalcitonin ng/mL |
| **血小板比积 / PCT** (CBC) | Plateletcrit % |
| **氧合指数 pO2(a)/FO2(I)** | PaO₂/FiO₂ |

Norepinephrine concentration is **0.05 mg/mL** (9 mL/h = 0.45 mg/h; 6 = 0.30; 4 = 0.20). Do not invent dopamine mg/h or body weight.

## Open locally

```bash
python3 -m http.server 8080
```

Then open [http://localhost:8080/index.html](http://localhost:8080/index.html).

## Preview

大陆入口是 [`index.xhtml`](index.xhtml)（`application/xhtml+xml`）。`index.html` 在镜像上是纯文本，不能直接开。不要用 `hub.xhtml`。

国内镜像把 `@main` 收成一份旧快照，`purge.jsdelivr.net` 和网址后面的 `?v=` 都换不掉。2026-09-22 实测 `jsd.onmicrosoft.cn` 与 `cdn.jsdmirror.com` 的 `@main` 仍停在术后149h20m（没有乳酸 2.12）。**带提交号的地址会立刻取到那一版。**

- **大陆入口（当前页）**: https://jsd.onmicrosoft.cn/gh/Lelouchzhu/MediDash@2b92beb/index.xhtml
- 备用国内镜像: https://cdn.jsdmirror.com/gh/Lelouchzhu/MediDash@2b92beb/index.xhtml

灌注卡应是乳酸 **2.24**，酸碱卡 pH **7.360**，氧合卡 **P/F 140**。感染卡白细胞 **26.44**，降钙素原 **8.206**。肾功能卡应是肌酐 **185**，尿素 **20.52**。血红蛋白卡血气仍是 **10.8**，血常规 **100**。循环卡仍是 **96/36**。顶栏应是 **最新化验：术后211h31m · 肌酐 185**。若顶栏还是术后209h47m，打开的还是旧镜像。下次更新后把 `2b92beb` 换成新提交号，不要改回 `@main`。

微信内置浏览若只看到源码，把链接复制到系统浏览器（Chrome / Safari）。

海外备用：https://htmlpreview.github.io/?https://github.com/Lelouchzhu/MediDash/blob/main/index.html

**上传化验**只在功能分支 `cursor/mainland-lab-upload-b98e`，和识图版 / 空白版一样，**先不覆盖 main**。大陆预览：

固定启动页（带后台轮询，不依赖 tag 缓存）：

https://jsd.onmicrosoft.cn/gh/Lelouchzhu/MediDash@237bb52/index.xhtml

这一页应有 **上传化验**，顶栏是 **最新化验：术后199h06m · APTT 41.1**。若仍是术后188h19m或198h50m，打开的是旧启动页。

`@upload` 只作备用入口，可能更新较慢：

https://jsd.onmicrosoft.cn/gh/Lelouchzhu/MediDash@upload/index.xhtml

网页不保存 Cursor 密钥。中转程序是 [`scripts/agent-upload-relay.py`](scripts/agent-upload-relay.py)：在医院网络能访问的机器上设置 `CURSOR_API_KEY` 和 `UPLOAD_TOKEN` 后运行，再把地址和口令填进手机。agent 只更新这一支的数据、解读和查房问题。

正式上传后，网页轮询中转的 `/status`。Agent push 完成时，中转读取新 commit
SHA，并把浏览器带到 `/page/<SHA>`；这是实时、不可变的新页面，不依赖
`@upload` 的国内 CDN 缓存。中转的 `/latest` 永远跳到功能分支当前页面。

阿里云函数计算部署包及控制台步骤见
[`deploy/aliyun-fc/README.md`](deploy/aliyun-fc/README.md)。部署密钥只通过 FC
环境变量注入，不进入仓库或网页。

暂不使用云中转时，可在 `LelouchzhuPC2` 同一局域网内运行：
[`deploy/local/README.md`](deploy/local/README.md)。本地地址同时提供 dashboard
和 `/upload`，避免浏览器 Mixed Content 拦截。

## Cloud Agent / handoff

Start Cloud Agents on **this** repository and read these first:

| File | Role |
|------|------|
| [`AGENTS.md`](AGENTS.md) | Operating rules: MediDash `main` only, testset backup, same-clock/hires replace, `node --check` |
| [`CONTEXT.md`](CONTEXT.md) | Living clinical memory (timeline, latest labs, bedside) |
| [`docs/transcripts/`](docs/transcripts/) | Dated conversation summaries (newest first) |
| [`testset/`](testset/) | Screenshot archive + `manifest.json` (currently 132 reports) |

Config: [`.cursor/environment.json`](.cursor/environment.json) starts the dashboard server on port **8080**.

Clinical zero: surgery end **2026-09-15 14:00**. Every new screenshot is copied into `testset/reports/<category>/`, registered in `manifest.json`, then extracted into `index.html`.
