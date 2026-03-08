---
title: 集合
source: packages/abm-utils/src/collection/set.ts
---

```ts
import 'abm-utils/collection/set';
```

# 函数 `areSetEqual`
检查两个集合是否相等。
```ts
const set1 = new Set([1, 2, 3]);
const set2 = new Set([3, 2, 1]);
areSetEqual(set1, set2); // true

const set3 = new Set([1, 2, 3, 4]);
areSetEqual(set1, set3); // false
```

# 函数 `find`
在 Set 中查找元素，同 `Array.prototype.find`。
```ts
const set = new Set([1, 2, 3, 4, 5]);
find(set, (item) => item > 3); // 4
find(set, (item) => item > 5); // null
```

# 类 `IterableWeakSet`
一个实现了 `Set` 接口的 `IterableWeakSet` 类，用于存储对对象的弱引用。当对象被垃圾回收时，它们将从集合中自动删除。

## 构造函数参数
- `values`：要添加到集合中的初始值数组（可选）

## 属性
- `size`：获取集合的大小

## 方法
### `add(value)`
向集合中添加一个值。
- 参数：要添加的值
- 返回值：集合本身

### `clear()`
清空集合。

### `delete(value)`
从集合中删除一个值。
- 参数：要删除的值
- 返回值：如果值被成功删除，则返回 `true`，否则返回 `false`

### `forEach(callbackfn, thisArg?)`
遍历集合中的每个元素，并对每个元素执行回调函数。
- 参数：
  - `callbackfn` - 对每个元素执行的回调函数
  - `thisArg` - 回调函数中的 `this` 值（可选）

### `has(value)`
检查集合中是否包含某个值。
- 参数：要检查的值
- 返回值：如果集合中包含该值，则返回 `true`，否则返回 `false`

### `entries()`
返回一个迭代器，用于遍历集合中的所有元素。
- 返回值：集合中的每个元素的迭代器

### `keys()`
返回一个迭代器，用于遍历集合中的所有键。
- 返回值：集合中的所有键的迭代器

### `values()`
返回一个迭代器，用于遍历集合中的所有值。
- 返回值：集合中的所有值的迭代器

### `find(predicate)`
返回满足提供的测试函数的第一个值。否则返回 `undefined`。
- 参数：测试函数
- 返回值：满足测试函数的第一个值，否则返回 `undefined`

### `findAll(predicate)`
返回满足提供的测试函数的所有值。
- 参数：测试函数
- 返回值：满足测试函数的所有值的数组

