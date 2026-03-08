---
title: 组件基础
order: 0
source: packages/abm-ui/src/component/base.ts
---

# 类 `Component`
组件基类，该 UI 库所有组件均继承自该类；该类继承 [`HTMLElement`](https://developer.mozilla.org/docs/Web/API/HTMLElement) 类，实现了 [`EventEmitter`](../utils/event#类-eventemitter) 类和 [`Navigable`](../infra/navigate#接口-navigable) 接口。

## 静态属性

### `style`
`ArrayOr<CSSStyleSheet>` 类型，可声明多个样式表，用于组件的样式。仅附加影子 DOM 时生效。

### `hoverable`
`boolean` 类型，是否可悬停，默认值为 `false`。若为 `true`，则该组件将会监听[悬停状态](../infra/state#悬停状态)。

### `activatable`
`boolean` 类型，是否可触发，默认值为 `false`。若为 `true`，则该组件将会监听[触发状态](../infra/state#触发状态)。

### `navigable`
`boolean` 类型，是否可导航，默认值为 `false`。若为 `true`，则该组件将标记为可导航元素。

### `aria`
`AriaConfig` 类型，用于配置组件的 ARIA 属性。在组件初始化时，会自动应用这些配置。

## 方法

### `init`
可选方法，将在第一次连接到文档时由 [`Component`](#类-component) 自动调用。构造阶段不允许访问元素的属性和子元素，可在该方法中安全访问和处理。

### `connectedCallback`
可选方法，每次元素连接到文档时自动被调用，参考 [MDN 文档](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_components/Using_custom_elements#自定义元素生命周期回调)。
[`Component`](#类-component) 类实现了该方法，因此若要重写此方法，请在重写方法中首行调用 `super.connectedCallback()`，确保父类的行为被正确执行。

### `disconnectedCallback`
可选方法，每次元素从文档中移除时自动被调用，参考 [MDN 文档](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_components/Using_custom_elements#自定义元素生命周期回调)。
[`Component`](#类-component) 类实现了该方法，因此若要重写此方法，请在重写方法中首行调用 `super.disconnectedCallback()`，确保父类的行为被正确执行。

### `adoptedCallback`
可选方法，每次元素被移动到新文档时自动被调用，参考 [MDN 文档](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_components/Using_custom_elements#自定义元素生命周期回调)。

### `attributeChangedCallback`
可选方法，每次元素的属性值发生变化时自动被调用，参考 [MDN 文档](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_components/Using_custom_elements#自定义元素生命周期回调)。
[`Component`](#类-component) 类实现了该方法，因此若要重写此方法，请在重写方法中首行调用 `super.attributeChangedCallback()`，确保父类的行为被正确执行。

### `handleLabelActive`
元素对应[标签](./form#label)激活回调。

### `attachShadow`
将元素的影子 DOM 附加到元素上，参考 [MDN 文档](https://developer.mozilla.org/zh-CN/docs/Web/API/Element/attachShadow)。
[`Component`](#类-component) 类重写了该方法，支持无参数创建默认模式为 `closed` 的影子 DOM；支持传入元素来添加到影子 DOM 中。
```tsx
this.attachShadow();
this.attachShadow({});
this.attachShadow(undefined);
this.attachShadow({}, 'Hello world');
this.attachShadow(undefined, 'Hello world');
this.attachShadow({}, <div>Hello</div>, <span>world</span>);
```

### `updateStyles`
更新元素独立的样式，独立样式会与 [`Component`](#类-component) 类的静态属性 `style` 指定的样式一起生效，且有更高的优先级。仅在影子 DOM 中生效。

### `updateAria`
更新组件的 ARIA 配置。可传入新的 ARIA 配置对象，该方法会根据配置更新组件的 ARIA 属性。

### `clone`
复制组件属性。若要实现克隆节点时复制节点属性，请通过重写该方法实现。

# 自定义组件

下面是一个典型的自定义组件示例：
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
