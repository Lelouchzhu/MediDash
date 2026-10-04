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

- **大陆入口（当前页）**: https://jsd.onmicrosoft.cn/gh/Lelouchzhu/MediDash@c5aa01c58e14ea79a5175994cad4a2890898114a/index.xhtml
- 备用国内镜像: https://cdn.jsdmirror.com/gh/Lelouchzhu/MediDash@c5aa01c58e14ea79a5175994cad4a2890898114a/index.xhtml

灌注卡大数字应是23:02动脉乳酸 **1.63**（0.5–1.6外），卡头写偏高。08:31动脉乳酸是 **2.98**↑。ABE **−2.00** 异常栏空着，不是已经正常。酸碱卡大数字 pH **7.471**↑，卡头写 pH标高，HCO₃⁻ **21.70**↓，PCO₂ **30.40**↓。氧合卡 **P/F 213**，FiO₂ **50%**，PO₂ **106.40**↑。213 是10月3日23:02这张底部印的氧合指数，106.40÷0.50=212.8，印的是213。0.34% 那一行不是 P/F。单子没印动脉或静脉，家属也没说静脉，按动脉血记。50% 不是已经撤机。感染卡白细胞 **13.63**，卡头写还有点低烧，降钙素原仍 **5.754**，10:06这两天没测，没有度数。血小板比积 0.10% 不是降钙素原。肾功能卡肌酐 **254.50**，卡头写这张参考57–111，尿素 **20.31**（这张参考3.6–9.5），钾 **3.99** 异常栏空着。10:06口述 CRRT已经准备中，今天继续。没有流速，也没有尿量。143.40到254.50不是已经再开，也不是肾脏已经恢复。肝卡 ALT **19**，白蛋白 **31.5→23.2**。血红蛋白卡血常规 **102.0**，卡头写仍低于115，血小板 **82**，23:02动脉血气 **7.40** / 钙 **1.11**↓。10:06口述今天输血，没说几单位。7.40 不是今天的单位数。不要写成10月2日发出的2单位就是这一次。凝血卡 APTT **60.9**，卡头写又高于21–45，这张参考21–45，INR **1.08**，纤维蛋白原 **3.35**。60.9不是危急值，也不是出血已经开始。循环卡应是 **135/40**，脉搏 **75**，呼吸 **20**，MAP **62**。135/40按常规算法约72，不改口述62。升压药只剩多巴胺 **5** mL/h，去甲记成 **0**。08:03是这句的收到时间，不是监护仪钟点。顶栏应是 **最新口述：术后452h06m · 今天输血**，并且有 **上传**。10:06是家属写的钟点，没有秒，不是监护仪钟点。这句没有血压，循环卡仍是08:03。手机状态栏23:32不是23:22的报告时间。10月2日15:06和10月3日07:43是另外两句口述，没有血压：中午左右便血、血量不算小、先观察；07:43 那次之后没再便，计划的肠胃营养液 **200** mL 没有灌入，便血后 CRRT 抗凝药不同所以测静脉血气，药名没说。十二点半的样子不是 12:30 整。查房仍是 4 条，展开后是短句，关键数字加粗：第一条 P/F 213、FiO₂ 50%、乳酸 1.63；第二条标题是降钙素原这两天没测，还有点低烧；第三条标题是肌酐254.50，CRRT今天继续做；第四条标题是今天输血，肠镜不能做，营养液不能喂。肠镜评估后不能做：要充气，怕把肠接合处撑开。血弥漫整段肠子，出血点难找。接合处没有说已经撑开。肠胃营养液不能喂了。07:43那 **200** mL 仍没灌入。大概明天不是降钙素原的钟点。器官汇总同样只留最新短句。长解释在数据库，不在这页。循环与支持只留血压趋势和升压药趋势，下面不再列口述长名单。详细趋势横轴另标输血（清单日发出单位）、CRRT计费日和插管/气切，不编开停钟点。每日用药与治疗应打开在 **10月3日**，写 CRRT **6.17** 小时 / **586.15** 元、这张没看到悬浮红细胞、白蛋白×4、瑞能退回1瓶、泰定平×3、呼吸机24小时。9月15日仍在。预交款 **81000**，费用 **157614.64**，余额 **−76614.64** 记在这一天的说明里，是账户快照。底栏当前总计被日期按钮挡住，不编单日合计。若灌注卡还写动脉 2.37，或氧合卡还写 PO₂ 107.40，打开的还是旧镜像。下次更新后把钉住的提交号换成新的完整 40 位 SHA，不要改回 `@main`，也不要用短 SHA。

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
