---
title: 导航
source: packages/abm-ui/src/component/nav.ts
---

该组件表单值类型为 `T | undefined`。

# 尝试一下
{{[demo](../../../../demo/component/nav.tsx)}}

# 使用
:::全局导入
```ts
import { Nav, NavFlex, NavItem } from 'abm-ui';
```
:::按需导入
```ts
import { Nav, NavFlex, NavItem } from 'abm-ui/component/nav';
```
:::注册导入
```ts
import 'abm-ui/component/nav';
```
:::

```tsx
<Nav value={0}>
  <NavItem value={0}>选项1</NavItem>
  <NavItem value={1}>选项2</NavItem>
  <NavFlex/>
  <NavItem value={2}>选项3</NavItem>
</Nav>
```

```html
<abm-nav value="0">
  <abm-nav-item value="0">选项1</abm-nav-item>
  <abm-nav-item value="1">选项2</abm-nav-item>
  <abm-nav-flex></abm-nav-flex>
  <abm-nav-item value="2">选项3</abm-nav-item>
</abm-nav>
```

# 属性

## `vertical`
是否垂直方向布局。

# 方法

## `setup`
快速设置导航项。
```ts
nav.setup([
  123, // 直接设置值
  { value: 456, content: '选项4' }, // 完整设置
  { type: 'flex' }, // 插入空白
]);
```
