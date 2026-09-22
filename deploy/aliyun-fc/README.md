# 阿里云 Function Compute 中转

只用于功能分支 `cursor/mainland-lab-upload-b98e`，不改 `main`。

## 资源

- 地域：杭州 `cn-hangzhou`
- 产品：函数计算 FC 3.0 Web 函数
- 公网入口：阿里云生成的 `https://….cn-hangzhou.fcapp.run`
- 鉴权：公网 HTTP 触发器匿名；业务请求仍必须携带随机 `UPLOAD_TOKEN`
- 运行时密钥：`CURSOR_API_KEY`、`UPLOAD_TOKEN` 只保存在 FC 环境变量中

## 部署前

生成一个新的上传口令，不要复用 Cursor API key：

```bash
export UPLOAD_TOKEN="$(openssl rand -hex 24)"
export CURSOR_API_KEY='你的 Cursor API key'
export MEDIDASH_AGENT_ID='bc-f66f1668-9237-4998-b08a-816b026db98e'
```

不要把这些值提交到 Git，也不要贴进聊天。

## 控制台部署（不需要把阿里云 AccessKey 交给本项目）

先生成 ZIP：

```bash
bash deploy/aliyun-fc/build-package.sh
```

在阿里云控制台：

1. 函数计算 FC → 杭州 → 创建函数 → Web 函数。
2. 运行环境选自定义运行时，上传 `deploy/aliyun-fc/medidash-upload-relay.zip`。
3. 启动命令：`python3 server.py`；监听端口：`9000`。
4. 内存 256 MB；超时 90 秒；允许访问公网。
5. 环境变量：`HOST=0.0.0.0`、`PORT=9000`、`CURSOR_API_KEY`、
   `UPLOAD_TOKEN`、`MEDIDASH_AGENT_ID`。
6. HTTP 触发器允许 GET / POST，认证选无需认证，不禁用公网 URL。
7. CORS 允许：
   - `https://jsd.onmicrosoft.cn`
   - `https://cdn.jsdmirror.com`
   - 方法 GET / POST
   - 请求头 Content-Type
8. 复制公网 HTTPS URL。

测试：

```bash
curl 'https://你的地址/health'
```

返回 `{"ok":true,…}` 后，在上传页填：

- 中转地址：`https://你的地址/upload`
- 上传口令：`UPLOAD_TOKEN` 的值

## Serverless Devs 部署

安装并配置最新版 Serverless Devs 后：

```bash
bash deploy/aliyun-fc/build-package.sh
cd deploy/aliyun-fc
s deploy -y
```

`s.yaml` 从本机环境变量读取两个密钥，不包含明文。

## 安全说明

- Cursor key 永远不能写入 `index.xhtml` 或浏览器 `localStorage`。
- `UPLOAD_TOKEN` 应为至少 24 个随机字节；怀疑泄露时立即更换 FC 环境变量。
- 上传内容会发送给 Cursor Cloud Agent；不要上传患者姓名、住院号、条形码等标识。
- FC 默认域名适合先测试。长期对外使用时，阿里云要求绑定已备案域名。
