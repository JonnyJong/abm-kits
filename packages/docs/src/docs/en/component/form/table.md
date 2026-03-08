---
title: Table
source: packages/abm-ui/src/component/table.ts
---

This component's form value type is `T[]`.

# Try It
{{[demo](../../../../demo/component/table.tsx)}}

# Usage
:::Global Import
```ts
import { Table } from 'abm-ui';
```
:::On-demand Import
```ts
import { Table } from 'abm-ui/component/table';
```
:::Registration Import
```ts
import 'abm-ui/component/table';
```
:::

# Properties

## `columns`
Table column configuration, type `TableColumn<T>[]`.

```ts
interface TableColumn<T, K extends keyof T = keyof T> {
	/** Column key */
	key: K;
	/** Column header */
	head?: (key: K) => DOMContents;
	/** Cell */
	cell?: TableCell<T, T[K]> | Constructor<FormControl<T[K>>>;
	/** Sort comparison */
	sort?: (a: T[K], b: T[K]) => number;
	/** Column width */
	width?: string | number;
}
```

# Methods

## `filter`
Filter and display table rows based on specified conditions.

| Condition Parameter                    | Description |
| ------------------------------------- | ----------- |
| `true`                                | Hide all |
| `false`, `null`, `undefined`          | Show all |
| `number[]`                            | Show table rows with specified indexes |
| `(item: T, index: number) => boolean` | Custom filter function, returns `true` to show the table row |

## `sort`
Sort table rows.

Parameters:
- `key`: Sort key, corresponding to the `key` property in `columns`
- `reverse`: Whether to sort in reverse order, default value is `false`