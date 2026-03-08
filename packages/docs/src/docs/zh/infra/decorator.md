---
title: 装饰器
source: packages/abm-ui/src/infra/decorator.ts
---

```ts
import 'abm-ui/infra/decorator';
```

# 函数 `defineElement`
自定义元素装饰器工厂函数，用于注册自定义元素。
```ts
@defineElement('my-button')
class MyButton extends HTMLElement {}
```

# 函数 `property`
注册自定义元素属性，自定义元素需继承自 [`Component`](../component/base#类-component) 且对应属性有 `getter` 或为访问器才能生效。

参数：
- `init`：可选
  - `name`：覆盖默认属性名，可选
  - `reflect`：启用反射，默认 `false`
  - `toValue`：属性值转换函数，默认 `String`
  - `toAttr`：HTMl 属性值转换函数，默认 `String`
  - `filter`：值过滤器

```tsx
@defineElement('my-button')
class MyButton extends Component {
  @property()
  accessor a = ''; // <my-button a="xyz"></my-button>
  @property({ name: 'attr-b' })
  accessor b = ''; // <my-button attr-b="xyz"></my-button>
  @property({ reflect: true, toValue: Boolean })
  accessor c = '';
}

const myButton = <my-button c="true"></my-button>;
myButton.c; // true
myButton.c = false; // <my-button c="false"></my-button>
```
