---
title: 键盘
source: packages/abm-ui/src/input/keyboard.ts
---

```ts
import 'abm-ui/input/keyboard';
```

# 类型 `KeyCode`
参考 [MDN Reference](https://developer.mozilla.org/docs/Web/API/KeyboardEvent/code)。

# 对象 `keyboard`
键盘 API。

## 对象 `shortcut`
快捷键 API。

### 方法 `hasId`
查询是否有指定 ID 的快捷键组。

### 方法 `has`
查询是否有指定 ID 的快捷键。

### 方法 `get`
获取指定 ID 的快捷键的所有按键组合。

### 方法 `set`
设置快捷键。

### 方法 `add`
添加快捷键。

### 方法 `rm`
移除快捷键。

### 方法 `delete`
移除快捷键。

### 方法 `isActivated`
检查对应 ID 的快捷键是否激活中。

## 对象 `alias`
按键别名 API。

### 方法 `hasId`
查询指定 ID 的按键别名是否存在。

### 方法 `has`
查询是否有指定 ID 的按键别名是否有某个按键。

### 方法 `get`
获取指定 ID 的按键别名的所有按键。

### 方法 `set`
设置按键别名。

### 方法 `add`
添加按键别名。

### 方法 `rm`
移除按键别名。

### 方法 `delete`
删除按键别名。

### 方法 `isActivated`
检查按键别名 ID 对应的按键是否激活中。

## 对象 `bind`
按键绑定 API。

### 属性 `binding`
是否正在绑定，只读。

### 方法 `start`
开始按键绑定。
若正在绑定，将不会中断正在进行的按键绑定，并返回 `false`。

### 方法 `stop`
停止按键绑定。若未在绑定，返回 `false`。

## 函数 `on`
添加键盘事件监听器。

## 函数 `once`
添加一次性键盘事件监听器。

## 函数 `off`
移除键盘事件监听器。

## 事件
| 事件名            | 参数列表            | 描述               |
| ----------------- | ------------------- | ------------------ |
| `down`            | `(key: KeyCode)`    | 按键按下           |
| `up`              | `(key: KeyCode)`    | 按键释放           |
| `press`           | `(key: KeyCode)`    | 按键按下并释放     |
| `trigger`         | `(key: KeyCode)`    | 按键触发           |
| `shortcut`        | `(id: string)`      | 快捷键按下         |
| `shortcutTrigger` | `(id: string)`      | 快捷键触发         |
| `aliasDown`       | `(name: string)`    | 别名按键按下       |
| `aliasUp`         | `(name: string)`    | 别名按键释放       |
| `aliasPress`      | `(name: string)`    | 别名按键按下并释放 |
| `aliasTrigger`    | `(name: string)`    | 别名按键触发       |
| `bindUpdate`      | `(keys: KeyCode[])` | 按键绑定更新       |
| `bindEnd`         | `(keys: KeyCode[])` | 按键绑定结束       |

# 对象 `KEY_CODE`

## 属性 `size`
支持的按键数量。

## 方法 `has`
检查键值是否支持。

## 方法 `values`
遍历所有支持的键值。

# 函数 `setKeyboardBlock`
设置键盘禁用状态。
