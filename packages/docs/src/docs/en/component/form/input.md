---
title: Input
source: packages/abm-ui/src/component/input.ts
---

# Class `InputBox`
Abstract class, all input box components below inherit from this class.

## Properties

### `autofill`
Autofill list, type [`AutofillItem[]`](#interface-autofillitem).

### `autoSize`
Automatically adjust input box size, type `boolean`, default value is `false`.

### `readOnly`
Whether the input box is read-only, type `boolean`, default value is `false`.

## Methods

### `focus`
Focus the input box.

## Events
This class includes the following additional events on top of the original [form control events](../form#events):

| Event Name | Parameter List | Description |
| ---------- | -------------- | ----------- |
| `autofill` | `(id: string)` | Autofill event, triggered when the input box auto-fills a value, parameter is the ID of the filled value |

## Slots

| Slot Name | Description |
| --------- | ----------- |
| `  `      | Placeholder |
| `left`    | Left slot of the input box |
| `right`   | Right slot of the input box |

## `::part()` Selectors

| Selector      | Description |
| ------------- | ----------- |
| `placeholder` | Placeholder |
| `left`        | Left slot of the input box |
| `right`       | Right slot of the input box |

# Interface `AutofillItem`
Autofill item interface, defines items in the autofill list.

## Properties

### `id`
Autofill item ID, type string.

### `value`
Autofill item value, type `T`.

### `label`
Autofill item label, type [`DOMContents`](../../infra/dom#type-domcontents), if empty, defaults to displaying the value of `value`.

# `<TextBox>`
Text input box component, this component's form type is `string`.

## Try It
{{[demo](../../../../demo/component/text-box.tsx)}}

## Usage
:::Global Import
```ts
import { TextBox } from 'abm-ui';
```
:::On-demand Import
```ts
import { TextBox } from 'abm-ui/component/input';
```
:::Registration Import
```ts
import 'abm-ui/component/input';
```
:::

# `<NumberBox>`
Number input box component, this component's form type is `number`.

## Try It
{{[demo](../../../../demo/component/number-box.tsx)}}

## Usage
:::Global Import
```ts
import { NumberBox } from 'abm-ui';
```
:::On-demand Import
```ts
import { NumberBox } from 'abm-ui/component/input';
```
:::Registration Import
```ts
import 'abm-ui/component/input';
```
:::

## Properties

### `min`
Minimum value of the input box, type `number`, default value is `Number.MIN_SAFE_INTEGER`.

### `max`
Maximum value of the input box, type `number`, default value is `Number.MAX_SAFE_INTEGER`.

### `step`
Step size of the input box, type `number`, default value is `0`.

# `<PasswordBox>`
Password input box component, this component's form type is `string`.

## Try It
{{[demo](../../../../demo/component/password-box.tsx)}}

## Usage
:::Global Import
```ts
import { PasswordBox } from 'abm-ui';
```
:::On-demand Import
```ts
import { PasswordBox } from 'abm-ui/component/input';
```
:::Registration Import
```ts
import 'abm-ui/component/input';
```
:::

## Properties

### `passwordVisible`
Whether the password is visible, type `boolean`, default value is `false`.