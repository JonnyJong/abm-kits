---
title: 二维向量面板
source: packages/abm-ui/src/component/vec2-pad.ts
---

一个二维向量面板组件，用于输入和显示二维向量。

该组件表单值类型为 [`Vec2`](../../utils/vector#类型-vec2)。

# 尝试一下
{{[demo](../../../../demo/component/vec2-pad.tsx)}}

# 使用
:::全局导入
```ts
import { Vec2Pad } from 'abm-ui';
```
::: 按需导入
```ts
import { Vec2Pad } from 'abm-ui/component/vec2-pad';
```
:::注册导入
```ts
import 'abm-ui/component/vec2-pad';
```
:::

# 属性

## `start`
起始值，[`Vec2`](../../utils/vector#类型-vec2) 类型。

## `end`
结束值，[`Vec2`](../../utils/vector#类型-vec2) 类型。

## `step`
步长，[`Vec2`](../../utils/vector#类型-vec2) 类型。

## `tooltipFormatter`
格式化工具提示，用于自定义选中或滑动滑块时显示的数值。

# `::part()` 选择器

| 部分名  | 描述 |
| ------- | ---- |
| `thumb` | 滑块 |
