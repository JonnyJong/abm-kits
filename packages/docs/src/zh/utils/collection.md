---
title: 集合
source:
	- packages/abm-utils/src/collection.ts
---

# 类型 `ArrayOr`
该类型有一个泛型 `T`，表示一个类型 `T` 或由 `T` 组成的数组。

# `asArray()`
将 [`ArrayOr<T>`](#类型-arrayor) 转换为 `T[]`。

# `range()`
生成由数字序列组成的数组。

该函数有多个重载：
- `(array: any[])`：\
  返回输入数组中所有元素的索引值组成的数组。\
	示例：`range(['a', 'b', 'c'])` -> `[0, 1, 2]`
- `(to: number)`：\
  返回从 `0` 到 `to - 1` 组成的数组。\
	示例：
  - `range(5)` -> `[0, 1, 2, 3, 4]`
  - `range(-5)` -> `[0, -1, -2, -3, -4]`
- `(from: number, to: number)`：\
  返回从 `from` 到 `to` 的数字数组（不包含 `to`）。\
	示例：
  - `range(2, 6)` -> `[2, 3, 4, 5]`
  - `range(6, 2)` -> `[6, 5, 4, 3]`
- `(from: number, to: number, step: number)`：\
  返回从 `from` 到 `to`，步长为 `step` 的数字数组（不包含 `to`），若 `step` 为负数，则交换 `from` 和 `to`\
	示例：
  - `range(1, 10, 2)` -> `[1, 3, 5, 7, 9]`
  - `range(1, 10, -2)` -> `[10, 8, 6, 4, 2]`
  - `range(10, 1, 2)` -> `[10, 8, 6, 4, 2]`
  - `range(10, 1, -2)` -> `[1, 3, 5, 7, 9]`

# `shuffle()`
随机打乱数组中的元素顺序并返回。该函数会修改原数组。

# `areSetEqual()`
检查两个 `Set` 是否相等，返回 `boolean`。

# ~~`proxyArray()`~~
**不再推荐使用该函数，由于其语义上存在歧义，且更新回调不能获取完整的更新信息，在未来的版本中将被弃用。**

简易地代理数组实现监听数组。

参数：
- `options`：代理选项，[`ProxyArrayOptions`](#接口-proxyarrayoptions) 类型
- `array`：代理的数组，默认为空数组

## 接口 `ProxyArrayOptions`

### `update()`
数组更新回调函数。

### `set()`
设置数组元素回调函数，可选。

### `debounceDelay`
调用回调函数防抖延迟，可选。

# `find()`
在 `Set` 中查找第一个符合条件的元素并返回，该函数类似于 `Array.prototype.find`。

# `shift()`
将数组中的元素从指定的 `from` 索引位置移动到 `to` 索引的位置，并返回处理后的数组。

```ts
import { shift } from 'abm-utils';

shift([1, 2, 3, 4, 5], 2, 4); // `[1, 2, 4, 3, 5]` 索引 4 元素前
shift([1, 2, 3, 4, 5], 4, 0); // `[5, 1, 2, 3, 4]` 索引 0 元素前
shift([1, 2, 3, 4, 5], 1, 5); // `[1, 3, 4, 5, 2]` 索引 4 元素后
shift([1, 2, 3, 4, 5], 1, 4); // `[1, 3, 4, 2, 5]` 索引 4 元素前
```

# 类 `SyncList`
同步数据列表与实例列表。

## `constructor()`
一个 [`SyncListInit`](#接口-synclistinit) 参数。

## `getData`
`(instance: Instance) => Data` 类型的属性，可读取或修改将实例转换为数据的实现函数。

## `setData`
`(instance: Instance, data: Data) => void` 类型的属性，可读取或修改将数据应用到实例的实现函数。

## `create`
`(data: Data) => Instance` 类型的属性，可读取或修改从数据创建实例的实现函数。

## `update`
`Function | undefined` 类型的属性，可读取或修改列表更新回调函数。

## `creatable`
`boolean` 类型的属性，可读取或修改当前能否创建实例。
- `true`：可创建实例。\
  当状态切换为可创建实例时，会将数据列表中所有数据创建为实例，并且清空数据列表。
- `false`：禁用创建实例。\
  当状态切换为禁用创建实例时，会将实例列表中所有实例转换为数据，并且清空实例列表。

## `instances`
实例列表，包含所有实例，当禁用创建实例时，该列表为空。

## `data`
数据列表，包含所有数据，当可创建实例时，该列表为空。

## `items`
代理数据列表，可安全地暴露将该列表。

## `replace()`
替换整个数据列表。

## 接口 `SyncListInit`

### `getData`
`(instance: Instance) => Data` 类型的属性，将实例转换为数据的实现函数。

### `setData`
`(instance: Instance, data: Data) => void` 类型的属性，将数据应用到实例的实现函数。

### `create`
`(data: Data) => Instance` 类型的属性，从数据创建实例的实现函数。

### `update`
`Function` 类型的属性，列表更新回调函数，可选。

### `creatable`
`boolean` 类型的属性，初始化后能否创建实例，默认 `false`。
- `true`：可创建实例。\
  当状态切换为可创建实例时，会将数据列表中所有数据创建为实例，并且清空数据列表。
- `false`：禁用创建实例。\
  当状态切换为禁用创建实例时，会将实例列表中所有实例转换为数据，并且清空实例列表。

### `updateDelay`
列表更新防抖延迟，可选。

# `applyConditionalOperation()`
根据条件对数组中的元素应用操作。

参数：
- `array: T[]`：操作的数组
- `operate: (item: T, shouldApply: boolean) => any`：操作函数
- `condition: boolean | number[] | ((data: D) => boolean) | null | undefined`：条件规则
  - `true`：所有元素 `operate(item, true)`
  - `false`、`null`、`undefined`：所有元素 `operate(item, false)`
  - `number[]`：指定索引的项 `operate(item, true)`，其余 `operate(item, false)`
  - `((data: Data)=>boolean)`：根据返回值执行 `operate`
- `dataMapper`：代理函数，将元素转换为条件判断所需的数据类型 `D`

# `zip()`
同时遍历多个数组，生成按索引对应的元素元组的迭代器，迭代次数为最短数组长度。

```ts
import { zip } from 'abm-utils';

for (const [num, char] of zip([1, 2, 3], ['a', 'b', 'c', 'd'])) {
	console.log(num, char);
}

/*
输出：
	1 a
	2 b
	3 c
*/
```

# `toReversed()`
反转给定数组的副本并返回，不改变原数组。

# `createArray()`
创建一个指定长度的数组，并通过生成器函数初始化每个元素。

```ts
import { createArray } from 'abm-utils';

const array = createArray(10, (_, i) => i);

console.log(array); // [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
```

