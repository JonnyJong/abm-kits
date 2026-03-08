---
title: Layout Controller
source: packages/abm-ui/src/layout.ts
---

# Usage
:::Global Import
```ts
import { LayoutController } from 'abm-ui';
```
:::On-demand Import
```ts
import { LayoutController } from 'abm-ui/layout';
```
:::

# Class `LayoutController`

## Constructor Parameters
- `target`: Target element
- `updateLayout`: Layout update callback

## Properties

### `target`
Target element.

### `updateLayout`
Layout update callback.

### `running`
Running status.

## Methods

### `start`
Start calculating layout, parameters:
- `skipFirst`: Boolean type, skip the first layout, default `false`

### `stop`
Stop calculating layout.

### `forceUpdate`
Force update layout, regardless of running status and whether element size/position has changed.