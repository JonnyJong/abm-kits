---
title: 函数
source: packages/abm-utils/src/function.ts
---

```ts
import 'abm-utils/function';
```

# 泛型 `Fn`
函数声明。

# 泛型 `PromiseOr`
声明一个 `T` 或 `Promise<T>` 的类型。

# 函数 `sequential`
将异步函数串行化，该函数每次执行都必须确保上一次调用该函数已经完成。

# 函数 `run`、`runSync`、`runTask`、`call`、`callSync`、`callTask`
用于安全执行传入的函数。
| 函数       | 执行方式 | 指定 `this` |
| ---------- | -------- | ----------- |
| `run`      | 异步     | 否          |
| `runSync`  | 同步     | 否          |
| `runTask`  | 微任务   | 否          |
| `call`     | 异步     | 是          |
| `callSync` | 同步     | 是          |
| `callTask` | 微任务   | 是          |

# 函数 `wrap`、`warpSync`
用于将函数包装为可安全执行的函数，若被包装函数抛出错误，则返回 `Error`。其中 `wrap` 用于包装异步函数；`wrapSync` 用于包装同步函数。

# 函数 `chain`
从单个参数开始链式执行，返回 [`ChainNode`](#类-chainnode)。

# 类 `ChainNode`
链式执行节点。

## 属性 `result`
链式执行结果，链中下一个函数参数。

## 方法 `run`
在改节点下继续执行下一个函数。

# 类 `SerialExecutor`
串行任务执行器，保证任务按添加顺序依次执行。

## 构造函数参数
- `exe`：实际执行任务的函数

## 方法
### `process(...args)`
提交新任务到执行队列。
- 参数：任务参数
- 返回值：返回一个 `Promise`，在任务执行完成时 resolve/reject
- 说明：任务会被加入队列并按添加顺序依次执行

# 类 `SerialCallbackExecutor`
串行任务执行器，保证任务按添加顺序依次执行，使用回调函数处理执行结果。

## 构造函数参数
- `exe`：实际执行任务的函数
- `callback`：任务执行完成后的回调函数，接收 `(result: T)` 或 `(undefined, error: Error)` 参数

## 方法
### `process(...args)`
提交新任务到执行队列。
- 参数：任务参数
- 返回值：返回一个 `Promise`，在任务执行完成时 resolve/reject
- 说明：任务会被加入队列并按添加顺序依次执行，执行结果通过回调函数处理

### `processMany(...tasks)`
提交多个任务到执行队列。
- 参数：任务参数数组
- 返回值：返回一个 `Promise`，在所有任务执行完成时 resolve/reject
- 说明：多个任务会被依次加入队列并按添加顺序执行，执行结果通过回调函数处理
