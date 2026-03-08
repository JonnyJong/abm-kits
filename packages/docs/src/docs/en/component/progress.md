---
title: Progress
source: packages/abm-ui/src/component/progress.ts
---

# Try It
{{[demo](../../../demo/component/progress.tsx)}}

# Usage
:::Global Import
```ts
import { Progress } from 'abm-ui';
```
:::On-demand Import
```ts
import { Progress } from 'abm-ui/component/progress';
```
:::Registration Import
```ts
import 'abm-ui/component/progress';
```
:::

```tsx
<Progress value={50} />
```

```html
<abm-progress value="50"></abm-progress>
```

# Properties

## `value`
The value of the progress bar, ranging from `0` to `100`, if `NaN`, the progress bar is in an indeterminate state.