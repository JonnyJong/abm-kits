---
title: 事件
source: packages/abm-ui/src/infra/event.ts
---

```ts
import 'abm-ui/infra/event';
```

# 函数 `on`
`target.addEventListener(type, handle, options)` 别名，参数：
- `target`
- `type`
- `handle`
- `options`

# 函数 `once`
`target.addEventListener(type, handle, { ...options, once: true })` 别名，参数：
- `target`
- `type`
- `handle`
- `options`

# 函数 `off`
`target.removeEventListener(type, handle, options)` 别名，参数：
- `target`
- `type`
- `handle`
- `options`
