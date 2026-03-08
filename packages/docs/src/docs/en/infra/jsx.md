---
title: JSX
source: packages/abm-ui/src/jsx-runtime.ts
---

```ts
import 'abm-ui/jsx-runtime';
```

ABM UI provides a basic JSX runtime, implemented based on native DOM, with no middle layer or virtual DOM.

# TypeScript Configuration
Just add two lines to `tsconfig.json` to use it.

```json tsconfig.json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "abm-ui"
  }
}
```

# Class `Fragment`
[`DocumentFragment`](https://developer.mozilla.org/docs/Web/API/DocumentFragment) alias.

# Function `jsx`
[`$new`](./dom#function-new) alias.

# Function `jsxs`
[`$new`](./dom#function-new) alias.

# Development Runtime
```ts
import 'abm-ui/jsx-runtime-dev';
```

The development runtime provides enhanced development experience, including source location tracking and element inspection features.

## Function `jsxDEV`

The JSX transformation function for development runtime, supporting source location tracking and component instance association.

## Debugging Features

The development runtime provides an **Alt + Left Click** debugging feature:

1. Hold `Alt` key and click on any element
2. The console will output detailed information about the element, including:
   - The DOM node itself
   - The owning component instance (if any)
   - Source location (file name, line number, column number)
3. Automatically attempts to open the corresponding source location in the editor
