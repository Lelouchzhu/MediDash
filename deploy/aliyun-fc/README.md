# 阿里云 Function Compute 中转：完整配置教程

只用于功能分支 `cursor/mainland-lab-upload-b98e`，**不改、不合并
`main`**。上传版页面：

https://jsd.onmicrosoft.cn/gh/Lelouchzhu/MediDash@a0fdbcd/index.xhtml

这是带后台轮询能力的固定启动页。不要用可变 `@upload` 作为首次入口。

本分支已经记入 2026-09-24 16:27 便常规，以及 2026-09-25 00:22 尿量口述。打开后应看到：

- 顶栏：**最新口述：术后226h22m · 尿量仍为0**
- 16:27 便常规：颜色 **黑褐色**，性状 **稀便**，镜检 **未见异常**。白细胞和红细胞结果是空的，这张没有隐血
- 00:22 口述只有尿量仍为 **0**。血压仍是 15:50 的 **130/30**，心跳 **77**
- 升压药仍是去甲 **3** mL/h（0.15 mg/h），多巴胺 **6** mL/h。若仍是去甲 6、多巴胺 3，是写反的旧页
- 血滤最后一句仍是 16:18 已停，00:22 没有说是否重开
- 化验卡仍是乳酸 **2.24**，pH **7.360**，P/F **140**，肌酐 **185**，尿素 **20.52**

若顶栏仍是术后218h18m · 血滤已停，打开的是旧页面。

## 1. 资源设计

- 地域：杭州 `cn-hangzhou`
- 产品：函数计算 FC 3.0 **Web 函数**
- 运行时：自定义运行时
- 公网入口：阿里云生成的 `https://….cn-hangzhou.fcapp.run`
- HTTP 触发器：公网匿名；业务 POST 仍必须通过随机 `UPLOAD_TOKEN`
- 出网：开启，用于调用 `https://api.cursor.com`
- 密钥：只放 FC 环境变量，不进入 Git 或网页
- 初次部署：`RELAY_DRY_RUN=1`，先验证但不调用 Agent

### 为什么不再等国内镜像缓存

`@upload` 是可变 tag，国内 CDN 可能长时间停在旧快照。正式流程不把它当
“最新页”：

1. `/upload` 创建 Cursor 后台任务并返回 `runId`；
2. 浏览器每 6 秒调用 `/status`；
3. Agent 完成并 push 后，中转读取功能分支的新 commit SHA；
4. 中转从 GitHub 拉取该 SHA 的 `index.xhtml`，由
   `/page/<40位SHA>` 以 `application/xhtml+xml` 返回；
5. 浏览器自动跳到这个不可变页面。

同一个提交 URL 永远对应同一份数据，不需要 purge。`/latest` 每次查询分支
HEAD，再跳转到当前 `/page/<SHA>`。

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

### 控制台没有跨域/CORS 面板时（很常见）

新版 FC 3.0 控制台的「编辑触发器 http-trigger」里往往只有 **请求方法 / 认证方式 /
禁用公网访问 URL**，**没有**「跨域 / CORS」这一项。这时不用找网关 CORS，直接走
**代码层 CORS**（`scripts/agent-upload-relay.py` 里的 `_cors()` 和 `do_OPTIONS`
已内置，会返回 `Access-Control-Allow-Origin: *`）：

1. 在「编辑触发器」的 **请求方法** 里，把 `OPTIONS` 也加上，变成 `GET、POST、OPTIONS`。
2. 点「确定」保存。
3. 浏览器的预检 `OPTIONS` 会打到函数，由代码回 CORS 头，覆盖
   `jsd.onmicrosoft.cn` 与 `cdn.jsdmirror.com`。页面只在请求体带 `token`、不带
   Cookie，所以 `*` + 不带凭据是安全可用的。

注意方向别搞反：

