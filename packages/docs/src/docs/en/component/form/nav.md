---
title: Nav
source: packages/abm-ui/src/component/nav.ts
---

This component's form value type is `T | undefined`.

# Try It
{{[demo](../../../../demo/component/nav.tsx)}}

# Usage
:::Global Import
```ts
import { Nav, NavFlex, NavItem } from 'abm-ui';
```
:::On-demand Import
```ts
import { Nav, NavFlex, NavItem } from 'abm-ui/component/nav';
```
:::Registration Import
```ts
import 'abm-ui/component/nav';
```
:::

```tsx
<Nav value={0}>
  <NavItem value={0}>Option 1</NavItem>
  <NavItem value={1}>Option 2</NavItem>
  <NavFlex/>
  <NavItem value={2}>Option 3</NavItem>
</Nav>
```

```html
<abm-nav value="0">
  <abm-nav-item value="0">Option 1</abm-nav-item>
  <abm-nav-item value="1">Option 2</abm-nav-item>
  <abm-nav-flex></abm-nav-flex>
  <abm-nav-item value="2">Option 3</abm-nav-item>
</abm-nav>
```

# Properties

## `vertical`
Whether to use vertical layout.

# Methods

## `setup`
Quickly set up navigation items.
```ts
nav.setup([
  123, // Directly set value
  { value: 456, content: 'Option 4' }, // Complete setup
  { type: 'flex' }, // Insert blank space
]);
```