---
title: 向量
source:
	- packages/abm-utils/src/vector.ts
---

# 类型 `Rect`
对象类型，表示一个矩形范围：
- `top`：上边距
- `right`：右边距
- `bottom`：下边距
- `left`：左边距

# 类型 `Direction4`
`string` 类型，表示方向：
- `up`：上
- `right`：右
- `down`：下
- `left`：左

# 类型 `Vec2`
长度为 2 的数字数组类型，表示二维向量：
- `[0]`：水平坐标
- `[1]`：垂直坐标

# 类 `Vector2`
```ts
import { Vector2 } from 'abm-utils';
```
用于存储、处理二维向量的类。

## 静态属性与方法

### `equals()`
```ts
Vector2.equals(a, b);
```
两个 `Vector2 | Vec2` 参数，检查两个向量是否相等，返回 `boolean`。

### `add()`
两个 `Vector2 | Vec2` 参数，返回两个向量的和向量。
若两个参数均为 `Vec2`，返回 `Vec2` 类型，否则返回 `Vector2` 类型。

### `subtract()`
两个 `Vector2 | Vec2` 参数，返回两个向量的差向量。
若两个参数均为 `Vec2`，返回 `Vec2` 类型，否则返回 `Vector2` 类型。

### `multiply()`
两个 `Vector2 | Vec2` 参数，计算两个向量的积，返回 `number`。

### `distance()`
两个 `Vector2 | Vec2` 参数，计算两个向量所代表的点的距离，返回 `number`。

## 实例属性与方法

## `vec`
`Vec2` 类型的属性，可读取或修改该向量的坐标。

## `x`
`number` 类型的属性，可读取或修改该向量的水平坐标。

## `y`
`number` 类型的属性，可读取或修改该向量的垂直坐标。

## `radians`
`number` 类型的属性，可读取或修改该向量的角度，使用弧度制。

## `angle`
`number` 类型的属性，可读取或修改该向量的角度，使用角度制。

## `length`
`number` 类型的属性，可读取或修改该向量的长度。

## `direction`
`Direction4 | undefined` 类型的属性，可读取该向量的方向。
若为 `undefined`，表示当前向量的零向量。

参考：[`Direction4`](#类型-direction4)

## `normalization()`
将该向量转换为单位向量。

## `equals()`
一个 `Vector2 | Vec2` 参数，检查该向量是否与提供向量相同，返回 `boolean`。

## `clone()`
克隆该向量，返回 `Vector2`。
