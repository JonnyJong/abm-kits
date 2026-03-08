---
title: 浮出面板
source: packages/abm-ui/src/widget/flyout.ts
---

# 尝试一下
{{[demo](../../../demo/widget/flyout.tsx)}}

# 使用
:::全局导入
```ts
import { Flyout } from 'abm-ui';
```
:::按需导入
```ts
import { Flyout } from 'abm-ui/widget/flyout';
```
:::

# 类 `Flyout`
该类继承自 [`EventEmitter`](../utils/event#类-eventemitter) 类。

## 构造参数
- `anchor`：锚点元素，浮出面板会根据该元素的位置进行定位
- `init`：浮出面板初始化参数，可选
  - `content`：内容，[`DOMContents`](../infra/dom#类型-domcontents) 类型，可选
  - `width`：宽度，支持数字（像素值）或 CSS 宽度值（如：`'300px'`、`'50%'`、`calc(50% - 20px)`），可选
  - `color`：主题配色，[`ThemeColor`](../infra/color#类型-themecolor) 类型，可选
  - `onClose`：浮出面板关闭回调，构造时将自动设置为 `close` 事件监听器，可选

## 属性
支持通过以下属性设置浮出面板：

- `anchor`：锚点元素
- `content`：内容，[`DOMContents`](../infra/dom#类型-domcontents) 类型
- `width`：宽度

## 方法

### `open`
打开浮出面板，返回 `this`。

### `close`
关闭浮出面板，返回 `this`。

### `setColor`
设置浮出面板主题配色，返回 `this`。

## 静态方法

### `confirm`
打开确认浮出面板，返回 `Promise<boolean> & { flyout: Flyout }`。

与默认初始化参数差异：
- `button`：操作按钮，[`Button | ButtonProp`](../component/button) 类型，可选

### `alert`
打开警告浮出面板，返回 `Promise<void> & { flyout: Flyout }`。

## 事件

| 事件名  | 参数列表 | 描述                         |
| ------- | -------- | ---------------------------- |
| `close` | `()`     | 点击外部区域或全局返回时触发 |
