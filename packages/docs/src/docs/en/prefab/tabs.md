---
title: Multi-tab Prefab
source: packages/abm-ui/src/prefab/tabs.ts
---

# Usage
:::Global Import
```ts
import { createTabsPrefab } from 'abm-ui';
```
:::On-demand Import
```ts
import { createTabsPrefab } from 'abm-ui/prefab/tabs';
```
:::

{{[demo](../../../demo/prefab/tabs.tsx)}}

# Function `createTabsPrefab`

## Parameters
- `tabs`：Tab definition
- `init`：Initialization parameters, optional
  - `nav`：Navigation bar, navigation bar properties, optional
  - `pageHost`：Page host, page host properties, optional
  - `args`：Parameter list, optional
  - `default`：Default tab, optional
  - `transition`：Tab switching animation
    - `suppress`：Direct switch, no animation, default
    - `fade`：Fade in/out switching animation
    - `entrance`：Bottom-up switching animation
    - `drill`：Zoom switching animation
    - `slide`：Slide
  `$change`：Tab switching callback

## Return Object
- `nav`：Navigation bar, read-only
- `pageHost`：Page host, read-only
- `value`：Tab ID
- `current`：Current tab instance, read-only