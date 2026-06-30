# Tool Box

个人常用工具箱，部署在 Cloudflare Workers（静态资源 + SPA 路由）。

## 技术栈

- React 19 + TypeScript + Vite
- [@cloudflare/vite-plugin](https://developers.cloudflare.com/workers/vite-plugin/) + Wrangler
- CodeMirror 6（JSON 语法高亮与实时校验）

## 本地开发

```bash
npm install
npm run dev
```

## 构建与部署

```bash
# 构建
npm run build

# 部署到 Cloudflare（需先 wrangler login）
npm run deploy
```

首次部署前登录 Cloudflare：

```bash
npx wrangler login
```

## 功能

### JSON 格式化

- 格式化 / 压缩
- 语法校验（行号定位）
- 键名排序
- 转义 / 反转义
- 复制、下载、打开本地文件
- 可调缩进（2 空格 / 4 空格 / Tab）

所有处理均在浏览器本地完成，不上传服务器。
