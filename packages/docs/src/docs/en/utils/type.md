---
title: Type
source: packages/abm-utils/src/type.ts
---

```ts
import 'abm-utils/type';
```

# Function `verifyType`
Verifies if a value is of the specified type.

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

## Type `AllowedType`
Allowed types.
Includes [basic types](#type-typeconstructor), [literals](#type-primitive), and classes.
The passed constructors can be used to check if input values are instances of that type.

### Type `TypeConstructor`
Basic type constructors, including:
- `BigInt`
- `Boolean`
- `Function`
- `Number`
- `Object`
- `String`
- `Symbol`
- `undefined`
- `null`

These types check the result of the `typeof` operator, where `Object` does not include `null`, and `Number` does not include `NaN`, `Infinity`, or `-Infinity`.

### Type `Primitive`
Literal types, including:
- `bigint`
- `boolean`
- `number`
- `object`
- `string`
- `symbol`