# Serverless Photo Gallery Frontend

React + TypeScript + Vite 前端，负责展示 OSS 中的摄影作品。包含懒加载、Lightbox 预览、PWA 支持以及下载密码验证入口。

## 本地开发

1. 复制示例环境变量文件并根据需要调整：

   ```bash
   cp .env.windows-local.example .env.windows-local
   ```

2. 安装依赖并启动 Windows 本地测试模式（会加载 `.env.windows-local`，前端会通过代理与本地 9000 端口通信）：

   ```bash
   npm install
   npm run dev:windows
   ```

默认情况下 `npm run dev` 仍会启动常规开发模式（以 `/api` 为基准路径），适合在非本地测试场景下使用。

## 构建

```bash
npm run build
```

构建产物将位于 `dist/` 目录，可直接同步至 OSS `site/` 目录。
