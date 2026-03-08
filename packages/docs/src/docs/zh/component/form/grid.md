---
title: 网格
source: packages/abm-ui/src/component/grid.ts
---

该组件表单类型为 `T[]`。

# 使用
:::全局导入
```ts
import { Grid, GridItem } from 'abm-ui';
```
:::按需导入
```ts
import { Grid, GridItem } from 'abm-ui/component/grid';
```
:::注册导入
```ts
import 'abm-ui/component/grid';
```
:::

## 使用自定义元素
若要通过自定义元素创建网格项，需要继承 [`GridItem`](#类-griditem) 类，并注册自定义元素。
{{[demo](../../../../demo/component/grid-custom.tsx)}}

## 使用预制 UI
更多信息请参考 [预制 UI/网格](../../prefab/grid#静态方法-creator)。
:::全局导入
```ts
import { PrefabGridItem } from 'abm-ui';
```
:::按需导入
```ts
import { PrefabGridItem } from 'abm-ui/prefab/grid';
```
:::

{{[demo](../../../../demo/component/grid-prefab.tsx)}}

# 属性

## `items`
网格项列表，只读。

## `itemCreator`
网格项创建函数，用于创建网格项。

## `selectType`
选择类型，可选值为 `null`、`single`、`multi`。

## `hGap`
水平间距，单位为像素。

## `vGap`
垂直间距，单位为像素。

# 方法

## `filter`
根据条件过滤显示网格项。

| 条件参数                              | 描述                                         |
| ------------------------------------- | -------------------------------------------- |
| `true`                                | 隐藏全部                                     |
| `false`、`null`、`undefined`          | 显示全部                                     |
| `number[]`                            | 显示指定索引的网格项                         |
| `(item: T, index: number) => boolean` | 自定义过滤函数，返回 `true` 表示显示该网格项 |

## `select`
根据条件选择网格项。

| 条件参数                              | 描述                                         |
| ------------------------------------- | -------------------------------------------- |
| `true`                                | 选择全部                                     |
| `false`、`null`、`undefined`          | 取消选择全部                                 |
| `number[]`                            | 选择指定索引的网格项                         |
| `(item: T, index: number) => boolean` | 自定义选择函数，返回 `true` 表示选择该网格项 |

## `getSelected`
获取当前选中的网格项数据列表。

## `getSelectedIndex`
获取当前选中的网格项索引列表。

# 事件
| 事件名   | 参数列表                    | 描述              |
| -------- | --------------------------- | ----------------- |
| `active` | `(value: T, index: number)` | 网格项被激活      |
| `select` | `()`                        | 网格项被选中/反选 |

---

# 类 `GridItem`

该类有一个泛型 `T`，表示该网格项的值类型。

## 属性

### `host`
获取当前网格项宿主，类型为 `Grid<T>`，在构建阶段后可用。

### `value`
类型 `T`，表示当前网格项数据。

### `activeTrigger`
激活事件触发器，用户可点击该元素来触发激活事件，需确保该元素的可访问性。

### `selectTrigger`
选择触发器，用户可点击该元素来触发选择事件，需确保该元素的可访问性。

## 方法

### `active`
激活当前网格项，触发 `active` 事件。
