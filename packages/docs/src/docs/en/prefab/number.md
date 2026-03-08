---
title: Number Input Prefab
source: packages/abm-ui/src/prefab/number.ts
---

# Usage
:::Global Import
```ts
import { createNumberInputPrefab } from 'abm-ui';
```
:::On-demand Import
```ts
import { createNumberInputPrefab } from 'abm-ui/prefab/number';
```
:::

{{[demo](../../../demo/prefab/number.tsx)}}

# Function `createNumberInputPrefab`

## Parameters
All parameters are optional.
- `init`：Initialization parameters
  - `slider`：Slider, slider properties
  - `numberBox`：Number input box, number input box properties
  - `default`：Default value, default `0`
  - `value`：Initial value, default `0`
  - `start`：Start value, default `0`
  - `end`：End value, default `1`
  - `step`：Step value, default `0`
  - `$input`：`input` event handler
  - `$change`：`change` event handler

## Return Object
- `slider`：Slider, read-only
- `numberBox`：Number input box, read-only
- `start`：Start value
- `end`：End value
- `step`：Step value
- `default`：Default value
- `value`：Current value