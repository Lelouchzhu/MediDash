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

- **大陆入口（当前页）**: https://jsd.onmicrosoft.cn/gh/Lelouchzhu/MediDash@6e8dc1cb1e6801ccb1158280f3b9ce868f523e55/index.xhtml
- 备用国内镜像: https://cdn.jsdmirror.com/gh/Lelouchzhu/MediDash@6e8dc1cb1e6801ccb1158280f3b9ce868f523e55/index.xhtml

灌注卡应是乳酸 **2.04**（0.5–1.6外），并写 1.67→2.04、ABE 1.90 仍在−3到3、这张没标异常。酸碱卡 pH **7.433**，卡头写 pH 在参考内，PCO₂ **40.10**，HCO₃⁻ **26.20**↑。氧合卡 **P/F 220**，FiO₂仍 **60%**，PO₂ **132.00**。220 是单子底部印的氧合指数，132.00÷0.60=220。0.34% 那一行不是 P/F。感染卡白细胞 **9.28**，中性粒 **93.3%** / **8.65** 仍高，降钙素原 **6.8433→5.546**，并写血小板比积 0.11% 不是降钙素原。肾功能卡肌酐 **210.0**，尿素 **18.24**，钾 **4.05**，尿 **20** ml，脱水总量 **7060**，并写凌晨两点左右开始。肝卡 ALT **19**，白蛋白 **31.5→23.2**。血红蛋白卡血常规 **84**，卡头写大夫说先不输血，血气仍 **8.00**，血小板 **89**，iCa 1.10→**1.11**。凝血卡 APTT **58.6**，卡头写仍高于21–45，这张没写危急值，INR仍 **1.19**，纤维蛋白原仍 **6.51**。循环卡应是 **139/43**，MAP **67**，心跳 **80**，呼吸 **15**。139/43 按常规算法是 75，卡上用口述的 67。去甲 4→**5** mL/h（0.25 mg/h，按 0.05 mg/mL），多巴胺仍 **5**。这批没有新的血压。顶栏应是 **最新：术后376h44m**，并且有 **上传**。查房仍是 4 条：第一条写 P/F 252→220、FiO₂仍60%；第二条写白细胞 18.20→9.28、降钙素原 6.8433→5.546；第三条写 9月30日清单CRRT 19.07小时、尿20ml、脱水总量7060、APTT 58.6仍高；第四条写 9月30日清单白蛋白4支/1648、血气Hb仍8.00、未见悬浮红细胞。若氧合卡还是 P/F 252、顶栏还是钾 4.05，打开的还是旧镜像。下次更新后把钉住的提交号换成新的完整 40 位 SHA，不要改回 `@main`，也不要用短 SHA。

微信内置浏览若只看到源码，把链接复制到系统浏览器（Chrome / Safari）。

海外备用：https://htmlpreview.github.io/?https://github.com/Lelouchzhu/MediDash/blob/main/index.html

**上传化验**已正式并入 `main`。家属大陆入口仍是上面带提交号的 `index.xhtml`。上传完成后的手机结果页用这次提交的 GitHub 预览，避免干等国内镜像缓存。

网页不保存 Cursor 密钥。中转程序是 [`scripts/agent-upload-relay.py`](scripts/agent-upload-relay.py)：在医院网络能访问的机器上设置 `CURSOR_API_KEY` 和 `UPLOAD_TOKEN` 后运行，再把地址和口令填进手机。默认更新 `main`。旧中转若仍指向 `cursor/mainland-lab-upload-b98e`，需要重新部署。agent 会改数据、解读、查房问题，重建 `index.xhtml`，并钉大陆入口提交号。

正式上传后，网页轮询中转的 `/status`。Agent push 完成时，中转读取新 commit SHA，并把浏览器带到这次提交的 GitHub 预览页。

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
| [`testset/`](testset/) | Screenshot archive + `manifest.json` (currently 216 reports) |

Config: [`.cursor/environment.json`](.cursor/environment.json) starts the dashboard server on port **8080**.

Clinical zero: surgery end **2026-09-15 14:00**. Every new screenshot is copied into `testset/reports/<category>/`, registered in `manifest.json`, then extracted into `index.html`.
