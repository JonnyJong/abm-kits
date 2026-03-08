---
title: Page
source: packages/abm-ui/src/component/page.ts
---

# Try It
{{[demo](../../../demo/component/page.tsx)}}

# Usage
:::Global Import
```ts
import { PageHost } from 'abm-ui';
```
:::On-demand Import
```ts
import { PageHost } from 'abm-ui/component/page';
```
:::Registration Import
```ts
import 'abm-ui/component/page';
```
:::

# Properties

## `history`
Page history manager, used to manage page history.

Before any history-related operations, you can set the history manager instance; by default, the `NonPageHistory` class is used.

## `current`
Read-only property, the currently active page, if `undefined`, it means no active page.

## `transition`
Default page transition animation, used when not specified, defaults to `suppress`.

Supports the following transition animations:
- `suppress`: Direct switch, no animation
- `fade`: Fade in/out transition animation
- `entrance`: Bottom-up transition animation
- `drill`: Scale transition animation
- `slideFromRight`: Right-to-left transition animation
- `slideFromLeft`: Left-to-right transition animation

## `autoHeight`
Whether to automatically adjust the page host height based on page height, defaults to `false`.

# Methods

## `push`
Open the specified page.

You can pass a page class or a registered page name, and support passing additional parameters to the page:
```ts
host.push(MyPage); // Directly pass the page class
host.push('my-page'); // Pass the registered page name

// Pass additional parameters to the page
host.push(MyPage, 'foo', 'bar');
host.push('my-page', 'foo', 'bar');

// Additional transition animation
host.push({
  page: MyPage, // or 'my-page'
  transition: 'fade', // Override default transition animation
  // Connected animation elements
  connectFrom: {
    cover: coverElement,
    title: titleElement,
  },
  // Whether the connection animation is one-way
  connectOneWay: false,
})
```

## `back`
Return to the previous page.

Parameters:
- `force`: Whether to force return to the previous page, defaults to `false`; when forced to return, the last page will be closed
- `options`: Transition animation configuration, optional
  - `transition`: Transition animation type

## `forward`
Go to the next page.

Parameters:
- `options`: Transition animation configuration, optional
  - `transition`: Transition animation type

## `goto`
Jump to the specified page.

Parameters:
- `index`: Target page index, starting from `0`
- `options`: Transition animation configuration, optional
  - `transition`: Transition animation type

## `register`
Register a page name for the page class, used to pass the page name in the `push` method.

Parameters:
- `name`: Page name
- `pageClass`: Page class

If the corresponding name or page class already exists, returns `false`.

## `unregister`
Cancel registration of the page name.

Parameters:
- `pageClass`: Page class

## `isRegistered`
Check if the page is already registered.

Parameters:
- `page`: Page name or page class

## `getName`
Get the registered page name.

Parameters:
- `pageClass`: Page class

## `getPage`
Get the registered page class.

Parameters:
- `name`: Page name

# Static Methods

## `new`
Used to conveniently create page instances and register pages.

# Class `Page`
Base page class, all pages need to inherit this class.

## Properties

### `host`
Get the current page host, available after the construction phase.

### `root`
Get the page root element, available after the construction phase.

## Lifecycle Callbacks
The following methods are called during the page lifecycle, with no default implementation.

| Method Name | Description |
| ----------- | ----------- |
| `init` | Initialize the page, called after the construction phase |
| `enter` | Page enter callback, called after the page is added to the page host's child element list, before playing the page transition animation |
| `exit` | Page exit callback, called after the new page is added to the page host's child element list, before playing the page transition animation and before being removed from the page host's child element list |
| `destroy` | Page destroy callback |

## Method `collectConnectableElements`
Collect all connectable elements in the page, used to play connection animations, returns [`ConnectableElements`](#type-connectableelements).

# Class `SingletonPage`
Singleton page base class, all singleton pages need to inherit this class, which inherits from the [`Page`](#class-page) class.

This class adds a `setup` method for page reuse configuration, called before `enter`;
the `destroy` method of this class will never be called.

# Interface `PageHistory`
Page history manager interface, used to manage page history.

This interface has a generic parameter `T`, representing the history item data type.

## Properties

### `current`
Read-only property, the currently active history item, if `undefined`, it means no active history item.

### `currentIndex`
Read-only property, the index of the currently active history item, if `-1`, it means no active history item.

### `length`
Read-only property, the number of history items.

## Methods

### `push`
Push a new item into the history stack.

### `back`
Navigate to the previous item in the history, return the previous item data, return `undefined` if there is no previous item.

### `forward`
Navigate to the next item in the history, return the next item data, return `undefined` if there is no next item.

### `goto`
Jump to the specified index position in the history stack, return the corresponding item data, return `undefined` if the index is invalid.

## Pre-built Implementation Classes

| Class Name | Description |
| ---------- | ----------- |
| `NonPageHistory` | No history manager class, used for no history scenarios, only keeps the current active item. |
| `StackPageHistory` | Stack history manager class, used for stack history scenarios, keeps all history items. |

# Type `ConnectableElements`
Alias for `Record<string, HTMLElement>`, used to represent a collection of connectable elements, where the key is the element ID and the value is the element instance.

When calculating connection animations, if both the previous and next pages provide elements with the same ID, a connection animation will be played for these two elements.