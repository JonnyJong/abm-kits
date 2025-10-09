---
title: 时间相关
source:
	- packages/abm-utils/src/timer.ts
---

# `sleep()`
生成一个指定时间后 resolve 的 `Promise`。

参数：
- `ms`：`number` 类型，单位毫秒

# 类 `RepeatingTriggerController`
该类用于模拟按键长按时重复触发。

## `constructor()`
参数：
- `fn`：触发函数
- `initialDelay`：`number` 类型，单位毫秒，初始延迟，默认 500
- `repeatInterval`：`number` 类型，单位毫秒，重复触发延迟，默认 100

## `isRunning`
是否正在运行，只读。

## `fn`
触发函数。

## `initialDelay`
`number` 类型，单位毫秒，初始延迟。

## `repeatInterval`
`number` 类型，单位毫秒，重复触发延迟。

## `start()`
开始触发。

## `stop()`
停止触发。

## `restart()`
重启。

# 类 `AnimationFrameController`
动画帧控制器。

## `constructor()`
参数：
- `fn`：`FrameRequestCallback` 类型
- `async`：`boolean` 类型，是否异步执行回调，默认 `false`

## `isRunning`
是否正在运行，只读。

## `ignoreErrors`
忽略错误。
设置为 `true` 时，发生错误不会停止动画帧循环。

## `fn`
帧回调函数。

## `async`
是否异步执行回调函数。

## `start()`
启动动画帧循环。

## `stop()`
停止动画帧循环。

# 类 `IntervalController`
间隔执行控制器。

## `constructor()`
参数：
- `fn`：执行函数
- `interval`：`number` 类型，间隔时间，单位毫秒
- `thisArgs`：执行函数 `this` 上下文，可选

## `fn`
执行函数。

## `thisArgs`
执行函数 `this` 上下文。

## `isRunning`
是否正在运行，只读。

## `interval`
`number` 类型，间隔时间，单位毫秒。

## `start()`
启动定时器。

## `stop()`
停止定时器。

# 类 `SerialExecutor`
串行任务执行器，用于确保任务按添加顺序依次执行。

## `constructor()`
参数：
- `exe`：执行函数

## `process()`
提交任务到执行队列。

# 类 `SerialCallbackExecutor`
串行任务执行器，用于确保任务按添加顺序依次执行，类似于 [`SerialExecutor`](#类-serialexecutor)，但使用回调处理。

## `constructor()`
参数：
- `exe`：执行函数
- `callback`：回调函数

## `process()`
提交任务到执行队列。

## `processMany()`
提交多个任务到执行队列。

# 类 `Timer`
计时器。

## `duration`
`number` 类型，单位毫秒，当前总计时时长。

## `isRunning`
是否正在运行，只读。

## `start()`
开始/继续计时。

## `pause()`
暂停计时。

## `clear()`
停止并清空计时器。
