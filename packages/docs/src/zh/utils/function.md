---
title: 函数
source:
	- packages/abm-utils/src/function.ts
---

# 类型 `Fn`
函数类型。

# 类型 `PromiseOr`
该类型有一个泛型 `R`，表示一个类型 `R` 或 `Promise<R>`。

# `normalizeError()`
将输入参数标准化为 `Error` 对象。

# `run()`
异步运行一个函数，返回其结果或 `Error` 对象。

# `runSync()`
同步运行一个函数，返回其结果或 `Error` 对象。

# `runTask()`
将函数运行加入微任务队列。

# `call()`
异步运行一个函数，并指定 `this` 绑定，返回其结果或 `Error` 对象。

# `callSync()`
同步运行一个函数，并指定 `this` 绑定，返回其结果或 `Error` 对象。

# `callTask()`
将函数运行加入微任务队列，并指定 `this` 绑定。

# `wrap()`
将函数为按异步函数包装，包装后的函数运行时若抛出错误，则返回 `Error` 对象。

# `wrapSync()`
将函数按通知函数包装，包装后的函数运行时若抛出错误，则返回 `Error` 对象。

# 类 `Debounce`
防抖类。

## 静态属性与方法

### `new()`

## 实例属性与方法

### `constructor()`
参数：
- `fn`：目标函数
- `thisArg`：`this` 上下文
- `delay`：防抖延迟，单位毫秒，默认 100

### `thisArg`
`this` 上下文。

### `result`
执行结果。

### `exe()`
按参数执行，参数将加入预订参数中。

### `exec()`
按预订参数执行。

### `clean()`
停止并清理计时器。

# 类 `Throttle`
节流类。

## 静态属性与方法

### `new()`

## 实例属性与方法

### `constructor()`
参数：
- `fn`：目标函数
- `thisArg`：`this` 上下文
- `delay`：节流延迟，单位毫秒，默认 100

### `thisArg`
`this` 上下文。

### `result`
执行结果。

### `exe()`
按参数执行，参数将加入预订参数中。

### `exec()`
按预订参数执行。

### `clean()`
停止并清理计时器。

# 类 `ChainNode`

## `run`
添加链条中下一函数。

## `result`
执行结果。

# `chain()`
链式执行。

参数：
- `value`：链中第一个函数的参数

返回执行链 [`ChainNode`](#类-chainnode)。
