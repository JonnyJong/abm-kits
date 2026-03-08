---
title: 类型
source: packages/abm-utils/src/type.ts
---

```ts
import 'abm-utils/type';
```

# 函数 `verifyType`
验证值是否为指定类型。

```ts
verifyType('hello world', [String]); // true
verifyType('hello world', [String, Number]); // true
verifyType('hello world', [Number]); // false
verifyType('hello world', ['hello', 123]); // false
verifyType('hello', ['hello', 123]); // true
verifyType(123, ['hello', 123]); // true
verifyType({}, [Object]); // true
verifyType(null, [Object]); // false
verifyType(null, [null]); // true
```

## 类型 `AllowedType`
允许的类型。
包含[基本类型](#类型-typeconstructor)、[字面量](#类型-primitive)、类。
其中传入了的构造函数可用于校验输入值是否为该类型的实例。

### 类型 `TypeConstructor`
基本类型的构造函数，包含：
- `BigInt`
- `Boolean`
- `Function`
- `Number`
- `Object`
- `String`
- `Symbol`
- `undefined`
- `null`

这些类型为检验 `typeof` 运算符的结果，其中 `Object` 不包含 `null`、`Number` 不包含 `NaN`、`Infinity`、`-Infinity`。

### 类型 `Primitive`
字面量类型，包含：
- `bigint`
- `boolean`
- `number`
- `object`
- `string`
- `symbol`
