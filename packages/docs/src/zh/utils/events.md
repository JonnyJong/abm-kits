---
title: 事件
source:
	- packages/abm-utils/src/events.ts
---

# 接口 `IEventBasic`
基础事件接口。

## `type`
`string` 类型，事件类型，只读。

## `timestamp`
`number` 类型，事件触发时间戳，只读。

# 接口 `EventBaseInit`

## `target`
事件触发目标对象，只读。

# 接口 `IEventBase`
该接口继承自 [`EventBaseInit`](#接口-eventbaseinit) 和 [`IEventBasic`](#接口-ieventbasic)。

# 类 `EventBase`
该类实现了 [`IEventBase`](#接口-ieventbase) 接口。

## `constructor()`
参数：
- `type`：`string` 类型，表示事件类型
- `options`：[`EventBaseInit`](#接口-eventbaseinit) 类型

---

# 类型 `EventsInitList`
事件初始化列表，用于限制事件列表中的事件名称与键名相同且继承 [`EventBaseInit`](#接口-eventbaseinit) 接口。

# 类型 `EventsList`
事件列表，用于限制事件列表中的事件名称与键名相同且继承 [`IEventBasic`](#接口-ieventbasic) 接口。

# 类型 `EventHandler`
事件处理函数，接收一个参数，该参数实现 [`EventBaseInit`](#接口-eventbaseinit) 接口和 [`IEventBasic`](#接口-ieventbasic) 接口。

# 类型 `EventSubscriptions`
事件订阅集合。

# 接口 `IEventSource`
事件源。

## `on()`
注册事件处理函数。

参数：
- `type`：`string` 类型，表示事件类型
- `handler`：[`EventHandler`](#类型-eventhandler) 类型，表示事件处理函数

## `once()`
注册一次性事件处理函数。

参数：
- `type`：`string` 类型，表示事件类型
- `handler`：[`EventHandler`](#类型-eventhandler) 类型，表示事件处理函数

## `off()`
移除事件处理函数。

参数：
- `type`：`string` 类型，表示事件类型
- `handler`：[`EventHandler`](#类型-eventhandler) 类型，表示事件处理函数

# 类 `Events`
事件管理类，该类实现了 [`IEventSource`](#接口-ieventsource) 接口。

## `constructor()`
参数：
- `eventTypes`：`string[]` 类型，所有事件类型列表

## `emit()`
触发指定事件。

参数：
- `event`：事件

---

# 接口 `EventValueInit`
该接口继承 [`EventBaseInit`](#接口-eventbaseinit) 接口。

## `value`
事件相关值。

# 接口 `IEventValue`
该接口继承 [`IEventBase`](#接口-ieventbase) 接口。

## `value`
事件相关值，只读。

# 类 `EventValue`
该类继承 [`EventBase`](#类-eventbase) 类，实现 [`IEventValue`](#接口-ieventvalue) 接口。

## `constructor()`
参数：
- `type`：`string` 类型，事件类型
- `options`：[`EventValueInit`](#接口-eventvalueinit) 类型

---

# 接口 `EventKeyInit`
该接口继承 [`EventBaseInit`](#接口-eventbaseinit) 接口。

## `key`
事件相关键。

# 接口 `IEventKey`
该接口继承 [`IEventBase`](#接口-ieventbase) 接口。

## `key`
事件相关键，只读。

# 类 `EventKey`
该类继承 [`EventBase`](#类-eventbase) 类，实现 [`IEventKey`](#接口-ieventkey) 接口。

## `constructor()`
参数：
- `type`：`string` 类型，事件类型
- `options`：[`EventKeyInit`](#接口-eventkeyinit) 类型

---

# 接口 `EventVectorInit`
该接口继承 [`EventBaseInit`](#接口-eventbaseinit) 接口。

## `x`
事件相关水平坐标。

## `y`
事件相关垂直坐标。

# 接口 `IEventVector`
该接口继承 [`IEventBase`](#接口-ieventbase) 接口。

## `x`
事件相关水平坐标，只读。

## `y`
事件相关垂直坐标，只读。

# 类 `EventVector`
该类继承 [`EventBase`](#类-eventbase) 类，实现 [`IEventVector`](#接口-ieventvector) 接口。

## `constructor()`
参数：
- `type`：`string` 类型，事件类型
- `options`：[`EventVectorInit`](#接口-eventvectorinit) 类型

---

# 接口 `EventErrorInit`
该接口继承 [`EventBaseInit`](#接口-eventbaseinit) 接口。

## `error`
`Error` 类型，事件相关错误。

# 接口 `IEventError`
该接口继承 [`IEventBase`](#接口-ieventbase) 接口。

## `error`
`Error` 类型，事件相关错误，只读。

# 类 `EventError`
该类继承 [`EventBase`](#类-eventbase) 类，实现 [`IEventError`](#接口-ieventerror) 接口。

## `constructor()`
参数：
- `type`：`string` 类型，事件类型
- `options`：[`EventErrorInit`](#接口-eventerrorinit) 类型

---

# 接口 `EventCustomInit`
该接口继承 [`EventBaseInit`](#接口-eventbaseinit) 接口。

## `details`
事件详细信息。

# 接口 `IEventCustom`
该接口继承 [`IEventBase`](#接口-ieventbase) 接口。

## `details`
事件详细信息，只读。

# 类 `EventCustom`
该类继承 [`EventBase`](#类-eventbase) 类，实现 [`IEventCustom`](#接口-ieventcustom) 接口。

## `constructor()`
参数：
- `type`：`string` 类型，事件类型
- `options`：[`EventCustomInit`](#接口-eventcustominit) 类型
