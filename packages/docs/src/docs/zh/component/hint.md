---
title: 提示
source: packages/abm-ui/src/component/hint
---

# `<Hint>`
操作提示组件，用于根据用户的操作方式显示合适的操作提示信息。

## 使用
:::全局导入
```ts
import { Hint } from 'abm-ui';
```
:::按需导入
```ts
import { Hint } from 'abm-ui/component/hint/hint';
```
:::注册导入
```ts
import 'abm-ui/component/hint/hint';
```
:::

```tsx
<Hint>
  <div slot="mouse">
    {'使用'}
    <MouseHint key="Left" />
    {'来激活按钮，使用'}
    <KeyHint key="ArrowUp" />
    <KeyHint key="ArrowRight" />
    <KeyHint key="ArrowDown" />
    <KeyHint key="ArrowLeft" />
  </div>
  <div slot="gamepad">
    {'使用'}
    <GamepadHint key="A" />
    {'来激活按钮，使用'}
    <GamepadHint key="Up" />
    <GamepadHint key="Right" />
    <GamepadHint key="Down" />
    <GamepadHint key="Left" />
  </div>
  <div slot="pen">
    {'使用'}
    <PenHint key="Tap" />
    {'来激活按钮，使用'}
    <KeyHint key="ArrowUp" />
    <KeyHint key="ArrowRight" />
    <KeyHint key="ArrowDown" />
    <KeyHint key="ArrowLeft" />
  </div>
  <div slot="touch">
    {'使用'}
    <TouchHint key="Tap" />
    {'来激活按钮'}
  </div>
</Hint>
```

```html
<abm-hint>
  <div slot="mouse">
    使用
    <abm-hint-mouse key="Left"></abm-hint-mouse>
    来激活按钮，使用
    <abm-hint-key key="ArrowUp"></abm-hint-key>
    <abm-hint-key key="ArrowRight"></abm-hint-key>
    <abm-hint-key key="ArrowDown"></abm-hint-key>
    <abm-hint-key key="ArrowLeft"></abm-hint-key>
  </div>
  <div slot="gamepad">
    使用
    <abm-hint-gamepad key="A"></abm-hint-gamepad>
    来激活按钮，使用
    <abm-hint-gamepad key="Up"></abm-hint-gamepad>
    <abm-hint-gamepad key="Right"></abm-hint-gamepad>
    <abm-hint-gamepad key="Down"></abm-hint-gamepad>
    <abm-hint-gamepad key="Left"></abm-hint-gamepad>
  </div>
  <div slot="pen">
    使用
    <abm-hint-pen key="Tap"></abm-hint-pen>
    来激活按钮，使用
    <abm-hint-key key="ArrowUp"></abm-hint-key>
    <abm-hint-key key="ArrowRight"></abm-hint-key>
    <abm-hint-key key="ArrowDown"></abm-hint-key>
    <abm-hint-key key="ArrowLeft"></abm-hint-key>
  </div>
  <div slot="touch">
    使用
    <abm-hint-touch key="Tap"></abm-hint-touch>
    来激活按钮
  </div>
</abm-hint>
```

<div class="preview">
  <abm-hint>
    <div slot="mouse">
      使用
      <abm-hint-mouse key="Left"></abm-hint-mouse>
      来激活按钮，使用
      <abm-hint-key key="ArrowUp"></abm-hint-key>
      <abm-hint-key key="ArrowRight"></abm-hint-key>
      <abm-hint-key key="ArrowDown"></abm-hint-key>
      <abm-hint-key key="ArrowLeft"></abm-hint-key>
    </div>
    <div slot="gamepad">
      使用
      <abm-hint-gamepad key="A"></abm-hint-gamepad>
      来激活按钮，使用
      <abm-hint-gamepad key="Up"></abm-hint-gamepad>
      <abm-hint-gamepad key="Right"></abm-hint-gamepad>
      <abm-hint-gamepad key="Down"></abm-hint-gamepad>
      <abm-hint-gamepad key="Left"></abm-hint-gamepad>
    </div>
    <div slot="pen">
      使用
      <abm-hint-pen key="Tap"></abm-hint-pen>
      来激活按钮，使用
      <abm-hint-key key="ArrowUp"></abm-hint-key>
      <abm-hint-key key="ArrowRight"></abm-hint-key>
      <abm-hint-key key="ArrowDown"></abm-hint-key>
      <abm-hint-key key="ArrowLeft"></abm-hint-key>
    </div>
    <div slot="touch">
      使用
      <abm-hint-touch key="Tap"></abm-hint-touch>
      来激活按钮
    </div>
  </abm-hint>
