---
title: 列表
source: packages/abm-ui/src/component/list.ts
---

该组件表单类型为 `T[]`。

# 使用
:::全局导入
```ts
import { List, ListItem } from 'abm-ui';
```
::: 按需导入
```ts
import { List, ListItem } from 'abm-ui/component/list';
```
:::注册导入
```ts
import 'abm-ui/component/list';
```
:::

## 使用自定义元素
若要通过自定义元素创建列表项，需要继承 [`ListItem`](#类-listitem) 类。
{{[demo](../../../../demo/component/list-custom.tsx)}}

## 使用预制 UI
更多信息请参考 [预制 UI/列表](../../prefab/list#静态方法-creator)。
:::全局导入
```ts
import { PrefabListItem } from 'abm-ui';
```
:::按需导入
```ts
import { PrefabListItem } from 'abm-ui/prefab/list';
```
:::

{{[demo](../../../../demo/component/list-prefab.tsx)}}

# 属性

## `items`
列表项列表，只读。

## `itemCreator`
列表项创建函数，用于创建列表项。

## `selectType`
选择类型，可选值为 `null`、`single`、`multi`。

## `mouseStartDelay`
鼠标排序开始延迟，单位为毫秒，默认值为 `0`。

## `penStartDelay`
笔排序开始延迟，单位为毫秒，默认值为 `500`。

## `touchStartDelay`
触摸排序开始延迟，单位为毫秒，默认值为 `500`。

# 方法

## `filter`
根据指定条件过滤显示列表项。

| 条件参数                              | 描述                                         |
| ------------------------------------- | -------------------------------------------- |
| `true`                                | 隐藏全部                                     |
| `false`、`null`、`undefined`          | 显示全部                                     |
| `number[]`                            | 显示指定索引的列表项                         |
| `(item: T, index: number) => boolean` | 自定义过滤函数，返回 `true` 表示显示该列表项 |

## `select`
根据条件选择列表项。

| 条件参数                              | 描述                                         |
| ------------------------------------- | -------------------------------------------- |
| `true`                                | 选择全部                                     |
| `false`、`null`、`undefined`          | 取消选择全部                                 |
| `number[]`                            | 选择指定索引的列表项                         |
| `(item: T, index: number) => boolean` | 自定义选择函数，返回 `true` 表示选择该列表项 |

## `getSelected`
获取当前选中的列表项数据列表。

## `getSelectedIndex`
获取当前选中的列表项索引列表。

## `sort`
排序列表项。

---

# 类 `ListItem`

该类有一个泛型 `T`，表示列表项的值类型。

## 属性

### `host`
获取当前列表项宿主，类型为 `List<T>`，在构建阶段后可用。

### `value`
类型 `T`，表示当前列表项值。

### `activeTrigger`
激活事件触发器，用户可点击该元素来触发激活事件，需确保该元素的可访问性。

### `selectTrigger`
选择触发器，用户可点击该元素来触发选择事件，需确保该元素的可访问性。

### `dragHandle`
拖拽把手，用户可点击该元素来触发拖动事件，需确保该元素的可访问性。

## 方法

### `active`
激活当前网格项，触发 `active` 事件。

### `startSort`
开始排序，调用该方法以通知排序导航式排序开始。

### `stopSort`
停止排序，调用该方法以通知排序导航式排序结束。

### `handleNavSort`
处理导航排序，导航排序开始后可将导航状态信息重定向到此处以自动处理排序。

### `sortStart`
当确实开始排序时，列表将会调用该方法，可以重写该方法以自定义排序开始时的行为。
