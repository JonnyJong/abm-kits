---
title: 头像
source: packages/abm-ui/src/component/avatar.ts
---

头像组件，用于显示用户头像，支持设置 fallback，当未设置头像或头像加载失败时显示 fallback。

该组件表单值类型为 `string | undefined`。

# 使用
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
<Avatar value="https://example.com/avatar.jpg">用户头像</Avatar>
```

```html
<abm-avatar value="https://example.com/avatar.jpg">用户头像</abm-avatar>
```

<div class="preview">
  <abm-avatar value="/abm-kits/favicon.svg">A</abm-avatar>
  <abm-avatar>A</abm-avatar>
</div>

# 属性

## `lazy`
布尔类型，设置为懒加载模式，仅在需要时加载头像。

## `squared`
布尔类型，设置为方形样式。

# 插槽

| 插槽名 | 描述          |
| ------ | ------------- |
| `  `   | Fallback 内容 |

# CSS 变量

| 变量名   | 默认值 | 描述     |
| -------- | ------ | -------- |
| `--size` | `32px` | 头像大小 |
