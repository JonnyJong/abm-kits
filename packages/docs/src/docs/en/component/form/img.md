---
title: Image
source: packages/abm-ui/src/component/img.ts
---

Image component, used to display images, supports setting a fallback, which is displayed when no image is set or when the image fails to load.

This component's form value type is `string | undefined`.

# Usage
:::Global Import
```ts
import { Img } from 'abm-ui';
```
:::On-demand Import
```ts
import { Img } from 'abm-ui/component/img';
```
:::Registration Import
```ts
import 'abm-ui/component/img';
```
:::

```tsx
<Img value="https://example.com/image.jpg">Image</Img>
```

```html
<abm-img value="https://example.com/image.jpg">Image</abm-img>
```

<div class="preview">
  <abm-img value="/abm-kits/favicon.svg">A</abm-img>
  <abm-img>Fallback</abm-img>
</div>

# Properties

## `lazy`
Boolean type, set to lazy loading mode, only loads the image when needed.

# Slots

| Slot Name | Description |
| --------- | ----------- |
| `  `      | Fallback content |