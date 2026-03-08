---
title: Value
source: packages/abm-ui/src/component/value.ts
---

An invisible form value component, used to store form values.

This component's form value type is `T`.

# Try It
{{[demo](../../../../demo/component/value.tsx)}}

:::Global Import
```ts
import { Value } from 'abm-ui';
```
:::On-demand Import
```ts
import { Value } from 'abm-ui/component/value';
```
:::Registration Import
```ts
import 'abm-ui/component/value';
```
:::

```tsx
<Value name="value" value={0} default={0}/>
```

```html
<abm-value name="value" value={0} default={0}></abm-value>
```