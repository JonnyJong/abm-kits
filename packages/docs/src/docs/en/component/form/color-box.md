---
title: Color Input
source: packages/abm-ui/src/component/color-box.ts
---

Color input component, used to select colors.

This component's form value type is the [`Color`](../../utils/color#class-color) class.

# Try It
{{[demo](../../../../demo/component/color-box.tsx)}}

# Usage
:::Global Import
```ts
import { ColorBox } from 'abm-ui';
```
:::On-demand Import
```ts
import { ColorBox } from 'abm-ui/component/color-box';
```
:::Registration Import
```ts
import 'abm-ui/component/color-box';
```
:::

```tsx
<ColorBox value="#ff0000" />
```

```html
<abm-color-box value="#ff0000"></abm-color-box>
```

# Properties

## `value`
Color value, supports setting HEX string or [`Color`](../../utils/color#class-color) class instance, always returns [`Color`](../../utils/color#class-color) class instance when read.

## `enableAlpha`
Boolean type, whether to enable alpha channel, default value is `false`.

## `picker`
String type, color picker type, default value is `auto`.

| Value    | Description |
| -------- | ----------- |
| `auto`   | Auto picker, selects `dialog` or `flyout` based on device type. |
| `dialog` | Dialog picker, opens a dialog where users can select colors. |
| `flyout` | Flyout picker, pops up a color picker when clicked, where users can select colors. |