---
title: 吐司通知
source: packages/abm-ui/src/widget/toast.ts
---

# 尝试一下
{{[demo](../../../demo/widget/toast.tsx)}}

# 使用
:::全局导入
```ts
import { Toast, toast } from 'abm-ui';
```
:::按需导入
```ts
import { Toast, toast } from 'abm-ui/widget/toast';
```
:::

# 函数 `toast`
快捷创建吐司通知。

- `toast(...)` -> `new Toast(...)`
- `toast.success(...)` -> `Toast.success(...)`
- `toast.warn(...)` -> `Toast.warn(...)`
- `toast.error(...)` -> `Toast.error(...)`
- `toast.promise(...)` -> `Toast.promise(...)`

# 类 `Toast`
该类继承自 [`EventEmitter`](../utils/event#类-eventemitter) 类。

## 构造参数
- `title`：标题，[`DOMContents`](../infra/dom#类型-domcontents) 类型
- `init`：吐司通知初始化参数，可选
  - `details`：详细信息，[`DOMContents`](../infra/dom#类型-domcontents) 类型，可选
  - `duration`：显示时长，单位毫秒，设置为 `0` 以持续显示，默认 `5000`
  - `icon`：图标，`Node` 类型，可选
  - `actions`：操作按钮，[`DOMContents`](../infra/dom#类型-domcontents) 类型，可选
  - `level`：通知级别，默认 `normal`
    - `normal`：普通
    - `success`：成功
    - `warn`：警告
    - `error`：错误

## 属性
支持通过以下属性设置吐司通知：

- `title`：标题，[`DOMContents`](../infra/dom#类型-domcontents) 类型
- `details`：详细信息，[`DOMContents`](../infra/dom#类型-domcontents) 类型
- `actions`：操作按钮，[`DOMContents`](../infra/dom#类型-domcontents) 类型
- `icon`：图标，`Node` 类型
- `duration`：显示时长，单位毫秒
- `level`：通知级别
  - `normal`：普通
  - `success`：成功
  - `warn`：警告
  - `error`：错误

## 方法

### `show`
显示通知。

### `close`
关闭通知

## 事件

| 事件名      | 参数列表 | 描述               |
| ----------- | -------- | ------------------ |
| `autoClose` | `()`     | 超时自动关闭时触发 |

## 静态属性

### `verticalAnchor`
垂直锚点，可选值为：
- `top`：顶部（默认）
- `bottom`：顶部

### `horizontalAnchor`
水平锚点，可选值为：
- `left`：靠左
- `center`：居中
- `right`：靠右（默认）

### `verticalOffset`
垂直偏移，单位像素，默认 `0`。

### `horizontalOffset`
水平偏移，单位像素，默认 `0`。

## 静态方法

### `success`
创建成功吐司通知。

### `warn`
创建警告吐司通知。

### `error`
创建错误吐司通知。

### `promise`
从 `Promise` 创建吐司通知。

参数：
- `promise`：`Promise<T>` 类型
- `init`：初始化参数，可选
  - `loading`：`Promise` pending 状态选项，可选，支持以下类型：
    - [`DOMContents`](../infra/dom#类型-domcontents)：标题
    - `{}`：
      - `title`：标题，可选
      - ...其他属性参考 [构造参数](#构造参数)
  - `success`：`Promise` resolved 状态选项，可选
    - `{}`：
      - `title`：标题，可选
      - ...其他属性参考 [构造参数](#构造参数)
    - `(result: T) => {}`，返回值类型：
      - `title`：标题，可选
      - ...其他属性参考 [构造参数](#构造参数)
  - `error`：`Promise` rejected 状态选项，可选
    - `{}`：
      - `title`：标题，可选
      - ...其他属性参考 [构造参数](#构造参数)
    - `(reason: unknown) => {}`，返回值类型：
      - `title`：标题，可选
      - ...其他属性参考 [构造参数](#构造参数)

# CSS 变量

| 变量名                   | 默认值                                                       | 描述               |
| ------------------------ | ------------------------------------------------------------ | ------------------ |
| `--toast-bg-success`     | `light-dark(oklch(.4 .2 142 / .15), oklch(.65 .2 142 / .2))` | 成功吐司通知背景色 |
| `--toast-border-success` | `light-dark(oklch(.5 .2 142 / .5), oklch(.65 .2 142 / .5))`  | 成功吐司通知边框色 |
| `--toast-bg-warn`        | `light-dark(oklch(.5 .2 60 / .15), oklch(.65 .2 60 / .2))`   | 警告吐司通知背景色 |
| `--toast-border-warn`    | `light-dark(oklch(.5 .2 60 / .5), oklch(.65 .2 60 / .5))`    | 警告吐司通知边框色 |
| `--toast-bg-error`       | `light-dark(oklch(.4 .2 30 / .15), oklch(.65 .2 30 / .2))`   | 错误吐司通知背景色 |
| `--toast-border-error`   | `light-dark(oklch(.4 .2 30 / .5), oklch(.65 .2 30 / .5))`    | 错误吐司通知边框色 |
