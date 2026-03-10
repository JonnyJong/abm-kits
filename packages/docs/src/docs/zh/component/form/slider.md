---
title: 滑动选择器
source: packages/abm-ui/src/component/slider.ts
---

该组件的表单值类型为 `T extends ArrayOr<number>`。

# 尝试一下
{{[demo](../../../../demo/component/slider-single.tsx)}}
{{[demo](../../../../demo/component/slider-array.tsx)}}

# 使用
:::全局导入
```ts
import { Slider } from 'abm-ui';
```
::: 按需导入
```ts
import { Slider } from 'abm-ui/component/slider';
```
:::注册导入
```ts
import 'abm-ui/component/slider';
```
:::

```tsx
<Slider/>
```

```html
<abm-slider></abm-slider>
```

# 属性

## `vertical`
是否垂直方向，类型为 `boolean`。

## `tick`
刻度，类型为 `ArrayOr<number>`。

当为 `0` 时，不显示刻度；
当不为 `0` 时，表示每个刻度的间隔；
当为数组时，数组中的值为刻度的位置，范围 `(start, end)`，超出范围的刻度将被忽略。

## `value`
默认类型为 `number`，此时仅有一个刻度；
若设置为数组，则表示多个刻度，且此后读取的值也为数组。

## `start`
起始值，类型为 `number`，默认 `0`。

## `end`
结束值，类型为 `number`，默认 `1`。

## `step`
步长，类型为 `number`，默认 `0`。

## `tooltipFormatter`
格式化工具提示，用于自定义选中或滑动滑块时显示的数值，类型为 `((value: number) => string) | undefined`。

# `::part()` 选择器

| 部分名  | 描述 |
| ------- | ---- |
| `track` | 轨道 |
| `thumb` | 滑块 |
