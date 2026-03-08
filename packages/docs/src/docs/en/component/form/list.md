---
title: List
source: packages/abm-ui/src/component/list.ts
---

This component's form type is `T[]`.

# Usage
:::Global Import
```ts
import { List, ListItem } from 'abm-ui';
```
:::On-demand Import
```ts
import { List, ListItem } from 'abm-ui/component/list';
```
:::Registration Import
```ts
import 'abm-ui/component/list';
```
:::

## Using Custom Elements
To create list items through custom elements, you need to inherit from the [`ListItem`](#class-listitem) class.
{{[demo](../../../../demo/component/list-custom.tsx)}}

## Using Prefab UI
For more information, please refer to [Prefab UI/List](../../prefab/list#static-method-creator).
:::Global Import
```ts
import { PrefabListItem } from 'abm-ui';
```
:::On-demand Import
```ts
import { PrefabListItem } from 'abm-ui/prefab/list';
```
:::

{{[demo](../../../../demo/component/list-prefab.tsx)}}

# Properties

## `items`
List item list, read-only.

## `itemCreator`
List item creation function, used to create list items.

## `selectType`
Selection type, optional values are `null`, `single`, `multi`.

## `mouseStartDelay`
Mouse sorting start delay, in milliseconds, default value is `0`.

## `penStartDelay`
Pen sorting start delay, in milliseconds, default value is `500`.

## `touchStartDelay`
Touch sorting start delay, in milliseconds, default value is `500`.

# Methods

## `filter`
Filter and display list items based on specified conditions.

| Condition Parameter                    | Description |
| ------------------------------------- | ----------- |
| `true`                                | Hide all |
| `false`, `null`, `undefined`          | Show all |
| `number[]`                            | Show list items with specified indexes |
| `(item: T, index: number) => boolean` | Custom filter function, returns `true` to show the list item |

## `select`
Select list items based on conditions.

| Condition Parameter                    | Description |
| ------------------------------------- | ----------- |
| `true`                                | Select all |
| `false`, `null`, `undefined`          | Deselect all |
| `number[]`                            | Select list items with specified indexes |
| `(item: T, index: number) => boolean` | Custom selection function, returns `true` to select the list item |

## `getSelected`
Get the list of currently selected list item data.

## `getSelectedIndex`
Get the list of currently selected list item indexes.

## `sort`
Sort list items.

---

# Class `ListItem`

This class has a generic `T` representing the value type of the list item.

## Properties

### `host`
Get the current list item host, type `List<T>`, available after the construction phase.

### `value`
Type `T`, representing the current list item value.

### `activeTrigger`
Activation event trigger, users can click this element to trigger the activation event, need to ensure the accessibility of this element.

### `selectTrigger`
Selection trigger, users can click this element to trigger the selection event, need to ensure the accessibility of this element.

### `dragHandle`
Drag handle, users can click this element to trigger drag events, need to ensure the accessibility of this element.

## Methods

### `active`
Activate the current list item, trigger the `active` event.

### `startSort`
Start sorting, call this method to notify that navigation-based sorting has started.

### `stopSort`
Stop sorting, call this method to notify that navigation-based sorting has ended.

### `handleNavSort`
Handle navigation sorting, after navigation sorting starts, navigation state information can be redirected here to automatically handle sorting.

### `sortStart`
When sorting actually starts, the list will call this method. You can override this method to customize the behavior when sorting starts.