---
title: Game Controller
source: packages/abm-ui/src/input/game-controller.ts
---

```ts
import 'abm-ui/input/game-controller';
```

# Type `GameControllerButton`
Game controller button type definition.

- `LB`: Left shoulder button
- `RB`: Right shoulder button
- `LT`: Left trigger
- `RT`: Right trigger
- `LSB`: Left stick press
- `RSB`: Right stick press
- `UP`: D-pad up
- `DOWN`: D-pad down
- `LEFT`: D-pad left
- `RIGHT`: D-pad right

# Class `GameController`
This class inherits from the [`EventEmitter`](../utils/event#class-eventemitter) class.

## Static Method `get`
Get the game controller instance with the specified index, index range `0`~`3`, direct construction of `GameController` instance is not allowed.

## Properties

### `connected`
Controller connection status, read-only.

### `index`
Current game controller index, read-only.

### `id`
Current game controller ID, refer to [MDN Reference](https://developer.mozilla.org/docs/Web/API/Gamepad/id).

### `ls`
Get left stick coordinates, `null` when not connected.

### `rs`
Get right stick coordinates, `null` when not connected.

### Dead Zone
Use the following properties to set stick/trigger dead zones:
| Property | Type   | Function |
| -------- | ------ | -------- |
| `lsMin`  | Left stick | Minimum value |
| `lsMax`  | Left stick | Maximum value |
| `rsMin`  | Right stick | Minimum value |
| `rsMax`  | Right stick | Maximum value |
| `ltMin`  | Left trigger | Minimum value |
| `ltMax`  | Left trigger | Maximum value |
| `rtMin`  | Right trigger | Minimum value |
| `rtMax`  | Right trigger | Maximum value |

## Methods

### `button`
Get the specified button state.

### `vibrate`
Trigger controller vibration effect, refer to [MDN Reference](https://developer.mozilla.org/docs/Web/API/GamepadHapticActuator/playEffect).

### `resetVibrate`
Reset controller vibration, refer to [MDN Reference](https://developer.mozilla.org/docs/Web/API/GamepadHapticActuator/reset).

## Events
| Event Name     | Parameter List                                    | Description               |
| -------------- | ------------------------------------------------- | ------------------------- |
| `down`         | `(button: GameControllerButton)`                  | Button pressed            |
| `up`           | `(button: GameControllerButton)`                  | Button released           |
| `press`        | `(button: GameControllerButton)`                  | Button pressed and released |
| `trigger`      | `(button: GameControllerButton)`                  | Button triggered          |
| `ls`           | `(direction: Direction8, x: number, y: number)`   | Left stick changed        |
| `rs`           | `(direction: Direction8, x: number, y: number)`   | Right stick changed       |
| `lsTrigger`    | `(direction: Direction8, x: number, y: number)`   | Left stick triggered      |
| `rsTrigger`    | `(direction: Direction8, x: number, y: number)`   | Right stick triggered     |
| `connectivity` | `(connected: boolean)`                            | Connected/disconnected    |