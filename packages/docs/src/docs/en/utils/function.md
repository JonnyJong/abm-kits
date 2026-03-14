---
title: Function
source: packages/abm-utils/src/function.ts
---

```ts
import 'abm-utils/function';
```

# Generic `Fn`
Function declaration.

# Generic `PromiseOr`
Declares a type that is either `T` or `Promise<T>`.

# Function `sequential`
Serializes async functions, ensuring that each execution of the function only runs after the previous call has completed.

# Functions `run`, `runSync`, `runTask`, `call`, `callSync`, `callTask`
Used to safely execute the passed function.
| Function   | Execution Method | Specify `this` |
| ---------- | ---------------- | -------------- |
| `run`      | Async            | No             |
| `runSync`  | Sync             | No             |
| `runTask`  | Microtask        | No             |
| `call`     | Async            | Yes            |
| `callSync` | Sync             | Yes            |
| `callTask` | Microtask        | Yes            |

# Functions `wrap`, `warpSync`
Used to wrap functions as safely executable functions. If the wrapped function throws an error, it returns an `Error`. `wrap` is used for wrapping async functions; `wrapSync` is used for wrapping sync functions.

# Function `lazy`
Lazy evaluation function that wraps a function with caching. Executes the original function on first call and caches the result; subsequent calls with the same arguments return the cached value directly.

# Function `chain`
Starts chain execution from a single parameter, returns [`ChainNode`](#class-chainnode).

# Class `ChainNode`
Chain execution node.

## Property `result`
Chain execution result, parameter for the next function in the chain.

## Method `run`
Continue executing the next function under this node.

# Class `SerialExecutor`
Serial task executor, ensures tasks are executed in the order they are added.

## Constructor Parameters
- `exe`: Function that actually executes the task

## Methods
### `process(...args)`
Submit a new task to the execution queue.
- Parameters: Task arguments
- Return value: Returns a `Promise` that resolves/rejects when the task completes
- Description: Tasks are added to the queue and executed in the order they are added

# Class `SerialCallbackExecutor`
Serial task executor, ensures tasks are executed in the order they are added, using callback functions to handle execution results.

## Constructor Parameters
- `exe`: Function that actually executes the task
- `callback`: Callback function after task execution, receives `(result: T)` or `(undefined, error: Error)` parameters

## Methods
### `process(...args)`
Submit a new task to the execution queue.
- Parameters: Task arguments
- Return value: Returns a `Promise` that resolves/rejects when the task completes
- Description: Tasks are added to the queue and executed in the order they are added, execution results are handled through the callback function

### `processMany(...tasks)`
Submit multiple tasks to the execution queue.
- Parameters: Task argument array
- Return value: Returns a `Promise` that resolves/rejects when all tasks complete
- Description: Multiple tasks are added to the queue in sequence and executed in the order they are added, execution results are handled through the callback function
