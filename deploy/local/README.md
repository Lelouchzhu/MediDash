# 在 LelouchzhuPC2 本地运行中转

正式入口是 `main`。默认 `MEDIDASH_UPDATE_BRANCH=main`。旧中转若仍指向
`cursor/mainland-lab-upload-b98e`，需要重新部署。

本地中转会在同一个地址提供：

- `/`：上传版 dashboard
- `/upload`：截图上传接口
- `/status`：Cursor 后台任务状态
- `/latest`：`main` 最新提交的 GitHub `index.html`
- `/page/<SHA>`：指定提交的 GitHub `index.html`
- `/health`：健康检查

因此手机直接打开 PC 的本地页面，不会遇到 HTTPS 页面调用 HTTP 接口的
Mixed Content 拦截。

## Windows 直接运行

电脑需要 Python 3。在 PowerShell 中进入仓库后运行：

```powershell
powershell -ExecutionPolicy Bypass -File deploy/local/run-relay.ps1
```

脚本会：

1. 隐藏输入 Cursor API key（不会写入仓库）；
2. 首次生成随机上传口令，保存在已被 Git 忽略的
   `.medidash-relay-token`；
3. 显示手机应打开的局域网地址和上传口令。

第一次运行时，Windows 防火墙若询问，允许“专用网络”访问 Python。

## WSL / Linux

```bash
bash deploy/local/run-relay.sh
```

若手机打不开脚本显示的 WSL 地址，原因通常是 WSL2 NAT。可优先：

1. 在 Windows 里直接用上面的 PowerShell 脚本运行；或
2. Windows 11 启用 WSL mirrored networking；或
3. 配置 Windows `netsh interface portproxy` 把 Windows 的 8787 转发到
   WSL 地址。

## 手机怎么用

1. PC 和手机在同一个局域网。
2. 手机打开脚本输出的 `http://<PC-IP>:8787/`。
3. 点击 **上传化验**。
4. 中转地址会自动填为当前地址的 `/upload`。
5. 填脚本显示的上传口令，上传截图和口述。

Agent 完成后，页面会自动打开这次提交的 GitHub 预览页，避免干等国内 CDN。
本机中转的 `/latest` 仍可读 `main` HEAD。家属日常大陆入口仍是带完整 SHA
的 `index.xhtml`。

如果手机在医院、PC 在家里，局域网地址不可达。此时还需要 VPN
（例如两端都登录同一个 Tailscale 网络）或公网 HTTPS 隧道；仅启动本地中转不够。

## 安全

- 不要把 Cursor API key 当上传口令。
- 不要把 Cursor API key 写进网页或发送到聊天。
- 不需要时按 Ctrl+C 停止中转。
- `.medidash-relay-token` 泄露后删除该文件，重启脚本会生成新口令。
- 上传前遮住患者姓名、住院号、条形码等标识。
