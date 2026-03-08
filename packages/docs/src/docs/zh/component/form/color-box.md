---
title: 颜色输入
source: packages/abm-ui/src/component/color-box.ts
---

颜色输入组件，用于选择颜色。

该组件表单值类型为 [`Color`](../../utils/color#类-color) 类。

# 尝试一下
{{[demo](../../../../demo/component/color-box.tsx)}}

# 使用
:::全局导入
```ts
import { ColorBox } from 'abm-ui';
```
::: 按需导入
```ts
import { ColorBox } from 'abm-ui/component/color-box';
```
:::注册导入
```ts
import 'abm-ui/component/color-box';
```
:::

```tsx
<ColorBox value="#ff0000" />
```

```html
<abm-color-box value="#ff0000"></abm-color-box>
```

# 属性

## `value`
颜色值，支持设置 HEX 字符串或 [`Color`](../../utils/color#类-color) 类实例，读取时总为 [`Color`](../../utils/color#类-color) 类实例。

## `enableAlpha`
布尔类型，是否启用透明度通道，默认值为 `false`。

## `picker`
字符串类型，颜色选择器类型，默认值为 `auto`。

| 值       | 描述                                                           |
| -------- | -------------------------------------------------------------- |
| `auto`   | 自动选择器，根据设备类型选择 `dialog` 或 `flyout`。            |
| `dialog` | 对话框选择器，打开一个对话框，用户可以在其中选择颜色。         |
| `flyout` | 弹出选择器，点击后弹出一个颜色选择器，用户可以在其中选择颜色。 |
