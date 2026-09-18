#!/usr/bin/env python3
"""Generate de-identified fixture screenshots for screenshot-import tests."""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "fixtures"
FONT_CANDIDATES = [
    "/usr/share/fonts/truetype/wqy/wqy-microhei.ttc",
    "/usr/share/fonts/truetype/droid/DroidSansFallbackFull.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
]


def font(size, bold=False):
    if bold:
        bold_path = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
        try:
            return ImageFont.truetype(bold_path, size)
        except OSError:
            pass
    for path in FONT_CANDIDATES:
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    return ImageFont.load_default()


def draw_report(path, title, subtitle, rows, badge=None):
    width, height = 900, 1280
    image = Image.new("RGB", (width, height), "#f3f6f4")
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle((36, 36, width - 36, height - 36), 28, fill="#ffffff", outline="#d7e2dc", width=3)
    draw.rounded_rectangle((36, 36, width - 36, 210), 28, fill="#143b31")
    draw.rectangle((36, 160, width - 36, 210), fill="#143b31")
    draw.text((64, 58), title, font=font(36, bold=True), fill="#ffffff")
    draw.text((64, 118), subtitle, font=font(22), fill="#d7eee4")
    if badge:
        draw.rounded_rectangle((width - 250, 70, width - 64, 118), 16, fill="#bd3b3b")
        draw.text((width - 236, 80), badge, font=font(20, bold=True), fill="#ffffff")

    y = 250
    for label, value, unit in rows:
        draw.rounded_rectangle((64, y, width - 64, y + 78), 16, fill="#f7fbf8", outline="#e1ebe5")
        draw.text((86, y + 22), label, font=font(24), fill="#4d635c")
        draw.text((430, y + 16), value, font=font(34, bold=True), fill="#17342f")
        draw.text((700, y + 24), unit, font=font(22), fill="#62746f")
        y += 92

    draw.text((64, height - 110), "De-identified fixture  ·  not a clinical record", font=font(18), fill="#8a9b95")
    OUT.mkdir(exist_ok=True)
    image.save(path, "PNG")


def main():
    draw_report(
        OUT / "sample-abg-screenshot.png",
        "Arterial Blood Gas",
        "ART  ·  术后66h10m  ·  de-identified",
        [
            ("pH", "7.371", ""),
            ("pCO2", "39.8", "mmHg"),
            ("pO2", "91.2", "mmHg"),
            ("HCO3", "22.1", "mmol/L"),
            ("BE", "-2.4", "mmol/L"),
            ("Lac", "2.31", "mmol/L"),
            ("FiO2", "45", "%"),
            ("tHb", "8.6", "g/dL"),
            ("iCa", "1.08", "mmol/L"),
        ],
    )
    draw_report(
        OUT / "sample-coag-screenshot.png",
        "Coagulation",
        "凝血  ·  术后66h20m  ·  de-identified",
        [
            ("APTT", "68.2", "sec"),
            ("INR", "1.38", ""),
        ],
        badge="CRITICAL",
    )
    empty = Image.new("RGB", (640, 400), "#d9e4dd")
    draw = ImageDraw.Draw(empty)
    draw.ellipse((180, 80, 460, 300), fill="#9bb6a8")
    draw.text((150, 330), "bedside photo, no lab values", font=font(22), fill="#355248")
    empty.save(OUT / "not-a-report.png", "PNG")


if __name__ == "__main__":
    main()
