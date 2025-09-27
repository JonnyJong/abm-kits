---
title: 字符串
source:
	- packages/abm-utils/src/string.ts
---

# `parseKeyNamespace`
从可能带命名空间的键名中解析命名空间和键名。

```ts
import { parseKeyNamespace } from 'abm-utils';

parseKeyNamespace('key'); // [null, 'key']
parseKeyNamespace('namespace:key'); // ['namespace', 'key']
parseKeyNamespace('namespace:key:key2'); // ['namespace', 'key:key2']
```
