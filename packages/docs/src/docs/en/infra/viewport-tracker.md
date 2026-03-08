---
title: Viewport Tracker
source: packages/abm-ui/src/infra/viewport-tacker.ts
---

# Object `viewportTracker`

## Function `lock`
Set the viewport tracking target to the specified element, ensuring the target element is visible within the viewport. When the target element is removed from the document tree, the tracking target is automatically removed.

## Function `unlock`
Remove the current viewport tracking target, only when the input target element is the same as the current tracking target.

## Functions `on` and `off`
Add or remove viewport tracking event listeners.

| Event Name | Parameter List | Description |
| ---------- | -------------- | ----------- |
| `scrolled` | `()`           | Triggered when the viewport is scrolled to make the target element visible |