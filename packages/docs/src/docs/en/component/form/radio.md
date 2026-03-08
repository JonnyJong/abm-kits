---
title: Radio
source: packages/abm-ui/src/component/radio.ts
---

The form value type of radio buttons and radio groups is `T | undefined`.

# Try It
{{[demo](../../../../demo/component/radio.tsx)}}

# Usage
:::Global Import
```ts
import { Radio, RadioGroup } from 'abm-ui';
```
:::On-demand Import
```ts
import { Radio, RadioGroup } from 'abm-ui/component/radio';
```
:::Registration Import
```ts
import 'abm-ui/component/radio';
```
:::

```tsx
<RadioGroup>
  <Radio value={0} />
  <Radio value={1} />
  <Radio value={2} />
</RadioGroup>
```

```html
<abm-radio-group>
  <abm-radio value="0"></abm-radio>
  <abm-radio value="1"></abm-radio>
  <abm-radio value="2"></abm-radio>
</abm-radio-group>
```

# `<Radio>`

## Properties

### `checked`
Whether it is selected.

# `<RadioGroup>`
Used to group the internal radio buttons together and prevent "penetration".


```tsx
<RadioGroup>
  <Radio value={0} /> {/* Belongs to the first group */}
  <Radio value={1} /> {/* Belongs to the first group */}
  <Radio value={2} /> {/* Belongs to the first group */}
  {/* Nested */}
  <RadioGroup>
    <Radio value={0} /> {/* Belongs to the second group */}
    <Radio value={1} /> {/* Belongs to the second group */}
    <Radio value={2} /> {/* Belongs to the second group */}
  </RadioGroup>
</RadioGroup>
```