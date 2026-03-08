---
title: Flyout
source: packages/abm-ui/src/widget/flyout.ts
---

# Try It
{{[demo](../../../demo/widget/flyout.tsx)}}

# Usage
:::Global Import
```ts
import { Flyout } from 'abm-ui';
```
:::On-demand Import
```ts
import { Flyout } from 'abm-ui/widget/flyout';
```
:::

# Class `Flyout`
This class inherits from the [`EventEmitter`](../utils/event#class-eventemitter) class.

## Constructor Parameters
- `anchor`：Anchor element, the flyout will be positioned based on the position of this element
- `init`：Flyout initialization parameters, optional
  - `content`：Content, [`DOMContents`](../infra/dom#type-domcontents) type, optional
  - `width`：Width, supports number (pixel value) or CSS width value (e.g.: `'300px'`, `'50%'`, `calc(50% - 20px)`), optional
  - `color`：Theme color, [`ThemeColor`](../infra/color#type-themecolor) type, optional
  - `onClose`：Flyout close callback, will be automatically set as `close` event listener during construction, optional

## Properties
The flyout can be set through the following properties:

- `anchor`：Anchor element
- `content`：Content, [`DOMContents`](../infra/dom#type-domcontents) type
- `width`：Width

## Methods

### `open`
Open the flyout, return `this`.

### `close`
Close the flyout, return `this`.

### `setColor`
Set flyout theme color, return `this`.

## Static Methods

### `confirm`
Open confirmation flyout, return `Promise<boolean> & { flyout: Flyout }`.

Differences from default initialization parameters:
- `button`：Action button, [`Button | ButtonProp`](../component/button) type, optional

### `alert`
Open alert flyout, return `Promise<void> & { flyout: Flyout }`.

## Events

| Event Name | Parameter List | Description                         |
| ---------- | -------------- | ----------------------------------- |
| `close`    | `()`           | Triggered when clicking outside area or global back |