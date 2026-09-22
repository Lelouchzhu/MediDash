# 阿里云 Function Compute 中转：完整配置教程

只用于功能分支 `cursor/mainland-lab-upload-b98e`，**不改、不合并
`main`**。上传版页面：

https://jsd.onmicrosoft.cn/gh/Lelouchzhu/MediDash@upload/index.xhtml

本分支已经同步到 main 的 2026-09-22 夜间数据。打开后应看到：

- 最新：术后 175h13m，钾 **4.85**
- 夜间血气：乳酸 **1.59**，FiO₂ **50%**，P/F **159**
- WBC **20.86**，肌酐 **320**，PCT **28.783**
- 床旁：BP **113/35**，去甲 **2 mL/h**，多巴胺 **5 mL/h**

若仍是 APTT 48.8 / WBC 18.61，打开的是旧缓存。

## 1. 资源设计

- 地域：杭州 `cn-hangzhou`
- 产品：函数计算 FC 3.0 **Web 函数**
- 运行时：自定义运行时
- 公网入口：阿里云生成的 `https://….cn-hangzhou.fcapp.run`
- HTTP 触发器：公网匿名；业务 POST 仍必须通过随机 `UPLOAD_TOKEN`
- 出网：开启，用于调用 `https://api.cursor.com`
- 密钥：只放 FC 环境变量，不进入 Git 或网页
- 初次部署：`RELAY_DRY_RUN=1`，先验证但不调用 Agent

## 2. 在 PC 上准备代码包

```bash
cd /mnt/d/Data/MediDash
git fetch origin
git switch cursor/mainland-lab-upload-b98e
git pull origin cursor/mainland-lab-upload-b98e
bash deploy/aliyun-fc/build-package.sh
```

输出：

```text
deploy/aliyun-fc/medidash-upload-relay.zip
```

ZIP 根目录必须直接包含 `server.py`，不能再套一层目录：

```bash
unzip -l deploy/aliyun-fc/medidash-upload-relay.zip
```

从 WSL 打开文件夹：

```bash
explorer.exe "$(wslpath -w deploy/aliyun-fc)"
```

## 3. 准备密钥

生成一个独立上传口令，不要复用 Cursor API key：

```bash
openssl rand -hex 24
```

准备：

```text
CURSOR_API_KEY       Cursor Dashboard 生成的 API key
UPLOAD_TOKEN         上一步生成的 48 位随机口令
MEDIDASH_AGENT_ID    bc-f66f1668-9237-4998-b08a-816b026db98e
```

不要把值贴进聊天、截图或提交到 Git。

## 4. 在阿里云控制台创建函数

打开 https://fcnext.console.aliyun.com/ ：

1. 开通函数计算 FC。
2. 地域选择 **华东 1（杭州）/ `cn-hangzhou`**。
3. 函数管理 → 创建函数 → **Web 函数**。
4. 函数名：`medidash-upload-relay`。
5. 运行环境：**自定义运行时**。
6. 代码上传：ZIP 包，选择 `medidash-upload-relay.zip`。
7. 启动命令：`python3 server.py`。
8. 监听端口：`9000`。
9. 内存：256 MB；超时：90 秒；单实例并发：8。
10. 开启“允许访问公网”；不要配置预留实例。

端口或启动命令不一致会导致 `FunctionNotStarted` / 健康检查失败。

## 5. 配置环境变量

逐项添加（值不要带引号）：

```text
HOST=0.0.0.0
PORT=9000
CURSOR_API_KEY=<你的 Cursor API key>
UPLOAD_TOKEN=<随机上传口令>
MEDIDASH_AGENT_ID=bc-f66f1668-9237-4998-b08a-816b026db98e
RELAY_DRY_RUN=1
```

`RELAY_DRY_RUN=1` 必须先保留，避免配置测试时真的触发 Agent。

## 6. 配置 HTTP 触发器与 CORS

函数详情 → 触发器 → 创建 HTTP 触发器：

```text
名称：http-trigger
版本：LATEST
认证：无需认证 / anonymous
公网 URL：开启（不要勾选“禁用公网访问 URL”）
方法：GET、POST
```

若控制台有 API CORS 配置：

```text
允许来源：
  https://jsd.onmicrosoft.cn
  https://cdn.jsdmirror.com
允许方法：GET、POST
允许请求头：Content-Type
允许凭据：false
预检缓存：86400
```

