---
title: File Picker
source: packages/abm-ui/src/component/file-picker.ts
---

File picker component, used to select files.

This component's form value type is [`File[]`](https://developer.mozilla.org/docs/Web/API/File).

# Try It
{{[demo](../../../../demo/component/file-picker.tsx)}}

# Usage
:::Global Import
```ts
import { FilePicker } from 'abm-ui';
```
:::On-demand Import
```ts
import { FilePicker } from 'abm-ui/component/file-picker';
```
:::Registration Import
```ts
import 'abm-ui/component/file-picker';
```
:::

```tsx
<FilePicker />
```

```html
<abm-file-picker></abm-file-picker>
```

# Properties

## `readonly`
Boolean type, set to read-only state, users cannot select files.

## `previewImage`
Boolean type, set to image preview state, after users select image files, the images will be previewed in the component.

## `accept`
String type, sets the accepted file types, for example `image/*` means accepting all image files, refer to [MDN documentation](https://developer.mozilla.org/docs/Web/API/HTMLInputElement/accept).

## `multiple`
Boolean type, set to multiple selection state, users can select multiple files.

# Methods

## `openPicker`
Open the file picker dialog, users can select files.

# Slots

| Slot Name | Description |
| --------- | ----------- |
| `  `      | Default slot, used to display placeholder |
| `before`  | Displayed before the file list, only shown when there are files |
| `after`   | Displayed after the file list, only shown when there are files |

# `::part()` Selectors

| Selector      | Description |
| ------------- | ----------- |
| `placeholder` | Placeholder |
| `before`      | Before file list |
| `after`       | After file list |