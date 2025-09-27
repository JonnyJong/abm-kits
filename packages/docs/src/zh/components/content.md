---
title: 内容
source:
	- packages/abm-ui/src/components/content.ts
order: 0
---

# 接口 `UIContentEvents`
[`UIContent`](#类-uicontent) 类事件列表。

- `icon`：图标更新事件
- `label`：文本更新事件

# 接口 `UIContentInit`
- `key`：本地化键名，可选，若 `key` 与 `text` 同时存在，优先使用 `key`
- `localeNamespace`：本地化命名空间，可选
- `localeParams`：本地化参数，可选
- `text`：文本内容，可选，若 `key` 与 `text` 同时存在，优先使用 `key`
- `icon`：图标键名，可选
- `iconNamespace`：图标命名空间，可选
- `progress`：进度，可选

# 类 `UIContent`
该类实现 [`IEventSource`](/@/utils/events#接口-ieventsource) 接口和 [`UIContentInit`](#接口-uicontentinit) 接口。

## `constructor()`
参数：
- `options`：`UIContentInit | string | UIContent`，可选

## `iconElement`
图标元素，只读。

## `labelElement`
文本元素，只读。

## `iconSignal`
图标元素更新信号，只读。

## `labelSignal`
文本元素更新信号，只读。

## `reset()`
重置，若无参数则清除所有内容。

参数：
- `options`：`UIContentInit | string | UIContent`，可选

## `clone()`
克隆。

# 接口 `UIContentTextInit`
该接口继承 [`UIContentInit`](#接口-uicontentinit) 接口。

其中 `key` 与 `text` 属性需至少有一个不为 `undefined`。

# 类 `UIContentText`
该类继承 [`UIContent`](#类-uicontent) 类。

其中 `text`、`labelSignal`、`labelElement` 属性始终不为 `undefined`。

# 接口 `UIContentAllInit`
该接口继承 [`UIContentInit`](#接口-uicontentinit) 接口。

其中 `key` 与 `text` 属性需至少有一个不为 `undefined`。

# 类 `UIContentAll`
该类继承 [`UIContentText`](#类-uicontenttext) 类。

其中 `text`、`labelSignal`、`labelElement`、`icon`、`iconSignal`、`iconElement` 属性始终不为 `undefined`。
