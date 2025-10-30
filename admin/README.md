# Serverless Photo Gallery Admin

React + Ant Design 后台管理界面，负责图库配置、缩略图生成触发及访问日志查看。

## 本地开发

1. 复制示例环境变量文件并根据需要调整：

   ```bash
   cp .env.windows-local.example .env.windows-local
   ```

2. 安装依赖并启动 Windows 本地测试模式（将管理端请求代理到本地 9000 端口的后端）：

   ```bash
   npm install
   npm run dev:windows
   ```

默认情况下 `npm run dev` 仍会以 `/api` 为前缀直接访问接口，适用于已部署的后端环境。
