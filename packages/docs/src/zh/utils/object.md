---
title: 对象
source:
	- packages/abm-utils/src/object.ts
---

# 类 `IterableWeakSet`
该类实现 `Set` 类的接口。

## `find()`
返回满足提供的测试函数的第一个值，否则返回 `undefined`。

## `findAll()`
返回满足提供的测试函数的所有值。

# 接口 `ProxyObjectOptions`

## `update`
对象更新回调函数。

## `debounceDelay`
`number` 类型，对象更新防抖延迟，单位毫秒，可选。

## `handler`
`ProxyHandler` 类型，代理对象的处理器，可选。

# `proxyObject()`
创建一个代理对象，该对象在属性被设置或删除时调用指定的更新函数。

参数：
- `options`：[`ProxyObjectOptions`](#接口-proxyobjectoptions) 类型
- `object`：目标代理对象，默认 `{}`
