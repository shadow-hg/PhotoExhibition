# Serverless Photo Gallery

基于阿里云函数计算（FC）+ OSS + React 的无服务器摄影作品展示平台。项目包含三部分：

- **frontend/**：React + TypeScript + Vite 展示站点，支持懒加载、Lightbox、PWA
- **backend/**：Node.js 云函数，负责配置读取、EXIF 解析、缩略图生成、访问追踪等
- **admin/**：React + Ant Design 后台，提供配置管理、上传处理与日志查看

## 快速开始

1. 设置环境变量：

```bash
export OSS_ACCESS_KEY_ID=...
export OSS_ACCESS_KEY_SECRET=...
export OSS_BUCKET=...
export OSS_REGION=...
export ADMIN_PASSWORD_HASH=$(echo -n "your-admin-password" | sha256sum | awk '{print $1}')
export DOWNLOAD_PASSWORD_HASH=$(echo -n "your-download-password" | sha256sum | awk '{print $1}')
```

2. 启动后端（本地调试）：

```bash
cd backend
npm install
npm run dev
```

3. 启动前端展示与后台：

```bash
cd frontend && npm install && npm run dev
cd admin && npm install && npm run dev
```

前端默认端口 5173，后台 5174，均代理到后端 9000 端口。

## 部署（阿里云）

以下步骤假设你已经在阿里云开通了对象存储 OSS、函数计算 FC 以及自定义域名（或 API 网关）。

1. **准备工具与凭证**
   - 在本地安装 [ossutil](https://help.aliyun.com/zh/oss/developer-reference/ossutil-overview)、[fcctl](https://help.aliyun.com/zh/functioncompute/product-overview/fcctl-introduction) 或 [Funcraft/fun](https://help.aliyun.com/zh/functioncompute/getting-started/deploy-your-first-function-with-fun) 等部署工具，并执行 `ossutil config`、`fcctl configure` 完成 AccessKey 绑定。
   - 在 OSS 中创建用于托管静态站点的 Bucket（例如 `photo-gallery-prod`，建议开启静态网站托管或绑定 CDN 加速域名）。
   - 在函数计算中创建服务（如 `photo-gallery-service`），并在其中预先创建一个 HTTP 触发的函数（运行时选择 Node.js 18+，触发器可设为“允许匿名访问”）。

2. **本地构建三套前端/后端产物**
   - 执行仓库根目录下的 `./deploy.sh`。脚本会在 `frontend/dist`、`admin/dist`、`backend/dist` 生成静态资源与云函数产物。
   - 如果更倾向于手动构建，可在每个子目录内执行 `npm install && npm run build`。

3. **上传静态资源到 OSS**
   - 使用 ossutil 将前台与后台管理的静态文件上传至 Bucket：
     ```bash
     ossutil cp -r frontend/dist/ oss://<your-bucket>/site/
     ossutil cp -r admin/dist/ oss://<your-bucket>/admin/
     ```
   - 若使用静态网站托管，请在 OSS 控制台将默认首页设置为 `index.html`，并为后台管理目录配置访问子路径（例如 `/admin/`）。

4. **部署后端函数**
   - 将 `backend/dist` 目录打包：`cd backend/dist && zip -r ../backend.zip .`。
   - 使用 fcctl/fun 部署，例如：
     ```bash
     cd backend
     fcctl function update --service-name photo-gallery-service \
       --function-name api --runtime nodejs18 \
       --handler index.handler --code-dir dist
     ```
   - 在函数计算控制台或 CLI 中写入必要的环境变量（即上文“快速开始”章节列出的变量），并将 `SITE_CONFIG_PATH` 指向 OSS 中的配置文件。

5. **配置触发器与域名**
   - 若函数未绑定 HTTP 触发器，可在控制台选择“HTTP 触发器”，路径设为 `/` 并开启 `GET/POST` 权限。
   - 可选：在自定义域名或阿里云 CDN 中添加一条路由，将 `/api/*` 指向函数计算触发域名，其余静态请求指向 OSS。（也可以在前端 `config/site_config.json` 中直接写入函数触发域名。）

6. **验收**
   - 访问 `https://<your-frontend-domain>/` 检查展示页是否能正确加载数据。
   - 访问 `https://<your-frontend-domain>/admin/` 并输入管理员密码，确认后台能够通过 API 与函数计算通信。
   - 可在 FC/OSS 控制台中查看调用日志与计量，确保资源使用符合预期。

> 小贴士：部署流程稳定后，可将上述 CLI 命令写入 CI/CD（例如 GitHub Actions），自动触发 `deploy.sh` 构建并发布到 OSS/FC。

## 配置

全局配置存储于 OSS `config/site_config.json`，示例见 `config/site_config.json` 文件。所有数据均采用 JSON，无需数据库。
