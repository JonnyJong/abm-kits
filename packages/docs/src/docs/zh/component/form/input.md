---
title: 输入框
source: packages/abm-ui/src/component/input.ts
---

# 类 `InputBox`
抽象类，以下所有输入框组件均继承自该类。

## 属性

### `autofill`
自动填充列表，类型为 [`AutofillItem[]`](#接口-autofillitem)。

### `autoSize`
自动调整输入框大小，类型为 `boolean`，默认值为 `false`。

### `readOnly`
输入框是否只读，类型为 `boolean`，默认值为 `false`。

## 方法

### `focus`
聚焦输入框。

## 事件
该类在原[表单控件事件](../form#事件)基础上，额外包含以下事件：

| 事件名     | 参数列表       | 描述                                                      |
| ---------- | -------------- | --------------------------------------------------------- |
| `autofill` | `(id: string)` | 自动填充事件，当输入框自动填充值时触发，参数为填充值的 ID |

## 插槽

| 插槽名  | 描述           |
| ------- | -------------- |
| `  `    | 占位符         |
| `left`  | 输入框左侧插槽 |
| `right` | 输入框右侧插槽 |

## `::part()` 选择器

| 选择器        | 描述           |
| ------------- | -------------- |
| `placeholder` | 占位符         |
| `left`        | 输入框左侧插槽 |
| `right`       | 输入框右侧插槽 |

# 接口 `AutofillItem`
自动填充项接口，定义自动填充列表中的项。

## 属性

### `id`
自动填充项的 ID，类型为字符串。

### `value`
自动填充项的值，类型为 `T`。

### `label`
自动填充项的标签，类型为 [`DOMContents`](../../infra/dom#类型-domcontents)，若为空，则默认显示 `value` 的值。

# `<TextBox>`
文本输入框组件，该组件表单类型为 `string`。

## 尝试一下
{{[demo](../../../../demo/component/text-box.tsx)}}

## 使用
:::全局导入
```ts
import { TextBox } from 'abm-ui';
```
::: 按需导入
```ts
import { TextBox } from 'abm-ui/component/input';
```
:::注册导入
```ts
import 'abm-ui/component/input';
```
:::

# `<NumberBox>`
数字输入框组件，该组件表单类型为 `number`。

## 尝试一下
{{[demo](../../../../demo/component/number-box.tsx)}}

## 使用
:::全局导入
```ts
import { NumberBox } from 'abm-ui';
```
::: 按需导入
```ts
import { NumberBox } from 'abm-ui/component/input';
```
:::注册导入
```ts
import 'abm-ui/component/input';
```
:::

## 属性

### `min`
输入框的最小值，类型为 `number`，默认值为 `Number.MIN_SAFE_INTEGER`。

### `max`
输入框的最大值，类型为 `number`，默认值为 `Number.MAX_SAFE_INTEGER`。

### `step`
输入框的步长，类型为 `number`，默认值为 `0`。

# `<PasswordBox>`
密码输入框组件，该组件表单类型为 `string`。

## 尝试一下
{{[demo](../../../../demo/component/password-box.tsx)}}

## 使用
:::全局导入
```ts
import { PasswordBox } from 'abm-ui';
```
::: 按需导入
```ts
import { PasswordBox } from 'abm-ui/component/input';
```
:::注册导入
```ts
import 'abm-ui/component/input';
```
:::

## 属性

### `passwordVisible`
密码是否可见，类型为 `boolean`，默认值为 `false`。
