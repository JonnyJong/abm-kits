---
title: 部件
order: 3
layout: index
---

# 接口 `WidgetInit`
- `eventTypes`：`string[]` 类型，元素事件列表，可选，`undefined` 时禁用该元素事件机制
- `nav`：`boolean`，是否可导航，默认 `false`
- `navGroup`：`boolean`，是否为导航组，默认 `false`

# 类 `Widget`
该类为抽象类，ABM UI 中所有 UI 元素都继承自该类，该类继承 `SignalWatcher` 和 `LitElement` 类，实现 [`IEventSource`](/@/utils/events#接口-ieventsource) 接口。

## `constructor()`
参数：
- `options`：[`WidgetInit`](#接口-widgetinit) 类型，可选

## `events`
[`Events`](/@/utils/events#类-events) 类型，受保护。

## `nonNavigable`
不可导航，只读，默认根据元素是否有 `disabled` 判定。

## `contextMenuBehavior`
菜单行为，只读，默认返回 `undefined`。

## `connectedCallback()`
用于连接到 DOM 树后自动添加 `ui-nav` 和 `ui-nav-group` 属性。
