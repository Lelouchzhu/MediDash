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

- **大陆入口（当前页）**: https://jsd.onmicrosoft.cn/gh/Lelouchzhu/MediDash@eaa9fc2c52fd6d09f72e20411104567c89c18cf2/index.xhtml
- 备用国内镜像: https://cdn.jsdmirror.com/gh/Lelouchzhu/MediDash@eaa9fc2c52fd6d09f72e20411104567c89c18cf2/index.xhtml

灌注卡大数字应是09:14静脉乳酸 **2.17**（0.5–1.6外），卡头写偏高。08:31动脉乳酸是 **2.98**↑。动脉ABE **1.20** 异常栏空着，静脉ABE仍 **1.70**。酸碱卡大数字 pH **7.459**↑，卡头写 pH标高，HCO₃⁻ **25.50** 异常栏空着，PCO₂ **36.80** 异常栏空着，08:31动脉pH是 **7.427**，异常栏空着。氧合卡 **P/F 179**，FiO₂仍 **60%**，08:31动脉 PO₂ **107.30**↑。179 是10月3日08:31这张动脉单子底部印的氧合指数，107.30÷0.60=178.83，印的是179。0.28% 那一行不是 P/F。02:39那张也印了179。02:38静脉底部指数 **64** 也不是动脉P/F，卡上写静脉169不是P/F。感染卡白细胞 **13.63**，卡头写总数仍高，中性粒 **95.1%** / **12.97** 仍高，降钙素原仍 **5.754**，并写血小板比积 0.10% 不是降钙素原。肾功能卡肌酐 **143.40**，卡头写这张参考57–111，尿素 **13.08**（这张参考3.6–9.5），钾 **3.79** 异常栏空着。约下午两点仍是10月2日15:00口述，不是这张化验已经说明肾脏恢复。肝卡 ALT **19**，白蛋白 **31.5→23.2**。血红蛋白卡血常规 **102.0**，卡头写仍低于115，血小板 **82**，08:31动脉血气 **10.20** / 钙 **1.09**，09:14静脉 ctHb **10.30**↓ / 钙 **1.11**↓。10月2日发出的2单位不是已经输完。凝血卡 APTT **38.9**，卡头写异常栏空着，这张参考21–45，INR **1.04**，纤维蛋白原 **4.14**。循环卡应是 **140/40**，脉搏 **87**，呼吸 **24**，MAP **64**。140/40按常规算法约73，不改口述64。多巴胺 **5**，去甲 **3** mL/h（0.15 mg/h）。顶栏应是 **最新口述：术后427h56m · 140/40**，并且有 **上传**。查房仍是 4 条：第一条写P/F 113→179、血压140/40、去甲5→3；第二条写白细胞11.50→13.63、降钙素原仍5.754、药敏；第三条写肌酐286.0→143.40、这张参考57–111、钾4.37→3.79；第四条写血常规Hb 73.0→102.0、血小板65→82、APTT 38.9异常栏空着。每日用药与治疗应打开在 **10月2日**，写 CRRT **9.87** 小时 / **937.65** 元、悬浮红细胞发出2单位、白蛋白×4、泰定平×3、呼吸机24小时。9月15日仍在。预交款 **71000**，费用 **151409.90**，余额 **−80409.90** 记在这一天的说明里，是账户快照。若灌注卡还写动脉 2.37，或氧合卡还写 PO₂ 107.40，打开的还是旧镜像。下次更新后把钉住的提交号换成新的完整 40 位 SHA，不要改回 `@main`，也不要用短 SHA。

微信内置浏览若只看到源码，把链接复制到系统浏览器（Chrome / Safari）。

海外备用：https://htmlpreview.github.io/?https://github.com/Lelouchzhu/MediDash/blob/main/index.html

**上传化验**已正式并入 `main`。家属大陆入口仍是上面带提交号的 `index.xhtml`。上传完成后的手机结果页用这次提交的 GitHub 预览，避免干等国内镜像缓存。

网页不保存 Cursor 密钥。中转程序是 [`scripts/agent-upload-relay.py`](scripts/agent-upload-relay.py)：在医院网络能访问的机器上设置 `CURSOR_API_KEY` 和 `UPLOAD_TOKEN` 后运行，再把地址和口令填进手机。默认更新 `main`。旧中转若仍指向 `cursor/mainland-lab-upload-b98e`，需要重新部署。agent 会改数据、状态卡和查房问题，重建 `index.xhtml`，并钉大陆入口提交号。文字说明只进 `data/narratives.json`，不写回页面。

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
