---
title: 数学工具
source: packages/abm-utils/src/math.ts
---

```ts
import 'abm-utils/math';
```

# 函数 `clamp`
将值限制在指定范围内。

# 函数 `wrapInRange`
将一个数值循环限制在指定范围内。
```ts
wrapInRange(4, 5); // 4
wrapInRange(5, 5); // 5
wrapInRange(5.5, 5); // 0.5
wrapInRange(4, 5, 1); // 4
wrapInRange(5, 5, 1); // 5
wrapInRange(5.5, 5, 1); // 1.5
```

# 函数 `steppedClamp`
将值限制在指定范围内，并按照指定的步长进行取整。
```ts
steppedClamp(0, 10, 5.5, 1) // 6
steppedClamp(0, 10, 5.2, 1) // 5
steppedClamp(0, 10, 15, 1) // 10
steppedClamp(0, 10, -5, 1) // 0
steppedClamp(0, 10, 5.5, 0) // 5.5
```

# 函数 `formatWithStep`
格式化数值，保留指定小数位数并添加步长单位。

# 函数 `normalizeCSSFourValue`
归一化 CSS 四值语法，将其四值转换为标准格式。
```ts
normalizeCSSFourValue(1); // [1, 1, 1, 1]
normalizeCSSFourValue([1]); // [1, 1, 1, 1]
normalizeCSSFourValue([1, 2]); // [1, 2, 1, 2]
normalizeCSSFourValue([1, 2, 3]); // [1, 2, 3, 2]
normalizeCSSFourValue([1, 2, 3, 4]); // [1, 2, 3, 4]
```

## 类型 `CSSFourValue`
CSS 四值语法，按上、右、下、左的顺序。

# 函数 `createLinearMapper`
创建一个线性映射器，用于将一个数值映射到另一个数值范围。

# 函数 `resolveStep`
当输入的步长为 0 时重新计算合理的步长。
