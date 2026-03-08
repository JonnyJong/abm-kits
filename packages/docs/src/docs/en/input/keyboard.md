---
title: Keyboard
source: packages/abm-ui/src/input/keyboard.ts
---

```ts
import 'abm-ui/input/keyboard';
```

# Type `KeyCode`
Refer to [MDN Reference](https://developer.mozilla.org/docs/Web/API/KeyboardEvent/code).

# Object `keyboard`
Keyboard API.

## Object `shortcut`
Shortcut key API.

### Method `hasId`
Check if there is a shortcut key group with the specified ID.

### Method `has`
Check if there is a shortcut key with the specified ID.

### Method `get`
Get all key combinations of the shortcut key with the specified ID.

### Method `set`
Set shortcut key.

### Method `add`
Add shortcut key.

### Method `rm`
Remove shortcut key.

### Method `delete`
Remove shortcut key.

### Method `isActivated`
Check if the shortcut key with the corresponding ID is activated.

## Object `alias`
Key alias API.

### Method `hasId`
Check if the key alias with the specified ID exists.

### Method `has`
Check if the key alias with the specified ID has a certain key.

### Method `get`
Get all keys of the key alias with the specified ID.

### Method `set`
Set key alias.

### Method `add`
Add key alias.

### Method `rm`
Remove key alias.

### Method `delete`
Delete key alias.

### Method `isActivated`
Check if the key corresponding to the key alias ID is activated.

## Object `bind`
Key binding API.

### Property `binding`
Whether it is currently binding, read-only.

### Method `start`
Start key binding.
If already binding, it will not interrupt the ongoing key binding and will return `false`.

### Method `stop`
Stop key binding. If not binding, return `false`.

## Function `on`
Add keyboard event listener.

## Function `once`
Add one-time keyboard event listener.

## Function `off`
Remove keyboard event listener.

## Events
| Event Name        | Parameter List      | Description               |
| ----------------- | ------------------- | ------------------------- |
| `down`            | `(key: KeyCode)`    | Key pressed               |
| `up`              | `(key: KeyCode)`    | Key released              |
| `press`           | `(key: KeyCode)`    | Key pressed and released  |
| `trigger`         | `(key: KeyCode)`    | Key triggered             |
| `shortcut`        | `(id: string)`      | Shortcut key pressed      |
| `shortcutTrigger` | `(id: string)`      | Shortcut key triggered    |
| `aliasDown`       | `(name: string)`    | Alias key pressed         |
| `aliasUp`         | `(name: string)`    | Alias key released        |
| `aliasPress`      | `(name: string)`    | Alias key pressed and released |
| `aliasTrigger`    | `(name: string)`    | Alias key triggered       |
| `bindUpdate`      | `(keys: KeyCode[])` | Key binding updated       |
| `bindEnd`         | `(keys: KeyCode[])` | Key binding ended         |

# Object `KEY_CODE`

## Property `size`
Number of supported keys.

## Method `has`
Check if the key value is supported.

## Method `values`
Iterate through all supported key values.

# Function `setKeyboardBlock`
Set keyboard disabled state.