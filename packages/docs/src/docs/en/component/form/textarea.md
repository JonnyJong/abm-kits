---
title: Textarea
source: packages/abm-ui/src/component/input.ts
---

Textarea input component, this component's form type is `string`.

# Try It
{{[demo](../../../../demo/component/textarea.tsx)}}

# Usage
:::Global Import
```ts
import { Textarea } from 'abm-ui';
```
:::On-demand Import
```ts
import { Textarea } from 'abm-ui/component/textarea';
```
:::Registration Import
```ts
import 'abm-ui/component/textarea';
```
:::

# Properties

## `autoSize`
Automatically adjust input box size, type `boolean`, default value is `false`.

## `readOnly`
Whether the input box is read-only, type `boolean`, default value is `false`.

## `enterMode`
Input box enter key mode.

| Value    | Description |
| -------- | ----------- |
| `direct` | Only press <abm-hint-key key="Enter"></abm-hint-key> to trigger submit event |
| `ctrl`   | Press <abm-hint-key key="ControlLeft"></abm-hint-key><abm-hint-key key="Enter"></abm-hint-key> / <abm-hint-key key="ControlRight"></abm-hint-key><abm-hint-key key="Enter"></abm-hint-key> to trigger submit event |
| `shift`  | Press <abm-hint-key key="ShiftLeft"></abm-hint-key><abm-hint-key key="Enter"></abm-hint-key> / <abm-hint-key key="ShiftRight"></abm-hint-key><abm-hint-key key="Enter"></abm-hint-key> to trigger submit event |
| `alt`    | Press <abm-hint-key key="AltLeft"></abm-hint-key><abm-hint-key key="Enter"></abm-hint-key> / <abm-hint-key key="AltRight"></abm-hint-key><abm-hint-key key="Enter"></abm-hint-key> to trigger submit event |
| `never`  | Never trigger submit event |

# Methods

## `focus`
Focus the input box.

# Events
This class includes the following additional events on top of the original [form control events](../form#events):

| Event Name | Parameter List | Description |
| ---------- | -------------- | ----------- |
| `autofill` | `(id: string)` | Autofill event, triggered when the input box auto-fills a value, parameter is the ID of the filled value |

# Slots

| Slot Name | Description |
| --------- | ----------- |
| `  `      | Placeholder |
| `left`    | Left slot of the input box |
| `right`   | Right slot of the input box |

# `::part()` Selectors

| Selector      | Description |
| ------------- | ----------- |
| `placeholder` | Placeholder |
| `left`        | Left slot of the input box |
| `right`       | Right slot of the input box |