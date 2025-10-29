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

## 部署

执行仓库根目录下的 `deploy.sh` 脚本，将自动构建三个子项目，随后按照提示使用 OSS/FC CLI 发布。

## 配置

全局配置存储于 OSS `config/site_config.json`，示例见 `config/site_config.json` 文件。所有数据均采用 JSON，无需数据库。
