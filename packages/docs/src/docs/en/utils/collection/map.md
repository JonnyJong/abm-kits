---
title: Map
source: packages/abm-utils/src/collection/map.ts
---

```ts
import 'abm-utils/collection/map';
```

# Class `TwoKeyMap`
Two-dimensional mapping table that uses two keys (`K1`, `K2`) to index values (`V`). It's an encapsulation of `Map<K1, Map<K2, V>>`, providing a more convenient operation interface.

## Methods
### `has(k1, k2)`
Checks if a value specified by two keys exists.
- Parameters:
  - `k1`: First dimension key
  - `k2`: Second dimension key
- Return value: Returns `true` if the value corresponding to the two keys exists, otherwise returns `false`

### `get(k1, k2)`
Gets the value corresponding to the two keys.
- Parameters:
  - `k1`: First dimension key
  - `k2`: Second dimension key
- Return value: The corresponding value, or `undefined` if it doesn't exist

### `set(k1, k2, value)`
Sets the value corresponding to the specified keys.
- Parameters:
  - `k1`: First dimension key
  - `k2`: Second dimension key
  - `value`: The value to set
- Return value: Returns the current instance, supporting method chaining

### `delete(k1, k2)`
Deletes the value specified by the two keys.
- Parameters:
  - `k1`: First dimension key
  - `k2`: Second dimension key
- Return value: Returns `true` if successfully deleted, returns `false` if the keys don't exist

### `hasInnerMap(k1)`
Checks if there's an inner Map corresponding to the specified first dimension key.
- Parameter: `k1`: First dimension key
- Return value: Returns `true` if the corresponding inner Map exists, otherwise returns `false`

### `getInnerMap(k1)`
Gets the inner Map corresponding to the first dimension key (containing all second dimension key-value pairs).
- Parameter: `k1`: First dimension key
- Return value: The corresponding inner Map, or `undefined` if it doesn't exist

### `setInnerMap(k1, innerMap)`
Sets the inner Map corresponding to the first dimension key.
- Parameters:
  - `k1`: First dimension key
  - `innerMap`: The inner Map to set
- Return value: Returns the current instance, supporting method chaining
- Exception: Throws `TypeError` if the passed parameter is not a Map instance

### `deleteInnerMap(k1)`
Deletes the entire inner Map corresponding to the first dimension key.
- Parameter: `k1`: First dimension key
- Return value: Returns `true` if successfully deleted, returns `false` if the key doesn't exist

### `entries()`
Returns the default iterator of the outer map, iterating over first dimension keys and their corresponding inner Maps.
- Return value: Iterator of first dimension keys and their corresponding inner Maps

### `innerEntries()`
Iterates over all inner map key-value pairs, generating an iterator of second dimension keys and values.
- Return value: Iterator of second dimension keys and values

### `allEntries()`
Iterates over all entries, generating a full triplet iterator.
- Return value: Iterator of full triplets (k1, k2, v)

### `keys1()`
Returns an iterator of all first dimension keys.
- Return value: Iterator of first dimension keys

### `keys2()`
Iterates over all second dimension keys, generating an iterator for them.
- Return value: Iterator of second dimension keys

### `values()`
Iterates over all stored values, generating an iterator for them.
- Return value: Iterator of values

# Class `SetMap`
Multi-value mapping collection that maps keys to sets of values. Each key corresponds to a set of unique values, suitable for one-to-many relationship data structures.

## Properties
- `size`: Gets the number of keys in the current map

## Methods
### `hasKey(key)`
Checks if the specified key is contained.
- Parameter: `key` - The key to check
- Return value: Returns `true` if the key is contained, otherwise returns `false`

### `has(key, value)`
Checks if the specified key-value pair is contained.
- Parameters:
  - `key` - The key to check
  - `value` - The value to check
- Return value: Returns `true` if the key-value pair is contained, otherwise returns `false`

### `get(key)`
Gets the value set corresponding to the specified key.
- Parameter: `key` - The key to query
- Return value: The corresponding value set, or `undefined` if the key doesn't exist

### `getOne(key)`
Gets any one value from the value set corresponding to the specified key.
- Parameter: `key` - The key to query
- Return value: Any one value from the corresponding value set, or `undefined` if the key doesn't exist or the value set is empty

### `set(key, values)`
Sets the value set corresponding to the specified key (replacing existing values).
- Parameters:
  - `key` - The key to set
  - `values` - The value set to set (iterable)
- Return value: Current SetMap instance (supports method chaining)

### `add(key, value)`
Adds a value to the value set corresponding to the specified key.
- Parameters:
  - `key` - The key to add value to
  - `value` - The value to add
- Return value: Current SetMap instance (supports method chaining)

### `delete(key, value)`
Removes a value from the value set corresponding to the specified key.
- Parameters:
  - `key` - The key to remove value from
  - `value` - The value to remove
- Return value: Current SetMap instance (supports method chaining)

### `deleteKey(key)`
Deletes the entire key and its corresponding value set.
- Parameter: `key` - The key to delete
- Return value: Current SetMap instance (supports method chaining)

### `clear()`
Clears all mapping relationships.
- Return value: Current SetMap instance (supports method chaining)

### `entries()`
Gets an iterator of key-value pairs.
- Return value: Returns an iterator of key-value pairs, where each value is a Set<V>

### `keys()`
Gets an iterator of all keys.
- Return value: Returns an iterator of keys

### `values()`
Gets an iterator of all value sets.
- Return value: Returns an iterator of value sets

# Class `BiMap`
Bidirectional mapping graph that supports bidirectional lookup from left key to right value and from right value to left key.

## Properties
- `size`: Gets the number of key-value pairs
- `inverse`: Gets the reverse view, type is `BiMap<R, L>`

## Methods
### `clear()`
Clears all key-value pairs.

### `delete(left)`
Deletes the corresponding key-value pair by left key.
- Parameter: `left` - The left key to delete
- Return value: Returns `true` if the key-value pair exists and was deleted, otherwise returns `false`

### `forEach(callbackfn, thisArg?)`
Iterates over all key-value pairs in the BiMap.
- Parameters:
  - `callbackfn` - Function called for each key-value pair, receiving three parameters: right value, left key, and the BiMap itself
  - `thisArg` - The this value to use when executing callbackfn (optional)

### `get(left)`
Gets the corresponding right value by left key.
- Parameter: `left` - The left key to look up
- Return value: Returns the corresponding right value if it exists, otherwise returns `undefined`

### `has(left)`
Checks if the specified left key exists in the BiMap.
- Parameter: `left` - The left key to check
- Return value: Returns `true` if it exists, otherwise returns `false`

### `set(left, right)`
Sets or updates a key-value pair.
- Parameters:
  - `left` - Left key
  - `right` - Right value
- Return value: Returns the BiMap instance itself, supporting method chaining

### `entries()`
Returns an iterator containing all [left key, right value] pairs.
- Return value: Iterator of [left key, right value] pairs

### `keys()`
Returns an iterator containing all left keys.
- Return value: Iterator of left keys

### `values()`
Returns an iterator containing all right values.
- Return value: Iterator of right values