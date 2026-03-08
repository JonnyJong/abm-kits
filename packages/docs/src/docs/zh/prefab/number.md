---
title: 数字输入预制件
source: packages/abm-ui/src/prefab/number.ts
---

# 使用
:::全局导入
```ts
import { createNumberInputPrefab } from 'abm-ui';
```
:::按需导入
```ts
import { createNumberInputPrefab } from 'abm-ui/prefab/number';
```
:::

{{[demo](../../../demo/prefab/number.tsx)}}

# 函数 `createNumberInputPrefab`

## 参数
所有参数均为可选参数。
- `init`：初始化参数
  - `slider`：滑动条、滑动条属性
  - `numberBox`：数字输入框、数字输入框属性
  - `default`：默认值，默认 `0`
  - `value`：初始值，默认 `0`
  - `start`：起点值，默认 `0`
  - `end`：终点值，默认 `1`
  - `step`：步长，默认 `0`
  - `$input`：`input` 事件处理器
  - `$change`：`change` 事件处理器

## 返回对象
- `slider`：滑动条，只读
- `numberBox`：数字输入框，只读
- `start`：起始值
- `end`：终点值
- `step`：步长
- `default`：默认值
- `value`：当前值