</div>

## 属性 `mouse`、`gamepad`、`touch`、`pen`
分别用于获取/设置鼠标、游戏手柄、触摸、笔对应的操作提示。

## 插槽

| 插槽名    | 描述             |
| --------- | ---------------- |
| `mouse`   | 鼠标操作提示     |
| `gamepad` | 游戏手柄操作提示 |
| `touch`   | 触摸操作提示     |
| `pen`     | 笔操作提示       |

## 子组件

| 名称      | 说明             |
| --------- | ---------------- |
| `Mouse`   | 鼠标操作提示     |
| `Gamepad` | 游戏手柄操作提示 |
| `Touch`   | 触摸操作提示     |
| `Pen`     | 笔操作提示       |

---

# `<KeyHint>`
按键提示组件，用于显示按键操作对应的键盘按键。

## 使用
:::全局导入
```ts
import { KeyHint } from 'abm-ui';
```
:::按需导入
```ts
import { KeyHint } from 'abm-ui/component/hint/key';
```
:::注册导入
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

## 属性 `key`
[`KeyCode`](../input/keyboard#类型-keycode) 类型，表示要显示的按键。

+++预览所有提示
| 值               | 预览                                               |
| ---------------- | -------------------------------------------------- |
| *`undefined`*    | <abm-hint-key></abm-hint-key>                      |
| `Escape`         | <abm-hint-key key="Escape"></abm-hint-key>         |
| `F1`             | <abm-hint-key key="F1"></abm-hint-key>             |
| `F2`             | <abm-hint-key key="F2"></abm-hint-key>             |
| `F3`             | <abm-hint-key key="F3"></abm-hint-key>             |
| `F4`             | <abm-hint-key key="F4"></abm-hint-key>             |
| `F5`             | <abm-hint-key key="F5"></abm-hint-key>             |
| `F6`             | <abm-hint-key key="F6"></abm-hint-key>             |
| `F7`             | <abm-hint-key key="F7"></abm-hint-key>             |
| `F8`             | <abm-hint-key key="F8"></abm-hint-key>             |
| `F9`             | <abm-hint-key key="F9"></abm-hint-key>             |
| `F10`            | <abm-hint-key key="F10"></abm-hint-key>            |
| `F11`            | <abm-hint-key key="F11"></abm-hint-key>            |
| `F12`            | <abm-hint-key key="F12"></abm-hint-key>            |
| `F13`            | <abm-hint-key key="F13"></abm-hint-key>            |
| `F14`            | <abm-hint-key key="F14"></abm-hint-key>            |
| `F15`            | <abm-hint-key key="F15"></abm-hint-key>            |
| `F16`            | <abm-hint-key key="F16"></abm-hint-key>            |
| `F17`            | <abm-hint-key key="F17"></abm-hint-key>            |
| `F18`            | <abm-hint-key key="F18"></abm-hint-key>            |
| `F19`            | <abm-hint-key key="F19"></abm-hint-key>            |
| `F20`            | <abm-hint-key key="F20"></abm-hint-key>            |
| `CapsLock`       | <abm-hint-key key="CapsLock"></abm-hint-key>       |
| `ControlLeft`    | <abm-hint-key key="ControlLeft"></abm-hint-key>    |
| `AltLeft`        | <abm-hint-key key="AltLeft"></abm-hint-key>        |
| `ShiftLeft`      | <abm-hint-key key="ShiftLeft"></abm-hint-key>      |
| `ControlRight`   | <abm-hint-key key="ControlRight"></abm-hint-key>   |
| `AltRight`       | <abm-hint-key key="AltRight"></abm-hint-key>       |
| `ShiftRight`     | <abm-hint-key key="ShiftRight"></abm-hint-key>     |
| `Tab`            | <abm-hint-key key="Tab"></abm-hint-key>            |
| `Backquote`      | <abm-hint-key key="Backquote"></abm-hint-key>      |
| `Digit0`         | <abm-hint-key key="Digit0"></abm-hint-key>         |
| `Digit1`         | <abm-hint-key key="Digit1"></abm-hint-key>         |
| `Digit2`         | <abm-hint-key key="Digit2"></abm-hint-key>         |
| `Digit3`         | <abm-hint-key key="Digit3"></abm-hint-key>         |
| `Digit4`         | <abm-hint-key key="Digit4"></abm-hint-key>         |
| `Digit5`         | <abm-hint-key key="Digit5"></abm-hint-key>         |
| `Digit6`         | <abm-hint-key key="Digit6"></abm-hint-key>         |
| `Digit7`         | <abm-hint-key key="Digit7"></abm-hint-key>         |
| `Digit8`         | <abm-hint-key key="Digit8"></abm-hint-key>         |
| `Digit9`         | <abm-hint-key key="Digit9"></abm-hint-key>         |
| `Minus`          | <abm-hint-key key="Minus"></abm-hint-key>          |
| `Equal`          | <abm-hint-key key="Equal"></abm-hint-key>          |
| `Backspace`      | <abm-hint-key key="Backspace"></abm-hint-key>      |
| `Enter`          | <abm-hint-key key="Enter"></abm-hint-key>          |
| `BracketLeft`    | <abm-hint-key key="BracketLeft"></abm-hint-key>    |
| `BracketRight`   | <abm-hint-key key="BracketRight"></abm-hint-key>   |
| `Backslash`      | <abm-hint-key key="Backslash"></abm-hint-key>      |
| `Semicolon`      | <abm-hint-key key="Semicolon"></abm-hint-key>      |
| `Quote`          | <abm-hint-key key="Quote"></abm-hint-key>          |
| `Comma`          | <abm-hint-key key="Comma"></abm-hint-key>          |
| `Period`         | <abm-hint-key key="Period"></abm-hint-key>         |
| `Slash`          | <abm-hint-key key="Slash"></abm-hint-key>          |
| `Space`          | <abm-hint-key key="Space"></abm-hint-key>          |
| `Home`           | <abm-hint-key key="Home"></abm-hint-key>           |
| `End`            | <abm-hint-key key="End"></abm-hint-key>            |
| `PageUp`         | <abm-hint-key key="PageUp"></abm-hint-key>         |
| `PageDown`       | <abm-hint-key key="PageDown"></abm-hint-key>       |
| `ArrowUp`        | <abm-hint-key key="ArrowUp"></abm-hint-key>        |
| `ArrowRight`     | <abm-hint-key key="ArrowRight"></abm-hint-key>     |
| `ArrowDown`      | <abm-hint-key key="ArrowDown"></abm-hint-key>      |
| `ArrowLeft`      | <abm-hint-key key="ArrowLeft"></abm-hint-key>      |
| `KeyA`           | <abm-hint-key key="KeyA"></abm-hint-key>           |
| `KeyB`           | <abm-hint-key key="KeyB"></abm-hint-key>           |
| `KeyC`           | <abm-hint-key key="KeyC"></abm-hint-key>           |
| `KeyD`           | <abm-hint-key key="KeyD"></abm-hint-key>           |
| `KeyE`           | <abm-hint-key key="KeyE"></abm-hint-key>           |
| `KeyF`           | <abm-hint-key key="KeyF"></abm-hint-key>           |
| `KeyG`           | <abm-hint-key key="KeyG"></abm-hint-key>           |
| `KeyH`           | <abm-hint-key key="KeyH"></abm-hint-key>           |
| `KeyI`           | <abm-hint-key key="KeyI"></abm-hint-key>           |
| `KeyJ`           | <abm-hint-key key="KeyJ"></abm-hint-key>           |
| `KeyK`           | <abm-hint-key key="KeyK"></abm-hint-key>           |
| `KeyL`           | <abm-hint-key key="KeyL"></abm-hint-key>           |
| `KeyM`           | <abm-hint-key key="KeyM"></abm-hint-key>           |
| `KeyN`           | <abm-hint-key key="KeyN"></abm-hint-key>           |
| `KeyO`           | <abm-hint-key key="KeyO"></abm-hint-key>           |
| `KeyP`           | <abm-hint-key key="KeyP"></abm-hint-key>           |
| `KeyQ`           | <abm-hint-key key="KeyQ"></abm-hint-key>           |
| `KeyR`           | <abm-hint-key key="KeyR"></abm-hint-key>           |
| `KeyS`           | <abm-hint-key key="KeyS"></abm-hint-key>           |
| `KeyT`           | <abm-hint-key key="KeyT"></abm-hint-key>           |
| `KeyU`           | <abm-hint-key key="KeyU"></abm-hint-key>           |
| `KeyV`           | <abm-hint-key key="KeyV"></abm-hint-key>           |
| `KeyW`           | <abm-hint-key key="KeyW"></abm-hint-key>           |
| `KeyX`           | <abm-hint-key key="KeyX"></abm-hint-key>           |
| `KeyY`           | <abm-hint-key key="KeyY"></abm-hint-key>           |
| `KeyZ`           | <abm-hint-key key="KeyZ"></abm-hint-key>           |
| `Numpad0`        | <abm-hint-key key="Numpad0"></abm-hint-key>        |
| `Numpad1`        | <abm-hint-key key="Numpad1"></abm-hint-key>        |
| `Numpad2`        | <abm-hint-key key="Numpad2"></abm-hint-key>        |
| `Numpad3`        | <abm-hint-key key="Numpad3"></abm-hint-key>        |
| `Numpad4`        | <abm-hint-key key="Numpad4"></abm-hint-key>        |
| `Numpad5`        | <abm-hint-key key="Numpad5"></abm-hint-key>        |
| `Numpad6`        | <abm-hint-key key="Numpad6"></abm-hint-key>        |
| `Numpad7`        | <abm-hint-key key="Numpad7"></abm-hint-key>        |
| `Numpad8`        | <abm-hint-key key="Numpad8"></abm-hint-key>        |
| `Numpad9`        | <abm-hint-key key="Numpad9"></abm-hint-key>        |
| `NumpadAdd`      | <abm-hint-key key="NumpadAdd"></abm-hint-key>      |
| `NumpadSubtract` | <abm-hint-key key="NumpadSubtract"></abm-hint-key> |
| `NumpadMultiply` | <abm-hint-key key="NumpadMultiply"></abm-hint-key> |
| `NumpadDivide`   | <abm-hint-key key="NumpadDivide"></abm-hint-key>   |
| `NumpadDecimal`  | <abm-hint-key key="NumpadDecimal"></abm-hint-key>  |
+++

---

# `<MouseHint>`
鼠标提示组件，用于鼠标操作提示。

## 使用
:::全局导入
```ts
import { MouseHint } from 'abm-ui';
```
:::按需导入
```ts
import { MouseHint } from 'abm-ui/component/hint/mouse';
```
:::注册导入
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

## 属性 `key`
表示要显示的鼠标提示。

| 值               | 预览                                                   | 说明             |
| ---------------- | ------------------------------------------------------ | ---------------- |
| *`undefined`*    | <abm-hint-mouse></abm-hint-mouse>                      | 未配置或键值错误 |
| `Move`           | <abm-hint-mouse key="Move"></abm-hint-mouse>           | 任意方向移动     |
| `MoveHorizontal` | <abm-hint-mouse key="MoveHorizontal"></abm-hint-mouse> | 水平移动         |
| `MoveVertical`   | <abm-hint-mouse key="MoveVertical"></abm-hint-mouse>   | 垂直移动         |
| `Wheel`          | <abm-hint-mouse key="Wheel"></abm-hint-mouse>          | 滚轮滚动         |
| `WheelPress`     | <abm-hint-mouse key="WheelPress"></abm-hint-mouse>     | 滚轮按下         |
| `WheelUp`        | <abm-hint-mouse key="WheelUp"></abm-hint-mouse>        | 滚轮向上滚动     |
| `WheelDown`      | <abm-hint-mouse key="WheelDown"></abm-hint-mouse>      | 滚轮向下滚动     |
| `Left`           | <abm-hint-mouse key="Left"></abm-hint-mouse>           | 左键点击         |
| `Right`          | <abm-hint-mouse key="Right"></abm-hint-mouse>          | 右键点击         |

---

# `<PenHint>`
笔提示组件，用于笔操作提示。

## 使用
:::全局导入
```ts
import { PenHint } from 'abm-ui';
```
:::按需导入
```ts
import { PenHint } from 'abm-ui/component/hint/pen';
```
:::注册导入
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

## 属性 `key`
表示要显示的笔提示。

| 值               | 预览                                               | 说明             |
| ---------------- | -------------------------------------------------- | ---------------- |
| *`undefined`*    | <abm-hint-pen></abm-hint-pen>                      | 未配置或键值错误 |
| `Tap`            | <abm-hint-pen key="Tap"></abm-hint-pen>            | 点击             |
| `DualTap`        | <abm-hint-pen key="DualTap"></abm-hint-pen>        | 双击             |
| `Hold`           | <abm-hint-pen key="Hold"></abm-hint-pen>           | 长按             |
| `Draw`           | <abm-hint-pen key="Draw"></abm-hint-pen>           | 绘制             |
| `DrawHorizontal` | <abm-hint-pen key="DrawHorizontal"></abm-hint-pen> | 水平绘制         |
| `DrawVertical`   | <abm-hint-pen key="DrawVertical"></abm-hint-pen>   | 垂直绘制         |
| `Move`           | <abm-hint-pen key="Move"></abm-hint-pen>           | 移动             |
| `MoveHorizontal` | <abm-hint-pen key="MoveHorizontal"></abm-hint-pen> | 水平移动         |
| `MoveVertical`   | <abm-hint-pen key="MoveVertical"></abm-hint-pen>   | 垂直移动         |

---

# `<GamepadHint>`
游戏手柄提示组件，用于游戏手柄操作提示。

## 使用
:::全局导入
```ts
import { GamepadHint } from 'abm-ui';
```
:::按需导入
```ts
import { GamepadHint } from 'abm-ui/component/hint/gamepad';
```
:::注册导入
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

## 属性 `key`
表示要显示的游戏手柄提示。

| 值            | 预览                                              | 说明             |
| ------------- | ------------------------------------------------- | ---------------- |
| *`undefined`* | <abm-hint-gamepad></abm-hint-gamepad>             | 未配置或键值错误 |
| `A`           | <abm-hint-gamepad key="A"></abm-hint-gamepad>     | A 按钮           |
| `B`           | <abm-hint-gamepad key="B"></abm-hint-gamepad>     | B 按钮           |
| `X`           | <abm-hint-gamepad key="X"></abm-hint-gamepad>     | X 按钮           |
| `Y`           | <abm-hint-gamepad key="Y"></abm-hint-gamepad>     | Y 按钮           |
| `LB`          | <abm-hint-gamepad key="LB"></abm-hint-gamepad>    | 左肩键           |
| `RB`          | <abm-hint-gamepad key="RB"></abm-hint-gamepad>    | 右肩键           |
| `LT`          | <abm-hint-gamepad key="LT"></abm-hint-gamepad>    | 左扳机           |
| `RT`          | <abm-hint-gamepad key="RT"></abm-hint-gamepad>    | 右扳机           |
| `BACK`        | <abm-hint-gamepad key="BACK"></abm-hint-gamepad>  | 返回键           |
| `START`       | <abm-hint-gamepad key="START"></abm-hint-gamepad> | 开始键           |
| `LSB`         | <abm-hint-gamepad key="LSB"></abm-hint-gamepad>   | 左摇杆按下       |
| `RSB`         | <abm-hint-gamepad key="RSB"></abm-hint-gamepad>   | 右摇杆按下       |
| `UP`          | <abm-hint-gamepad key="UP"></abm-hint-gamepad>    | 上方向键         |
| `DOWN`        | <abm-hint-gamepad key="DOWN"></abm-hint-gamepad>  | 下方向键         |
| `LEFT`        | <abm-hint-gamepad key="LEFT"></abm-hint-gamepad>  | 左方向键         |
| `RIGHT`       | <abm-hint-gamepad key="RIGHT"></abm-hint-gamepad> | 右方向键         |
| `HOME`        | <abm-hint-gamepad key="HOME"></abm-hint-gamepad>  | 主菜单键         |
| `LS`          | <abm-hint-gamepad key="LS"></abm-hint-gamepad>    | 左摇杆           |
| `RS`          | <abm-hint-gamepad key="RS"></abm-hint-gamepad>    | 右摇杆           |

## CSS 变量

| 变量名        | 默认值                                           | 描述   |
| ------------- | ------------------------------------------------ | ------ |
| `--gamepad-a` | `light-dark(oklch(.6 .2 142), oklch(.7 .2 142))` | 按键 A |
| `--gamepad-b` | `light-dark(oklch(.6 .2 20), oklch(.7 .2 20))`   | 按键 B |
| `--gamepad-x` | `light-dark(oklch(.6 .2 240), oklch(.7 .2 240))` | 按键 X |
| `--gamepad-y` | `light-dark(oklch(.6 .2 90), oklch(.7 .2 90))`   | 按键 Y |

---

# `<TouchHint>`
触摸提示组件，用于触摸操作提示。

## 使用
:::全局导入
```ts
import { TouchHint } from 'abm-ui';
```
:::按需导入
```ts
import { TouchHint } from 'abm-ui/component/hint/touch';
```
:::注册导入
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

## 属性 `key`
表示要显示的触摸提示。

| 值            | 预览                                              | 说明             |
| ------------- | ------------------------------------------------- | ---------------- |
| *`undefined`* | <abm-hint-touch></abm-hint-touch>                 | 未配置或键值错误 |
| `Tap`         | <abm-hint-touch key="Tap"></abm-hint-touch>       | 单击             |
| `DualTap`     | <abm-hint-touch key="DualTap"></abm-hint-touch>   | 双击             |
| `Hold`        | <abm-hint-touch key="Hold"></abm-hint-touch>      | 长按             |
| `Move`        | <abm-hint-touch key="Move"></abm-hint-touch>      | 移动             |
| `SwapUp`      | <abm-hint-touch key="SwapUp"></abm-hint-touch>    | 上滑             |
| `SwapRight`   | <abm-hint-touch key="SwapRight"></abm-hint-touch> | 右滑             |
| `SwapDown`    | <abm-hint-touch key="SwapDown"></abm-hint-touch>  | 下滑             |
| `SwapLeft`    | <abm-hint-touch key="SwapLeft"></abm-hint-touch>  | 左滑             |