网关会自行响应 OPTIONS，不要把 OPTIONS 加进 CORS `allowMethods`。
如果控制台没有 API CORS 面板，则在触发器方法中再允许 `OPTIONS`；
代码会返回 CORS 响应。

## 7. 获取 HTTPS 地址并做健康检查

在触发器页面复制公网地址，例如：

```text
https://medidash-upload-relay-xxxx.cn-hangzhou.fcapp.run
```

检查：

```bash
curl 'https://你的地址/health'
```

预期：

```json
{"ok":true,"dryRun":true,"agentId":"bc-f66f1668-9237-4998-b08a-816b026db98e"}
```

如果访问超时，先检查出网、端口 9000、启动命令和公网 URL 是否开启。

## 8. 试运行上传

PowerShell：

```powershell
$url = "https://你的地址/upload"
$body = @{
  token  = "你的 UPLOAD_TOKEN"
  notes  = "阿里云中转试运行"
  images = @()
} | ConvertTo-Json

Invoke-RestMethod `
  -Method Post `
  -Uri $url `
  -ContentType "application/json" `
  -Body $body
```

预期：

```json
{"ok":true,"dryRun":true,"images":0}
```

错误口令应返回 HTTP 401。

## 9. 连接上传版网页

打开：

https://jsd.onmicrosoft.cn/gh/Lelouchzhu/MediDash@upload/index.xhtml

点击 **上传化验**，填写：

```text
中转地址：https://你的地址/upload
上传口令：UPLOAD_TOKEN 的值
```

添加一句测试口述后提交。页面应显示：

```text
试运行已送到中转，还没有真正调用 agent。
```

若浏览器显示“连不上中转”，检查公网 URL 与 CORS。不要改成 HTTP。

## 10. 正式启用

回到 FC 环境变量，将：

```text
RELAY_DRY_RUN=1
```

改为：

```text
RELAY_DRY_RUN=0
```

保存并部署。之后上传会调用当前监测 Agent。Agent 被明确要求：

- 只更新 `cursor/mainland-lab-upload-b98e`
- 更新 dashboard 数据、interpretation、`doctorQuestions`
- 重建 `index.xhtml`
- 推送本分支并移动 tag `upload`
- 不 push / merge `main`

一个 Agent 同时只能跑一个任务；返回 `agent_busy` 时，等上一条结束再传。

## 11. Serverless Devs 自动部署（可选）

配置阿里云 AccessKey 后：

```bash
export CURSOR_API_KEY='...'
export UPLOAD_TOKEN='...'
export RELAY_DRY_RUN='1'
export MEDIDASH_AGENT_ID='bc-f66f1668-9237-4998-b08a-816b026db98e'

bash deploy/aliyun-fc/build-package.sh
cd deploy/aliyun-fc
s deploy -y
```

`s.yaml` 通过 `${env(...)}` 读取密钥，不包含明文。

## 12. 常见错误

| 现象 | 处理 |
|---|---|
| 健康检查失败 | 启动命令必须是 `python3 server.py`，端口必须是 9000 |
| 401 / `token` | 网页口令与 FC 的 `UPLOAD_TOKEN` 不一致 |
| `cursor_key_missing` | 未配置 `CURSOR_API_KEY` |
| `agent_busy` | Agent 正在处理上一条，稍后重试 |
| `cursor_unreachable` | FC 未开启公网出网，或访问 `api.cursor.com` 失败 |
| 浏览器“连不上中转” | HTTPS 地址、HTTP 触发器公网 URL 或 CORS 配置错误 |
| 413 / `image_size` | 单张压缩后仍超过 8 MB |
| `dashboard_not_found` | 只会出现在本地同源模式；FC 根路径本来只做健康响应 |

## 13. 安全和费用

- Cursor key 永远不能写进 `index.xhtml` 或浏览器 `localStorage`。
- `UPLOAD_TOKEN` 至少 24 个随机字节；怀疑泄露时立即轮换。
- 上传前遮住姓名、住院号、条形码等标识。
- 不配置预留实例，按调用计费；可在费用中心设置预算告警。
- FC 默认 `fcapp.run` 域名适合先测试；长期对外使用自定义域名时需要备案。
