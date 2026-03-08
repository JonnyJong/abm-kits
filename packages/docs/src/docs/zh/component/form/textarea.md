---
title: 文本域输入框
source: packages/abm-ui/src/component/input.ts
---

文本域输入框组件，该组件表单类型为 `string`。

# 尝试一下
{{[demo](../../../../demo/component/textarea.tsx)}}

# 使用
:::全局导入
```ts
import { Textarea } from 'abm-ui';
```
::: 按需导入
```ts
import { Textarea } from 'abm-ui/component/textarea';
```
:::注册导入
```ts
import 'abm-ui/component/textarea';
```
:::

# 属性

## `autoSize`
自动调整输入框大小，类型为 `boolean`，默认值为 `false`。

## `readOnly`
输入框是否只读，类型为 `boolean`，默认值为 `false`。

## `enterMode`
输入框回车键模式。

| 值       | 描述                                                                                                                                                                                                   |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `direct` | 只按 <abm-hint-key key="Enter"></abm-hint-key> 触发提交事件                                                                                                                                            |
| `ctrl`   | 按下 <abm-hint-key key="ControlLeft"></abm-hint-key><abm-hint-key key="Enter"></abm-hint-key> / <abm-hint-key key="ControlRight"></abm-hint-key><abm-hint-key key="Enter"></abm-hint-key> 触发提交事件 |
| `shift`  | 按下 <abm-hint-key key="ShiftLeft"></abm-hint-key><abm-hint-key key="Enter"></abm-hint-key> / <abm-hint-key key="ShiftRight"></abm-hint-key><abm-hint-key key="Enter"></abm-hint-key> 触发提交事件     |
| `alt`    | 按下 <abm-hint-key key="AltLeft"></abm-hint-key><abm-hint-key key="Enter"></abm-hint-key> / <abm-hint-key key="AltRight"></abm-hint-key><abm-hint-key key="Enter"></abm-hint-key> 触发提交事件         |
| `never`  | 从不触发提交事件                                                                                                                                                                                       |

# 方法

## `focus`
聚焦输入框。

# 事件
该类在原[表单控件事件](../form#事件)基础上，额外包含以下事件：

| 事件名     | 参数列表       | 描述                                                      |
| ---------- | -------------- | --------------------------------------------------------- |
| `autofill` | `(id: string)` | 自动填充事件，当输入框自动填充值时触发，参数为填充值的 ID |

# 插槽

| 插槽名  | 描述           |
| ------- | -------------- |
| `  `    | 占位符         |
| `left`  | 输入框左侧插槽 |
| `right` | 输入框右侧插槽 |

# `::part()` 选择器

| 选择器        | 描述           |
| ------------- | -------------- |
| `placeholder` | 占位符         |
| `left`        | 输入框左侧插槽 |
| `right`       | 输入框右侧插槽 |
