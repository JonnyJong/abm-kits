---
title: 复选框
source: packages/abm-ui/src/component/checkbox.ts
---

复选框组件，用于选择多个选项。

该组件表单值类型为 `boolean`。

# 尝试一下
{{[demo](../../../../demo/component/checkbox.tsx)}}

# 使用
:::全局导入
```ts
import { Checkbox } from 'abm-ui';
```
::: 按需导入
```ts
import { Checkbox } from 'abm-ui/component/checkbox';
```
:::注册导入
```ts
import 'abm-ui/component/checkbox';
```
:::

```tsx
<Checkbox checked/>
```

```html
<abm-checkbox checked></abm-checkbox>
```

# 属性

## `checked`
布尔类型，设置为选中状态，`value` 属性与该属性同步。

## `indeterminate`
布尔类型，设置为中间状态。

# CSS 变量

| 变量名   | 默认值 | 描述       |
| -------- | ------ | ---------- |
| `--size` | `24px` | 复选框大小 |
