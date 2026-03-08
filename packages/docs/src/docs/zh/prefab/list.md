---
title: 列表
source: packages/abm-ui/src/prefab/list.ts
---

# 使用
:::全局导入
```ts
import { List } from 'abm-ui';
```
::: 按需导入
```ts
import { List } from 'abm-ui/prefab/list';
```
:::

{{[demo](../../../demo/component/list-prefab.tsx)}}

# 类 `PrefabListItem`
预制列表项组件，内部已附加了 Shadow DOM，Shadow DOM 中包含一个插槽。

## 静态方法 `creator`
创建一个列表项元素创建函数。创建参数如下：

直接传入渲染函数：
```ts
(self: ListItem<T>) => {
  self.replaceChildren(String(self.value));
}
```

完成创建参数：
- `render(self: ListItem<T>): any`，渲染函数，用于渲染列表项的内容，当列表项的值发生变化时，会调用该函数进行渲染
- `init(self: ListItem<T>): void`，初始化函数，用于初始化列表项的状态，默认值为空函数
- `activeTrigger`：激活触发元素，若设定为 `true`，则表示列表项作为触发器
- `selectTrigger`：选择触发元素，若设定为 `true`，则表示列表项作为选择器
- `dragHandle`：拖拽把手元素，若设定为 `true`，则表示列表项作为拖拽把手
- `hoverable`：是否可悬停，若设定为 `true`，则表示列表项可悬停
- `activatable`：是否可激活，若设定为 `true`，则表示列表项可激活
- `navigable`：是否可导航，若设定为 `true`，则表示列表项可导航
- `style`：自定义列表项样式
