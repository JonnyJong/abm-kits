---
title: Decorator
source: packages/abm-ui/src/infra/decorator.ts
---

```ts
import 'abm-ui/infra/decorator';
```

# Function `defineElement`
Custom element decorator factory function, used to register custom elements.
```ts
@defineElement('my-button')
class MyButton extends HTMLElement {}
```

# Function `property`
Register custom element properties. Custom elements need to inherit from [`Component`](../component/base#class-component) and have a `getter` or be an accessor for the corresponding property to take effect.

Parameters:
- `init`: Optional
  - `name`: Override default property name, optional
  - `reflect`: Enable reflection, default `false`
  - `toValue`: Property value conversion function, default `String`
  - `toAttr`: HTML attribute value conversion function, default `String`
  - `filter`: Value filter

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