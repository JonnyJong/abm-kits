---
title: 分段输入框
source: packages/abm-ui/src/component/segment-input.ts
---

该组件的表单值类型为 `string[]`。

# 尝试一下
{{[demo](../../../../demo/component/segment-input.tsx)}}

# 使用
:::全局导入
```ts
import { SegmentInput } from 'abm-ui';
```
::: 按需导入
```ts
import { SegmentInput } from 'abm-ui/component/segment-input';
```
:::注册导入
```ts
import 'abm-ui/component/segment-input';
```
:::

```tsx
<SegmentInput>
	<SegmentInput.Seg />
	<SegmentInput.Seg />
	<SegmentInput.Seg />
	<SegmentInput.Seg />
	<SegmentInput.Seg />
	<SegmentInput.Seg />
</SegmentInput>
```

```html
<abm-segment-input>
  <input>
  <input>
  <input>
  <input>
  <input>
  <input>
</abm-segment-input>
```

# 属性

## `handleStep`
步进处理器，处理函数参数为 `(input: HTMLInputElement, delta: number)`。`delta` 始终为整数且不为 0。
设定步进处理器后，允许使用方向键设置值。若同时启用 [`slidable`](#slidable)，则允许在输入框处上下滑动设置值。

## `handleBlur`
失焦处理器，处理函数参数为 `(input: HTMLInputElement)`。当输入框失去焦点时调用。

## `handleInput`
输入处理器，处理函数参数为 `(input: HTMLInputElement, next: () => void)`。调用 `next` 使焦点聚焦到下一个输入框，若当前输入框为最后一个输入框，则不会有任何作用。

## `valueFilter`
输入值过滤，类型为 `string[] | undefined`，在 `keydown` 阶段拦截，若设定为 `undefined` 则允许所有字符；设定为字符串数组则只允许数组中的字符。

## `slidable`
可滑动，启用后可通过上下滑动文本输入框设置值，需同时配置 [`handleStep`](#handlestep) 才能生效。

## `value`
表单值。若设置的数组元素数量大于输入框数量，多余元素将被忽略；若设置的数组元素数量小于输入框数量，则其余输入框值被设置为空字符串。
