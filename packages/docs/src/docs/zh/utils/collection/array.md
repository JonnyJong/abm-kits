---
title: 数组
source: packages/abm-utils/src/collection/array.ts
---

```ts
import 'abm-utils/collection/array';
```

# 泛型 `ArrayOr`
声明一个类型 `T` 或由 `T` 组成的数组。

# 函数 `asArray`
将一个类型 `T` 或由 `T` 组成的数组转换为数组。
```ts
asArray(1); // [1]
asArray([1, 2, 3]); // [1, 2, 3]
```

# 函数 `range`
生成一个数字数组。
```ts
range(5); // [0, 1, 2, 3, 4]
range(1, 5); // [1, 2, 3, 4]
range(1, 5, 2); // [1, 3, 5]

const array = ['a', 'b', 'c'];
range(array); // [0, 1, 2]
```

# 函数 `shuffle`
随机打乱数组中的元素顺序。
```ts
const array = [1, 2, 3, 4, 5];
const shuffled = shuffle(array); // 例如: [3, 1, 5, 2, 4]
shuffled === array; // true
```

# 函数 `shift`
将数组中的元素从指定的 from 索引位置移动到 to 索引的位置。
```ts
const array = [1, 2, 3, 4, 5];
const shifted = shift(array, 2, 4); // [1, 2, 4, 3, 5]
shifted === array; // true
```

# 函数 `applyConditionalOperation`
根据条件对数组中的元素应用操作。
```ts
const array = [1, 2, 3, 4, 5];
applyConditionalOperation(
  array,
  (item, shouldApply) => console.log(`${item}: ${shouldApply}`),
  (item) => item % 2 === 0
);
// 输出:
// 1: false
// 2: true
// 3: false
// 4: true
// 5: false
```

# 函数 `toReversed`
反转给定数组的副本并返回，不改变原数组。
```ts
const array = [1, 2, 3];
const reversed = toReversed(array);
console.log(reversed); // [3, 2, 1]
console.log(array); // [1, 2, 3] (原数组不变)
```

# 函数 `createArray`
创建一个指定长度的数组，并通过生成器函数初始化每个元素。
```ts
createArray(5, (index) => index ** 2); // [0, 1, 4, 9, 16]
```

# 函数 `proxyArray`
创建一个代理数组，该数组在添加或删除元素时会触发更新函数。

## 参数
- `options`：配置选项
  - `update`：更新时的回调函数
  - `debounceDelay`：防抖延迟时间（可选）
  - `set`：添加元素时的回调函数（可选）
- `arr`：要代理的数组，默认为空数组

## 示例
```ts
const proxy = proxyArray({
  update: (target) => {
    console.log('数组已更新:', target);
  },
}, [1, 2, 3]);

proxy.push(4); // 数组已更新: [1, 2, 3, 8]
proxy[0] = 5; // 数组已更新: [5, 2, 3, 8]
```

# 类 `SyncList`
同步数据列表与实例列表。

## 构造函数参数
- `options`：初始化选项
  - `getData`：获取实例数据的函数
  - `setData`：设置实例数据的函数
  - `create`：创建实例的函数
  - `reset`：重置实例的函数（可选）
  - `creatable`：是否可创建实例（可选）
  - `update`：列表更新回调（可选）
  - `updateDelay`：列表更新防抖延迟（可选）

## 属性
- `creatable`：是否可创建实例
- `instances`：实例列表
- `data`：数据列表
- `items`：数据代理，该列表可被安全的暴露

## 方法
- `rebuild()`：重建所有实例
- `replace(...items)`：替换整个列表

## 示例
```ts
class Item {
  constructor(public value: number) {}
}

const syncList = new SyncList<number, Item>({
  getData: (item) => item.value,
  setData: (item, data) => { item.value = data; },
  create: (data) => new Item(data),
  creatable: true,
  update: () => console.log('列表已更新')
});

// 使用 items 代理
const items = syncList.items;
items.push(1, 2, 3); // 列表已更新
console.log(items); // [1, 2, 3]

// 访问实例
console.log(syncList.instances.length); // 3

// 切换 creatable 状态
syncList.creatable = false;
console.log(syncList.data); // [1, 2, 3]
console.log(syncList.instances.length); // 0
```

## `proxyArray` 与 `SyncList` 比较
### 相似点
- 两者都提供了对数组操作的代理机制
- 都支持在数组变化时触发回调函数
- 都支持防抖延迟

### 不同点
- **粒度不同**：
  - `proxyArray` 是对单个数组的代理，关注数组本身的变化
  - `SyncList` 是对数据列表和实例列表的双向同步，关注数据与实例之间的转换
- **功能不同**：
  - `proxyArray` 主要提供数组操作的拦截和回调
  - `SyncList` 提供数据与实例之间的自动转换和同步
- **使用场景不同**：
  - `proxyArray` 适用于需要监听数组变化的场景
  - `SyncList` 适用于需要在数据和实例之间保持同步的场景，例如 UI 组件列表
