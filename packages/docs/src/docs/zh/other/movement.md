---
title: 移动控制器
source: packages/abm-ui/src/movement.ts
---

# 使用
:::全局导入
```ts
import { MovementController } from 'abm-ui';
```
:::按需导入
```ts
import { MovementController } from 'abm-ui/movement';
```
:::

# 类型 `MovementValue`
移动值类型，支持一维值和二维值。
- `number`：一维值
- `Vec2`：二维值

# 类型 `MovementValueSource<T>`
移动值来源，可以是固定值或动态值函数。
- `T`：固定值
- `() => T`：动态值

# 类型 `MovementState`
移动状态。
- `start`：首次移动
- `moving`：移动中
- `end`：移动结束
- `cancel`：移动取消

# 类型 `InteractionSource`
交互来源，详细说明见 [交互源](../infra/interaction#类型-interactionsource)。

# 接口 `MovementTarget<T>`

移动目标配置。

## 属性

- `value`：当前逻辑值，`MovementValueSource<T>` 类型
- `start?`：起始逻辑值，`MovementValueSource<T>` 类型，默认 `Number.NEGATIVE_INFINITY`
- `end?`：结束逻辑值，`MovementValueSource<T>` 类型，默认 `Number.POSITIVE_INFINITY`
- `step?`：逻辑值步长，`MovementValueSource<T>` 类型，默认 `0`
- `discrete?`：离散控制系数，`MovementValueSource<T>` 类型，默认根据步长计算。离散输入包括键盘按键、游戏手柄按键
- `continuous?`：连续控制系数，`MovementValueSource<T>` 类型，默认根据步长计算。连续输入包括摇杆
- `mouseStartDelay?`：鼠标拖动开始延迟，`MovementValueSource<number>` 类型，单位毫秒，默认 `0`
- `penStartDelay?`：笔拖动开始延迟，`MovementValueSource<number>` 类型，单位毫秒，默认 `500`
- `touchStartDelay?`：触摸拖动开始延迟，`MovementValueSource<number>` 类型，单位毫秒，默认 `500`
- `mouseCheckDelay?`：鼠标拖动检查时长，`MovementValueSource<number>` 类型，单位毫秒，默认 `0`
- `penCheckDelay?`：笔拖动检查时长，`MovementValueSource<number>` 类型，单位毫秒，默认 `100`
- `touchCheckDelay?`：触摸拖动检查时长，`MovementValueSource<number>` 类型，单位毫秒，默认 `100`

# 接口 `MovementEvent<T, E>`

移动事件。

## 属性

- `state`：移动状态，[`MovementState`](#类型-movementstate) 类型
- `initial`：初始逻辑值，`T` 类型
- `value`：当前逻辑值，`T` 类型
- `offset`：逻辑值变化量（从初始逻辑值到当前），`T` 类型
- `delta`：本次移动的逻辑值变化量，`T` 类型
- `trigger?`：触发移动元素，`E` 类型
- `pointer?`：指针坐标信息
  - `initial`：初始坐标，[`Vec2`](../utils/vector#类型-vec2) 类型
  - `current`：当前坐标，[`Vec2`](../utils/vector#类型-vec2) 类型
  - `offset`：坐标变化量（从初始坐标到现在），[`Vec2`](../utils/vector#类型-vec2) 类型
  - `delta`：本次移动的坐标变化量，[`Vec2`](../utils/vector#类型-vec2) 类型
- `end`：本次移动是否结束，`boolean` 类型

# 接口 `MovementEventHandler<T, E>`

移动事件处理器
(event类型。
```ts: MovementEvent<T, E>) => any
```

# 接口 `MovementChecker<E>`

首次移动检查器类型。
```ts
(offset: Vec2, trigger?: E) => boolean | Vec2
```
- 返回 `true`：检查通过
- 返回 `false`：检查不通过
- 返回 `Vec2`：期望移动方向向量（双向，由移动控制器进一步检查）

# 接口 `MovementAxisGetter<T>`

轴线获取器类型，用于定义移动的坐标轴。

## 一维移动 (`T extends number`)
```ts
() => {
    o: Vec2 | DOMRect | Element;  // 原点坐标
    x: Vec2 | DOMRect | Element;  // X 轴正半轴任意点坐标
    y?: Vec2 | DOMRect | Element; // Y 轴正半轴任意点坐标，一维移动无需该坐标
}
```

## 二维移动 (`T extends Vec2`)
```ts
() => {
    o: Vec2 | DOMRect | Element;  // 原点坐标
    x: Vec2 | DOMRect | Element;  // X 轴正半轴任意点坐标
    y: Vec2 | DOMRect | Element;  // Y 轴正半轴任意点坐标
}
```

# 接口 `MovementControllerInit<T, E>`

移动控制器初始化参数。

## 属性

- `handler?`：[`MovementEventHandler<T, E>`](#接口-movementeventhandlerte)
- `check?`：[`MovementChecker<E>`](#接口-movementchecke)
- `axis?`：[`MovementAxisGetter<T>`](#接口-movementaxisgettert)
- `triggers?`：触发元素，`ArrayOr<E>` 类型

# 接口 `MovementStartOptions<T, E>`

开始移动参数。

## 属性

- `source?`：交互源，默认 `nav`
  - `InteractionSource`
  - `PointerEvent`
  - `PointerEvent['pointerType']`
  - `Touch`
- `value?`：当前值，默认 `target.value`
- `position?`：指针位置
  - `Vec2`
  - `PointerEvent`
  - `Touch`
- `trigger?`：触发器，`E` 类型
- `disableDelay?`：禁用拖动开始延迟，`boolean` 类型
- `disableCheck?`：禁用首次移动检查，`boolean` 类型

# 类 `MovementController<T, E>`

移动控制器，统一处理逻辑值和像素值移动。

## 构造参数
- `target`：[`MovementTarget<T>`](#接口-movementtargett)
- `init?`：[`MovementControllerInit<T, E>`](#接口-movementcontrollerinitt-e)

## 属性

### `target`
移动目标，[`MovementTarget<T>`](#接口-movementtargett) 类型，可读写。

### `source`
当前交互源，[`InteractionSource`](#类型-interactionsource) 类型，只读。

### `moving`
当前是否正在移动，`boolean` 类型，只读。

### `handler`
移动事件处理器，[`MovementEventHandler<T, E>`](#接口-movementeventhandlerte) 类型，可读写。

### `check`
首次移动检查器，[`MovementChecker<E>`](#接口-movementchecke) 类型，可读写。

### `axis`
轴线获取器，[`MovementAxisGetter<T>`](#接口-movementaxisgettert) 类型，可读写。

## 方法

### `start`
开始移动，若当前正在移动或准备移动，则不会开始移动。

```ts
start(options?: MovementStartOptions<T, E>): void
```

- `options?`：[`MovementStartOptions<T, E>`](#接口-movementstartoptionst-e)

当 `source` 为 `nav` 时为逻辑值移动（键盘、导航、游戏手柄），其他值（pointer、touch、pen）为像素值移动。

### `stop`
停止移动，若当前不存在正在移动或准备移动，则不会停止移动。

```ts
stop(cancel?: boolean): void
```

- `cancel?`：是否为取消移动，默认 `false`

### `handleNav`
将导航状态重定向到此处以自动处理逻辑值滑动。

```ts
handleNav(state: NavState): void
```

### `addTriggers`
添加多个移动触发元素。

```ts
addTriggers(...triggers: E[]): void
```

### `hasTrigger`
检查目标元素是否设置为当前移动控制器触发元素。

```ts
hasTrigger(trigger: E): boolean
```

### `rmTriggers`
移除多个移动触发元素。

```ts
rmTriggers(...triggers: E[]): void
```

### `clearTriggers`
清除所有移动触发元素。

```ts
clearTriggers(): void
```

## 静态方法

### `isPrefer`
快捷检查是否应该进行本次移动。

```ts
static isPrefer(prefer: Vec2, offset: Vec2): boolean
```

- `prefer`：期望移动方向
- `offset`：实际移动方向

### `value2uv`
将逻辑值转换为 UV 坐标（0-1 范围）。

```ts
static value2uv<T extends MovementValue>(value: T, start: T, end: T): T
```

- `value`：逻辑值
- `start`：起始逻辑值
- `end`：结束逻辑值
- 返回值：UV 坐标
