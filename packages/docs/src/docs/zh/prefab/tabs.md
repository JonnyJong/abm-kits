---
title: 多标签页预制件
source: packages/abm-ui/src/prefab/tabs.ts
---

# 使用
:::全局导入
```ts
import { createTabsPrefab } from 'abm-ui';
```
:::按需导入
```ts
import { createTabsPrefab } from 'abm-ui/prefab/tabs';
```
:::

{{[demo](../../../demo/prefab/tabs.tsx)}}

# 函数 `createTabsPrefab`

## 参数
- `tabs`：标签定义
- `init`：初始化参数，可选
  - `nav`：导航栏、导航栏属性，可选
  - `pageHost`：页面宿主、页面宿主属性，可选
  - `args`：参数列表，可选
  - `default`：默认标签页，可选
  - `transition`：标签页切换动画
    - `suppress`：直接切换，无动画，默认
    - `fade`：淡入淡出切换动画
    - `entrance`：从下往上切换动画
    - `drill`：缩放切换动画
    - `slide`：滑动
  `$change`：标签页切换回调

## 返回对象
- `nav`：导航栏，只读
- `pageHost`：页面宿主，只读
- `value`：标签页 ID
- `current`：当前标签页实例，只读
