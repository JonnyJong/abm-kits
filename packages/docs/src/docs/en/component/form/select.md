---
title: Select
source: packages/abm-ui/src/component/select.ts
---

This component's form value type is `T | undefined`.

# Try It
{{[demo](../../../../demo/component/select.tsx)}}

# Usage
:::Global Import
```ts
import { Select } from 'abm-ui';
```
:::On-demand Import
```ts
import { Select } from 'abm-ui/component/select';
```
:::Registration Import
```ts
import 'abm-ui/component/select';
```
:::

# Properties

## `options`
Option list, type `{ value: T, label: DOMContent }[]`.

## `index`
Index of the currently selected item, type `number`.

# Slots

| Slot Name | Description |
| --------- | ----------- |
| `  `      | Fallback content |