---
title: Collapsible Panel
source: packages/abm-ui/src/component/collapsible.ts
---

# Try It
{{[demo](../../../demo/component/collapsible.tsx)}}

# Usage
:::Global Import
```ts
import { Collapsible } from 'abm-ui';
```
:::On-demand Import
```ts
import { Collapsible } from 'abm-ui/component/collapsible';
```
:::Register Import
```ts
import 'abm-ui/component/collapsible';
```
:::

```tsx
<Collapsible>
  <div slot="head">Click Me</div>
  {'Hello world'}
</Collapsible>
```

```html
<abm-collapsible>
  <div slot="head">Click Me</div>
  Hello world
</abm-collapsible>
```

# Properties

## `expanded`
Boolean type, set to expanded state.

## `disabled`
Boolean type, set to disabled state, cannot expand or collapse by clicking the head element when disabled.

# Events

| Event Name | Parameter List | Description       |
| ---------- | -------------- | ----------------- |
| `expand`   | `()`           | Triggered when expanded |
| `collapse` | `()`           | Triggered when collapsed |

# Slots

| Slot Name | Description     |
| --------- | --------------- |
| `  `      | Main content    |
| `head`    | Header content  |

# `::part()` Selectors

| Part Name | Description     |
| --------- | --------------- |
| `head`    | Head element    |
| `body`    | Content element |