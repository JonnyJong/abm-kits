---
title: 导航
source: packages/abm-ui/src/navigate
---

```ts
import 'abm-ui/navigate';
```

# 对象 `navigate`

## 函数 `nav`
- `(direction: Vec2 | Direction8)`：向指定方向导航
- `(direction: 'prev' | 'next', from?: Navigable)`：按 DOM 顺序导航

## 函数 `back`
全局返回。

按下绑定的返回键后（默认 <abm-hint-key key="Escape"></abm-hint-key>、<abm-hint-gamepad key="B"></abm-hint-gamepad>），若无锁定导航焦点，且导航焦点、导航根元素未发生变化，则会自动触发全局返回。

*在安卓端接收到全局返回事件时，可调用该函数。*

## 函数 `addLayer`
添加导航层级，参数：
- `root`：根元素
- `current`：新层级焦点，可选

## 函数 `rmLayer`
移除导航层级，参数：
- `root`：根元素

## 函数 `lock`
将导航焦点锁定到指定元素。

## 函数 `unlock`
解锁导航焦点。

## 函数 `setCurrent`
设置当前导航焦点。

## 属性 `onBack`
全局返回处理。

## 属性 `disableRootCallback`
禁用根元素导航状态回调。

## 对象 `keyboard`
键盘相关设置。

### 属性 `disabled`
禁用导航，默认 `false`。

## 对象 `gameController`
游戏控制器相关。

### 属性 `disabled`
禁用游戏控制器，默认 `false`。

### 属性 `index`
激活的游戏控制器 ID，默认 `0`。

### 属性 `ls`
启用左摇杆导航，默认 `true`。

### 属性 `rs`
启用右摇杆导航，默认 `false`。

# 接口 `Navigable`
可导航元素接口，继承自 [`HTMLElement`](https://developer.mozilla.org/docs/Web/API/HTMLElement)。
- `nonNavigable`：禁用导航
- `navCallback`：导航状态回调
- `navParent`：父导航元素
- `navChildren`：子导航元素列表

# 类型 `NavState`
该类型由以下类型联合：
- `{ type: 'focus' | 'blur' }`：焦点状态
- `{ type: 'active' | 'cancel'; down: boolean }`：激活、取消状态
- `{ type: 'nav'; direction: 'prev' | 'next' }`：按 DOM 顺序导航状态
- `{ type: 'direction'; direction: Vec2 }`：按方向导航状态
- `{ type: 'stick'; x: number; y: number }`：摇杆状态
- `{ type: 'back' }`：全局返回
