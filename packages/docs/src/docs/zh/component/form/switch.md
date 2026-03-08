---
title: 开关
source: packages/abm-ui/src/component/switch.ts
---

该组件的表单值类型为 `boolean`。

# 尝试一下
{{[demo](../../../../demo/component/switch.tsx)}}

# 使用
:::全局导入
```ts
import { Switch } from 'abm-ui';
```
::: 按需导入
```ts
import { Switch } from 'abm-ui/component/switch';
```
:::注册导入
```ts
import 'abm-ui/component/switch';
```
:::

```tsx
<Switch checked/>
```

```html
<abm-switch checked></abm-switch>
```

# 属性

## `checked`
布尔类型，设置为选中状态，`value` 属性与该属性同步。

# CSS 变量

| 变量名   | 默认值 | 描述     |
| -------- | ------ | -------- |
| `--size` | `24px` | 开关大小 |
