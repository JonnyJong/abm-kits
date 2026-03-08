---
title: 事件
source: packages/abm-utils/src/event.ts
---

```ts
import 'abm-utils/event';
```

# 泛型 `EventHandler`
事件处理函数类型。

# 接口 `IEventEmitter`
Node 风格事件发射器接口。

## 方法 `on`
添加事件监听器。

## 方法 `once`
添加单次事件监听器。

## 方法 `off`
移除事件监听器。

## 方法 `emit`
触发事件。

# 类 `EventEmitter`
事件发射器类。继承 [`EventTarget`](https://developer.mozilla.org/docs/Web/API/EventTarget)，实现 [`IEventEmitter`](#接口-ieventemitter) 接口。
