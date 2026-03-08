---
title: Math
source: packages/abm-utils/src/math.ts
---

```ts
import 'abm-utils/math';
```

# Function `clamp`
Restricts a value within a specified range.

# Function `wrapInRange`
Circularly restricts a value within a specified range.
```ts
wrapInRange(4, 5); // 4
wrapInRange(5, 5); // 5
wrapInRange(5.5, 5); // 0.5
wrapInRange(4, 5, 1); // 4
wrapInRange(5, 5, 1); // 5
wrapInRange(5.5, 5, 1); // 1.5
```

# Function `steppedClamp`
Restricts a value within a specified range and rounds it according to the specified step.
```ts
steppedClamp(0, 10, 5.5, 1) // 6
steppedClamp(0, 10, 5.2, 1) // 5
steppedClamp(0, 10, 15, 1) // 10
steppedClamp(0, 10, -5, 1) // 0
steppedClamp(0, 10, 5.5, 0) // 5.5
```

# Function `formatWithStep`
Formats a number, preserving the specified decimal places and adding step units.

# Function `normalizeCSSFourValue`
Normalizes CSS four-value syntax, converting it to a standard format.
```ts
normalizeCSSFourValue(1); // [1, 1, 1, 1]
normalizeCSSFourValue([1]); // [1, 1, 1, 1]
normalizeCSSFourValue([1, 2]); // [1, 2, 1, 2]
normalizeCSSFourValue([1, 2, 3]); // [1, 2, 3, 2]
normalizeCSSFourValue([1, 2, 3, 4]); // [1, 2, 3, 4]
```

## Type `CSSFourValue`
CSS four-value syntax, in the order of top, right, bottom, left.

# Function `createLinearMapper`
Creates a linear mapper for mapping a value from one range to another.

# Function `resolveStep`
Recalculates a reasonable step when the input step is 0.