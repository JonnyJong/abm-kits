---
title: 颜色
source:
	- packages/abm-utils/src/color.ts
---

# 类型 `RGB`
长度为 3 的数字数组类型，表示 RGB 值：
- `[0]`：红色通道值（0 ~ 255）
- `[1]`：绿色通道值（0 ~ 255）
- `[2]`：蓝色通道值（0 ~ 255）

# 类型 `RGBA`
长度为 4 的数字数组类型，表示 RGBA 值：
- `[0]`：红色通道值（0 ~ 255）
- `[1]`：绿色通道值（0 ~ 255）
- `[2]`：蓝色通道值（0 ~ 255）
- `[3]`：不透明度通道值（0 ~ 255）

# 类型 `HSL`
长度为 3 的数字数组类型，表示 HSL 值：
- `[0]`：色相（0 ~ 360）
- `[1]`：对比度（0 ~ 1）
- `[2]`：亮度（0 ~ 1）

# 类型 `HSLA`
长度为 4 的数字数组类型，表示 HSLA 值：
- `[0]`：色相（0 ~ 360）
- `[1]`：对比度（0 ~ 1）
- `[2]`：亮度（0 ~ 1）
- `[3]`：不透明度（0 ~ 1）

# `rgb2hsl()`
将 RGB 值转换为 HSL；将 RGBA 转换为 HSLA。

# `hsl2rgb()`
将 HSL 值转换为 RGB；将 HSLA 转换为 RGBA。

# 类 `Color`

## 静态属性与方法

### `hex()`
从 `HEX` 值创建 `Color` 实例，支持以下值：
- `#AABBCC`
- `AABBCC`
- `#ABC`
- `ABC`

### `hexa()`
从 `HEX` 值创建 `Color` 实例，支持以下值：
- `#AABBCCDD`
- `AABBCCDD`
- `#ABCD`
- `ABCD`

### `rgb()`
从 [`RGB`](#类型-rgb) 值创建 `Color` 实例。

### `rgba()`
从 [`RGBA`](#类型-rgba) 值创建 `Color` 实例。

### `hsl()`
从 [`HSL`](#类型-hsl) 值创建 `Color` 实例。

### `hsla()`
从 [`HSLA`](#类型-hsla) 值创建 `Color` 实例。

## 实例属性与方法

### `hex()`
若无参数，返回带 `#` 前缀的 `HEX` 值；
若有参数，根据 `HEX` 值并设置该 `Color` 实例，返回 `this`。

### `hexa()`
若无参数，返回带 `#` 前缀和不透明度的 `HEX` 值；
若有参数，根据带不透明度的 `HEX` 值设置该 `Color` 实例，返回 `this`。

### `rgb()`
若无参数，返回 [`RGB`](#类型-rgb)；
若有参数，根据 [`RGB`](#类型-rgb) 值设置该 `Color` 实例，返回 `this`。

### `rgba()`
若无参数，返回 [`RGBA`](#类型-rgba)；
若有参数，根据 [`RGBA`](#类型-rgba) 值设置该 `Color` 实例，返回 `this`。

### `hsl()`
若无参数，返回 [`HSL`](#类型-hsl)；
若有参数，根据 [`HSL`](#类型-hsl) 值设置该 `Color` 实例，返回 `this`。

### `hsla()`
若无参数，返回 [`HSLA`](#类型-hsla)；
若有参数，根据 [`HSLA`](#类型-hsla) 值设置该 `Color` 实例，返回 `this`。

### `alpha()`
若无参数，返回不透明度（0 ~ 1）；
若有参数，根据参数值设置该 `Color` 实例，返回 `this`。

### `alphaByte()`
若无参数，返回不透明度（0 ~ 255）；
若有参数，根据参数值设置该 `Color` 实例，返回 `this`。

### `isDark()`
检查当前实例颜色亮度是否低于 0.5，返回 `boolean`。

### `invert()`
返回当前颜色反转后的 `Color` 实例，不会改变原实例。

### `getTokens()`
从当前颜色获取主题 tokens，主题 tokens 包含：
- `--theme`
- `--theme-text`
- `--theme-a1` ~ `--theme-ae`

### `clone()`
克隆并返回新的 `Color` 实例。
