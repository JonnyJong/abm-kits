---
title: 按钮
source: packages/abm-ui/src/component/button.ts
---

# 尝试一下
{{[demo](../../../demo/component/button.tsx)}}

# 使用
:::全局导入
```ts
import { Button } from 'abm-ui';
```
:::按需导入
```ts
import { Button } from 'abm-ui/component/button';
```
:::注册导入
```ts
import 'abm-ui/component/button';
```
:::

```tsx
<Button variant="primary">Hello world</Button>
```

```html
<abm-btn variant="primary">Hello world</abm-btn>
```

# 属性

## `variant`
字符串类型，可选值为：
- ` `（空字符串，默认值）：线框样式
- `primary`：主要样式
- `secondary`：次要样式
- `danger`：危险样式
- `critical`：关键样式

## `flat`
布尔类型，设置为扁平样式，移除按钮边框。

## `rounded`
布尔类型，设置为圆形样式，使按钮变为圆形。

## `repeat`
布尔类型，设置为重复触发模式，按住按钮时会持续触发 `active` 事件。

## `disabled`
布尔类型，禁用按钮，禁用状态下按钮不可点击且透明度降低。

# 事件

| 事件名  | 参数列表           | 描述       |
| ------- | ------------------ | ---------- |
| `click` | `(button: Button)` | 点击时触发 |
