#!/usr/bin/env python3
"""Build index.xhtml from index.html for China CDNs (application/xhtml+xml)."""

from __future__ import annotations

import re
import sys
from pathlib import Path
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "index.html"
DEST = ROOT / "index.xhtml"
VOIDS = "meta|link|img|br|hr|input|source|area|col|embed|base"
BOOLS = (
    "required",
    "checked",
    "selected",
    "disabled",
    "readonly",
    "multiple",
    "autofocus",
    "novalidate",
    "hidden",
    "open",
)


def close_voids(text: str) -> str:
    def repl(match: re.Match[str]) -> str:
        tag = match.group(0)
        if tag.endswith("/>"):
            return tag
        return tag[:-1].rstrip() + "/>"

    return re.sub(rf"<(?:{VOIDS})(?:\s[^>]*)?>", repl, text, flags=re.I)


def escape_amp(text: str) -> str:
    return re.sub(r"&(?![#a-zA-Z0-9]+;)", "&amp;", text)


def xhtmlify_markup(text: str) -> str:
    for attr in BOOLS:
        text = re.sub(rf"(?<=\s){attr}(?=[\s>])", f'{attr}="{attr}"', text)
    return escape_amp(close_voids(text))


def build(src_text: str) -> str:
    match = re.search(r"<script>([\s\S]*)</script>", src_text)
    if not match:
        raise SystemExit("index.html is missing a <script> block")
    js = match.group(1)
    if "]]>" in js:
        raise SystemExit("dashboard script contains ]]> which would break XHTML CDATA")
    head = xhtmlify_markup(src_text[: match.start()])
    tail = xhtmlify_markup(src_text[match.end() :])
    head = re.sub(r"^<!doctype html>\s*", "", head, flags=re.I)
    head = head.replace(
        '<html lang="zh-CN">',
        '<html xmlns="http://www.w3.org/1999/xhtml" lang="zh-CN" xml:lang="zh-CN">',
        1,
    )
    return (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        "<!DOCTYPE html>\n"
        + head
        + '<script type="text/javascript">\n//<![CDATA['
        + js
        + "//]]>\n  </script>"
        + tail
    )


def main() -> int:
    out = build(SRC.read_text(encoding="utf-8"))
    try:
        ET.fromstring(out)
    except ET.ParseError as exc:
        print(f"generated index.xhtml is not well-formed XML: {exc}", file=sys.stderr)
        return 1
    DEST.write_text(out, encoding="utf-8")
    print(f"wrote {DEST.relative_to(ROOT)} ({len(out)} bytes)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
