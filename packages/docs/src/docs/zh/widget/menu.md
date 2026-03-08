---
title: 菜单
source: packages/abm-ui/src/component/menu.ts
---

# 尝试一下
{{[demo](../../../demo/widget/menu.tsx)}}

# 使用
:::全局导入
```ts
import { Menu, MenuItem } from 'abm-ui';
```
:::按需导入
```ts
import { Menu, MenuItem } from 'abm-ui/widget/menu';
```
:::

# 类 `Menu`
继承自 [`MenuItem`](#类-menuitem) 类。

## 方法

### `open`
打开菜单。

支持以下类型参数：
- `Element`：以指定元素为锚点打开菜单
- `DOMRect`：以指定矩形为锚点打开菜单
- `Vec2`：以指定坐标为锚点打开菜单
- `MenuOpenOptions`：菜单打开选项
  - `origin`：菜单打开原点，支持以下类型参数
    - `Element`：以指定元素为锚点打开菜单
    - `DOMRect`：以指定矩形为锚点打开菜单
    - `Vec2`：以指定坐标为锚点打开菜单
  - `preferSide`：菜单打开时优先显示的侧边，支持以下参数
    - `top`：优先在顶部显示
    - `bottom`：优先在底部显示
    - `left`：优先在左侧显示
    - `right`：优先在右侧显示
  - `preferAlign`：菜单打开时优先显示的对齐方式，支持以下参数
    - `start`：优先在起点对齐
    - `end`：优先在终点对齐

### `close`
关闭菜单。

# 类 `MenuItem`

## 构造参数
所有构造参数均为可选参数。

- `init`：菜单项初始化参数
  - `id`：菜单项 ID
  - `icon`：菜单项图标
  - `label`：菜单项标签
  - `type`：菜单项类型
    - `menu`：普通菜单项
    - `separator`：菜单分隔符
    - `checkbox`：复选框菜单项
  - `checked`：菜单项是否选中
  - `disabled`：菜单项是否禁用
  - `hidden`：隐藏菜单项
  - `action`：菜单项点击事件
  - `submenu`：子菜单
  - `before`：排列在列表中的菜单项前
  - `after`：排列在列表中的菜单项后

## 属性
支持通过以下属性设置菜单项：

- `id`：菜单项 ID
- `icon`：菜单项图标
- `label`：菜单项标签
- `type`：菜单项类型
- `checked`：菜单项是否选中
- `disabled`：菜单项是否禁用
- `hidden`：隐藏菜单项
- `action`：菜单项点击事件

## 方法

### `prepend`
在菜单项前插入多个菜单项。

### `append`
在菜单项后插入多个菜单项。

### `insert`
在指定位置插入多个菜单项。

### `getChildren`
获取子菜单项。

### `clear`
清除所有子菜单项。

### `clone`
克隆菜单项。
