---
title: Button
source: packages/abm-ui/src/component/button.ts
---

# Try It
{{[demo](../../../demo/component/button.tsx)}}

# Usage
:::Global Import
```ts
import { Button } from 'abm-ui';
```
:::On-demand Import
```ts
import { Button } from 'abm-ui/component/button';
```
:::Register Import
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

# Properties

## `variant`
String type, optional values:
- ` ` (empty string, default value): Wireframe style
- `primary`: Primary style
- `secondary`: Secondary style
- `danger`: Danger style
- `critical`: Critical style

## `flat`
Boolean type, set to flat style, removes button border.

## `rounded`
Boolean type, set to rounded style, makes the button circular.

## `repeat`
Boolean type, set to repeat trigger mode, will continuously trigger `active` event when the button is held down.

## `disabled`
Boolean type, disables the button, the button is not clickable and transparency is reduced when disabled.

# Events

| Event Name | Parameter List     | Description       |
| ---------- | ------------------ | ----------------- |
| `click`    | `(button: Button)` | Triggered on click |