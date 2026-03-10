---
title: Movement Controller
source: packages/abm-ui/src/movement.ts
---

# Usage
:::Global Import
```ts
import { MovementController } from 'abm-ui';
```
:::On-demand Import
```ts
import { MovementController } from 'abm-ui/movement';
```
:::

# Type `MovementValue`
Movement value type, supports one-dimensional and two-dimensional values.
- `number`: One-dimensional value
- `Vec2`: Two-dimensional value

# Type `MovementValueSource<T>`
Movement value source, can be a fixed value or a dynamic value function.
- `T`: Fixed value
- `() => T`: Dynamic value

# Type `MovementState`
Movement state.
- `start`: First move
- `moving`: Moving
- `end`: Movement ended
- `cancel`: Movement cancelled

# Type `InteractionSource`
Interaction source, see [Interaction Source](../infra/interaction#type-interactionsource) for details.

# Interface `MovementTarget<T>`

Movement target configuration.

## Properties

- `value`: Current logical value, `MovementValueSource<T>` type
- `start?`: Start logical value, `MovementValueSource<T>` type, default `Number.NEGATIVE_INFINITY`
- `end?`: End logical value, `MovementValueSource<T>` type, default `Number.POSITIVE_INFINITY`
- `step?`: Logical value step, `MovementValueSource<T>` type, default `0`
- `discrete?`: Discrete control coefficient, `MovementValueSource<T>` type, default calculated based on step. Discrete inputs include keyboard keys, gamepad buttons
- `continuous?`: Continuous control coefficient, `MovementValueSource<T>` type, default calculated based on step. Continuous inputs include joysticks
- `mouseStartDelay?`: Mouse drag start delay, `MovementValueSource<number>` type, unit milliseconds, default `0`
- `penStartDelay?`: Pen drag start delay, `MovementValueSource<number>` type, unit milliseconds, default `500`
- `touchStartDelay?`: Touch drag start delay, `MovementValueSource<number>` type, unit milliseconds, default `500`
- `mouseCheckDelay?`: Mouse drag check duration, `MovementValueSource<number>` type, unit milliseconds, default `0`
- `penCheckDelay?`: Pen drag check duration, `MovementValueSource<number>` type, unit milliseconds, default `100`
- `touchCheckDelay?`: Touch drag check duration, `MovementValueSource<number>` type, unit milliseconds, default `100`

# Interface `MovementEvent<T, E>`

Movement event.

## Properties

- `state`: Movement state, [`MovementState`](#type-movementstate) type
- `initial`: Initial logical value, `T` type
- `value`: Current logical value, `T` type
- `offset`: Logical value change (from initial to current), `T` type
- `delta`: Logical value change of this movement, `T` type
- `trigger?`: Trigger movement element, `E` type
- `pointer?`: Pointer coordinate information
  - `initial`: Initial coordinates, [`Vec2`](../utils/vector#type-vec2) type
  - `current`: Current coordinates, [`Vec2`](../utils/vector#type-vec2) type
  - `offset`: Coordinate change (from initial to current), [`Vec2`](../utils/vector#type-vec2) type
  - `delta`: Coordinate change of this movement, [`Vec2`](../utils/vector#type-vec2) type
- `end`: Whether this movement is ended, `boolean` type

# Interface `MovementEventHandler<T, E>`

Movement event handler
```ts
(event: MovementEvent<T, E>) => any
```

# Interface `MovementChecker<E>`

First move checker type.
```ts
(offset: Vec2, trigger?: E) => boolean | Vec2
```
- Returns `true`: Check passed
- Returns `false`: Check failed
- Returns `Vec2`: Expected movement direction vector (bidirectional, further checked by movement controller)

# Interface `MovementAxisGetter<T>`

Axis getter type, used to define the coordinate axis of movement.

## One-dimensional movement (`T extends number`)
```ts
() => {
    o: Vec2 | DOMRect | Element;  // Origin coordinate
    x: Vec2 | DOMRect | Element;  // Any point coordinate on the positive X-axis
    y?: Vec2 | DOMRect | Element; // Any point coordinate on the positive Y-axis, not needed for one-dimensional movement
}
```

## Two-dimensional movement (`T extends Vec2`)
```ts
() => {
    o: Vec2 | DOMRect | Element;  // Origin coordinate
    x: Vec2 | DOMRect | Element;  // Any point coordinate on the positive X-axis
    y: Vec2 | DOMRect | Element;  // Any point coordinate on the positive Y-axis
}
```

# Interface `MovementControllerInit<T, E>`

Movement controller initialization parameters.

## Properties

- `handler?`: [`MovementEventHandler<T, E>`](#interface-movementeventhandlert-e)
- `check?`: [`MovementChecker<E>`](#interface-movementcheckere)
- `axis?`: [`MovementAxisGetter<T>`](#interface-movementaxisgettert)
- `triggers?`: Trigger elements, `ArrayOr<E>` type

# Interface `MovementStartOptions<T, E>`

Start movement parameters.

## Properties

- `source?`: Interaction source, default `nav`
  - `InteractionSource`
  - `PointerEvent`
  - `PointerEvent['pointerType']`
  - `Touch`
- `value?`: Current value, default `target.value`
- `position?`: Pointer position
  - `Vec2`
  - `PointerEvent`
  - `Touch`
- `trigger?`: Trigger, `E` type
- `disableDelay?`: Disable drag start delay, `boolean` type
- `disableCheck?`: Disable first move check, `boolean` type

# Class `MovementController<T, E>`

Movement controller, uniformly handles logical value and pixel value movement.

## Constructor Parameters
- `target`: [`MovementTarget<T>`](#interface-movementtargett)
- `init?`: [`MovementControllerInit<T, E>`](#interface-movementcontrollerinitt-e)

## Properties

### `target`
Movement target, [`MovementTarget<T>`](#interface-movementtargett) type, readable and writable.

### `source`
Current interaction source, [`InteractionSource`](#type-interactionsource) type, read-only.

### `moving`
Whether currently moving, `boolean` type, read-only.

### `handler`
Movement event handler, [`MovementEventHandler<T, E>`](#interface-movementeventhandlert-e) type, readable and writable.

### `check`
First move checker, [`MovementChecker<E>`](#interface-movementcheckere) type, readable and writable.

### `axis`
Axis getter, [`MovementAxisGetter<T>`](#interface-movementaxisgettert) type, readable and writable.

## Methods

### `start`
Start movement, if currently moving or preparing to move, will not start movement.

```ts
start(options?: MovementStartOptions<T, E>): void
```

- `options?`: [`MovementStartOptions<T, E>`](#interface-movementstartoptionst-e)

When `source` is `nav`, it is logical value movement (keyboard, navigation, gamepad), other values (pointer, touch, pen) are pixel value movement.

### `stop`
Stop movement, if currently not moving or preparing to move, will not stop movement.

```ts
stop(cancel?: boolean): void
```

- `cancel?`: Whether to cancel movement, default `false`

### `handleNav`
Redirect navigation state here to automatically handle logical value sliding.

```ts
handleNav(state: NavState): void
```

### `addTriggers`
Add multiple movement trigger elements.

```ts
addTriggers(...triggers: E[]): void
```

### `hasTrigger`
Check if the target element is set as the current movement controller trigger element.

```ts
hasTrigger(trigger: E): boolean
```

### `rmTriggers`
Remove multiple movement trigger elements.

```ts
rmTriggers(...triggers: E[]): void
```

### `clearTriggers`
Clear all movement trigger elements.

```ts
clearTriggers(): void
```

## Static Methods

### `isPrefer`
Quick check whether this movement should be performed.

```ts
static isPrefer(prefer: Vec2, offset: Vec2): boolean
```

- `prefer`: Expected movement direction
- `offset`: Actual movement direction

### `value2uv`
Convert logical value to UV coordinate (0-1 range).

```ts
static value2uv<T extends MovementValue>(value: T, start: T, end: T): T
```

- `value`: Logical value
- `start`: Start logical value
- `end`: End logical value
- Return value: UV coordinate
