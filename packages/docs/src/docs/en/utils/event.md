---
title: Event
source: packages/abm-utils/src/event.ts
---

```ts
import 'abm-utils/event';
```

# Generic `EventHandler`
Event handler function type.

# Interface `IEventEmitter`
Node-style event emitter interface.

## Method `on`
Add event listener.

## Method `once`
Add single event listener.

## Method `off`
Remove event listener.

## Method `emit`
Trigger event.

# Class `EventEmitter`
Event emitter class. Inherits from [`EventTarget`](https://developer.mozilla.org/docs/Web/API/EventTarget), implements the [`IEventEmitter`](#interface-ieventemitter) interface.