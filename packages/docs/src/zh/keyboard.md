---
title: 键盘
source:
	- packages/abm-ui/src/keyboard.ts
order: 2
icon: Keyboard
---

# 尝试一下

## 监听按键
```demo keyboard/pressing
locale: {}
```

## 快捷键
```demo keyboard/shortcut
locale: {}
```

## 别名
```demo keyboard/alias
locale: {}
```

# 接口

## 类型 `KeysAllow`
允许使用的按键，能够处理的按键。

## `KEYS_ALLOW`
允许使用的按键列表，只读。

## 类型 `KeyBindItem`
`Set<KeysAllow>` 类型，按键绑定项。

## 类型 `KeyBindGroup`
`KeyBindItem[]` 类型，按键绑定组。

## 类型 `KeyBindMap`
按键绑定图。

## 类型 `AliasItem`
按键别名项。

## 类型 `AliasMap`
按键别名图。

## 类型 `KeyBinderEvents`
按键绑定事件列表。

- `update`：按键更新
- `done`：绑定结束

## 类 `KeyBinder`
按键绑定类，该类实现了 [`IEventSource`](#接口-ieventsource) 接口。

### `binding`
是否正在绑定，只读。

### `keys`
获取当前按下的按键，只读。

### `cancel()`
结束按键绑定。

## 类型 `KeyboardEvents`
键盘事件列表。

- `down`：按键按下
- `up`：按键松开
- `press`：完整按键按下松开
- `trigger`：按键触发（长按按键时将反复触发）
- `shortcut`：快捷键被按下
- `shortcutTrigger`：快捷键触发（长按快捷键将反复触发）
- `aliasDown`：别名按键按下
- `aliasUp`：别名按键松开
- `aliasPress`：完整别名按键按下松开
- `aliasTrigger`：别名按键触发（长按按键时将反复触发）

## `keyboard`
该类实现了 [`IEventSource`](#接口-ieventsource) 接口。

### `pressing`
获取当前按下的按键，只读。

### `bindMap`
获取或修改按键绑定图。

### `set()`
为特定 ID 设定一组快捷键，将覆盖还 ID 原有快捷键。

参数：
- `id`：`string` 类型，快捷键 ID
- `group`：[`KeyBindGroup`](#类型-keybindgroup) 类型

### `add()`
为特定 ID 添加一项快捷键。

参数：
- `id`：`string` 类型，快捷键 ID
- `group`：[`KeyBindItem`](#类型-keybinditem) 类型

### `rm()`
为特定 ID 移除一项快捷键。

参数：
- `id`：`string` 类型，快捷键 ID
- `group`：[`KeyBindItem`](#类型-keybinditem) 类型

### `delete()`
删除特定 ID 的所有快捷键。

参数：
- `id`：`string` 类型，快捷键 ID

### `aliasMap`
读取或修改按键别名图。

### `setAlias()`
为特定别名设置一组按键，将覆盖别名原有按键。

参数：
- `id`：`string` 类型，别名 ID
- `item`：[`AliasItem`](#类型-aliasitem) 类型

### `addAlias()`
为特定别名添加按键。

参数：
- `id`：`string` 类型，别名 ID
- `key`：[`KeysAllow`](#类型-keysallow) 类型

### `rmAlias()`
为特定别名输出按键。

参数：
- `id`：`string` 类型，别名 ID
- `key`：[`KeysAllow`](#类型-keysallow) 类型

### `deleteAlias()`
删除特定别名。

参数：
- `id`：`string` 类型，别名 ID

### `isAliasActivated()`
检查别名对应按键是否激活。

参数：
- `id`：`string` 类型，别名 ID

### `bind()`
开始绑定按键，键盘事件将被屏蔽直到按键绑定结束或被取消，返回 [`KeyBinder`](#类-keybinder) 或 `null`。
若返回 `null`，代表当前正在绑定按键。

### `preventDefaultWebBehavior`
读取或修改阻止浏览器默认按键行为。
