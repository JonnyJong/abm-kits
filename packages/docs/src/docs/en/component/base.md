---
title: Component Base
order: 0
source: packages/abm-ui/src/component/base.ts
---

# Class `Component`
The base class for components, all components in this UI library inherit from this class; this class inherits the [`HTMLElement`](https://developer.mozilla.org/docs/Web/API/HTMLElement) class, and implements the [`EventEmitter`](../utils/event#class-eventemitter) class and [`Navigable`](../infra/navigate#interface-navigable) interface.

## Static Properties

### `style`
`ArrayOr<CSSStyleSheet>` type, can declare multiple style sheets for component styles. Only effective when shadow DOM is attached.

### `hoverable`
`boolean` type, whether hoverable, default value is `false`. If `true`, the component will listen for [hover state](../infra/state#hover-state).

### `activatable`
`boolean` type, whether activatable, default value is `false`. If `true`, the component will listen for [active state](../infra/state#active-state).

### `navigable`
`boolean` type, whether navigable, default value is `false`. If `true`, the component will be marked as a navigable element.

### `aria`
`AriaConfig` type, used to configure the ARIA attributes of the component. These configurations will be automatically applied during component initialization.

## Methods

### `init`
Optional method, will be automatically called by [`Component`](#class-component) when first connected to the document. Accessing element properties and children is not allowed during the construction phase, but can be safely accessed and processed in this method.

### `connectedCallback`
Optional method, automatically called every time the element is connected to the document, refer to [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#custom-element-lifecycle-callbacks).
The [`Component`](#class-component) class implements this method, so if you want to override this method, please call `super.connectedCallback()` at the first line of the overridden method to ensure the parent class's behavior is correctly executed.

### `disconnectedCallback`
Optional method, automatically called every time the element is removed from the document, refer to [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#custom-element-lifecycle-callbacks).
The [`Component`](#class-component) class implements this method, so if you want to override this method, please call `super.disconnectedCallback()` at the first line of the overridden method to ensure the parent class's behavior is correctly executed.

### `adoptedCallback`
Optional method, automatically called every time the element is moved to a new document, refer to [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#custom-element-lifecycle-callbacks).

### `attributeChangedCallback`
Optional method, automatically called every time the element's attribute value changes, refer to [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#custom-element-lifecycle-callbacks).
The [`Component`](#class-component) class implements this method, so if you want to override this method, please call `super.attributeChangedCallback()` at the first line of the overridden method to ensure the parent class's behavior is correctly executed.

### `handleLabelActive`
Callback when the corresponding [label](./form#label) is activated.

### `attachShadow`
Attaches the element's shadow DOM to the element, refer to [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/API/Element/attachShadow).
The [`Component`](#class-component) class overrides this method, supporting parameterless creation of shadow DOM with default mode `closed`; supports passing elements to add to the shadow DOM.
```tsx
this.attachShadow();
this.attachShadow({});
this.attachShadow(undefined);
this.attachShadow({}, 'Hello world');
this.attachShadow(undefined, 'Hello world');
this.attachShadow({}, <div>Hello</div>, <span>world</span>);
```

### `updateStyles`
Updates the element's independent styles. Independent styles will take effect together with the styles specified by the static property `style` of the [`Component`](#class-component) class, and have higher priority. Only effective in shadow DOM.

### `updateAria`
Updates the ARIA configuration of the component. Can pass a new ARIA configuration object, and this method will update the component's ARIA attributes according to the configuration.

### `clone`
Copies component properties. If you want to implement copying node properties when cloning a node, please override this method.

# Custom Components

Here is a typical custom component example:
```ts
declare module 'abm-ui' {
  interface CustomElementTagNameMap {
    'my-component': MyComponent;
  }
}

export interface MyComponentProp extends ElementProps<MyComponent> {}

export interface MyComponentEventMap {
  a: [];
  b: [boolean]
}

@defineElement('my-component')
export class MyComponent extends Component<MyComponentProp, MyComponentEventMap> {
  protected static hoverable = true;
  protected static navigable = true;
  protected static style = css`
    :host {
      position: relative;
      display: block;
    }
  `;
  constructor(_props?: MyComponentProp) {
    super();
    this.attachShadow({}, 'Hello world');
    state.active.on(this, (active, cancel) => {
      if (cancel) return;
      this.emit('b', active);
    });
  }
  @property()
  @toType(String)
  accessor value = '';
  cloneNode(subtree?: boolean): this {
    const node = super.cloneNode(subtree);
    node.value = this.value;
    return node;
  }
}
```