- **有**网关 CORS 面板 → 用白名单 `allowOrigins`，方法只放 `GET、POST`，**不要**加 `OPTIONS`（网关自己回预检）。
- **没有**网关 CORS 面板 → 方法里**必须**加 `OPTIONS`，让代码回预检。

两种方式二选一，别让网关和代码同时输出 `Access-Control-Allow-Origin`，否则浏览器
会因为收到两个不同值而报 “multiple values” 错误。

保存后验证跨域是否通（把地址换成你的公网地址）：

```bash
curl -i -X OPTIONS 'https://你的地址/upload' \
  -H 'Origin: https://jsd.onmicrosoft.cn' \
  -H 'Access-Control-Request-Method: POST' \
  -H 'Access-Control-Request-Headers: Content-Type'
```

响应头出现下面几行即为通过：

```text
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, GET, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

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
{"ok":true,"dryRun":true,"agentId":"bc-f66f1668-9237-4998-b08a-816b026db98e","branch":"cursor/mainland-lab-upload-b98e","latestUrl":"https://你的地址/latest"}
```

如果访问超时，先检查出网、端口 9000、启动命令和公网 URL 是否开启。

另测最新页面代理：

```bash
curl -i 'https://你的地址/latest'
```

应 **200** 且 `Content-Type: application/xhtml+xml`，直接返回当前分支 HEAD 的
dashboard；浏览器打开 `/latest` 或 `/` 都直接看到页面。

> **注意：`/latest` 与 `/` 不再用 302 跳转。** 阿里云 FC 默认域名
> `*.fcapp.run` 禁止函数返回 3xx 跳转，只对**自定义域名**放开（`curl` 会看到
> `400 ExternalRedirectForbidden / please use custom domain endpoint`）。所以中转
> 直接把当前 HEAD 的 `index.xhtml` 代理成 200 返回，无需备案自定义域名。实时上传
> 结果页 `/page/<40位SHA>` 本来就是 200，由浏览器前端跳转打开，不受此限制。

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

第一次打开固定启动页：

https://jsd.onmicrosoft.cn/gh/Lelouchzhu/MediDash@a0fdbcd/index.xhtml

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

正式上传后页面会依次显示：

```text
正在识图、更新数据和查房问题…
数据已更新，正在生成不可变的新网页…
更新完成，正在打开新网页。
```

随后自动打开：

```text
https://你的地址/page/<新提交SHA>
```

以后建议把 `https://你的地址/latest` 加入收藏。它由阿里云实时读取功能分支
HEAD，不依赖 `@upload` 镜像。`@upload` 只保留为没有中转时的启动入口。

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
| `branch_unreachable` | 中转暂时读不到 GitHub 功能分支 HEAD |
| `page_unreachable` | 新提交已产生，但 GitHub 原始 XHTML 尚未拉取成功；页面会继续重试 |
| `/latest` 返回 502 | FC 到 GitHub API 不通，或公开 API 临时限流 |
| `400 ExternalRedirectForbidden` | 默认 `fcapp.run` 域名禁止 3xx 跳转。已改为直接代理 200，重新用最新 `build-package.sh` 打包并部署即可；无需自定义域名 |
| `403 FCCommonError` | HTTP 触发器认证方式仍是「签名认证」，改为「无需认证」并保存 |
| 浏览器“连不上中转” | HTTPS 地址、HTTP 触发器公网 URL 或 CORS 配置错误 |
| 413 / `image_size` | 单张压缩后仍超过 8 MB |
| `dashboard_not_found` | 只会出现在本地同源模式；FC 根路径本来只做健康响应 |

## 13. 安全和费用

- Cursor key 永远不能写进 `index.xhtml` 或浏览器 `localStorage`。
- `UPLOAD_TOKEN` 至少 24 个随机字节；怀疑泄露时立即轮换。
- 上传前遮住姓名、住院号、条形码等标识。
- 不配置预留实例，按调用计费；可在费用中心设置预算告警。
- FC 默认 `fcapp.run` 域名适合先测试；长期对外使用自定义域名时需要备案。
