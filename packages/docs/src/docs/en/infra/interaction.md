---
title: Interaction
source: packages/abm-ui/src/infra/interaction.ts
---

```ts
import 'abm-ui/infra/interaction';
```

# Type `InteractionSource`
Interaction source:
- `nav`: Navigation (keyboard, game controller)
- `mouse`: Mouse
- `pen`: Pen
- `number`: Touch ID

# Function `toInteractionSource`
Calculate interaction source from [`PointerEvent`](https://developer.mozilla.org/docs/Web/API/PointerEvent), [`pointerType`](https://developer.mozilla.org/docs/Web/API/PointerEvent/pointerType), or [`Touch`](https://developer.mozilla.org/docs/Web/API/Touch).