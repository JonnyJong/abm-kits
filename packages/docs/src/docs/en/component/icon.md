---
title: Icon
order: 3
source: packages/abm-ui/src/component/icon.ts
---

# Usage
:::Global Import
```ts
import { Icon, ico } from 'abm-ui';
```
:::On-demand Import
```ts
import { Icon, ico } from 'abm-ui/component/icon';
```
:::Registration Import
```ts
import 'abm-ui/component/icon';
```
:::

```tsx
ico('ui.success') // Recommended
<Icon>ui.success</Icon>
<Icon key="ui.success"></Icon>
```

```html
<abm-icon>ui.success</abm-icon>
<abm-icon key="ui.success"></abm-icon>
```

# Properties

## `key`
String type, icon key.

# Methods

## `update`
No parameters, no return value, updates icon content.

# Static Methods

## `register`
Registers an icon package.

## `svg`
Creates an icon from an SVG string.

# Function `ico`
Creates and returns an Icon component instance.

# Types/Interfaces

## `IconDict`
Nested icon package dictionary.

## `PresetIcons`
Preset icon dictionary.

## `IconRegistry`
Icon definition. Declare new icons via:
```ts
declare module 'abm-ui' {
  interface IconRegistry {
    aaa: string;
    bbb: string;
  }
}

// Usage
ico('aaa');
```

## `IconKey`
Declared icon key.

## `IconPackageDefine`
Icon package definition. Can be used to simplify icon package declaration:
```ts
declare module 'abm-ui' {
  interface IconRegistry extends IconPackageDefine<typeof ICONS> {}
}

const ICONS = {} as const satisfies IconDict;
```

## `IconPackage`
Icon package.