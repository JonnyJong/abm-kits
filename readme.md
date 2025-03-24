English | [中文](./readme_zh.md)

<picture>
	<source media="(prefers-color-scheme: dark)" srcset="./assets/icon.svg" style="width:100%;max-height:200px">
	<source media="(prefers-color-scheme: light)" srcset="./assets/icon.light.svg" style="width:100%;max-height:200px">
	<img alt="ABM Icon" src="./assets/icon.svg" height="200" width="100%">
</picture>
<h1 align="center">ABM Kits</h1>
A development toolkit for ABM. Toolkit is under development...

## Packages
- [ABM UI](./packages/abm-ui/)
- [ABM Utils](./packages/abm-utils/)
- [Demo](./packages/example/)

## Dev
*VSCode is recommended.*
```sh
pnpm i
# Just-in-time compilation
pnpm watch
# Preview effect: http://localhost:5500
pnpm dev
```

### Create Icon Pack
```sh
# Prepare icon pack creator
pnpm icon:build
# Start icon pack creator
pnpm icon
```
Open http://localhost:5502 in browser.
