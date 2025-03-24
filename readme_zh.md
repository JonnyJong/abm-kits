[English](./readme.md) | 中文

<picture>
	<source media="(prefers-color-scheme: dark)" srcset="./assets/icon.svg" style="width:100%;max-height:200px">
	<source media="(prefers-color-scheme: light)" srcset="./assets/icon.light.svg" style="width:100%;max-height:200px">
	<img alt="ABM Icon" src="./assets/icon.svg" height="200" width="100%">
</picture>
<h1 align="center">ABM Kits</h1>
ABM 的开发工具包。工具包正在开发中……

## 包
- [ABM UI](./packages/abm-ui/)
- [ABM Utils](./packages/abm-utils/)
- [演示](./packages/example/)

## Dev
*推荐使用 VSCode。*
```sh
pnpm i
# 实时编译
pnpm watch
# 预览效果：http://localhost:5500
pnpm dev
```

### 创建图标包
```sh
# 准备图标包创建器
pnpm icon:build
# 启动图标包创建器
pnpm icon
```
在浏览器打开 http://localhost:5502。
