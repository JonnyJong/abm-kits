---
title: 工具提示
order: 1
icon: TooltipQuote
source:
	- packages/abm-ui/src/components/tooltips.ts
---

# 尝试一下
```demo components/tooltips
locale:
  hoverOnMe: 在此处悬停
  tooltipsContent: 工具提示内容
```

# HTML 属性
在 HTML 中使用 `tooltips` 属性可为对应元素设置工具提示，但仅限于 `DOMContentLoaded` 事件触发前添加到 DOM 树的元素。
```pug
div(tooltips="locale.key.here")
```

# 接口

## `tooltips`
```ts
import { tooltips } from 'abm-ui';
```

### `get()`
获取元素对应的工具提示内容。

参数：
- `target`：目标元素

返回值：`DOMContents | undefined`

### `set()`
为元素设置工具提示。

参数：
- `target`：目标元素
- `content`：[`DOMContents`](/@/utils/dom#类型-domcontents) 或 `undefined`，若为 `undefined` 则移除该元素的工具提示

### `lock()`
锁定工具提示，锁定后工具提示将始终显示。

参数：
- `target`：目标元素

### `unlock()`
解锁工具提示。
