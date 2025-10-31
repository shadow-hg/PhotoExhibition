# 光影私语 · 摄影作品展览平台

一个集前台展示、后台管理与数据驱动策展于一体的个人摄影作品平台。项目包含：

- **前台 Web**（React + Vite + Tailwind）：沉浸式作品展示、系列策展、展览计划与合作联系。
- **后台管理**（与前台同一应用内的 `/admin` 模块）：作品维护、系列管理、展览计划、观众留言处理。
- **API 服务**（Node.js + Express + SQLite）：JWT 管理员认证、作品/系列/展览 CRUD、留言收集、统计接口。

## 快速开始

### 环境需求
- Node.js 18 或 20（如使用 Node 22 需手动编译 better-sqlite3）
- npm 或 pnpm

### 安装依赖
```bash
# 后端
cd backend
npm install

# 前端
cd ../frontend
npm install
```

### 初始化数据库
```bash
cd backend
npm run seed
```

> 默认管理员账号：`curator`，密码：`visionary123`

### 启动服务
```bash
# 启动后端 API（默认端口 4000）
cd backend
npm run dev

# 启动前端（默认端口 5173）
cd ../frontend
npm run dev
```

前端已配置 `/api` 代理指向本地 4000 端口。访问 `http://localhost:5173` 即可体验网站。

### Windows 一键启动脚本

若使用 Windows，可在项目根目录的 PowerShell 中运行 `./Start-PhotoExhibition.ps1`，脚本会自动检测端口占用并分别在 `9000`（后端）与 `6666`（前端）端口上启动开发服务器。如需调整端口，可通过参数传入，例如：

```powershell
./Start-PhotoExhibition.ps1 -BackendPort 9100 -FrontendPort 6700
```

## 功能亮点
- **多维作品筛选**：支持主题系列、标签、关键词组合检索。
- **沉浸式视觉设计**：Aurora 渐变背景、动效、响应式瀑布流画廊与全屏 Lightbox。
- **策展数据看板**：后台仪表盘可视化热门标签、作品总览、留言动态。
- **一键管理**：后台支持作品、系列、展览的创建、更新、删除及观众留言状态标记。
- **安全认证**：JWT Bearer Token 鉴权，后台路由受保护。

## 项目结构
```
backend/    Express + SQLite API 服务
frontend/   React + Tailwind 前台与后台管理界面
```

## 版权与作者
- 摄影作品示例图片来源于 Unsplash 开放 API，仅供演示使用。
- 由 gpt-5-codex 创作与实现。
