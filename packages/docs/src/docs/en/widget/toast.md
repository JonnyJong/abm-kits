---
title: Toast Notification
source: packages/abm-ui/src/widget/toast.ts
---

# Try It
{{[demo](../../../demo/widget/toast.tsx)}}

# Usage
:::Global Import
```ts
import { Toast, toast } from 'abm-ui';
```
:::On-demand Import
```ts
import { Toast, toast } from 'abm-ui/widget/toast';
```
:::

# Function `toast`
Quickly create toast notification.

- `toast(...)` -> `new Toast(...)`
- `toast.success(...)` -> `Toast.success(...)`
- `toast.warn(...)` -> `Toast.warn(...)`
- `toast.error(...)` -> `Toast.error(...)`
- `toast.promise(...)` -> `Toast.promise(...)`

# Class `Toast`
This class inherits from the [`EventEmitter`](../utils/event#class-eventemitter) class.

## Constructor Parameters
- `title`：Title, [`DOMContents`](../infra/dom#type-domcontents) type
- `init`：Toast initialization parameters, optional
  - `details`：Details, [`DOMContents`](../infra/dom#type-domcontents) type, optional
  - `duration`：Display duration, unit milliseconds, set to `0` to display continuously, default `5000`
  - `icon`：Icon, `Node` type, optional
  - `actions`：Action buttons, [`DOMContents`](../infra/dom#type-domcontents) type, optional
  - `level`：Notification level, default `normal`
    - `normal`：Normal
    - `success`：Success
    - `warn`：Warning
    - `error`：Error

## Properties
The toast notification can be set through the following properties:

- `title`：Title, [`DOMContents`](../infra/dom#type-domcontents) type
- `details`：Details, [`DOMContents`](../infra/dom#type-domcontents) type
- `actions`：Action buttons, [`DOMContents`](../infra/dom#type-domcontents) type
- `icon`：Icon, `Node` type
- `duration`：Display duration, unit milliseconds
- `level`：Notification level
  - `normal`：Normal
  - `success`：Success
  - `warn`：Warning
  - `error`：Error

## Methods

### `show`
Show the notification.

### `close`
Close the notification

## Events

| Event Name   | Parameter List | Description               |
| ------------ | -------------- | ------------------------- |
| `autoClose`  | `()`           | Triggered when automatically closed due to timeout |

## Static Properties

### `verticalAnchor`
Vertical anchor, optional values:
- `top`：Top (default)
- `bottom`：Bottom

### `horizontalAnchor`
Horizontal anchor, optional values:
- `left`：Left
- `center`：Center
- `right`：Right (default)

### `verticalOffset`
Vertical offset, unit pixels, default `0`.

### `horizontalOffset`
Horizontal offset, unit pixels, default `0`.

## Static Methods

### `success`
Create success toast notification.

### `warn`
Create warning toast notification.

### `error`
Create error toast notification.

### `promise`
Create toast notification from `Promise`.

Parameters:
- `promise`：`Promise<T>` type
- `init`：Initialization parameters, optional
  - `loading`：`Promise` pending status options, optional, supports the following types:
    - [`DOMContents`](../infra/dom#type-domcontents)：Title
    - `{}`：
      - `title`：Title, optional
      - ...other properties refer to [Constructor Parameters](#constructor-parameters)
  - `success`：`Promise` resolved status options, optional
    - `{}`：
      - `title`：Title, optional
      - ...other properties refer to [Constructor Parameters](#constructor-parameters)
    - `(result: T) => {}`，return value type：
      - `title`：Title, optional
      - ...other properties refer to [Constructor Parameters](#constructor-parameters)
  - `error`：`Promise` rejected status options, optional
    - `{}`：
      - `title`：Title, optional
      - ...other properties refer to [Constructor Parameters](#constructor-parameters)
    - `(reason: unknown) => {}`，return value type：
      - `title`：Title, optional
      - ...other properties refer to [Constructor Parameters](#constructor-parameters)

# CSS Variables

| Variable Name             | Default Value                                               | Description               |
| ------------------------- | ----------------------------------------------------------- | ------------------------- |
| `--toast-bg-success`     | `light-dark(oklch(.4 .2 142 / .15), oklch(.65 .2 142 / .2))` | Success toast background color |
| `--toast-border-success` | `light-dark(oklch(.5 .2 142 / .5), oklch(.65 .2 142 / .5))`  | Success toast border color |
| `--toast-bg-warn`        | `light-dark(oklch(.5 .2 60 / .15), oklch(.65 .2 60 / .2))`   | Warning toast background color |
| `--toast-border-warn`    | `light-dark(oklch(.5 .2 60 / .5), oklch(.65 .2 60 / .5))`    | Warning toast border color |
| `--toast-bg-error`       | `light-dark(oklch(.4 .2 30 / .15), oklch(.65 .2 30 / .2))`   | Error toast background color |
| `--toast-border-error`   | `light-dark(oklch(.4 .2 30 / .5), oklch(.65 .2 30 / .5))`    | Error toast border color |