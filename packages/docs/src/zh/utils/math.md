---
title: 数学
source:
	- packages/abm-utils/src/math.ts
---

# `clamp()`
限制目标值在最大值和最小值之间。

参数：
- `min`：`number` 类型，最小值
- `target`：`number` 类型，目标值
- `max`：`number` 类型，最大值

# `wrapInRange()`
将目标值循环限制在指定范围内。

参数：
- `target`：`number` 类型，目标值
- `max`：`number` 类型，最大值
- `min`：`number` 类型，最小值，默认 0

```ts
import { wrapInRange } from 'abm-utils';

wrapInRange(4, 5); // 4
wrapInRange(5, 5); // 5
wrapInRange(5.5, 5); // 0.5
wrapInRange(4, 5, 1); // 4
wrapInRange(5, 5, 1); // 5
wrapInRange(5.5, 5, 1); // 1.5
```

# `createClampedStepper()`
创建一个限制步长的函数，该函数将输入值限制在指定的范围内，并按照指定的步长进行取整。

参数：
- `from`：`number` 类型，起始值
- `to`：`number` 类型，终点值
- `step`：`number` 类型，步长，默认 0

# `formatWithStep()`
根据步长将数值格式化为字符串。

参数：
- `value`：`number` 类型，需要格式化的数值
- `step`：`number` 类型，步长

# 类型 `CSSFourValue`
长度为 4 的数字数组类型。

- `[0]`：`top`
- `[1]`：`right`
- `[2]`：`bottom`
- `[3]`：`left`

# `normalizeCSSFourValue()`
将数字或数组按照 CSS 中四值的方式处理。

参数：
- `value`：`number | number[] | CSSFourValue` 类型

```ts
import { normalizeCSSFourValue } from 'abm-utils';

normalizeCSSFourValue(1); // [1, 1, 1, 1]
normalizeCSSFourValue([1]); // [1, 1, 1, 1]
normalizeCSSFourValue([1, 2]); // [1, 2, 1, 2]
normalizeCSSFourValue([1, 2, 3]); // [1, 2, 3, 2]
normalizeCSSFourValue([1, 2, 3, 4]); // [1, 2, 3, 4]
```

# `createLinearMapper()`
线性映射，将输入值从 `[x1, x2]` 映射到 `[y1, y2]`。
