---
title: Array
source: packages/abm-utils/src/collection/array.ts
---

```ts
import 'abm-utils/collection/array';
```

# Generic `ArrayOr`
Declares a type `T` or an array of `T`.

# Function `asArray`
Converts a type `T` or an array of `T` to an array.
```ts
asArray(1); // [1]
asArray([1, 2, 3]); // [1, 2, 3]
```

# Function `range`
Generates a numeric array.
```ts
range(5); // [0, 1, 2, 3, 4]
range(1, 5); // [1, 2, 3, 4]
range(1, 5, 2); // [1, 3, 5]

const array = ['a', 'b', 'c'];
range(array); // [0, 1, 2]
```

# Function `shuffle`
Randomly shuffles the order of elements in an array.
```ts
const array = [1, 2, 3, 4, 5];
const shuffled = shuffle(array); // Example: [3, 1, 5, 2, 4]
shuffled === array; // true
```

# Function `shift`
Moves an element in the array from the specified `from` index to the `to` index.
```ts
const array = [1, 2, 3, 4, 5];
const shifted = shift(array, 2, 4); // [1, 2, 4, 3, 5]
shifted === array; // true
```

# Function `applyConditionalOperation`
Applies an operation to elements in the array based on a condition.
```ts
const array = [1, 2, 3, 4, 5];
applyConditionalOperation(
  array,
  (item, shouldApply) => console.log(`${item}: ${shouldApply}`),
  (item) => item % 2 === 0
);
// Output:
// 1: false
// 2: true
// 3: false
// 4: true
// 5: false
```

# Function `toReversed`
Reverses a copy of the given array and returns it, without modifying the original array.
```ts
const array = [1, 2, 3];
const reversed = toReversed(array);
console.log(reversed); // [3, 2, 1]
console.log(array); // [1, 2, 3] (original array unchanged)
```

# Function `createArray`
Creates an array of the specified length and initializes each element using a generator function.
```ts
createArray(5, (index) => index ** 2); // [0, 1, 4, 9, 16]
```

# Function `proxyArray`
Creates a proxy array that triggers an update function when elements are added or removed.

## Parameters
- `options`：Configuration options
  - `update`：Callback function when updated
  - `debounceDelay`：Debounce delay time (optional)
  - `set`：Callback function when adding elements (optional)
- `arr`：Array to proxy, defaults to empty array

## Example
```ts
const proxy = proxyArray({
  update: (target) => {
    console.log('Array updated:', target);
  },
}, [1, 2, 3]);

proxy.push(4); // Array updated: [1, 2, 3, 8]
proxy[0] = 5; // Array updated: [5, 2, 3, 8]
```

# Class `SyncList`
Synchronizes data list with instance list.

## Constructor Parameters
- `options`：Initialization options
  - `getData`：Function to get instance data
  - `setData`：Function to set instance data
  - `create`：Function to create instances
  - `reset`：Function to reset instances (optional)
  - `creatable`：Whether instances can be created (optional)
  - `update`：List update callback (optional)
  - `updateDelay`：List update debounce delay (optional)

## Properties
- `creatable`：Whether instances can be created
- `instances`：Instance list
- `data`：Data list
- `items`：Data proxy, this list can be safely exposed

## Methods
- `rebuild()`：Rebuilds all instances
- `replace(...items)`：Replaces the entire list

## Example
```ts
class Item {
  constructor(public value: number) {}
}

const syncList = new SyncList<number, Item>({
  getData: (item) => item.value,
  setData: (item, data) => { item.value = data; },
  create: (data) => new Item(data),
  creatable: true,
  update: () => console.log('List updated')
});

// Using items proxy
const items = syncList.items;
items.push(1, 2, 3); // List updated
console.log(items); // [1, 2, 3]

// Accessing instances
console.log(syncList.instances.length); // 3

// Toggling creatable status
syncList.creatable = false;
console.log(syncList.data); // [1, 2, 3]
console.log(syncList.instances.length); // 0
```

## Comparison between `proxyArray` and `SyncList`
### Similarities
- Both provide proxy mechanisms for array operations
- Both support triggering callback functions when the array changes
- Both support debounce delay

### Differences
- **Granularity**:
  - `proxyArray` is a proxy for a single array, focusing on changes to the array itself
  - `SyncList` is a bidirectional synchronization between data list and instance list, focusing on conversion between data and instances
- **Functionality**:
  - `proxyArray` mainly provides interception and callbacks for array operations
  - `SyncList` provides automatic conversion and synchronization between data and instances
- **Use Cases**:
  - `proxyArray` is suitable for scenarios where array changes need to be monitored
  - `SyncList` is suitable for scenarios where synchronization between data and instances needs to be maintained, such as UI component lists