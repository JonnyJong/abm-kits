---
title: 交互
source: packages/abm-ui/src/infra/interaction.ts
---

```ts
import 'abm-ui/infra/interaction';
```

# 类型 `InteractionSource`
交互来源：
- `nav`：导航（键盘、游戏控制器）
- `mouse`：鼠标
- `pen`：笔
- `number`：触摸 ID

# 函数 `toInteractionSource`
从 [`PointerEvent`](https://developer.mozilla.org/docs/Web/API/PointerEvent)、[`pointerType`](https://developer.mozilla.org/docs/Web/API/PointerEvent/pointerType) 或 [`Touch`](https://developer.mozilla.org/docs/Web/API/Touch) 计算交互来源。
