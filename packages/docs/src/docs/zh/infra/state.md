---
title: 状态管理
source: packages/abm-ui/src/state
---

```ts
import 'abm-ui/state/index';
```

# 悬停状态
悬停状态只能由鼠标、笔、键盘、游戏手柄触发。

| 函数              | 描述                         |
| ----------------- | ---------------------------- |
| `state.hover.add` | 将目标元素加入悬停状态处理   |
| `state.hover.rm`  | 移除目标元素悬停状态处理     |
| `state.hover.on`  | 添加悬停状态处理器到目标元素 |
| `state.hover.off` | 从目标元素移除悬停状态处理器 |
| `state.hover.set` | 设置目标元素悬停状态         |

# 触发状态
激活状态可以由所有交互方式触发。

| 函数               | 描述                         |
| ------------------ | ---------------------------- |
| `state.active.add` | 将目标元素加入激活状态处理   |
| `state.active.rm`  | 移除目标元素激活状态处理     |
| `state.active.on`  | 添加激活状态处理器到目标元素 |
| `state.active.off` | 从目标元素移除激活状态处理器 |
| `state.active.set` | 设置目标元素激活状态         |
