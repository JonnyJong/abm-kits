---
title: 图像
source: packages/abm-ui/src/component/img.ts
---

图像组件，用于显示图像，支持设置 fallback，当未设置图像或图像加载失败时显示 fallback。

该组件表单值类型为 `string | undefined`。

# 使用
:::全局导入
```ts
import { Img } from 'abm-ui';
```
::: 按需导入
```ts
import { Img } from 'abm-ui/component/img';
```
:::注册导入
```ts
import 'abm-ui/component/img';
```
:::

```tsx
<Img value="https://example.com/image.jpg">图像</Img>
```

```html
<abm-img value="https://example.com/image.jpg">图像</abm-img>
```

<div class="preview">
  <abm-img value="/abm-kits/favicon.svg">A</abm-img>
  <abm-img>Fallback</abm-img>
</div>

# 属性

## `lazy`
布尔类型，设置为懒加载模式，仅在需要时加载头像。

# 插槽

| 插槽名 | 描述          |
| ------ | ------------- |
| `  `   | Fallback 内容 |
