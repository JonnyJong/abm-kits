---
title: Set
source: packages/abm-utils/src/collection/set.ts
---

```ts
import 'abm-utils/collection/set';
```

# Function `areSetEqual`
Checks if two sets are equal.
```ts
const set1 = new Set([1, 2, 3]);
const set2 = new Set([3, 2, 1]);
areSetEqual(set1, set2); // true

const set3 = new Set([1, 2, 3, 4]);
areSetEqual(set1, set3); // false
```

# Function `find`
Finds an element in a Set, similar to `Array.prototype.find`.
```ts
const set = new Set([1, 2, 3, 4, 5]);
find(set, (item) => item > 3); // 4
find(set, (item) => item > 5); // null
```

# Class `IterableWeakSet`
An `IterableWeakSet` class that implements the `Set` interface, used to store weak references to objects. When objects are garbage collected, they will be automatically removed from the set.

## Constructor Parameters
- `values`：Initial value array to add to the set (optional)

## Properties
- `size`：Gets the size of the set

## Methods
### `add(value)`
Adds a value to the set.
- Parameter：Value to add
- Return value：The set itself

### `clear()`
Clears the set.

### `delete(value)`
Removes a value from the set.
- Parameter：Value to delete
- Return value：Returns `true` if the value was successfully deleted, otherwise returns `false`

### `forEach(callbackfn, thisArg?)`
Iterates over each element in the set and executes the callback function for each element.
- Parameters：
  - `callbackfn` - Callback function executed for each element
  - `thisArg` - `this` value in the callback function (optional)

### `has(value)`
Checks if the set contains a certain value.
- Parameter：Value to check
- Return value：Returns `true` if the set contains the value, otherwise returns `false`

### `entries()`
Returns an iterator for iterating over all elements in the set.
- Return value：Iterator of each element in the set

### `keys()`
Returns an iterator for iterating over all keys in the set.
- Return value：Iterator of all keys in the set

### `values()`
Returns an iterator for iterating over all values in the set.
- Return value：Iterator of all values in the set

### `find(predicate)`
Returns the first value that satisfies the provided testing function. Otherwise returns `undefined`.
- Parameter：Testing function
- Return value：First value that satisfies the testing function, otherwise returns `undefined`

### `findAll(predicate)`
Returns all values that satisfy the provided testing function.
- Parameter：Testing function
- Return value：Array of all values that satisfy the testing function