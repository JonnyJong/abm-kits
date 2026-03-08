---
title: DOM
source: packages/abm-ui/src/infra/dom.ts
---

```ts
import 'abm-ui/infra/dom';
```

# 类型 `DOMContents`
DOM 内容，`Node | string | (Node | string)[]` 的别名。

# 类型 `ElementProps`
从自定义元素类中提取适用于 JSX 的属性类型定义。

# 类型 `VoidElementProps`
从自定义的自闭合元素类中提取适用于 JSX 的属性类型定义。

# 类型 `GlobalAttributes`
全局属性，所有值均为可选值。
- `children`：子元素
- `className`：类名
- `id`：ID
- `style`：样式，参考 [`StyleDeclaration`](./style#类型-styledeclaration)
- `color`：主题色，参考 [`ThemeColor`](./color#类型-themecolor)
- `data-*`：数据属性
- `$*`：[`Component`](../component/base#类-component) 事件监听器
- `ref`：获取 DOM 引用
- `attr`：HTML 属性
- `props`：属性
- `dangerouslySetInnerHTML`：
  - `__html`：直接设置 `innerHTML`，当包含子元素时，此选项失效
- `tooltip`：工具提示，[`DOMContents`](#类型-domcontents) 类型
- `xmlns`：标签命名空间

# 接口 `CustomElementTagNameMap`
自定义元素标签名映射，结构同 `HTMLElementTagNameMap`。

# 接口 `CustomElementPropMap`
自定义元素属性映射，结构同 `JSX.IntrinsicElements`

# 函数 `$apply`
修改 DOM 元素，参数：
- `target`：DOM 元素
- `options`：[`GlobalAttributes`](#类型-globalattributes) 类型，可选
- `...children`：子元素，若该参数有值，将忽略 `options.children` 和 `options.dangerouslySetInnerHTML`

# 函数 `$fragment`
`document.createDocumentFragment` 别名，参数：
- `...nodes`：`(Node | string)[]`

# 函数 `$new`
创建并设置元素，参数：
- `type`：支持传入标签名、已注册的自定义元素类、函数
- `options`：[`GlobalAttributes`](#类型-globalattributes) 类型，可选
- `...children`：子元素，若该参数有值，将忽略 `options.children` 和 `options.dangerouslySetInnerHTML`

默认情况下，所有传入的标签名使用默认的命名空间创建，下表标签名默认使用 `http://www.w3.org/2000/svg` 命名空间创建：
+++查看详情
- `svg`
- `animate`
- `animateMotion`
- `animateTransform`
- `set`
- `circle`
- `ellipse`
- `rect`
- `defs`
- `g`
- `symbol`
- `use`
- `path`
- `polygon`
- `polyline`
- `line`
- `clipPath`
- `mask`
- `marker`
- `switch`
- `foreignObject`
- `text`
- `textPath`
- `tspan`
- `desc`
- `metadata`
- `mpath`
- `linearGradient`
- `radialGradient`
- `pattern`
- `stop`
- `feBlend`
- `feColorMatrix`
- `feComponentTransfer`
- `feComposite`
- `feConvolveMatrix`
- `feDiffuseLighting`
- `feDisplacementMap`
- `feDistantLight`
- `feDropShadow`
- `feFlood`
- `feFuncA`
- `feFuncB`
- `feFuncG`
- `feFuncR`
- `feGaussianBlur`
- `feImage`
- `feMerge`
- `feMergeNode`
- `feMorphology`
- `feOffset`
- `fePointLight`
- `feSpecularLighting`
- `feSpotLight`
- `feTile`
- `feTurbulence`
- `filter`
- `view`
- `image`
+++

# 函数 `$div`
创建并设置 `<div>` 元素，该函数为 `$new('div', ...)` 别名。

# 函数 `$slot`
创建 `<slot>` 元素，参数：
- `name`：槽位名，可选

# 函数 `$comment`
`document.createComment` 别名。

# 函数 `$svg`
使用 `http://www.w3.org/2000/svg` 命名空间创建元素。

# 函数 `$`
`scope.querySelector<E>(selector)` 别名，参数：
- `selector`：选择器
- `scope`：范围，默认 `document`

# 函数 `$$`
`scope.querySelectorAll<E>(selector)` 别名，参数：
- `selector`：选择器
- `scope`：范围，默认 `document`

# 函数 `$content`
获取目标元素所有子元素，`Text` 元素自动转换为 `string`。

# 函数 `$clone`
克隆 [`DOMContents`](#类型-domcontents)。

# 函数 `$path`
获取元素路径。

# 函数 `$rect`
`Element.getBoundingClientRect()` 别名，若未传入元素，返回 `new DOMRect()`。

# 函数 `$ready`
在 DOM 内容加载完毕后调用处理器并兑现 Promise；当 DOM 内容已加载完成时立即调用并兑现。

参数：`() => any`，可选。返回 `Promise<void>`。
