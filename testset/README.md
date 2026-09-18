# Report screenshot testset

Backup of lab/imaging screenshots for:
1. **Re-extraction / regression tests** (OCR or manual re-read)
2. **Preventing omitted values** when updating the dashboard

## Layout

```
testset/
  manifest.json          # index of all archived reports
  reports/
    abg/                 # arterial/venous blood gas
    chemistry/           # biochem, PCT(procalcitonin), liver/muscle enzymes
    coag/                # coagulation
    cbc/                 # complete blood count (note: CBC "PCT" = plateletcrit)
    imaging/             # CT/X-ray/ultrasound screenshots
    other/               # unlabeled historical uploads
    inbox/               # drop new unlabeled shots here first
```

## Policy (mandatory)

Whenever a new report image is uploaded in chat:
1. Copy it into `testset/reports/<category>/` with name `{YYYYMMDDTHHMMSS}__{original}` when clock is known
2. Append an entry to `manifest.json` (`labeled: true` once values are extracted)
3. Update `index.html` dashboard readings
4. Commit and push to **MediDash**

Do **not** confuse:
- 降钙素原 PCT (ng/mL) vs 血小板比积 PCT (%) vs 氧合指数 P/F

## Counts

See `manifest.json` → `count`.

## Parser regression

Labeled LIS reports (abg / chemistry / coag / cbc) can be re-read with the shared parser:

```bash
node --test parse-lab-report.test.mjs
node scripts/run-testset.mjs --ocr
```

`--ocr` uses Tesseract `chi_sim+eng` on the JPEGs. Without `--ocr` the script only lists expected values.

To see whether the **empty template** can rebuild the live report from these files plus oral notes:

```bash
node scripts/build-template.mjs
node scripts/replay-coverage.mjs
```

Open `template.html` and use **添加最新结果** (screenshot + 口述血压/脉搏/CRRT).
