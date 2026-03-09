---
title: DOM
source: packages/abm-ui/src/infra/dom.ts
---

```ts
import 'abm-ui/infra/dom';
```

# Type `DOMContents`
DOM content, alias for `Node | string | (Node | string)[]`.

# Type `ElementProps`
Extract JSX-appropriate property type definitions from custom element classes.

# Type `VoidElementProps`
Extract JSX-appropriate property type definitions from custom self-closing element classes.

# Type `GlobalAttributes`
Global attributes, all values are optional.
- `children`: Child elements
- `className`: Class name
- `id`: ID
- `style`: Style, refer to [`StyleDeclaration`](./style#type-styledeclaration)
- `color`: Theme color, refer to [`ThemeColor`](./color#type-themecolor)
- `data-*`: Data attributes
- `$*`: [`Component`](../component/base#class-component) event listeners
- `ref`: Get DOM reference
- `attr`: HTML attributes
- `props`: Properties
- `dangerouslySetInnerHTML`:
  - `__html`: Directly set `innerHTML`, this option is invalid when containing child elements
- `tooltip`: Tooltip, [`DOMContents`](#type-domcontents) type
- `xmlns`: Tag namespace

# Interface `CustomElementTagNameMap`
Custom element tag name map, structure same as `HTMLElementTagNameMap`.

# Interface `CustomElementPropMap`
Custom element property map, structure same as `JSX.IntrinsicElements`

# Function `$apply`
Modify DOM element, parameters:
- `target`: DOM element
- `options`: [`GlobalAttributes`](#type-globalattributes) type, optional
- `...children`: Child elements, if this parameter has a value, `options.children` and `options.dangerouslySetInnerHTML` will be ignored

# Function `$fragment`
`document.createDocumentFragment` alias, parameters:
- `...nodes`: `(Node | string)[]`

# Function `$new`
Create and set element, parameters:
- `type`: Supports passing tag name, registered custom element class, or function
- `options`: [`GlobalAttributes`](#type-globalattributes) type, optional
- `...children`: Child elements, if this parameter has a value, `options.children` and `options.dangerouslySetInnerHTML` will be ignored

By default, all passed tag names are created using the default namespace. The following tag names are created using the `http://www.w3.org/2000/svg` namespace by default:
+++View Details
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

# Function `$div`
Create and set `<div>` element, this function is an alias for `$new('div', ...)`.

# Function `$slot`
Create `<slot>` element, parameters:
- `name`: Slot name, optional

# Function `$comment`
`document.createComment` alias.

# Function `$svg`
Create elements using the `http://www.w3.org/2000/svg` namespace.

# Function `$`
`scope.querySelector<E>(selector)` alias, parameters:
- `selector`: Selector
- `scope`: Scope, default `document`

# Function `$$`
`scope.querySelectorAll<E>(selector)` alias, parameters:
- `selector`: Selector
- `scope`: Scope, default `document`

# Function `$content`
Get all child elements of the target element, `Text` elements are automatically converted to `string`.

# Function `$clone`
Clone [`DOMContents`](#type-domcontents).

# Function `$path`
Get element path.

# Function `$rect`
`Element.getBoundingClientRect()` alias, returns `new DOMRect()` if no element is passed.

# Function `$ready`
Call the handler and resolve the Promise after DOM content is loaded; call and resolve immediately when DOM content is already loaded.

Parameter: `() => any`, optional. Returns `Promise<void>`.

# Function `$part`
Create a part component for defining named parts of a component.

When parameter is a string:
- `slot`: Slot name, child elements will automatically have the `slot` attribute set

When parameter is a function:
- `apply`: Custom handler function that receives each child element as a parameter
