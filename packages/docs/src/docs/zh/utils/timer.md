---
title: 时间工具
source: packages/abm-utils/src/timer.ts
---

```ts
import 'abm-utils/timer';
```

# 函数 `sleep`
生成一个指定时间后 resolve 的 `Promise`。
```ts
await sleep(1000);
console.log('1 秒后执行');

sleep(500).then(() => {
  console.log('500 毫秒后执行');
});
```

# 类 `Debounce`
防抖函数类，用于在指定时间间隔内仅执行一次操作。

## 构造函数参数
- `fn`：需要执行的函数
- `thisArg`：`this` 上下文（可选）
- `delay`：延迟时间，默认 100 毫秒

## 属性
- `result`：执行结果
- `thisArg`：`this` 上下文

## 方法
### `clean()`
清除定时器。

### `exe(...args)`
执行函数。
- 参数：函数参数

### `exec()`
执行函数。

## 静态方法
### `new(fn, delay?)`
创建一个防抖函数。
- 参数：
  - `fn`：需要执行的函数
  - `delay`：延迟时间，默认 100 毫秒
- 返回值：防抖函数

## 示例
```ts
// 创建一个防抖实例
const debounce = new Debounce((value) => {
  console.log('执行防抖函数:', value);
  return value * 2;
}, undefined, 300);

// 连续调用，只会在最后一次调用后 300 毫秒执行一次
debounce.exe(1);
debounce.exe(2);
debounce.exe(3);
// 输出: 执行防抖函数: 3

// 使用静态方法创建防抖函数
const debounceFn = Debounce.new((value) => {
  console.log('执行静态防抖函数:', value);
}, 200);

debounceFn(1);
debounceFn(2);
debounceFn(3);
// 输出: 执行静态防抖函数: 3
```

# 类 `Throttle`
节流函数类，用于限制函数的执行频率。

## 构造函数参数
- `fn`：需要执行的函数
- `thisArg`：`this` 上下文
- `delay`：延迟时间，默认 100 毫秒

## 属性
- `result`：执行结果
- `thisArg`：`this` 上下文
- `delay`：延迟时间
- `fn`：需要执行的函数
- `args`：函数参数

## 方法
### `clean()`
清除定时器。

### `exe(...args)`
执行函数。
- 参数：函数参数

### `exec()`
执行函数。

## 静态方法
### `new(fn, delay?)`
创建一个节流函数。
- 参数：
  - `fn`：要执行的函数
  - `delay`：节流延迟时间，默认为 100 毫秒
- 返回值：节流函数

## 示例
```ts
// 创建一个节流实例
const throttle = new Throttle((value) => {
  console.log('执行节流函数:', value);
  return value * 2;
}, undefined, 300);

// 连续调用，每 300 毫秒最多执行一次
throttle.exe(1); // 执行
throttle.exe(2); // 被忽略
throttle.exe(3); // 被忽略
setTimeout(() => {
  throttle.exe(4); // 执行
}, 350);

// 使用静态方法创建节流函数
const throttleFn = Throttle.new((value) => {
  console.log('执行静态节流函数:', value);
}, 200);

throttleFn(1); // 执行
throttleFn(2); // 被忽略
setTimeout(() => {
  throttleFn(3); // 执行
}, 250);
```

# 类 `Interval`
管理 setInterval 定时器的启动/停止，支持动态调整间隔时间。

## 构造函数参数
- `fn`：要定时执行的函数
- `interval`：执行间隔时间（毫秒）
- `thisArgs`：函数的 this 绑定对象（可选）

## 属性
- `fn`：定时执行的目标函数
- `thisArgs`：目标函数的 this 绑定对象
- `isRunning`：是否正在运行定时器（只读）
- `interval`：当前定时器间隔时间（毫秒）

## 方法
### `start()`
启动定时器。

### `stop()`
停止定时器。

## 示例
```ts
// 创建一个定时器实例
let count = 0;
const interval = new Interval(() => {
  console.log('执行定时器:', ++count);
}, 1000);

// 启动定时器
interval.start();

// 5 秒后停止定时器
setTimeout(() => {
  interval.stop();
  console.log('定时器已停止');
}, 5000);

// 动态调整间隔时间
setTimeout(() => {
  interval.interval = 500; // 改为 500 毫秒
  console.log('间隔时间已调整为 500ms');
}, 2000);
```

# 类 `Timeout`
延迟定时器，管理 setTimeout 定时器的启动/停止。

