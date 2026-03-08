---
title: Spinner
source: packages/abm-ui/src/component/spinner.ts
---

# Try It
{{[demo](../../../demo/component/spinner.tsx)}}

# Usage
:::Global Import
```ts
import { Spinner } from 'abm-ui';
```
:::On-demand Import
```ts
import { Spinner } from 'abm-ui/component/spinner';
```
:::Registration Import
```ts
import 'abm-ui/component/spinner';
```
:::

```tsx
<Spinner value={50}/>
```

```html
<abm-spinner value="50"></abm-spinner>
```

# Properties

## `value`
The value of the spinner, ranging from `0` to `100`, if `NaN`, the spinner is in an indeterminate state.

## `size`
The size of the spinner in pixels.

# CSS Variables

| Variable Name | Default Value | Description  |
| ------------- | ------------- | ------------ |
| `--size`      | `14px`        | Spinner size |
