---
title: Dialog
source: packages/abm-ui/src/widget/dialog.ts
---

# Try It
{{[demo](../../../demo/widget/dialog.tsx)}}

# Usage
:::Global Import
```ts
import { Dialog } from 'abm-ui';
```
:::On-demand Import
```ts
import { Dialog } from 'abm-ui/widget/dialog';
```
:::

# Class `Dialog`
This class inherits from the [`EventEmitter`](../utils/event#class-eventemitter) class.

## Constructor Parameters
All constructor parameters are optional.

- `init`：Dialog initialization parameters
  - `icon`：Icon, `Node` type
  - `title`：Title, [`DOMContents`](../infra/dom#type-domcontents) type
  - `content`：Content, [`DOMContents`](../infra/dom#type-domcontents) type
  - `actions`：Action buttons, [`DOMContents`](../infra/dom#type-domcontents) type
  - `hideCloseButton`：Hide close button, boolean type, default `false`
  - `disableClickOutside`：Disable closing dialog by clicking outside area, boolean type, default `false`
  - `disableGlobalBackClose`：Disable closing dialog by global back, boolean type, default `false`
  - `layout`：Layout, optional values:
    - `horizontal`：Horizontal layout, icon on the left, title and content on the right and left-aligned (default)
    - `vertical`：Vertical layout, icon on top, title and content below and center-aligned
  - `actionsLayout`：Action button layout, optional values:
    - `horizontal`：Horizontal layout, action buttons aligned to the edge (default)
    - `horizontal-full`：Horizontal layout, action buttons full width
    - `vertical`：Vertical layout, action buttons arranged vertically
  - `width`：Width, supports number (pixel value) or CSS width value (e.g.: `'300px'`, `'50%'`, `calc(50% - 20px)`)
  - `color`：Theme color, [`ThemeColor`](../infra/color#type-themecolor) type
  - `onClose`：Dialog close callback, will be automatically set as `close` event listener during construction

## Properties
The dialog can be set through the following properties:

- `icon`：Icon, `Node` type
- `title`：Title, [`DOMContents`](../infra/dom#type-domcontents) type
- `content`：Content, [`DOMContents`](../infra/dom#type-domcontents) type
- `actions`：Action buttons, [`DOMContents`](../infra/dom#type-domcontents) type
- `hideCloseButton`：Hide close button, boolean type
- `disableClickOutside`：Disable closing dialog by clicking outside area, boolean type
- `disableGlobalBackClose`：Disable closing dialog by global back, boolean type
- `layout`：Layout, optional values:
  - `horizontal`：Horizontal layout, icon on the left, title and content on the right and left-aligned (default)
  - `vertical`：Vertical layout, icon on top, title and content below and center-aligned
- `actionsLayout`：Action button layout, optional values:
  - `horizontal`：Horizontal layout, action buttons aligned to the edge (default)
  - `horizontal-full`：Horizontal layout, action buttons full width
  - `vertical`：Vertical layout, action buttons arranged vertically
- `width`：Width

## Methods

### `open`
Open the dialog, return `this`.

### `close`
Close the dialog, return `this`.

### `setColor`
Set dialog theme color, return `this`.

## Static Methods

### `confirm`
Create a confirmation dialog, return `Promise<boolean> & { dialog: Dialog }`.

Differences from default initialization parameters:
- `level`：Level, optional values:
  - `primary`：Primary style (default)
  - `danger`：Danger style
  - `critical`：Critical danger style
- `confirmContent`：Confirm button content, [`DOMContents`](../infra/dom#type-domcontents) type, default `t('ui.confirm')`
- `actionsLayout`：Default `horizontal-full`
- `actions`：Action button parameter will be ignored

### `alert`
Create an alert dialog, return `Promise<void> & { dialog: Dialog }`.

Differences from default initialization parameters:
- `buttonVariant`：Button variant, optional values:
  - `  `：Flat style (default)
  - `primary`：Primary style
  - `secondary`：Secondary style
  - `danger`：Danger style
  - `critical`：Critical danger style
- `confirmContent`：Confirm button content, [`DOMContents`](../infra/dom#type-domcontents) type, default `t('ui.confirm')`
- `hideCloseButton`：Default `true`
- `disableClickOutside`：Default `true`
- `actionsLayout`：Default `horizontal-full`
- `actions`：Action button parameter will be ignored

### `overlay`
Create an overlay dialog, return `Dialog` instance.

Differences from default initialization parameters:
- `hideCloseButton`：Default `true`
- `disableClickOutside`：Default `true`
- `disableGlobalBackClose`：Default `true`

## Events

| Event Name | Parameter List | Description                                                   |
| ---------- | -------------- | ------------------------------------------------------------- |
| `close`    | `()`           | Triggered when clicking dialog close button, outside area, or global back to close dialog |