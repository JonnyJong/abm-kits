---
title: Switch
source: packages/abm-ui/src/component/switch.ts
---

This component's form value type is `boolean`.

# Try It
{{[demo](../../../../demo/component/switch.tsx)}}

# Usage
:::Global Import
```ts
import { Switch } from 'abm-ui';
```
:::On-demand Import
```ts
import { Switch } from 'abm-ui/component/switch';
```
:::Registration Import
```ts
import 'abm-ui/component/switch';
```
:::

```tsx
<Switch checked/>
```

```html
<abm-switch checked></abm-switch>
```

# Properties

## `checked`
Boolean type, set to checked state, the `value` property is synchronized with this property.

# CSS Variables

| Variable Name | Default Value | Description |
| ------------- | ------------- | ----------- |
| `--size`      | `24px`        | Switch size |
