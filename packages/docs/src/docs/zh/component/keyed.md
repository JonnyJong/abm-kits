---
title: 键控组件基类
source: packages/abm-ui/src/component/keyed.ts
order: 1
---

# 使用
:::全局导入
```ts
import { KeyedComponent } from 'abm-ui';
```
:::按需导入
```ts
import { KeyedComponent } from 'abm-ui/component/keyed';
```
:::

# 类 `KeyedComponent`
该类为抽象类。

## 属性 `key`
键，字符串类型，更新时自动调用 `update` 方法。

## 方法

### `update`
键更新回调，无默认实现，键更新时自动调用。

### `initial`
初始键值。

### `validate`
检查键，若检查不通过，返回 `false`，无默认实现。

### `parse`
用于转换键类型，无默认实现。

### `init`
该类实现了 `init` 方法，若需要重写，请确保在重写方法开头调用 `super.init()`。

### `clone`
该类实现了 `clone` 方法，若需要重写，可能需要调用 `super.clone(from)`。
