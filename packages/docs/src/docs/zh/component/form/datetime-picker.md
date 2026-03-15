---
title: 时间日期选择器
source: packages/abm-ui/src/component/datetime-picker.ts
---

该组件表单值类型为 [`Temporal.ZonedDateTime`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Temporal/ZonedDateTime)。

该组件依赖于 [`Temporal API`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Temporal)，需确保目标运行环境支持或设置 Polyfill。

# 尝试一下
{{[demo](../../../../demo/component/datetime-picker.tsx)}}

# 使用
:::全局导入
```ts
import { DatetimePicker } from 'abm-ui';
```
:::按需导入
```ts
import { DatetimePicker } from 'abm-ui/component/datetime-picker';
```
:::注册导入
```ts
import 'abm-ui/component/datetime-picker';
```
:::

```tsx
<DatetimePicker/>
```

```html
<abm-datetime-picker></abm-datetime-picker>
```

# 属性

## `locale`
地区设置，类型为 `string | undefined`。

当设置为 `undefined` 时，根据全局 `locale` 自动调整；若设置了 `intlOptions`，则切换地区时自动更新格式。

## `currentLocale`
当前地区设置，类型为 `string`（只读）。

## `intlOptions`
国际化格式化选项，类型为 `Intl.DateTimeFormatOptions`，默认值为 `{ dateStyle: 'short', timeStyle: 'short' }`。

修改该项不会触发更新，仅用于根据地区设置自动切换格式。

## `disabled`
是否禁用，类型为 `boolean`。

# 方法

## `setParts`
设置时间日期的部分格式。

```ts
setParts(...parts: DatetimePickerPart[]): void
```

参数 `parts` 为时间日期部分的配置数组，每个元素可以是：
- 字符串：直接显示的文本
- `{ type: 'literal', fmt: string }`：字面量文本
- `{ type: 'year' }`：年份
- `{ type: 'month', fmt?: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow' }`：月份
- `{ type: 'day', fmt?: 'numeric' | '2-digit' }`：日期
- `{ type: 'weekday', fmt?: 'long' | 'short' | 'narrow' }`：星期
- `{ type: 'hour', fmt?: HourFmt }`：小时，格式为 `${hourCycle}_${format}`
  - `hourCycle`：小时循环，参考 [MDN 文档](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/hourCycle)
  - `format`：`'numeric' | '2-digit'`
- `{ type: 'minute', fmt?: 'numeric' | '2-digit' }`：分钟
- `{ type: 'second', fmt?: 'numeric' | '2-digit' }`：秒
- `{ type: 'fractionalSecond', fmt?: 1 | 2 | 3 }`：毫秒
- `{ type: 'dayPeriod' }`：上午/下午

# 静态方法

## `toParts`
从国际化格式化选项生成部分配置。

## `fromIntl`
从国际化格式化选项创建时间日期选择器。

## `fromParts`
从部分配置创建时间日期选择器。

# 子组件

| 名称   | 描述       |
| ------ | ---------- |
| `Date` | 日期选择器 |
| `Time` | 时间选择器 |
