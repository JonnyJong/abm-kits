---
title: 表单
source: packages/abm-ui/src/component/form.ts
order: 4
---

# 类 `FormControl`
表单控件组件抽象类，所有表单控件均继承自该类。

该类第一个泛型 `T` 表示表单控件的值类型。

该类已在 `cloneNode` 方法中实现了 `value`、`default`、`name`、`invalid`、`disabled` 属性的复制。

## 使用
:::全局导入
```ts
import { FormControl } from 'abm-ui';
```
::: 按需导入
```ts
import { FormControl } from 'abm-ui/component/form';
```
:::

## 属性

### `value`
表单控件的值，类型为 `T`。

### `default`
表单控件的默认值，类型为 `T`。

### `name`
表单控件的名称，类型为 `string`。

### `invalid`
表单控件是否无效，类型为 `boolean`。

### `disabled`
表单控件是否禁用，类型为 `boolean`。

## 方法

### `reset`
重置表单控件的值为默认值。

### `emitUpdate`
受保护的方法，用于触发表单更新，若参数为 `true` 则触发 `change` 事件，无参数或参数为 `false` 则触发 `input` 事件。

### `clone`
该类重写了 [`clone`](../base#clone) 方法，若子类重写了该方法，可能需要调用 `super.clone(from)`。

## 事件
| 事件名   | 参数列表     | 描述                                                     |
| -------- | ------------ | -------------------------------------------------------- |
| `input`  | `(value: T)` | 当表单控件的值发生变化时触发，参数为当前值               |
| `change` | `(value: T)` | 当表单控件的值发生变化且用户交互结束时触发，参数为当前值 |
| `submit` | `()`         | 当表单控件提交时触发                                     |

---

# `<Form>`
表单组件，继承自 [`FormControl`](#类-formcontrol) 类，用于包裹表单控件，可获取其所有子元素中表单控件的值的汇总。

其表单值类型为 `T extends any[] | Record<string, any> = Record<string, any>`。

该组件会代理其所有子元素发出的表单事件，其子元素发出表单事件后，该组件会发出同类事件。

## 使用
:::全局导入
```ts
import { Form } from 'abm-ui';
```
::: 按需导入
```ts
import { Form } from 'abm-ui/component/form';
```
:::注册导入
```ts
import 'abm-ui/component/form';
```
:::

```tsx
<Form>
  <FormField name="username">
    <Label>用户名</Label>
    <TextBox/>
    <FormMessage/>
  </FormField>
  <FormField name="password">
    <Label>密码</Label>
    <PasswordBox/>
    <FormMessage/>
  </FormField>
</Form>
```

```html
<abm-form>
  <abm-form-field name="username">
    <abm-label>用户名</abm-label>
    <abm-text-box></abm-text-box>
    <abm-form-message></abm-form-message>
  </abm-form-field>
  <abm-form-field name="password">
    <abm-label>密码</abm-label>
    <abm-password-box></abm-password-box>
    <abm-form-message></abm-form-message>
  </abm-form-field>
</abm-form>
```

## 属性

### `as`
用于指示该表单如何汇总其子元素的表单值。

| 值          | 描述                                   |
| ----------- | -------------------------------------- |
| `undefined` | 若键名都为数字，则作为数组，反之为对象 |
| `array`     | 总是汇总为数组                         |
| `object`    | 总是汇总为对象                         |

## 方法

### `setMessage`
设置表单控件的无效提出消息，结构同表单值，但每个值类型为字符串，即每个表单控件的无效提出消息。

---

# `<FormField>`
表单域组件，继承自 [`FormControl`](#类-formcontrol) 类，用于包裹表单控件，用于同时管理其内部的表单控件、表单信息和标签。

该组件会代理其直接子元素发出的表单事件，其子元素发出表单事件后，该组件会发出同类事件。

## 使用
:::全局导入
```ts
import { FormField } from 'abm-ui';
```
::: 按需导入
```ts
import { FormField } from 'abm-ui/component/form';
```
:::注册导入
```ts
import 'abm-ui/component/form';
```
:::

```tsx
<FormField name="username">
  <Label>用户名</Label>
  <TextBox/>
  <FormMessage/>
</FormField>
```

```html
<abm-form-field name="username">
  <abm-label>用户名</abm-label>
  <abm-text-box></abm-text-box>
  <abm-form-message></abm-form-message>
</abm-form-field>
```

## 方法

### `setMessage`
设置表单域的无效提出消息。

---

# `<FormMessage>`
表单信息组件，用于显示表单域的无效提出消息。

## 使用
:::全局导入
```ts
import { FormMessage } from 'abm-ui';
```
::: 按需导入
```ts
import { FormMessage } from 'abm-ui/component/form';
```
:::注册导入
```ts
import 'abm-ui/component/form';
```
:::

## 属性

### `message`
表单域的无效提出消息。

---

# `<Label>`
标签组件，用于为表单控件添加描述性文本，当标签悬浮或激活时，相同 ID 的表单控件会同时被悬浮或激活。

## 使用
:::全局导入
```ts
import { Label } from 'abm-ui';
```
::: 按需导入
```ts
import { Label } from 'abm-ui/component/form';
```
:::注册导入
```ts
import 'abm-ui/component/form';
```
:::

```tsx
<Label for="username">用户名</Label>
<TextBox id="username"/>
```

```html
<abm-label for="username">用户名</abm-label>
<abm-text-box id="username"></abm-text-box>
```

## 属性

### `for`
标签关联的表单控件的 ID，类型为 `string`。
