---
title: Iteration
source: packages/abm-utils/src/collection/iter.ts
---

```ts
import 'abm-utils/collection/iter';
```

# Generic `IterOr`
Declares a type `T` or an iterator or iterable with enumeration value type `T`.

# Generic `Iter`
Declares an iterator and iterable with enumeration value type `T`.

# Function `asIter`
Converts a type `T` or an iterator or iterable with enumeration value type `T` to an iterator and iterable.
```ts
// Single value
const iter1 = asIter(1);
iter1.next(); // { value: 1, done: false }
iter1.next(); // { value: undefined, done: true }

// Array
const iter2 = asIter([1, 2, 3]);
for (const item of iter2) {
  console.log(item); // 1, 2, 3
}
```

# Function `zip`
Iterates over multiple iterables or iterators simultaneously.
```ts
const numbers = [1, 2, 3];
const letters = ['a', 'b', 'c'];
for (const [num, char] of zip(numbers, letters)) {
  console.log(num, char); // 1 a, 2 b, 3 c
}
```