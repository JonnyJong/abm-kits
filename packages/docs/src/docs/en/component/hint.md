---
title: Hint
source: packages/abm-ui/src/component/hint
---

# `<Hint>`
Operation hint component, used to display appropriate operation hints based on the user's operation method.

## Usage
:::Global Import
```ts
import { Hint } from 'abm-ui';
```
:::On-demand Import
```ts
import { Hint } from 'abm-ui/component/hint/hint';
```
:::Registration Import
```ts
import 'abm-ui/component/hint/hint';
```
:::

```tsx
<Hint>
  <div slot="mouse">
    {'Use'}
    <MouseHint key="Left" />
    {'to activate the button, use'}
    <KeyHint key="ArrowUp" />
    <KeyHint key="ArrowRight" />
    <KeyHint key="ArrowDown" />
    <KeyHint key="ArrowLeft" />
  </div>
  <div slot="gamepad">
    {'Use'}
    <GamepadHint key="A" />
    {'to activate the button, use'}
    <GamepadHint key="Up" />
    <GamepadHint key="Right" />
    <GamepadHint key="Down" />
    <GamepadHint key="Left" />
  </div>
  <div slot="pen">
    {'Use'}
    <PenHint key="Tap" />
    {'to activate the button, use'}
    <KeyHint key="ArrowUp" />
    <KeyHint key="ArrowRight" />
    <KeyHint key="ArrowDown" />
    <KeyHint key="ArrowLeft" />
  </div>
  <div slot="touch">
    {'Use'}
    <TouchHint key="Tap" />
    {'to activate the button'}
  </div>
</Hint>
```

```html
<abm-hint>
  <div slot="mouse">
    Use
    <abm-hint-mouse key="Left"></abm-hint-mouse>
    to activate the button, use
    <abm-hint-key key="ArrowUp"></abm-hint-key>
    <abm-hint-key key="ArrowRight"></abm-hint-key>
    <abm-hint-key key="ArrowDown"></abm-hint-key>
    <abm-hint-key key="ArrowLeft"></abm-hint-key>
  </div>
  <div slot="gamepad">
    Use
    <abm-hint-gamepad key="A"></abm-hint-gamepad>
    to activate the button, use
    <abm-hint-gamepad key="Up"></abm-hint-gamepad>
    <abm-hint-gamepad key="Right"></abm-hint-gamepad>
    <abm-hint-gamepad key="Down"></abm-hint-gamepad>
    <abm-hint-gamepad key="Left"></abm-hint-gamepad>
  </div>
  <div slot="pen">
    Use
    <abm-hint-pen key="Tap"></abm-hint-pen>
    to activate the button, use
    <abm-hint-key key="ArrowUp"></abm-hint-key>
    <abm-hint-key key="ArrowRight"></abm-hint-key>
    <abm-hint-key key="ArrowDown"></abm-hint-key>
    <abm-hint-key key="ArrowLeft"></abm-hint-key>
  </div>
  <div slot="touch">
    Use
    <abm-hint-touch key="Tap"></abm-hint-touch>
    to activate the button
  </div>
</abm-hint>
```

<div class="preview">
  <abm-hint>
    <div slot="mouse">
      Use
      <abm-hint-mouse key="Left"></abm-hint-mouse>
      to activate the button, use
      <abm-hint-key key="ArrowUp"></abm-hint-key>
      <abm-hint-key key="ArrowRight"></abm-hint-key>
      <abm-hint-key key="ArrowDown"></abm-hint-key>
      <abm-hint-key key="ArrowLeft"></abm-hint-key>
    </div>
    <div slot="gamepad">
      Use
      <abm-hint-gamepad key="A"></abm-hint-gamepad>
      to activate the button, use
      <abm-hint-gamepad key="Up"></abm-hint-gamepad>
      <abm-hint-gamepad key="Right"></abm-hint-gamepad>
      <abm-hint-gamepad key="Down"></abm-hint-gamepad>
      <abm-hint-gamepad key="Left"></abm-hint-gamepad>
    </div>
    <div slot="pen">
      Use
      <abm-hint-pen key="Tap"></abm-hint-pen>
      to activate the button, use
      <abm-hint-key key="ArrowUp"></abm-hint-key>
      <abm-hint-key key="ArrowRight"></abm-hint-key>
      <abm-hint-key key="ArrowDown"></abm-hint-key>
      <abm-hint-key key="ArrowLeft"></abm-hint-key>
    </div>
    <div slot="touch">
      Use
      <abm-hint-touch key="Tap"></abm-hint-touch>
      to activate the button
    </div>
  </abm-hint>
