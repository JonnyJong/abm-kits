---
title: 游戏控制器
source: packages/abm-ui/src/input/game-controller.ts
---

```ts
import 'abm-ui/input/game-controller';
```

# 类型 `GameControllerButton`
游戏控制器按钮类型定义。

- `LB`：左肩键
- `RB`：右肩键
- `LT`：左扳机
- `RT`：右扳机
- `LSB`：左摇杆按下
- `RSB`：右摇杆按下
- `UP`：方向键上
- `DOWN`：方向键下
- `LEFT`：方向键左
- `RIGHT`：方向键右

# 类 `GameController`
该类继承自 [`EventEmitter`](../utils/event#类-eventemitter) 类。

## 静态方法 `get`
获取指定索引的游戏控制器实例，索引范围 `0`~`3`，不允许直接构造 `GameController` 实例。

## 属性

### `connected`
控制器连接状态，只读。

### `index`
当前游戏控制器索引，只读。

### `id`
当前游戏控制器 ID，参考 [MDN Reference](https://developer.mozilla.org/docs/Web/API/Gamepad/id)。

### `ls`
获取左摇杆坐标，未连接时为 `null`。

### `rs`
获取右摇杆坐标，未连接时为 `null`。

### 死区
使用以下属性设置摇杆/扳机死区：
| 属性    | 类型   | 作用   |
| ------- | ------ | ------ |
| `lsMin` | 左摇杆 | 最小值 |
| `lsMax` | 左摇杆 | 最大值 |
| `rsMin` | 右摇杆 | 最小值 |
| `rsMax` | 右摇杆 | 最大值 |
| `ltMin` | 左扳机 | 最小值 |
| `ltMax` | 左扳机 | 最大值 |
| `rtMin` | 右扳机 | 最小值 |
| `rtMax` | 右扳机 | 最大值 |

## 方法

### `button`
获取指定按钮状态。

### `vibrate`
触发控制器震动效果，参考 [MDN Reference](https://developer.mozilla.org/docs/Web/API/GamepadHapticActuator/playEffect)。

### `resetVibrate`
重置控制器震动，参考 [MDN Reference](https://developer.mozilla.org/docs/Web/API/GamepadHapticActuator/reset)。

## 事件
| 事件名         | 参数列表                                        | 描述           |
| -------------- | ----------------------------------------------- | -------------- |
| `down`         | `(button: GameControllerButton)`                | 按钮按下       |
| `up`           | `(button: GameControllerButton)`                | 按钮释放       |
| `press`        | `(button: GameControllerButton)`                | 按钮按下并释放 |
| `trigger`      | `(button: GameControllerButton)`                | 按钮触发       |
| `ls`           | `(direction: Direction8, x: number, y: number)` | 左摇杆变化     |
| `rs`           | `(direction: Direction8, x: number, y: number)` | 由摇杆变化     |
| `lsTrigger`    | `(direction: Direction8, x: number, y: number)` | 左摇杆触发     |
| `rsTrigger`    | `(direction: Direction8, x: number, y: number)` | 由摇杆触发     |
| `connectivity` | `(connected: boolean)`                          | 连接/断开      |
