---
title: Slider
source: packages/abm-ui/src/component/slider.ts
---

This component's form value type is `T extends ArrayOr<number>`.

# Try It
{{[demo](../../../../demo/component/slider-single.tsx)}}
{{[demo](../../../../demo/component/slider-array.tsx)}}

# Properties

## `vertical`
Whether to use vertical direction, type `boolean`.

## `tick`
Tick, type `ArrayOr<number>`.

When `0`, no ticks are displayed;
When not `0`, it represents the interval between each tick;
When it is an array, the values in the array are the positions of the ticks, range `(start, end)`, ticks outside the range will be ignored.

## `value`
Default type is `number`, in this case there is only one tick;
If set to an array, it means multiple ticks, and the value read thereafter is also an array.

## `start`
Start value, type `number`, default `0`.

## `end`
End value, type `number`, default `1`.

## `step`
Step size, type `number`, default `0`.

## `tooltipFormatter`
Format tooltip, used to customize the value displayed when selecting or sliding the slider, type `((value: number) => string) | undefined`.

# `::part()` Selectors

| Part Name | Description |
| --------- | ----------- |
| `track`   | Track |
| `thumb`   | Thumb |