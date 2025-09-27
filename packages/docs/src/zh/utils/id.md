---
title: 标识符
source:
	- packages/abm-utils/src/id.ts
---

# 类 `IDGenerator`
ID 生成器。

## `constructor()`
参数：
- `begin`：`number | bigint` 类型，起始 ID，默认 0

## `current`
`bigint` 类型，当前 ID，只读。

## `next()`
生成下一 ID 并返回，返回类型 `string`。
