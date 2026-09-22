#!/usr/bin/env bash
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
TOKEN_FILE="$ROOT/.medidash-relay-token"

if [[ -z "${CURSOR_API_KEY:-}" ]]; then
  read -r -s -p "Cursor API key: " CURSOR_API_KEY
  echo
  export CURSOR_API_KEY
fi

if [[ -z "${UPLOAD_TOKEN:-}" ]]; then
  if [[ -f "$TOKEN_FILE" ]]; then
    UPLOAD_TOKEN="$(cat "$TOKEN_FILE")"
  else
    umask 077
    UPLOAD_TOKEN="$(openssl rand -hex 24)"
    printf '%s' "$UPLOAD_TOKEN" > "$TOKEN_FILE"
  fi
  export UPLOAD_TOKEN
fi

export HOST="${HOST:-0.0.0.0}"
export PORT="${PORT:-8787}"
export DASHBOARD_PATH="$ROOT/index.xhtml"

LAN_IP="$(hostname -I 2>/dev/null | awk '{print $1}')"
echo "上传口令（手机填写）：$UPLOAD_TOKEN"
echo "本机页面：http://127.0.0.1:$PORT/"
if [[ -n "$LAN_IP" ]]; then
  echo "局域网页面（需要手机能访问此地址）：http://$LAN_IP:$PORT/"
fi
echo "按 Ctrl+C 停止中转。"

exec python3 "$ROOT/scripts/agent-upload-relay.py"
