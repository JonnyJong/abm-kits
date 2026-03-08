---
title: 转盘
source: packages/abm-ui/src/component/spinner.ts
---

# 尝试一下
{{[demo](../../../demo/component/spinner.tsx)}}

# 使用
:::全局导入
```ts
import { Spinner } from 'abm-ui';
```
:::按需导入
```ts
import { Spinner } from 'abm-ui/component/spinner';
```
:::注册导入
```ts
import 'abm-ui/component/spinner';
```
:::

```tsx
<Spinner value={50}/>
```

```html
<abm-spinner value="50"></abm-spinner>
```

# 属性

## `value`
转盘的值，范围为 `0` 到 `100`，若为 `NaN` 则转盘为不确定状态。

## `size`
转盘的大小，单位为像素。

# CSS 变量

| 变量名   | 默认值 | 描述     |
| -------- | ------ | -------- |
| `--size` | `14px` | 转盘大小 |
