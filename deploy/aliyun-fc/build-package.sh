#!/usr/bin/env bash
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
BUILD="$HERE/.fc-code"
ZIP="$HERE/medidash-upload-relay.zip"

rm -rf "$BUILD"
mkdir -p "$BUILD"
cp "$ROOT/scripts/agent-upload-relay.py" "$BUILD/server.py"

python3 -m py_compile "$BUILD/server.py"
rm -rf "$BUILD/__pycache__"

python3 - <<'PY' "$BUILD" "$ZIP"
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile
import sys

build = Path(sys.argv[1])
dest = Path(sys.argv[2])
with ZipFile(dest, "w", ZIP_DEFLATED) as archive:
    for path in sorted(build.iterdir()):
        if path.is_file():
            archive.write(path, path.name)
print(dest)
PY

echo "Built FC code directory: $BUILD"
echo "Built console-upload ZIP: $ZIP"