## 构造函数参数
- `fn`：要定时执行的函数
- `timeout`：执行延迟时间（毫秒），默认为 0
- `thisArgs`：函数的 this 绑定对象（可选）

## 属性
- `fn`：定时执行的目标函数
- `thisArgs`：目标函数的 this 绑定对象
- `running`：是否正在运行定时器（只读）
- `timeout`：当前定时器延迟时间（毫秒）

## 方法
### `start(timeout?)`
启动定时器。
- 参数：覆盖原延迟时间（可选）
- 返回值：是否成功创建定时器

### `stop()`
停止定时器。
- 返回值：若无定时器则返回 false

### `restart(timeout?)`
重启定时器。
- 参数：覆盖原延迟时间（可选）

## 示例
```ts
// 创建一个超时定时器实例
const timeout = new Timeout(() => {
  console.log('执行超时定时器');
}, 2000);

// 启动定时器
timeout.start();

// 1 秒后重启定时器
setTimeout(() => {
  timeout.restart(3000); // 重启并改为 3 秒
  console.log('定时器已重启');
}, 1000);

// 2 秒后停止定时器
setTimeout(() => {
  timeout.stop();
  console.log('定时器已停止');
}, 2000);
```

# 类 `RepeatingTriggerController`
模拟按键长按重复触发的控制器。

## 构造函数参数
- `fn`：要执行的函数
- `initialDelay`：初始延迟时间，可选，默认为 500 毫秒
- `repeatInterval`：重复触发的时间间隔，可选，默认为 100 毫秒

## 属性
- `isRunning`：是否正在运行（只读）
- `fn`：要执行的函数
- `initialDelay`：初始延迟
- `repeatInterval`：重复触发的时间间隔

## 方法
### `start()`
开始触发。

### `stop()`
停止触发。

### `restart()`
重启。

## 示例
```ts
// 创建一个重复触发控制器
let count = 0;
const trigger = new RepeatingTriggerController(() => {
  console.log('触发执行:', ++count);
}, 500, 100);

// 开始触发
trigger.start();

// 3 秒后停止触发
setTimeout(() => {
  trigger.stop();
  console.log('触发已停止');
}, 3000);
```

# 类型 `AnimationFrameHandler`
动画帧处理器类型。

## 参数
- `time`：当前时间
- `diff`：与上一帧相差时间（控制器启动后第一帧为 0）

# 类 `AnimationFrameController`
管理 requestAnimationFrame 的启动/停止，支持同步/异步回调。

## 构造函数参数
- `fn`：每帧要执行的回调函数，参数为时间戳
- `async`：是否异步执行回调函数，可选，默认为 `false`

## 属性
- `isRunning`：是否正在运行动画帧循环（只读）
- `ignoreErrors`：是否忽略回调函数中的错误
- `fn`：当前帧回调函数
- `async`：是否以异步模式运行回调函数

## 方法
### `start()`
启动动画帧循环。

### `stop()`
停止动画帧循环。

## 示例
```ts
// 创建一个动画帧控制器
let lastTime = 0;
const animationController = new AnimationFrameController((time, diff) => {
  // 计算帧率
  const fps = diff ? 1000 / Math.abs(diff) : 0;
  console.log(`当前帧率: ${Math.round(fps)} FPS`);
  
  // 简单的动画逻辑
  const progress = (time - lastTime) / 1000;
  console.log(`动画进度: ${progress.toFixed(2)}s`);
});

// 启动动画
animationController.start();

// 5 秒后停止动画
setTimeout(() => {
  animationController.stop();
  console.log('动画已停止');
}, 5000);
```

# 类 `Timer`
计时器，用于测量时间间隔。

## 属性
- `duration`：时长
- `isRunning`：是否正在运行（只读）

## 方法
### `start()`
开始/继续计时。
- **返回值**：如果已经在运行则返回 false

### `pause()`
暂停计时。
- **返回值**：如果没有在运行则返回 false

### `clear()`
停止并清零计时。
- **返回值**：如果已经停止且时长为 0 则返回 false

## 示例
```ts
// 创建一个计时器实例
const timer = new Timer();

// 开始计时
timer.start();

// 模拟一些操作
setTimeout(() => {
  // 暂停计时
  timer.pause();
  console.log(`已计时: ${timer.duration}ms`);
  
  // 继续计时
  timer.start();
  
  // 再次模拟操作
  setTimeout(() => {
    // 停止并清零
    timer.clear();
    console.log(`最终计时: ${timer.duration}ms`);
  }, 1000);
}, 2000);
```
