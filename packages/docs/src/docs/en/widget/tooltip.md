---
title: Tooltip
source: packages/abm-ui/src/widget/tooltip.ts
---

# Try It
{{[demo](../../../demo/widget/tooltip.tsx)}}

# Usage
:::Global Import
```ts
import { tooltip } from 'abm-ui';
```
:::On-demand Import
```ts
import { tooltip } from 'abm-ui/widget/tooltip';
```
:::

```tsx
// Set when creating element
const div = $new('div', { tooltip: t('xxx.tooltip') });
// Set on existing element
tooltip.set(div, 'Hello world');
```

```html
<div tooltip="This is tooltip">Target</div>
```

# Object `tooltip`

## Functions

### `set`
Set tooltip on element.

### `rm`
Remove tooltip from element.

### `lock`
Lock tooltip display for specified element.

### `unlock`
Unlock tooltip display for specified element.