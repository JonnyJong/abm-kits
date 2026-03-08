---
title: Color Picker
source: packages/abm-ui/src/component/color-picker.ts
---

Color picker component, used to select colors.

This component's form value type is the [`Color`](../../utils/color#class-color) class.

# Try It
{{[demo](../../../../demo/component/color-picker.tsx)}}

# Usage
:::Global Import
```ts
import { ColorPicker } from 'abm-ui';
```
:::On-demand Import
```ts
import { ColorPicker } from 'abm-ui/component/color-picker';
```
:::Registration Import
```ts
import 'abm-ui/component/color-picker';
```
:::

```tsx
<ColorPicker value="#ff0000" />
```

```html
<abm-color-picker value="#ff0000"></abm-color-picker>
```

# Properties

## `value`
Color value, supports setting HEX string or [`Color`](../../utils/color#class-color) class instance, always returns [`Color`](../../utils/color#class-color) class instance when read.

## `enableAlpha`
Boolean type, whether to enable alpha channel, default value is `false`.