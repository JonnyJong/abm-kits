---
title: Avatar
source: packages/abm-ui/src/component/avatar.ts
---

Avatar component, used to display user avatars, supports setting a fallback, which is displayed when no avatar is set or when the avatar fails to load.

This component's form value type is `string | undefined`.

# Usage
:::Global Import
```ts
import { Avatar } from 'abm-ui';
```
:::On-demand Import
```ts
import { Avatar } from 'abm-ui/component/avatar';
```
:::Registration Import
```ts
import 'abm-ui/component/avatar';
```
:::

```tsx
<Avatar value="https://example.com/avatar.jpg">User Avatar</Avatar>
```

```html
<abm-avatar value="https://example.com/avatar.jpg">User Avatar</abm-avatar>
```

<div class="preview">
  <abm-avatar value="/abm-kits/favicon.svg">A</abm-avatar>
  <abm-avatar>A</abm-avatar>
</div>

# Properties

## `lazy`
Boolean type, set to lazy loading mode, only loads the avatar when needed.

## `squared`
Boolean type, set to square style.

# Slots

| Slot Name | Description |
| --------- | ----------- |
| `  `      | Fallback content |

# CSS Variables

| Variable Name | Default Value | Description |
| ------------- | ------------- | ----------- |
| `--size`      | `32px`        | Avatar size |