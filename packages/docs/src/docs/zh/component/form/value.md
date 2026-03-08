---
title: 值
source: packages/abm-ui/src/component/value.ts
---

一个不可见的表单值组件，用于存储表单值。

该组件表单值类型为 `T`。

# 尝试一下
{{[demo](../../../../demo/component/value.tsx)}}

:::全局导入
```ts
import { Avatar } from 'abm-ui';
```
::: 按需导入
```ts
import { Avatar } from 'abm-ui/component/avatar';
```
:::注册导入
```ts
import 'abm-ui/component/avatar';
```
:::

```tsx
<Value name="value" value={0} default={0}/>
```

```html
<abm-value name="value" value={0} default={0}></abm-value>
```
