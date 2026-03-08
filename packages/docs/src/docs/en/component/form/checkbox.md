---
title: Checkbox
source: packages/abm-ui/src/component/checkbox.ts
---

Checkbox component, used to select multiple options.

This component's form value type is `boolean`.

# Try It
{{[demo](../../../../demo/component/checkbox.tsx)}}

# Usage
:::Global Import
```ts
import { Checkbox } from 'abm-ui';
```
:::On-demand Import
```ts
import { Checkbox } from 'abm-ui/component/checkbox';
```
:::Registration Import
```ts
import 'abm-ui/component/checkbox';
```
:::

```tsx
<Checkbox checked/>
```

```html
<abm-checkbox checked></abm-checkbox>
```

# Properties

## `checked`
Boolean type, set to checked state, the `value` property is synchronized with this property.

## `indeterminate`
Boolean type, set to indeterminate state.

# CSS Variables

| Variable Name | Default Value | Description |
| ------------- | ------------- | ----------- |
| `--size`      | `24px`        | Checkbox size |