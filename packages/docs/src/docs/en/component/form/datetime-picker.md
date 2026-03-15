---
title: Datetime Picker
source: packages/abm-ui/src/component/datetime-picker.ts
---

This component's form value type is [`Temporal.ZonedDateTime`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Temporal/ZonedDateTime).

This component depends on [`Temporal API`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Temporal), ensure the target runtime environment supports it or set up a Polyfill.

# Try It
{{[demo](../../../../demo/component/datetime-picker.tsx)}}

# Usage
:::Global Import
```ts
import { DatetimePicker } from 'abm-ui';
```
:::On-demand Import
```ts
import { DatetimePicker } from 'abm-ui/component/datetime-picker';
```
:::Registration Import
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

# Properties

## `default`
Default value, type `Temporal.ZonedDateTime`, default value is the current time.

## `value`
Current value, type `Temporal.ZonedDateTime`.

## `locale`
Locale setting, type `string | undefined`.

When set to `undefined`, it automatically adjusts based on the global `locale`; if `intlOptions` is set, the format updates automatically when the locale changes.

## `currentLocale`
Current locale setting, type `string` (read-only).

## `intlOptions`
Intl formatting options, type `Intl.DateTimeFormatOptions`, default value is `{ dateStyle: 'short', timeStyle: 'short' }`.

Modifying this property does not trigger an update, it is only used to automatically switch formats based on locale settings.

## `disabled`
Whether disabled, type `boolean`.

# Methods

## `setParts`
Set the datetime part format.

```ts
setParts(...parts: DatetimePickerPart[]): void
```

The `parts` parameter is an array of datetime part configurations, each element can be:
- String: Text to display directly
- `{ type: 'literal', fmt: string }`: Literal text
- `{ type: 'year' }`: Year
- `{ type: 'month', fmt?: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow' }`: Month
- `{ type: 'day', fmt?: 'numeric' | '2-digit' }`: Day
- `{ type: 'weekday', fmt?: 'long' | 'short' | 'narrow' }`: Weekday
- `{ type: 'hour', fmt?: HourFmt }`: Hour, format is `${hourCycle}_${format}`
  - `hourCycle`：Hour cycle，reference [MDN Document](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/hourCycle)
  - `format`：`'numeric' | '2-digit'`
- `{ type: 'minute', fmt?: 'numeric' | '2-digit' }`: Minute
- `{ type: 'second', fmt?: 'numeric' | '2-digit' }`: Second
- `{ type: 'fractionalSecond', fmt?: 1 | 2 | 3 }`: Millisecond
- `{ type: 'dayPeriod' }`: AM/PM

# Static Methods

## `toParts`
Generate part configuration from intl formatting options.

## `fromIntl`
Create a datetime picker from intl formatting options.

## `fromParts`
Create a datetime picker from part configuration.

# Sub Components

| Name   | Description |
| ------ | ----------- |
| `Date` | Date Picker |
| `Time` | Time Picker |
