---
title: State Management
source: packages/abm-ui/src/state
---

```ts
import 'abm-ui/state/index';
```

# Hover State
Hover state can only be triggered by mouse, pen, keyboard, or game controller.

| Function         | Description |
| ---------------- | ----------- |
| `state.hover.add` | Add the target element to hover state processing |
| `state.hover.rm`  | Remove the target element from hover state processing |
| `state.hover.on`  | Add hover state handler to the target element |
| `state.hover.off` | Remove hover state handler from the target element |
| `state.hover.set` | Set the hover state of the target element |

# Active State
Active state can be triggered by all interaction methods.

| Function          | Description |
| ----------------- | ----------- |
| `state.active.add` | Add the target element to active state processing |
| `state.active.rm`  | Remove the target element from active state processing |
| `state.active.on`  | Add active state handler to the target element |
| `state.active.off` | Remove active state handler from the target element |
| `state.active.set` | Set the active state of the target element |