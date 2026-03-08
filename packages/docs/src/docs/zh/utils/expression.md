---
title: 表达式
source: packages/abm-utils/src/expression.ts
---

```ts
import 'abm-utils/expression';
```

# 接口 `ExpressionEvaluationResult`
表达式求值结果接口。

## 属性 `value`
表达式求值结果值。

## 属性 `text`
表达式文本。

## 属性 `error`
可选，表达式求值错误信息。

# 接口 `IExpressionEvaluator`
表达式求值器接口。

## 方法 `evaluate`
表达式求值方法。
- 参数：表达式文本
- 返回值：表达式求值结果
