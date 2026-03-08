---
title: 图标
order: 3
source: packages/abm-ui/src/component/icon.ts
---

# 使用
:::全局导入
```ts
import { Icon, ico } from 'abm-ui';
```
:::按需导入
```ts
import { Icon, ico } from 'abm-ui/component/icon';
```
:::注册导入
```ts
import 'abm-ui/component/icon';
```
:::

```tsx
ico('ui.success') // 推荐
<Icon>ui.success</Icon>
<Icon key="ui.success"></Icon>
```

```html
<abm-icon>ui.success</abm-icon>
<abm-icon key="ui.success"></abm-icon>
```

# 属性

## `key`
字符串类型，图标键名。

# 方法

## `update`
无参数无返回值，更新图标内容。

# 静态方法

## `register`
注册图标包。

## `svg`
从 SVG 字符串创建图标。

# 函数 `ico`
创建并返回 Icon 组件实例。

# 类型/接口

## `IconDict`
支持嵌套的图标包字典。

## `PresetIcons`
预设图标字典。

## `IconRegistry`
图标定义。通过以下方式声明新图标：
```ts
declare module 'abm-ui' {
  interface IconRegistry {
    aaa: string;
    bbb: string;
  }
}

// 使用
ico('aaa');
```

## `IconKey`
已声明的图标键名。

## `IconPackageDefine`
图标包定义。可用于简化图标包的声明。
```ts
declare module 'abm-ui' {
  interface IconRegistry extends IconPackageDefine<typeof ICONS> {}
}

const ICONS = {} as const satisfies IconDict;
```

## `IconPackage`
图标包。
