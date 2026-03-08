---
title: 选择框
source: packages/abm-ui/src/component/select.ts
---

该组件表单值类型为 `T | undefined`。

# 尝试一下
{{[demo](../../../../demo/component/select.tsx)}}

# 使用
:::全局导入
```ts
import { Select } from 'abm-ui';
```
:::按需导入
```ts
import { Select } from 'abm-ui/component/select';
```
:::注册导入
```ts
import 'abm-ui/component/select';
```
:::

# 属性

## `options`
选项列表，类型为 `{ value: T, label: DOMContent }[]`。

## `index`
当前选中项的索引，类型为 `number`。

# 插槽

| 插槽名 | 描述          |
| ------ | ------------- |
| `  `   | Fallback 内容 |
