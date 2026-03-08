---
title: 对话框
source: packages/abm-ui/src/widget/dialog.ts
---

# 尝试一下
{{[demo](../../../demo/widget/dialog.tsx)}}

# 使用
:::全局导入
```ts
import { Dialog } from 'abm-ui';
```
:::按需导入
```ts
import { Dialog } from 'abm-ui/widget/dialog';
```
:::

# 类 `Dialog`
该类继承自 [`EventEmitter`](../utils/event#类-eventemitter) 类。

## 构造参数
所有构造参数均为可选参数。

- `init`：对话框初始化参数
  - `icon`：图标，`Node` 类型
  - `title`：标题，[`DOMContents`](../infra/dom#类型-domcontents) 类型
  - `content`：内容，[`DOMContents`](../infra/dom#类型-domcontents) 类型
  - `actions`：操作按钮，[`DOMContents`](../infra/dom#类型-domcontents) 类型
  - `hideCloseButton`：隐藏关闭按钮，布尔类型，默认 `false`
  - `disableClickOutside`：禁用点击外部区域关闭对话框，布尔类型，默认 `false`
  - `disableGlobalBackClose`：禁用全局返回关闭对话框，布尔类型，默认 `false`
  - `layout`：布局，可选值为：
    - `horizontal`：水平布局，左侧显示图标，标题和内容在右侧并居左（默认）
    - `vertical`：垂直布局，顶部显示图标，标题和内容在下方并居中
  - `actionsLayout`：操作按钮布局，可选值为：
    - `horizontal`：水平布局，操作按钮靠边（默认）
    - `horizontal-full`：水平布局，操作按钮填满
    - `vertical`：垂直布局，操作按钮垂直排列
  - `width`：宽度，支持数字（像素值）或 CSS 宽度值（如：`'300px'`、`'50%'`、`calc(50% - 20px)`）
  - `color`：主题配色，[`ThemeColor`](../infra/color#类型-themecolor) 类型
  - `onClose`：对话框关闭回调，构造时将自动设置为 `close` 事件监听器

## 属性
支持通过以下属性设置对话框：

- `icon`：图标，`Node` 类型
- `title`：标题，[`DOMContents`](../infra/dom#类型-domcontents) 类型
- `content`：内容，[`DOMContents`](../infra/dom#类型-domcontents) 类型
- `actions`：操作按钮，[`DOMContents`](../infra/dom#类型-domcontents) 类型
- `hideCloseButton`：隐藏关闭按钮，布尔类型
- `disableClickOutside`：禁用点击外部区域关闭对话框，布尔类型
- `disableGlobalBackClose`：禁用全局返回关闭对话框，布尔类型
- `layout`：布局，可选值为：
  - `horizontal`：水平布局，左侧显示图标，标题和内容在右侧并居左（默认）
  - `vertical`：垂直布局，顶部显示图标，标题和内容在下方并居中
- `actionsLayout`：操作按钮布局，可选值为：
  - `horizontal`：水平布局，操作按钮靠边（默认）
  - `horizontal-full`：水平布局，操作按钮填满
  - `vertical`：垂直布局，操作按钮垂直排列
- `width`：宽度

## 方法

### `open`
打开对话框，返回 `this`。

### `close`
关闭对话框，返回 `this`。

### `setColor`
设置对话框主题配色，返回 `this`。

## 静态方法

### `confirm`
创建确认对话框，返回 `Promise<boolean> & { dialog: Dialog }`。

与默认初始化参数差异：
- `level`：级别，可选值为：
  - `primary`：主要样式（默认）
  - `danger`：危险样式
  - `critical`：严重危险样式
- `confirmContent`：确认按钮内容，[`DOMContents`](../infra/dom#类型-domcontents) 类型，默认 `t('ui.confirm')`
- `actionsLayout`：默认 `horizontal-full`
- `actions`：操作按钮参数将被忽略

### `alert`
创建警告对话框，返回 `Promise<void> & { dialog: Dialog }`。

与默认初始化参数差异：
- `buttonVariant`：按钮变体，可选值为：
  - `  `：扁平样式（默认）
  - `primary`：主要样式
  - `secondary`：次要样式
  - `danger`：危险样式
  - `critical`：严重危险样式
- `confirmContent`：确认按钮内容，[`DOMContents`](../infra/dom#类型-domcontents) 类型，默认 `t('ui.confirm')`
- `hideCloseButton`：默认 `true`
- `disableClickOutside`：默认 `true`
- `actionsLayout`：默认 `horizontal-full`
- `actions`：操作按钮参数将被忽略

### `overlay`
创建覆盖对话框 ，返回 `Dialog` 实例。

与默认初始化参数差异：
- `hideCloseButton`：默认 `true`
- `disableClickOutside`：默认 `true`
- `disableGlobalBackClose`：默认 `true`

## 事件

| 事件名  | 参数列表 | 描述                                                   |
| ------- | -------- | ------------------------------------------------------ |
| `close` | `()`     | 点击对话框关闭按钮、外部区域或全局返回关闭对话框时触发 |
