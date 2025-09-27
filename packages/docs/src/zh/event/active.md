---
title: 激活事件
icon: CursorClick
order: 2
source:
	- packages/abm-ui/src/events/active.ts
---

激活事件用于检测目标元素是否被激活，以下为触发激活的条件：
- 鼠标主键点击
- 笔按下
- 触摸
- 使用游戏控制器将焦点移动到目标元素并按下激活键，默认激活键为 <w-hint-gamepad w-hint-gamepad="a"></w-hint-gamepad>
- 使用键盘将焦点移动到目标元素并按下激活键，默认激活键为 <w-hint-key key="Enter"></w-hint-key> 或 <w-hint-key key="Space"></w-hint-key>

# 尝试一下

```demo event/active
locale: { activeMe: '激活该元素' }
```

# HTML 属性
当目标元素处于激活状态时，该元素会被添加 `ui-active` 属性，可用于编写 CSS 样式。
```styl
.target {
  background: white;
}
.target[ui-active] {
  background: black;
}
```

# 接口

```ts
import { events } from 'abm-ui';
```

## `on()`
```ts
events.active.on(element, handler);
```
为目标元素注册激活事件处理函数。

## `off()`
```ts
events.active.off(element, handler);
```
移除目标元素的激活事件处理函数。

## `add()`
```ts
events.active.add(element);
```
为目标元素注册激活事件，但不添加处理函数。

## `rm()`
```ts
events.active.rm(element);
```
取消目标元素注册的激活事件，并移除所有对应的处理函数。

## `start()`
```ts
events.active.start(element);
```
若目标元素注册了激活事件，则使其处于激活状态。
若元素已注册了激活事件，返回 `true`，反之返回 `false`。

## `end()`
```ts
events.active.end(element);
```
若目标元素注册了激活事件，则结束其激活状态，其效果类似于在目标元素上按下鼠标主键后松开。
若元素已注册了激活事件，返回 `true`，反之返回 `false`。

## `cancel()`
```ts
events.active.end(element);
```
若目标元素注册了激活事件，则取消其激活状态，其效果类似于在目标元素上按下鼠标主键后移出目标元素再松开。
若元素已注册了激活事件，返回 `true`，反之返回 `false`。

## 类 `UIEventActive`
该类继承自 [`EventBase`](/@/utils/events#类-eventbase)。

`on()` 方法中注册的处理函数 `handler`，在激活事件触发时会接收到一个 `UIEventHover` 类型的参数。
```ts
import { UIEventActive } from 'abm-ui';

const handler = (event: UIEventActive) => {};
```

### `active`
`boolean` 类型的属性，表示事件触发时的激活状态：
- `true`：事件触发时为激活状态
- `false`：事件触发时不为激活状态

### `cancel`
`boolean` 类型的属性，表示激活操作是否被取消。
通常情况下，取消激活应当不进行操作。

### `identifier`
`number` 类型的属性，表示激活相关控制方式。

控制方式标识符：
- `-2`：通过导航方式激活，包括键盘、游戏控制器
- `-1`：通过鼠标激活
- `>= 0`：通过触摸或笔激活

### `position`
[`Vec2`](/@/utils/vector/#类型-vec2) 类型的属性，表示激活位置。
在导航激活方式下，该属性值为目标元素中心坐标；
其他方式下，该属性值为具体激活坐标。

### `target`
`HTMLElement` 类型的属性，表示激活事件对应元素。

### `type`
`string` 类型的属性，表示事件类型，激活事件 `type` 恒为 `active`。
