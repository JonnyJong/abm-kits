---
title: Form
source: packages/abm-ui/src/component/form.ts
order: 4
---

# Class `FormControl`
Abstract class for form control components, all form controls inherit from this class.

The first generic `T` of this class represents the value type of the form control.

This class has implemented the copying of `value`, `default`, `name`, `invalid`, and `disabled` properties in the `cloneNode` method.

## Usage
:::Global Import
```ts
import { FormControl } from 'abm-ui';
```
:::On-demand Import
```ts
import { FormControl } from 'abm-ui/component/form';
```
:::

## Properties

### `value`
The value of the form control, type `T`.

### `default`
The default value of the form control, type `T`.

### `name`
The name of the form control, type `string`.

### `invalid`
Whether the form control is invalid, type `boolean`.

### `disabled`
Whether the form control is disabled, type `boolean`.

## Methods

### `reset`
Reset the form control's value to the default value.

### `emitUpdate`
Protected method, used to trigger form updates. If the parameter is `true`, it triggers a `change` event; if no parameter or the parameter is `false`, it triggers an `input` event.

### `clone`
This class overrides the [`clone`](../base#clone) method. If a subclass overrides this method, it may need to call `super.clone(from)`.

## Events
| Event Name | Parameter List | Description |
| ---------- | -------------- | ----------- |
| `input`    | `(value: T)`   | Triggered when the form control's value changes, parameter is the current value |
| `change`   | `(value: T)`   | Triggered when the form control's value changes and user interaction ends, parameter is the current value |
| `submit`   | `()`           | Triggered when the form control is submitted |

---

# `<Form>`
Form component, inherits from the [`FormControl`](#class-formcontrol) class, used to wrap form controls and can get a summary of the values of all form controls in its child elements.

Its form value type is `T extends any[] | Record<string, any> = Record<string, any>`.

This component will proxy form events emitted by all its child elements. After a child element emits a form event, this component will emit the same type of event.

## Usage
:::Global Import
```ts
import { Form } from 'abm-ui';
```
:::On-demand Import
```ts
import { Form } from 'abm-ui/component/form';
```
:::Registration Import
```ts
import 'abm-ui/component/form';
```
:::

```tsx
<Form>
  <FormField name="username">
    <Label>Username</Label>
    <TextBox/>
    <FormMessage/>
  </FormField>
  <FormField name="password">
    <Label>Password</Label>
    <PasswordBox/>
    <FormMessage/>
  </FormField>
</Form>
```

```html
<abm-form>
  <abm-form-field name="username">
    <abm-label>Username</abm-label>
    <abm-text-box></abm-text-box>
    <abm-form-message></abm-form-message>
  </abm-form-field>
  <abm-form-field name="password">
    <abm-label>Password</abm-label>
    <abm-password-box></abm-password-box>
    <abm-form-message></abm-form-message>
  </abm-form-field>
</abm-form>
```

## Properties

### `as`
Used to indicate how the form should summarize the form values of its child elements.

| Value        | Description |
| ------------ | ----------- |
| `undefined`  | If all keys are numbers, summarize as an array; otherwise, summarize as an object |
| `array`      | Always summarize as an array |
| `object`     | Always summarize as an object |

## Methods

### `setMessage`
Set the invalid message for form controls. The structure is the same as the form value, but each value type is a string, which is the invalid message for each form control.

---

# `<FormField>`
Form field component, inherits from the [`FormControl`](#class-formcontrol) class, used to wrap form controls and manage its internal form controls, form messages, and labels simultaneously.

This component will proxy form events emitted by its direct child elements. After a child element emits a form event, this component will emit the same type of event.

## Usage
:::Global Import
```ts
import { FormField } from 'abm-ui';
```
:::On-demand Import
```ts
import { FormField } from 'abm-ui/component/form';
```
:::Registration Import
```ts
import 'abm-ui/component/form';
```
:::

```tsx
<FormField name="username">
  <Label>Username</Label>
  <TextBox/>
  <FormMessage/>
</FormField>
```

```html
<abm-form-field name="username">
  <abm-label>Username</abm-label>
  <abm-text-box></abm-text-box>
  <abm-form-message></abm-form-message>
</abm-form-field>
```

## Methods

### `setMessage`
Set the invalid message for the form field.

---

# `<FormMessage>`
Form message component, used to display the invalid message of the form field.

## Usage
:::Global Import
```ts
import { FormMessage } from 'abm-ui';
```
:::On-demand Import
```ts
import { FormMessage } from 'abm-ui/component/form';
```
:::Registration Import
```ts
import 'abm-ui/component/form';
```
:::

## Properties

### `message`
The invalid message of the form field.

---

# `<Label>`
Label component, used to add descriptive text to form controls. When the label is hovered or activated, form controls with the same ID will be hovered or activated simultaneously.

## Usage
:::Global Import
```ts
import { Label } from 'abm-ui';
```
:::On-demand Import
```ts
import { Label } from 'abm-ui/component/form';
```
:::Registration Import
```ts
import 'abm-ui/component/form';
```
:::

```tsx
<Label for="username">Username</Label>
<TextBox id="username"/>
```

```html
<abm-label for="username">Username</abm-label>
<abm-text-box id="username"></abm-text-box>
```

## Properties

### `for`
The ID of the form control associated with the label, type `string`.