---
title: Grid
source: packages/abm-ui/src/prefab/grid.ts
---

# Usage
:::Global Import
```ts
import { PrefabGridItem } from 'abm-ui';
```
:::On-demand Import
```ts
import { PrefabGridItem } from 'abm-ui/prefab/grid-item';
```
:::

{{[demo](../../../demo/component/grid-prefab.tsx)}}

# Class `PrefabGridItem`
Prefab grid item component, with Shadow DOM attached internally, which contains a slot.

## Static Method `creator`
Create a grid item element creation function. Creation parameters are as follows:

Directly pass a render function:
```ts
(self: GridItem<T>) => {
  self.replaceChildren(String(self.value));
};
```

Complete creation parameters:
- `render(self: GridItem<T>): any`，Render function, used to render the content of the grid item, when the value of the grid item changes, this function will be called for rendering
- `init(self: GridItem<T>): void`，Initialization function, used to initialize the state of the grid item, default value is an empty function
- `activeTrigger`：Activation trigger element, if set to `true`, it means the grid item is a trigger
- `selectTrigger`：Selection trigger element, if set to `true`, it means the grid item is a selector
- `hoverable`：Whether hoverable, if set to `true`, it means the grid item is hoverable
- `activatable`：Whether activatable, if set to `true`, it means the grid item is activatable
- `navigable`：Whether navigable, if set to `true`, it means the grid item is navigable
- `style`：Custom grid item style