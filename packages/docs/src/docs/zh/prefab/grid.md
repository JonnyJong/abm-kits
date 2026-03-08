---
title: 网格
source: packages/abm-ui/src/prefab/grid.ts
---

# 使用
:::全局导入
```ts
import { PrefabGridItem } from 'abm-ui';
```
:::按需导入
```ts
import { PrefabGridItem } from 'abm-ui/prefab/grid-item';
```
:::

{{[demo](../../../demo/component/grid-prefab.tsx)}}

# 类 `PrefabGridItem`
预制网格项组件，内部已附加了 Shadow DOM，Shadow DOM 中包含一个插槽。

## 静态方法 `creator`
创建一个网格项元素创建函数。创建参数如下：

直接传入渲染函数：
```ts
(self: GridItem<T>) => {
  self.replaceChildren(String(self.value));
};
```

完整创建参数：
- `render(self: GridItem<T>): any`，渲染函数，用于渲染网格项的内容，当网格项的值发生变化时，会调用该函数进行渲染
- `init(self: GridItem<T>): void`，初始化函数，用于初始化网格项的状态，默认值为空函数
- `activeTrigger`：激活触发元素，若设定为 `true`，则表示网格项作为触发器
- `selectTrigger`：选择触发元素，若设定为 `true`，则表示网格项作为选择器
- `hoverable`：是否可悬停，若设定为 `true`，则表示网格项可悬停
- `activatable`：是否可激活，若设定为 `true`，则表示网格项可激活
- `navigable`：是否可导航，若设定为 `true`，则表示网格项可导航
- `style`：自定义网格项样式
