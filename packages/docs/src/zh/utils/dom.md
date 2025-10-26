---
title: DOM
source:
	- packages/abm-utils/src/dom.ts
---

# 接口 `HTMLElementProp`
原生 DOM 元素接口的部分定义，用于代码提示补全。

# 类型 `CSSProperty`
CSS 属性值对象定义。

键值处理：
- `string`：
  若以 `$` 开头，将转换为 `var(...)`，其他情况按字面量\
	例：
	- `black` -> `black`
	- `$themeColor` -> `var(--theme-color)`
- `number`：
  添加 `px` 后缀\
	例：`12` -> `12px`

# 类型 `CSSVariable`
CSS 变量键值对对象定义。

CSS 变量名允许使用 `--` 或 `$` 前缀，`$` 前缀将自动转换为 `--`；
变量名中 `-a` 可简写为 `A`。

示例：
- `--theme-color` -> `--theme-color`
- `--themeColor` -> `--theme-color`
- `$theme-color` -> `--theme-color`
- `$themeColor` -> `--theme-color`

键值处理：
- `string`：
  若以 `$` 开头，将转换为 `var(...)`，其他情况按字面量\
	例：
	- `black` -> `black`
	- `$themeColor` -> `var(--theme-color)`
- `number`：
  添加 `px` 后缀\
	例：`12` -> `12px`

# 类型 `DOMContents`
DOM 内容定义。

# 类型 `DOMEventMap`
DOM 元素事件“事件名-处理函数对”对象定义。

# 类型 `DOMApplyOptions`
`$apply()` 函数选项定义。

## `class`
元素类名，可选。
单个类名可直接使用字符串，多个类名需使用字符串数组。

## `id`
元素 ID，可选。

## `attr`
元素属性键值对，可选。

## `data`
元素 `dataset` 键值对，可选。

## `style`
元素样式键值对，可选。
参考 [`CSSProperty`](#类型-cssproperty)、[`CSSVariable`](#类型-cssvariable)。

## `content`
元素内容，可选，参考 [`DOMContents`](#类型-domcontents)。\
若同时编写 `content` 和 `html`，将忽略 `content`。

## `html`
元素 HTML 内容，可选。\
若同时编写 `content` 和 `html`，将忽略 `content`。

## `event`
元素 DOM 事件绑定，可选，参考 [`DOMEventMap`](#类型-domeventmap)。

## `color`
元素颜色 token 设置，可选。

## `prop`
元素属性值设置，可选。

## `on`
元素自定义事件绑定。

## `once`
元素自定义事件一次性绑定。

# `$applyColor()`
将 [`Color`](/@/utils/color#类-color) 的 token 设置到目标元素上。

# `$apply()`
根据 [`DOMApplyOptions`](#类型-domapplyoptions) 修改目标元素。

# `$()`
在指定元素内，查找一个元素，默认范围 `document`。该函数为 `Element.querySelector` 的别名。

# `$$()`
在指定元素内，查找多个元素，默认范围 `document`。该函数为 `Element.querySelectorAll` 的别名。

# `$new()`
创建一个元素并根据 [`DOMApplyOptions`](#类型-domapplyoptions) 修改创建的元素，返回创建的元素。

```ts
import { $new } from 'abm-utils';

$new(
	{ tag: 'a', class: 'link', prop: { href: '#' } },
	$new({ tag: 'span' }, 'Hello world!'),
);

/*
结果：
	<a class="link" href="#">
		<span>Hello world!</span>
	</a>
*/
```

# `$div()`
`$new({ tag: 'div' }, ...)` 的别名。

# `$path()`
获取目标元素在 DOM 树中的路径。

# `$ready()`
`document.addEventListener('DOMContentLoaded', ...)` 别名。
