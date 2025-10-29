# Serverless Photo Gallery Backend

Node.js (Express) 云函数逻辑，部署于阿里云函数计算（FC）。

## 环境变量

- `OSS_ACCESS_KEY_ID`
- `OSS_ACCESS_KEY_SECRET`
- `OSS_BUCKET`
- `OSS_REGION`
- `ADMIN_PASSWORD_HASH` - 管理员密码的 SHA256 结果
- `DOWNLOAD_PASSWORD_HASH` - 下载密码的 SHA256 结果
- `SITE_CONFIG_PATH` - OSS 上的配置文件路径，默认 `config/site_config.json`

## 开发调试

```bash
npm install
npm run dev
```

服务将启动在 `http://localhost:9000`，可与前端 Vite Dev Server 通过代理联调。

## 构建

```bash
npm run build
```

构建产物位于 `dist/`，可通过阿里云 FC CLI 上传部署。
