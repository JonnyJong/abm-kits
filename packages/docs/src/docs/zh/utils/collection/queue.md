---
title: 队列
source: packages/abm-utils/src/collection/queue.ts
---

```ts
import 'abm-utils/collection/queue';
```

# 类 `Queue`
队列实现。

## 方法
- `enqueue(...items)`：入队
- `dequeue()`：出队
- `empty`：获取队列是否为空

## 示例
```ts
const queue = new Queue(1, 2, 3);
queue.enqueue(4, 5);

console.log(queue.dequeue()); // 1
console.log(queue.dequeue()); // 2
console.log(queue.empty); // false

// 遍历队列
for (const item of queue) {
  console.log(item); // 3, 4, 5
}

console.log(queue.empty); // true
```
