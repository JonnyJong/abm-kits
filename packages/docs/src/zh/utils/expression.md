---
title: 表达式
source:
	- packages/abm-utils/src/expression.ts
---

# 接口 `ExpressionEvaluationResult`
表达式执行结果。

## `value`
`number` 类型，结果数值。

## `text`
`string` 类型，结果精确值。

## `error`
`string | undefined`，表达式执行错误原因。
若为 `undefined` 表示表达式执行成功。

# 接口 `IExpressionEvaluator`
表达式求值器。

## `evaluate()`
求值函数，一个 `string` 类型的参数，返回 [`ExpressionEvaluationResult`](#接口-expressionevaluationresult)。
