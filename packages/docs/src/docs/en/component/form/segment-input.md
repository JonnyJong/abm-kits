---
title: Segment Input
source: packages/abm-ui/src/component/segment-input.ts
---

The form value type of this component is `string[]`.

# Try It
{{[demo](../../../../demo/component/segment-input.tsx)}}

# Usage
:::Global Import
```ts
import { SegmentInput } from 'abm-ui';
```
:::On-demand Import
```ts
import { SegmentInput } from 'abm-ui/component/segment-input';
```
:::Registration Import
```ts
import 'abm-ui/component/segment-input';
```
:::

```tsx
<SegmentInput>
	<SegmentInput.Seg />
	<SegmentInput.Seg />
	<SegmentInput.Seg />
	<SegmentInput.Seg />
	<SegmentInput.Seg />
	<SegmentInput.Seg />
</SegmentInput>
```

```html
<abm-segment-input>
  <input>
  <input>
  <input>
  <input>
  <input>
  <input>
</abm-segment-input>
```

# Properties

## `handleStep`
Step handler, handler function parameter is `(input: HTMLInputElement, delta: number)`. `delta` is always an integer and never 0.
After setting the step handler, arrow keys can be used to set values. If [`slidable`](#slidable) is also enabled, sliding up and down on the input field to set values is allowed.

## `handleBlur`
Blur handler, handler function parameter is `(input: HTMLInputElement)`. Called when the input field loses focus.

## `handleInput`
Input handler, handler function parameter is `(input: HTMLInputElement, next: () => void)`. Calling `next` moves focus to the next input field. If the current input field is the last one, it has no effect.

## `valueFilter`
Input value filter, type is `string[] | undefined`, intercepted at the `keydown` stage. If set to `undefined`, all characters are allowed; if set to a string array, only characters in the array are allowed.

## `slidable`
Slidable, when enabled, values can be set by sliding up and down on the text input field. Requires [`handleStep`](#handlestep) to be configured to take effect.

## `value`
Form value. If the number of array elements set is greater than the number of input fields, excess elements will be ignored; if the number of array elements set is less than the number of input fields, the remaining input field values will be set to empty strings.