</div>

## Properties `mouse`, `gamepad`, `touch`, `pen`
Used to get/set operation hints for mouse, gamepad, touch, and pen respectively.

## Slots

| Slot Name | Description |
| --------- | ----------- |
| `mouse`   | Mouse operation hint |
| `gamepad` | Gamepad operation hint |
| `touch`   | Touch operation hint |
| `pen`     | Pen operation hint |

---

# `<KeyHint>`
Key hint component, used to display keyboard keys corresponding to key operations.

## Usage
:::Global Import
```ts
import { KeyHint } from 'abm-ui';
```
:::On-demand Import
```ts
import { KeyHint } from 'abm-ui/component/hint/key';
```
:::Registration Import
```ts
import 'abm-ui/component/hint/key';
```
:::

```tsx
<KeyHint key="Enter"/>
```

```html
<abm-hint-key key="Enter"></abm-hint-key>
```

## Property `key`
[`KeyCode`](../input/keyboard#type-keycode) type, represents the key to display.

+++Preview All Hints
| Value               | Preview                                               |
| ------------------- | ---------------------------------------------------- |
| *`undefined`*       | <abm-hint-key></abm-hint-key>                        |
| `Escape`            | <abm-hint-key key="Escape"></abm-hint-key>         |
| `F1`                | <abm-hint-key key="F1"></abm-hint-key>             |
| `F2`                | <abm-hint-key key="F2"></abm-hint-key>             |
| `F3`                | <abm-hint-key key="F3"></abm-hint-key>             |
| `F4`                | <abm-hint-key key="F4"></abm-hint-key>             |
| `F5`                | <abm-hint-key key="F5"></abm-hint-key>             |
| `F6`                | <abm-hint-key key="F6"></abm-hint-key>             |
| `F7`                | <abm-hint-key key="F7"></abm-hint-key>             |
| `F8`                | <abm-hint-key key="F8"></abm-hint-key>             |
| `F9`                | <abm-hint-key key="F9"></abm-hint-key>             |
| `F10`               | <abm-hint-key key="F10"></abm-hint-key>            |
| `F11`               | <abm-hint-key key="F11"></abm-hint-key>            |
| `F12`               | <abm-hint-key key="F12"></abm-hint-key>            |
| `F13`               | <abm-hint-key key="F13"></abm-hint-key>            |
| `F14`               | <abm-hint-key key="F14"></abm-hint-key>            |
| `F15`               | <abm-hint-key key="F15"></abm-hint-key>            |
| `F16`               | <abm-hint-key key="F16"></abm-hint-key>            |
| `F17`               | <abm-hint-key key="F17"></abm-hint-key>            |
| `F18`               | <abm-hint-key key="F18"></abm-hint-key>            |
| `F19`               | <abm-hint-key key="F19"></abm-hint-key>            |
| `F20`               | <abm-hint-key key="F20"></abm-hint-key>            |
| `CapsLock`          | <abm-hint-key key="CapsLock"></abm-hint-key>       |
| `ControlLeft`       | <abm-hint-key key="ControlLeft"></abm-hint-key>    |
| `AltLeft`           | <abm-hint-key key="AltLeft"></abm-hint-key>        |
| `ShiftLeft`         | <abm-hint-key key="ShiftLeft"></abm-hint-key>      |
| `ControlRight`      | <abm-hint-key key="ControlRight"></abm-hint-key>   |
| `AltRight`          | <abm-hint-key key="AltRight"></abm-hint-key>       |
| `ShiftRight`        | <abm-hint-key key="ShiftRight"></abm-hint-key>     |
| `Tab`               | <abm-hint-key key="Tab"></abm-hint-key>            |
| `Backquote`         | <abm-hint-key key="Backquote"></abm-hint-key>      |
| `Digit0`            | <abm-hint-key key="Digit0"></abm-hint-key>         |
| `Digit1`            | <abm-hint-key key="Digit1"></abm-hint-key>         |
| `Digit2`            | <abm-hint-key key="Digit2"></abm-hint-key>         |
| `Digit3`            | <abm-hint-key key="Digit3"></abm-hint-key>         |
| `Digit4`            | <abm-hint-key key="Digit4"></abm-hint-key>         |
| `Digit5`            | <abm-hint-key key="Digit5"></abm-hint-key>         |
| `Digit6`            | <abm-hint-key key="Digit6"></abm-hint-key>         |
| `Digit7`            | <abm-hint-key key="Digit7"></abm-hint-key>         |
| `Digit8`            | <abm-hint-key key="Digit8"></abm-hint-key>         |
| `Digit9`            | <abm-hint-key key="Digit9"></abm-hint-key>         |
| `Minus`             | <abm-hint-key key="Minus"></abm-hint-key>          |
| `Equal`             | <abm-hint-key key="Equal"></abm-hint-key>          |
| `Backspace`         | <abm-hint-key key="Backspace"></abm-hint-key>      |
| `Enter`             | <abm-hint-key key="Enter"></abm-hint-key>          |
| `BracketLeft`       | <abm-hint-key key="BracketLeft"></abm-hint-key>    |
| `BracketRight`      | <abm-hint-key key="BracketRight"></abm-hint-key>   |
| `Backslash`         | <abm-hint-key key="Backslash"></abm-hint-key>      |
| `Semicolon`         | <abm-hint-key key="Semicolon"></abm-hint-key>      |
| `Quote`             | <abm-hint-key key="Quote"></abm-hint-key>          |
| `Comma`             | <abm-hint-key key="Comma"></abm-hint-key>          |
| `Period`            | <abm-hint-key key="Period"></abm-hint-key>         |
| `Slash`             | <abm-hint-key key="Slash"></abm-hint-key>          |
| `Space`             | <abm-hint-key key="Space"></abm-hint-key>          |
| `Home`              | <abm-hint-key key="Home"></abm-hint-key>           |
| `End`               | <abm-hint-key key="End"></abm-hint-key>            |
| `PageUp`            | <abm-hint-key key="PageUp"></abm-hint-key>         |
| `PageDown`          | <abm-hint-key key="PageDown"></abm-hint-key>       |
| `ArrowUp`           | <abm-hint-key key="ArrowUp"></abm-hint-key>        |
| `ArrowRight`        | <abm-hint-key key="ArrowRight"></abm-hint-key>     |
| `ArrowDown`         | <abm-hint-key key="ArrowDown"></abm-hint-key>      |
| `ArrowLeft`         | <abm-hint-key key="ArrowLeft"></abm-hint-key>      |
| `KeyA`              | <abm-hint-key key="KeyA"></abm-hint-key>           |
| `KeyB`              | <abm-hint-key key="KeyB"></abm-hint-key>           |
| `KeyC`              | <abm-hint-key key="KeyC"></abm-hint-key>           |
| `KeyD`              | <abm-hint-key key="KeyD"></abm-hint-key>           |
| `KeyE`              | <abm-hint-key key="KeyE"></abm-hint-key>           |
| `KeyF`              | <abm-hint-key key="KeyF"></abm-hint-key>           |
| `KeyG`              | <abm-hint-key key="KeyG"></abm-hint-key>           |
| `KeyH`              | <abm-hint-key key="KeyH"></abm-hint-key>           |
| `KeyI`              | <abm-hint-key key="KeyI"></abm-hint-key>           |
| `KeyJ`              | <abm-hint-key key="KeyJ"></abm-hint-key>           |
| `KeyK`              | <abm-hint-key key="KeyK"></abm-hint-key>           |
| `KeyL`              | <abm-hint-key key="KeyL"></abm-hint-key>           |
| `KeyM`              | <abm-hint-key key="KeyM"></abm-hint-key>           |
| `KeyN`              | <abm-hint-key key="KeyN"></abm-hint-key>           |
| `KeyO`              | <abm-hint-key key="KeyO"></abm-hint-key>           |
| `KeyP`              | <abm-hint-key key="KeyP"></abm-hint-key>           |
| `KeyQ`              | <abm-hint-key key="KeyQ"></abm-hint-key>           |
| `KeyR`              | <abm-hint-key key="KeyR"></abm-hint-key>           |
| `KeyS`              | <abm-hint-key key="KeyS"></abm-hint-key>           |
| `KeyT`              | <abm-hint-key key="KeyT"></abm-hint-key>           |
| `KeyU`              | <abm-hint-key key="KeyU"></abm-hint-key>           |
| `KeyV`              | <abm-hint-key key="KeyV"></abm-hint-key>           |
| `KeyW`              | <abm-hint-key key="KeyW"></abm-hint-key>           |
| `KeyX`              | <abm-hint-key key="KeyX"></abm-hint-key>           |
| `KeyY`              | <abm-hint-key key="KeyY"></abm-hint-key>           |
| `KeyZ`              | <abm-hint-key key="KeyZ"></abm-hint-key>           |
| `Numpad0`           | <abm-hint-key key="Numpad0"></abm-hint-key>        |
| `Numpad1`           | <abm-hint-key key="Numpad1"></abm-hint-key>        |
| `Numpad2`           | <abm-hint-key key="Numpad2"></abm-hint-key>        |
| `Numpad3`           | <abm-hint-key key="Numpad3"></abm-hint-key>        |
| `Numpad4`           | <abm-hint-key key="Numpad4"></abm-hint-key>        |
| `Numpad5`           | <abm-hint-key key="Numpad5"></abm-hint-key>        |
| `Numpad6`           | <abm-hint-key key="Numpad6"></abm-hint-key>        |
| `Numpad7`           | <abm-hint-key key="Numpad7"></abm-hint-key>        |
| `Numpad8`           | <abm-hint-key key="Numpad8"></abm-hint-key>        |
| `Numpad9`           | <abm-hint-key key="Numpad9"></abm-hint-key>        |
| `NumpadAdd`         | <abm-hint-key key="NumpadAdd"></abm-hint-key>      |
| `NumpadSubtract`    | <abm-hint-key key="NumpadSubtract"></abm-hint-key> |
| `NumpadMultiply`    | <abm-hint-key key="NumpadMultiply"></abm-hint-key> |
| `NumpadDivide`      | <abm-hint-key key="NumpadDivide"></abm-hint-key>   |
| `NumpadDecimal`     | <abm-hint-key key="NumpadDecimal"></abm-hint-key>  |
+++

---

# `<MouseHint>`
Mouse hint component, used for mouse operation hints.

## Usage
:::Global Import
```ts
import { MouseHint } from 'abm-ui';
```
:::On-demand Import
```ts
import { MouseHint } from 'abm-ui/component/hint/mouse';
```
:::Registration Import
```ts
import 'abm-ui/component/hint/mouse';
```
:::

```tsx
<MouseHint key="Left"/>
```

```html
<abm-hint-mouse key="Left"></abm-hint-mouse>
```

## Property `key`
Represents the mouse hint to display.

| Value               | Preview                                                   | Description             |
| ------------------- | -------------------------------------------------------- | ----------------------- |
| *`undefined`*       | <abm-hint-mouse></abm-hint-mouse>                        | Unconfigured or invalid |
| `Move`              | <abm-hint-mouse key="Move"></abm-hint-mouse>           | Move in any direction   |
| `MoveHorizontal`    | <abm-hint-mouse key="MoveHorizontal"></abm-hint-mouse> | Move horizontally       |
| `MoveVertical`      | <abm-hint-mouse key="MoveVertical"></abm-hint-mouse>   | Move vertically         |
| `Wheel`             | <abm-hint-mouse key="Wheel"></abm-hint-mouse>          | Scroll wheel            |
| `WheelPress`        | <abm-hint-mouse key="WheelPress"></abm-hint-mouse>     | Press wheel             |
| `WheelUp`           | <abm-hint-mouse key="WheelUp"></abm-hint-mouse>        | Scroll wheel up         |
| `WheelDown`         | <abm-hint-mouse key="WheelDown"></abm-hint-mouse>      | Scroll wheel down       |
| `Left`              | <abm-hint-mouse key="Left"></abm-hint-mouse>           | Left click              |
| `Right`             | <abm-hint-mouse key="Right"></abm-hint-mouse>          | Right click             |

---

# `<PenHint>`
Pen hint component, used for pen operation hints.

## Usage
:::Global Import
```ts
import { PenHint } from 'abm-ui';
```
:::On-demand Import
```ts
import { PenHint } from 'abm-ui/component/hint/pen';
```
:::Registration Import
```ts
import 'abm-ui/component/hint/pen';
```
:::

```tsx
<PenHint key="Tap"/>
```

```html
<abm-hint-pen key="Tap"></abm-hint-pen>
```

## Property `key`
Represents the pen hint to display.

| Value               | Preview                                               | Description             |
| ------------------- | ---------------------------------------------------- | ----------------------- |
| *`undefined`*       | <abm-hint-pen></abm-hint-pen>                      | Unconfigured or invalid |
| `Tap`               | <abm-hint-pen key="Tap"></abm-hint-pen>            | Tap                     |
| `DualTap`           | <abm-hint-pen key="DualTap"></abm-hint-pen>        | Double tap              |
| `Hold`              | <abm-hint-pen key="Hold"></abm-hint-pen>           | Long press              |
| `Draw`              | <abm-hint-pen key="Draw"></abm-hint-pen>           | Draw                    |
| `DrawHorizontal`    | <abm-hint-pen key="DrawHorizontal"></abm-hint-pen> | Draw horizontally       |
| `DrawVertical`      | <abm-hint-pen key="DrawVertical"></abm-hint-pen>   | Draw vertically         |
| `Move`              | <abm-hint-pen key="Move"></abm-hint-pen>           | Move                    |
| `MoveHorizontal`    | <abm-hint-pen key="MoveHorizontal"></abm-hint-pen> | Move horizontally       |
| `MoveVertical`      | <abm-hint-pen key="MoveVertical"></abm-hint-pen>   | Move vertically         |

---

# `<GamepadHint>`
Gamepad hint component, used for gamepad operation hints.

## Usage
:::Global Import
```ts
import { GamepadHint } from 'abm-ui';
```
:::On-demand Import
```ts
import { GamepadHint } from 'abm-ui/component/hint/gamepad';
```
:::Registration Import
```ts
import 'abm-ui/component/hint/gamepad';
```
:::

```tsx
<GamepadHint key="A"/>
```

```html
<abm-hint-gamepad key="A"></abm-hint-gamepad>
```

## Property `key`
Represents the gamepad hint to display.

| Value            | Preview                                              | Description             |
| ---------------- | --------------------------------------------------- | ----------------------- |
| *`undefined`*    | <abm-hint-gamepad></abm-hint-gamepad>             | Unconfigured or invalid |
| `A`              | <abm-hint-gamepad key="A"></abm-hint-gamepad>     | A button                |
| `B`              | <abm-hint-gamepad key="B"></abm-hint-gamepad>     | B button                |
| `X`              | <abm-hint-gamepad key="X"></abm-hint-gamepad>     | X button                |
| `Y`              | <abm-hint-gamepad key="Y"></abm-hint-gamepad>     | Y button                |
| `LB`             | <abm-hint-gamepad key="LB"></abm-hint-gamepad>    | Left shoulder button    |
| `RB`             | <abm-hint-gamepad key="RB"></abm-hint-gamepad>    | Right shoulder button   |
| `LT`             | <abm-hint-gamepad key="LT"></abm-hint-gamepad>    | Left trigger            |
| `RT`             | <abm-hint-gamepad key="RT"></abm-hint-gamepad>    | Right trigger           |
| `BACK`           | <abm-hint-gamepad key="BACK"></abm-hint-gamepad>  | Back button             |
| `START`          | <abm-hint-gamepad key="START"></abm-hint-gamepad> | Start button            |
| `LSB`            | <abm-hint-gamepad key="LSB"></abm-hint-gamepad>   | Left stick press        |
| `RSB`            | <abm-hint-gamepad key="RSB"></abm-hint-gamepad>   | Right stick press       |
| `UP`             | <abm-hint-gamepad key="UP"></abm-hint-gamepad>    | Up directional pad      |
| `DOWN`           | <abm-hint-gamepad key="DOWN"></abm-hint-gamepad>  | Down directional pad    |
| `LEFT`           | <abm-hint-gamepad key="LEFT"></abm-hint-gamepad>  | Left directional pad    |
| `RIGHT`          | <abm-hint-gamepad key="RIGHT"></abm-hint-gamepad> | Right directional pad   |
| `HOME`           | <abm-hint-gamepad key="HOME"></abm-hint-gamepad>  | Home button             |
| `LS`             | <abm-hint-gamepad key="LS"></abm-hint-gamepad>    | Left stick              |
| `RS`             | <abm-hint-gamepad key="RS"></abm-hint-gamepad>    | Right stick             |

## CSS Variables

| Variable Name  | Default Value                                           | Description |
| -------------- | ------------------------------------------------------ | ----------- |
| `--gamepad-a`  | `light-dark(oklch(.6 .2 142), oklch(.7 .2 142))` | Button A    |
| `--gamepad-b`  | `light-dark(oklch(.6 .2 20), oklch(.7 .2 20))`   | Button B    |
| `--gamepad-x`  | `light-dark(oklch(.6 .2 240), oklch(.7 .2 240))` | Button X    |
| `--gamepad-y`  | `light-dark(oklch(.6 .2 90), oklch(.7 .2 90))`   | Button Y    |

---

# `<TouchHint>`
Touch hint component, used for touch operation hints.

## Usage
:::Global Import
```ts
import { TouchHint } from 'abm-ui';
```
:::On-demand Import
```ts
import { TouchHint } from 'abm-ui/component/hint/touch';
```
:::Registration Import
```ts
import 'abm-ui/component/hint/touch';
```
:::

```tsx
<TouchHint key="Tap"/>
```

```html
<abm-hint-touch key="Tap"></abm-hint-touch>
```

## Property `key`
Represents the touch hint to display.

| Value            | Preview                                              | Description             |
| ---------------- | --------------------------------------------------- | ----------------------- |
| *`undefined`*    | <abm-hint-touch></abm-hint-touch>                 | Unconfigured or invalid |
| `Tap`            | <abm-hint-touch key="Tap"></abm-hint-touch>       | Tap                     |
| `DualTap`        | <abm-hint-touch key="DualTap"></abm-hint-touch>   | Double tap              |
| `Hold`           | <abm-hint-touch key="Hold"></abm-hint-touch>      | Long press              |
| `Move`           | <abm-hint-touch key="Move"></abm-hint-touch>      | Move                    |
| `SwapUp`         | <abm-hint-touch key="SwapUp"></abm-hint-touch>    | Swipe up                |
| `SwapRight`      | <abm-hint-touch key="SwapRight"></abm-hint-touch> | Swipe right             |
| `SwapDown`       | <abm-hint-touch key="SwapDown"></abm-hint-touch>  | Swipe down              |
| `SwapLeft`       | <abm-hint-touch key="SwapLeft"></abm-hint-touch>  | Swipe left              |