---
title: Event
source: packages/abm-ui/src/infra/event.ts
---

```ts
import 'abm-ui/infra/event';
```

# Function `on`
`target.addEventListener(type, handle, options)` alias, parameters:
- `target`
- `type`
- `handle`
- `options`

# Function `once`
`target.addEventListener(type, handle, { ...options, once: true })` alias, parameters:
- `target`
- `type`
- `handle`
- `options`

# Function `off`
`target.removeEventListener(type, handle, options)` alias, parameters:
- `target`
- `type`
- `handle`
- `options`