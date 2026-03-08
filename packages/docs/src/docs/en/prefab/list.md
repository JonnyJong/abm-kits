---
title: List
source: packages/abm-ui/src/prefab/list.ts
---

# Usage
:::Global Import
```ts
import { List } from 'abm-ui';
```
:::On-demand Import
```ts
import { List } from 'abm-ui/prefab/list';
```
:::

{{[demo](../../../demo/component/list-prefab.tsx)}}

# Class `PrefabListItem`
Prefab list item component, with Shadow DOM attached internally, which contains a slot.

## Static Method `creator`
Create a list item element creation function. Creation parameters are as follows:

Directly pass a render function:
```ts
(self: ListItem<T>) => {
  self.replaceChildren(String(self.value));
}
```

Complete creation parameters:
- `render(self: ListItem<T>): any`，Render function, used to render the content of the list item, when the value of the list item changes, this function will be called for rendering
- `init(self: ListItem<T>): void`，Initialization function, used to initialize the state of the list item, default value is an empty function
- `activeTrigger`：Activation trigger element, if set to `true`, it means the list item is a trigger
- `selectTrigger`：Selection trigger element, if set to `true`, it means the list item is a selector
- `dragHandle`：Drag handle element, if set to `true`, it means the list item is a drag handle
- `hoverable`：Whether hoverable, if set to `true`, it means the list item is hoverable
- `activatable`：Whether activatable, if set to `true`, it means the list item is activatable
- `navigable`：Whether navigable, if set to `true`, it means the list item is navigable
- `style`：Custom list item style