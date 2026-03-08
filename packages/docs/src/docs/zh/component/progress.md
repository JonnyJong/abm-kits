---
title: 进度条
source: packages/abm-ui/src/component/progress.ts
---

# 尝试一下
{{[demo](../../../demo/component/progress.tsx)}}

# 使用
:::全局导入
```ts
import { Progress } from 'abm-ui';
```
:::按需导入
```ts
import { Progress } from 'abm-ui/component/progress';
```
:::注册导入
```ts
import 'abm-ui/component/progress';
```
:::

```tsx
<Progress value={50} />
```

```html
<abm-progress value="50"></abm-progress>
```

# 属性

## `value`
进度条的值，范围为 `0` 到 `100`，若为 `NaN` 则进度条为不确定状态。
