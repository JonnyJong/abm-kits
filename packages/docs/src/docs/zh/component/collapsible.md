---
title: 可折叠面板
source: packages/abm-ui/src/component/collapsible.ts
---

# 尝试一下
{{[demo](../../../demo/component/collapsible.tsx)}}

# 使用
:::全局导入
```ts
import { Collapsible } from 'abm-ui';
```
::: 按需导入
```ts
import { Collapsible } from 'abm-ui/component/collapsible';
```
:::注册导入
```ts
import 'abm-ui/component/collapsible';
```
:::

```tsx
<Collapsible>
  <div slot="head">Click Me</div>
  {'Hello world'}
</Collapsible>
```

```html
<abm-collapsible>
  <div slot="head">Click Me</div>
  Hello world
</abm-collapsible>
```

# 属性

## `expanded`
布尔类型，设置为展开状态。

## `disabled`
布尔类型，设置为禁用状态，禁用后无法通过点击头元素来展开或折叠。

# 事件

| 事件名     | 参数列表 | 描述       |
| ---------- | -------- | ---------- |
| `expand`   | `()`     | 展开时触发 |
| `collapse` | `()`     | 折叠时触发 |

# 插槽

| 插槽名 | 描述     |
| ------ | -------- |
| `  `   | 主要内容 |
| `head` | 标题内容 |

# `::part()` 选择器

| 部分名 | 描述     |
| ------ | -------- |
| `head` | 头元素   |
| `body` | 内容元素 |
