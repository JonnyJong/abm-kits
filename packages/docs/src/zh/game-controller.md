---
title: 游戏控制器
source:
	- packages/abm-ui/src/game-controller.ts
order: 3
icon: XboxController
---

# 尝试一下
```demo game-controller
locale: {}
```

# 接口

## 接口 `GameControllerRumbleOptions`
游戏控制器震动选项。

### `type`
`GamepadHapticEffectType` 类型。

### `strongMagnitude`
`number` 类型，范围 0 ~ 1，低频震动强度，可选。

### `weakMagnitude`
`number` 类型，范围 0 ~ 1，高频震动强度，可选。

### `leftTrigger`
左扳机震动强度，可选。

### `rightTrigger`
右扳机震动强度，可选。

## 类型 `GameControllerEvents`
游戏控制器事件列表。

- `a`：按键 A
- `b`：按键 B
- `x`：按键 X
- `y`：按键 Y
- `lb`：左肩键
- `rb`：右肩键
- `lt`：左扳机
- `rt`：右扳机
- `back`：返回按钮
- `start`：开始按钮
- `lsb`：左摇杆按键
- `rsb`：右摇杆按键
- `up`：上键
- `down`：下键
- `left`：左键
- `right`：右键
- `home`：Home 键
- `ls`：左摇杆
- `rs`：右摇杆
- `arrow`：方向变化
- `connectivity`：连接性变化

## 类 `GameController`
该类实现了 [`IEventSource`](#接口-ieventsource) 接口。

## 静态属性与方法

### `getInstance()`
获取 `GameController` 实例。

参数：
- `index`：`number` 类型，范围 0 ~ 4

需通过该方法获取 `GameController` 实例，直接实例化将抛出错误 `Cannot instantiate GameController`。

## 实例属性与方法

### `connecting`
是否连接，只读。

### `a`
按键 A 是否按下，只读。

### `b`
按键 B 是否按下，只读。

### `x`
按键 X 是否按下，只读。

### `y`
按键 Y 是否按下，只读。

### `lb`
左肩键是否按下，只读。

### `rb`
右肩键是否按下，只读。

### `lt`
左扳机按下深度，范围 0 ~ 1。

### `rt`
右扳机按下深度，范围 0 ~ 1。

### `back`
返回键是否按下，只读。

### `start`
开始键是否按下，只读。

### `lsb`
左摇杆按键是否按下，只读。

### `rsb`
右摇杆按键是否按下，只读。

### `up`
上键是否按下，只读。

### `down`
下键是否按下，只读。

### `left`
左键是否按下，只读。

### `right`
右键是否按下，只读。

### `home`
Home 键是否按下，只读。

### `ls`
[`Vector2`](/@/utils/vector#类-vector2) 类型，左摇杆向量，只读。

### `rs`
[`Vector2`](/@/utils/vector#类-vector2) 类型，右摇杆向量，只读。

### `vibrating`
是否正在震动，只读。

### `lsDeadZoneMin`
`number` 类型，范围 0 ~ 1，左摇杆死区起点，默认 0.01。

### `lsDeadZoneMax`
`number` 类型，范围 0 ~ 1，左摇杆死区终点，默认 1。

### `rsDeadZoneMin`
`number` 类型，范围 0 ~ 1，右摇杆死区起点，默认 0.01。

### `rsDeadZoneMax`
`number` 类型，范围 0 ~ 1，右摇杆死区终点，默认 1。

### `ltDeadZoneMin`
`number` 类型，范围 0 ~ 1，左扳机死区起点，默认 0.01。

### `ltDeadZoneMax`
`number` 类型，范围 0 ~ 1，左扳机死区终点，默认 1。

### `rtDeadZoneMin`
`number` 类型，范围 0 ~ 1，右扳机死区起点，默认 0.01。

### `rtDeadZoneMax`
`number` 类型，范围 0 ~ 1，右扳机死区终点，默认 1。

### `rumble()`
开始震动。

参数：
- `options`：[`GameControllerRumbleOptions`](#接口-gamecontrollerrumbleoptions) 类型

### `stopRumble()`
停止震动。

### `rumbleOnce()`
震动一次。

参数：
- `type`：`GamepadHapticEffectType` 类型
- `params`：`GamepadEffectParameters` 类型，可选
