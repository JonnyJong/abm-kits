---
title: 表格
source: packages/abm-ui/src/component/table.ts
---

该组件的表单值类型为 `T[]`。

# 尝试一下
{{[demo](../../../../demo/component/table.tsx)}}

# 使用
:::全局导入
```ts
import { Table } from 'abm-ui';
```
::: 按需导入
```ts
import { Table } from 'abm-ui/component/table';
```
:::注册导入
```ts
import 'abm-ui/component/table';
```
:::

# 属性

## `columns`
表格列配置，类型为 `TableColumn<T>[]`。

```ts
interface TableColumn<T, K extends keyof T = keyof T> {
	/** 列键 */
	key: K;
	/** 列头 */
	head?: (key: K) => DOMContents;
	/** 单元格 */
	cell?: TableCell<T, T[K]> | Constructor<FormControl<T[K]>>;
	/** 排序比较 */
	sort?: (a: T[K], b: T[K]) => number;
	/** 列宽度 */
	width?: string | number;
}
```

# 方法

## `filter`
根据指定条件过滤显示表格行。

| 条件参数                              | 描述                                         |
| ------------------------------------- | -------------------------------------------- |
| `true`                                | 隐藏全部                                     |
| `false`、`null`、`undefined`          | 显示全部                                     |
| `number[]`                            | 显示指定索引的表格行                         |
| `(item: T, index: number) => boolean` | 自定义过滤函数，返回 `true` 表示显示该表格行 |

## `sort`
排序表格行。

参数：
- `key`：排序键，对应 `columns` 中的 `key` 属性
- `reverse`：是否逆序排序，默认值为 `false`
