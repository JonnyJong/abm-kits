---
title: Menu
source: packages/abm-ui/src/component/menu.ts
---

# Try It
{{[demo](../../../demo/widget/menu.tsx)}}

# Usage
:::Global Import
```ts
import { Menu, MenuItem } from 'abm-ui';
```
:::On-demand Import
```ts
import { Menu, MenuItem } from 'abm-ui/widget/menu';
```
:::

# Class `Menu`
Inherits from the [`MenuItem`](#class-menuitem) class.

## Methods

### `open`
Open the menu.

Supports the following type parameters:
- `Element`：Open the menu with the specified element as anchor
- `DOMRect`：Open the menu with the specified rectangle as anchor
- `Vec2`：Open the menu with the specified coordinates as anchor
- `MenuOpenOptions`：Menu open options
  - `origin`：Menu open origin, supports the following type parameters
    - `Element`：Open the menu with the specified element as anchor
    - `DOMRect`：Open the menu with the specified rectangle as anchor
    - `Vec2`：Open the menu with the specified coordinates as anchor
  - `preferSide`：Preferred side for menu display when opening, supports the following parameters
    - `top`：Prefer to display at the top
    - `bottom`：Prefer to display at the bottom
    - `left`：Prefer to display on the left
    - `right`：Prefer to display on the right
  - `preferAlign`：Preferred alignment for menu display when opening, supports the following parameters
    - `start`：Prefer to align at the start
    - `end`：Prefer to align at the end

### `close`
Close the menu.

# Class `MenuItem`

## Constructor Parameters
All constructor parameters are optional.

- `init`：MenuItem initialization parameters
  - `id`：MenuItem ID
  - `icon`：MenuItem icon
  - `label`：MenuItem label
  - `type`：MenuItem type
    - `menu`：Normal menu item
    - `separator`：Menu separator
    - `checkbox`：Checkbox menu item
  - `checked`：Whether the menu item is checked
  - `disabled`：Whether the menu item is disabled
  - `hidden`：Hide menu item
  - `action`：MenuItem click event
  - `submenu`：Submenu
  - `before`：Menu items to be arranged before this item in the list
  - `after`：Menu items to be arranged after this item in the list

## Properties
The menu item can be set through the following properties:

- `id`：MenuItem ID
- `icon`：MenuItem icon
- `label`：MenuItem label
- `type`：MenuItem type
- `checked`：Whether the menu item is checked
- `disabled`：Whether the menu item is disabled
- `hidden`：Hide menu item
- `action`：MenuItem click event

## Methods

### `prepend`
Insert multiple menu items before this menu item.

### `append`
Insert multiple menu items after this menu item.

### `insert`
Insert multiple menu items at the specified position.

### `getChildren`
Get child menu items.

### `clear`
Clear all child menu items.

### `clone`
Clone the menu item.