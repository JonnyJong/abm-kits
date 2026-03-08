---
title: Navigate
source: packages/abm-ui/src/navigate
---

```ts
import 'abm-ui/navigate';
```

# Object `navigate`

## Function `nav`
- `(direction: Vec2 | Direction8)`: Navigate in the specified direction
- `(direction: 'prev' | 'next', from?: Navigable)`: Navigate in DOM order

## Function `back`
Global back.

After pressing the bound back key (default <abm-hint-key key="Escape"></abm-hint-key>, <abm-hint-gamepad key="B"></abm-hint-gamepad>), if there is no locked navigation focus and the navigation focus and navigation root element have not changed, global back will be automatically triggered.

*On Android, this function can be called when receiving a global back event.*

## Function `addLayer`
Add navigation layer, parameters:
- `root`: Root element
- `current`: New layer focus, optional

## Function `rmLayer`
Remove navigation layer, parameters:
- `root`: Root element

## Function `lock`
Lock navigation focus to the specified element.

## Function `unlock`
Unlock navigation focus.

## Function `setCurrent`
Set current navigation focus.

## Property `onBack`
Global back handler.

## Property `disableRootCallback`
Disable root element navigation state callback.

## Object `keyboard`
Keyboard-related settings.

### Property `disabled`
Disable navigation, default `false`.

## Object `gameController`
Game controller-related.

### Property `disabled`
Disable game controller, default `false`.

### Property `index`
Active game controller ID, default `0`.

### Property `ls`
Enable left stick navigation, default `true`.

### Property `rs`
Enable right stick navigation, default `false`.

# Interface `Navigable`
Navigable element interface, inherits from [`HTMLElement`](https://developer.mozilla.org/docs/Web/API/HTMLElement).
- `nonNavigable`: Disable navigation
- `navCallback`: Navigation state callback
- `navParent`: Parent navigation element
- `navChildren`: Child navigation element list

# Type `NavState`
This type is a union of the following types:
- `{ type: 'focus' | 'blur' }`: Focus state
- `{ type: 'active' | 'cancel'; down: boolean }`: Activation, cancel state
- `{ type: 'nav'; direction: 'prev' | 'next' }`: DOM order navigation state
- `{ type: 'direction'; direction: Vec2 }`: Direction navigation state
- `{ type: 'stick'; x: number; y: number }`: Stick state
- `{ type: 'back' }`: Global back