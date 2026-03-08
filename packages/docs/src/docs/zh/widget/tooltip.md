---
title: 工具提示
source: packages/abm-ui/src/widget/tooltip.ts
---

# 尝试一下
{{[demo](../../../demo/widget/tooltip.tsx)}}

# 使用
:::全局导入
```ts
import { tooltip } from 'abm-ui';
```
:::按需导入
```ts
import { tooltip } from 'abm-ui/widget/tooltip';
```
:::

```tsx
// 创建元素时设置
const div = $new('div', { tooltip: t('xxx.tooltip') });
// 设置已有元素
tooltip.set(div, 'Hello world');
```

```html
<div tooltip="This is tooltip">Target</div>
```

# 对象 `tooltip`

## 函数

### `set`
在元素上设置工具提示。

### `rm`
移除元素上的工具提示。

### `lock`
锁定指定元素的工具提示显示。

### `unlock`
解锁指定元素工具提示显示。
