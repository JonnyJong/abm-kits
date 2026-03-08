---
title: Keyed Component Base Class
source: packages/abm-ui/src/component/keyed.ts
order: 1
---

# Usage
:::Global Import
```ts
import { KeyedComponent } from 'abm-ui';
```
:::On-demand Import
```ts
import { KeyedComponent } from 'abm-ui/component/keyed';
```
:::

# Class `KeyedComponent`
This class is abstract.

## Property `key`
Key, string type, automatically calls the `update` method when updated.

## Methods

### `update`
Key update callback, no default implementation, automatically called when key is updated.

### `initial`
Initial key value.

### `validate`
Checks the key, returns `false` if check fails, no default implementation.

### `parse`
Used to convert key type, no default implementation.

### `init`
This class implements the `init` method. If you need to override it, make sure to call `super.init()` at the beginning of the overridden method.

### `clone`
This class implements the `clone` method. If you need to override it, you may need to call `super.clone(from)`.