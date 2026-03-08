---
title: 单选框
source: packages/abm-ui/src/component/radio.ts
---

单选框与单选框组的表单值类型为 `T | undefined`。

# 尝试一下
{{[demo](../../../../demo/component/radio.tsx)}}

# 使用
:::全局导入
```ts
import { Radio, RadioGroup } from 'abm-ui';
```
:::按需导入
```ts
import { Radio, RadioGroup } from 'abm-ui/component/radio';
```
:::注册导入
```ts
import 'abm-ui/component/radio';
```
:::

```tsx
<RadioGroup>
  <Radio value={0} />
  <Radio value={1} />
  <Radio value={2} />
</RadioGroup>
```

```html
<abm-radio-group>
  <abm-radio value="0"></abm-radio>
  <abm-radio value="1"></abm-radio>
  <abm-radio value="2"></abm-radio>
</abm-radio-group>
```

# `<Radio>`

## 属性

### `checked`
是否选中。

# `<RadioGroup>`
用于将内部的单选框合并为一组，且不会发生“穿透”。


```tsx
<RadioGroup>
  <Radio value={0} /> {/* 属于第一组 */}
  <Radio value={1} /> {/* 属于第一组 */}
  <Radio value={2} /> {/* 属于第一组 */}
  {/* 嵌套 */}
  <RadioGroup>
    <Radio value={0} /> {/* 属于第二组 */}
    <Radio value={1} /> {/* 属于第二组 */}
    <Radio value={2} /> {/* 属于第二组 */}
  </RadioGroup>
</RadioGroup>
```
