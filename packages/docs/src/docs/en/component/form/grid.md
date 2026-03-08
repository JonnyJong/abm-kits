---
title: Grid
source: packages/abm-ui/src/component/grid.ts
---

This component's form type is `T[]`.

# Usage
:::Global Import
```ts
import { Grid, GridItem } from 'abm-ui';
```
:::On-demand Import
```ts
import { Grid, GridItem } from 'abm-ui/component/grid';
```
:::Registration Import
```ts
import 'abm-ui/component/grid';
```
:::

## Using Custom Elements
To create grid items through custom elements, you need to inherit from the [`GridItem`](#class-griditem) class and register the custom element.
{{[demo](../../../../demo/component/grid-custom.tsx)}}

## Using Prefab UI
For more information, please refer to [Prefab UI/Grid](../../prefab/grid#static-method-creator).
:::Global Import
```ts
import { PrefabGridItem } from 'abm-ui';
```
:::On-demand Import
```ts
import { PrefabGridItem } from 'abm-ui/prefab/grid';
```
:::

{{[demo](../../../../demo/component/grid-prefab.tsx)}}

# Properties

## `items`
Grid item list, read-only.

## `itemCreator`
Grid item creation function, used to create grid items.

## `selectType`
Selection type, optional values are `null`, `single`, `multi`.

## `hGap`
Horizontal gap, in pixels.

## `vGap`
Vertical gap, in pixels.

# Methods

## `filter`
Filter and display grid items based on conditions.

| Condition Parameter                    | Description |
| ------------------------------------- | ----------- |
| `true`                                | Hide all |
| `false`, `null`, `undefined`          | Show all |
| `number[]`                            | Show grid items with specified indexes |
| `(item: T, index: number) => boolean` | Custom filter function, returns `true` to show the grid item |

## `select`
Select grid items based on conditions.

| Condition Parameter                    | Description |
| ------------------------------------- | ----------- |
| `true`                                | Select all |
| `false`, `null`, `undefined`          | Deselect all |
| `number[]`                            | Select grid items with specified indexes |
| `(item: T, index: number) => boolean` | Custom selection function, returns `true` to select the grid item |

## `getSelected`
Get the list of currently selected grid item data.

## `getSelectedIndex`
Get the list of currently selected grid item indexes.

# Events
| Event Name | Parameter List              | Description |
| ---------- | --------------------------- | ----------- |
| `active`   | `(value: T, index: number)` | Grid item is activated |
| `select`   | `()`                        | Grid item is selected/deselected |

---

# Class `GridItem`

This class has a generic `T` representing the value type of the grid item.

## Properties

### `host`
Get the current grid item host, type `Grid<T>`, available after the construction phase.

### `value`
Type `T`, representing the current grid item data.

### `activeTrigger`
Activation event trigger, users can click this element to trigger the activation event, need to ensure the accessibility of this element.

### `selectTrigger`
Selection trigger, users can click this element to trigger the selection event, need to ensure the accessibility of this element.

## Methods

### `active`
Activate the current grid item, trigger the `active` event.