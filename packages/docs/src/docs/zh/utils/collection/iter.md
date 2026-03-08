---
title: 迭代
source: packages/abm-utils/src/collection/iter.ts
---

```ts
import 'abm-utils/collection/iter';
```

# 泛型 `IterOr`
声明一个类型 `T` 或枚举值类型为 `T` 的迭代器或可迭代对象。

# 泛型 `Iter`
声明一个枚举值类型为 `T` 的迭代器与可迭代对象。

# 函数 `asIter`
将一个类型 `T` 或枚举值类型为 `T` 的迭代器或可迭代对象转换为迭代器与可迭代对象。
```ts
// 单个值
const iter1 = asIter(1);
iter1.next(); // { value: 1, done: false }
iter1.next(); // { value: undefined, done: true }

// 数组
const iter2 = asIter([1, 2, 3]);
for (const item of iter2) {
  console.log(item); // 1, 2, 3
}
```

# 函数 `zip`
同时遍历多个可迭代对象或迭代器。
```ts
const numbers = [1, 2, 3];
const letters = ['a', 'b', 'c'];
for (const [num, char] of zip(numbers, letters)) {
  console.log(num, char); // 1 a, 2 b, 3 c
}
```
