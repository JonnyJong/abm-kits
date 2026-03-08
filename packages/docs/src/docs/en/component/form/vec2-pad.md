---
title: Vec2 Pad
source: packages/abm-ui/src/component/vec2-pad.ts
---

A 2D vector pad component, used to input and display 2D vectors.

This component's form value type is [`Vec2`](../../utils/vector#type-vec2).

# Try It
{{[demo](../../../../demo/component/vec2-pad.tsx)}}

# Usage
:::Global Import
```ts
import { Vec2Pad } from 'abm-ui';
```
:::On-demand Import
```ts
import { Vec2Pad } from 'abm-ui/component/vec2-pad';
```
:::Registration Import
```ts
import 'abm-ui/component/vec2-pad';
```
:::

# Properties

## `start`
Start value, [`Vec2`](../../utils/vector#type-vec2) type.

## `end`
End value, [`Vec2`](../../utils/vector#type-vec2) type.

## `step`
Step size, [`Vec2`](../../utils/vector#type-vec2) type.

## `tooltipFormatter`
Format tooltip, used to customize the value displayed when selecting or sliding the slider.

# `::part()` Selectors

| Part Name | Description |
| --------- | ----------- |
| `thumb`   | Thumb |