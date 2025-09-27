---
title: 滑动事件
icon: HandDraw
order: 3
source:
	- packages/abm-ui/src/events/slide.ts
---

滑动事件用于处理目标元素的滑动，滑动事件支持以下操作方式：
- 鼠标
- 笔
- 触控
- 游戏控制器
- 键盘

# 尝试一下

```demo event/slide
locale: { slideOnMe: '在此处滑动' }
```

# HTML 属性
当目标元素处于滑动状态时，该元素会被添加 `ui-slide` 属性，可用于编写 CSS 样式。
```styl
.target {
  background: white;
}
.target[ui-slide] {
  background: black;
}
```

# 接口

```ts
import { events } from 'abm-ui';
```

## `on()`
```ts
events.slide.on(element, handler);
```
为目标元素注册滑动事件处理函数。

## `off()`
```ts
events.slide.off(element, handler);
```
移除目标元素的滑动事件处理函数。

## `add()`
```ts
events.slide.add(element);
```
为目标元素注册滑动事件，但不添加处理函数。

## `rm()`
```ts
events.slide.rm(element);
```
取消目标元素注册的滑动事件，并移除所有对应的处理函数。

## `start()`
```ts
events.slide.start(element, identifier, x, y);
```
参数：
- `element`：目标元素
- `identifier`：滑动控制方式标识符，参考 [`identifier`](#identifier)
- `x`：起始点水平坐标（可选）
- `y`：起始点垂直坐标（可选）

若目标元素注册了滑动事件，则使其处于滑动状态。
若元素已注册了滑动事件，返回 `true`，反之返回 `false`。

## `cancel()`
```ts
events.slide.end(element);
```
若目标元素注册了滑动事件，则结束其滑动状态。
若元素已注册了滑动事件，返回 `true`，反之返回 `false`。

## 类 `UIEventSlide`
该类继承自 [`EventBase`](/@/utils/events#类-eventbase)。

`on()` 方法中注册的处理函数 `handler`，在滑动事件触发时会接收到一个 `UIEventHover` 类型的参数。
```ts
import { UIEventSlide } from 'abm-ui';

const handler = (event: UIEventSlide) => {};
```

### `state`
[`UIEventSlideState`](#类型-uieventslidestate) 类型的属性，表示事件触发时的滑动状态：
- `start`：开始滑动
- `move`：正在滑动
- `end`：滑动结束

### `identifier`
`number` 类型的属性，表示滑动相关控制方式。

控制方式标识符：
- `-2`：通过导航方式滑动，包括键盘、游戏控制器
- `-1`：通过鼠标滑动
- `>= 0`：通过触摸或笔滑动

### `pointer`
`boolean` 类型的属性，表示是否使用指点设备滑动。

### `digital`
`boolean` 类型的属性，表示是否使用按钮滑动。

### `startX`
`number` 类型的属性，表示滑动起始水平坐标。

### `startY`
`number` 类型的属性，表示滑动起始垂直坐标。

### `x`
`number` 类型的属性，表示当前滑动位置水平坐标。

### `y`
`number` 类型的属性，表示当前滑动位置垂直坐标。

### `dx`
`number` 类型的属性，表示当前滑动位置与起始位置的水平距离。

### `dy`
`number` 类型的属性，表示当前滑动位置与起始位置的垂直距离。

### `direction`
`Direction4 | undefined` 类型的属性，表示按下的方向键：
- `undefined`：该滑动不使用方向键
- `up`：使用上方向键
- `right`：使用右方向键
- `down`：使用下方向键
- `left`：使用左方向键

参考：[工具/向量](/@/utils/vector/#类型-direction4)

### `target`
`HTMLElement` 类型的属性，表示滑动事件对应元素。

### `type`
`string` 类型的属性，表示事件类型，滑动事件 `type` 恒为 `slide`。

### `vector`
`Vector2 | undefined` 类型的属性，表示摇杆方向：
- `undefined`：该滑动不使用摇杆
- `Vector2`：摇杆方向，参考 [工具/向量](/@/utils/vector/#类-vector2)

### `power`
`number | undefined` 类型的属性，表示摇杆力度：
- `undefined`：该滑动不使用摇杆
- `number`：力度大小，取值范围 0 ~ 1

力度大小为滑动方向乘以采样时间，若要确保滑动速度与帧率无关，请使用 `power` 属性而非 `vector` 属性。

### `powerX`
`number | undefined` 类型的属性，表示摇杆水平力度：
- `undefined`：该滑动不使用摇杆
- `number`：水平力度大小，取值范围 0 ~ 1

### `powerY`
`number | undefined` 类型的属性，表示摇杆垂直力度：
- `undefined`：该滑动不使用摇杆
- `number`：垂直力度大小，取值范围 0 ~ 1

## 类型 `SlideBorder`
长度为 4 的数字数组类型，表示滑动边界：
- `[0]`：左边界
- `[1]`：右边界
- `[2]`：上边界
- `[3]`：下边界

## 类型 `UIEventSlideState`
字符串类型，表示事件触发时的滑动状态：
- `start`：开始滑动
- `move`：正在滑动
- `end`：滑动结束

## 接口 `Slidable`
继承自 `HTMLElement`，包含可滑动元素有关的属性。

### `digitalXStep`
`number` 类型的属性，表示使用按钮触发滑动时，水平方向滑动步长，默认为 1。

### `digitalYStep`
`number` 类型的属性，表示使用按钮触发滑动时，垂直方向滑动步长，默认为 1。

### `joystickXSpeedFactor`
`number` 类型的属性，表示使用摇杆触发滑动时，水平方向的速度因数，默认为 1。

### `joystickYSpeedFactor`
`number` 类型的属性，表示使用摇杆触发滑动时，垂直方向的速度因数，默认为 1。

### `slideBorder`
[`SlideBorder`](#类型-slideborder) 类型的属性，表示使用键盘、游戏控制器等非指点设备触发滑动时的滑动边界。
