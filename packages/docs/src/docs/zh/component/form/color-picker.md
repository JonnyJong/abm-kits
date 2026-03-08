---
title: 颜色选择器
source: packages/abm-ui/src/component/color-picker.ts
---

颜色选择器组件，用于选择颜色。

该组件表单值类型为 [`Color`](../../utils/color#类-color) 类。

# 尝试一下
{{[demo](../../../../demo/component/color-picker.tsx)}}

# 使用
:::全局导入
```ts
import { ColorPicker } from 'abm-ui';
```
::: 按需导入
```ts
import { ColorPicker } from 'abm-ui/component/color-picker';
```
:::注册导入
```ts
import 'abm-ui/component/color-picker';
```
:::

```tsx
<ColorPicker value="#ff0000" />
```

```html
<abm-color-picker value="#ff0000"></abm-color-picker>
```

# 属性

## `value`
颜色值，支持设置 HEX 字符串或 [`Color`](../../utils/color#类-color) 类实例，读取时总为 [`Color`](../../utils/color#类-color) 类实例。

## `enableAlpha`
布尔类型，是否启用透明度通道，默认值为 `false`。
