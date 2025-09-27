---
title: 悬停事件
icon: CursorHover
order: 1
source:
	- packages/abm-ui/src/events/hover.ts
---

悬停事件用于检测指针是否移动到目标元素上，以下为能够触发悬停的操作方式：
- 鼠标
- 笔
- 使用游戏控制器、键盘将焦点移动到目标元素上

# 尝试一下

```demo event/hover
locale: { hoverOnMe: '在此处悬停' }
```

# HTML 属性
当目标元素处于悬停状态时，该元素会被添加 `ui-hover` 属性，可用于编写 CSS 样式。
```styl
.target {
  background: white;
}
.target[ui-hover] {
  background: black;
}
```

# 接口

```ts
import { events } from 'abm-ui';
```

## `on()`
```ts
events.hover.on(element, handler);
```
为目标元素注册悬停事件处理函数。

## `off()`
```ts
events.hover.off(element, handler);
```
移除目标元素的悬停事件处理函数。

## `add()`
```ts
events.hover.add(element);
```
为目标元素注册悬停事件，但不添加处理函数。

## `rm()`
```ts
events.hover.rm(element);
```
取消目标元素注册的悬停事件，并移除所有对应的处理函数。

## `start()`
```ts
events.hover.start(element);
```
若目标元素注册了悬停事件，则使其处于悬停状态。
若元素已注册了悬停事件，返回 `true`，反之返回 `false`。

## `end()`
```ts
events.hover.end(element);
```
若目标元素注册了悬停事件，则结束其悬停状态。
若元素已注册了悬停事件，返回 `true`，反之返回 `false`。

## 类 `UIEventHover`
该类继承自 [`EventBase`](/@/utils/events#类-eventbase)。

`on()` 方法中注册的处理函数 `handler`，在悬停事件触发时会接收到一个 `UIEventHover` 类型的参数。
```ts
import { UIEventHover } from 'abm-ui';

const handler = (event: UIEventHover) => {};
```

### `hover`
`boolean` 类型的属性，表示事件触发时的悬停状态：
- `true`：事件触发时为悬停状态
- `false`：事件触发时不为悬停状态

### `target`
`HTMLElement` 类型的属性，表示悬停事件对应元素。

### `type`
`string` 类型的属性，表示事件类型，悬停事件 `type` 恒为 `hover`。
