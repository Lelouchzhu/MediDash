param(
  [int]$Port = 8787
)

$ErrorActionPreference = "Stop"
$Root = (Resolve-Path (Join-Path $PSScriptRoot "../..")).Path
$TokenFile = Join-Path $Root ".medidash-relay-token"

if (-not $env:CURSOR_API_KEY) {
  $secure = Read-Host "Cursor API key" -AsSecureString
  $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  try {
    $env:CURSOR_API_KEY = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
  } finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
  }
}

if (-not $env:UPLOAD_TOKEN) {
  if (Test-Path $TokenFile) {
    $env:UPLOAD_TOKEN = (Get-Content $TokenFile -Raw).Trim()
  } else {
    $bytes = New-Object byte[] 24
    [Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
    $env:UPLOAD_TOKEN = -join ($bytes | ForEach-Object { $_.ToString("x2") })
    Set-Content -Path $TokenFile -Value $env:UPLOAD_TOKEN -NoNewline
  }
}

$env:HOST = "0.0.0.0"
$env:PORT = "$Port"
$env:DASHBOARD_PATH = Join-Path $Root "index.xhtml"

$lan = Get-NetIPAddress -AddressFamily IPv4 |
  Where-Object {
    $_.IPAddress -notlike "127.*" -and
    $_.IPAddress -notlike "169.254.*" -and
    $_.InterfaceAlias -notmatch "Loopback"
  } |
  Select-Object -First 1 -ExpandProperty IPAddress

Write-Host "上传口令（手机填写）：$($env:UPLOAD_TOKEN)"
Write-Host "本机页面：http://127.0.0.1:$Port/"
if ($lan) {
  Write-Host "局域网页面：http://${lan}:$Port/"
}
Write-Host "按 Ctrl+C 停止中转。"

python (Join-Path $Root "scripts/agent-upload-relay.py")
