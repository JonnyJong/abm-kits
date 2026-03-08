---
title: Queue
source: packages/abm-utils/src/collection/queue.ts
---

```ts
import 'abm-utils/collection/queue';
```

# Class `Queue`
Queue implementation.

## Methods
- `enqueue(...items)`: Enqueue
- `dequeue()`: Dequeue
- `empty`: Get whether the queue is empty

## Example
```ts
const queue = new Queue(1, 2, 3);
queue.enqueue(4, 5);

console.log(queue.dequeue()); // 1
console.log(queue.dequeue()); // 2
console.log(queue.empty); // false

// Iterate over the queue
for (const item of queue) {
  console.log(item); // 3, 4, 5
}

console.log(queue.empty); // true
```