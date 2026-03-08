---
title: 文件选择器
source: packages/abm-ui/src/component/file-picker.ts
---

文件选择器组件，用于选择文件。

该组件表单值类型为 [`File[]`](https://developer.mozilla.org/docs/Web/API/File)。

# 尝试一下
{{[demo](../../../../demo/component/file-picker.tsx)}}

# 使用
:::全局导入
```ts
import { FilePicker } from 'abm-ui';
```
::: 按需导入
```ts
import { FilePicker } from 'abm-ui/component/file-picker';
```
:::注册导入
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

# 属性

## `readonly`
布尔类型，设置为只读状态，用户无法选择文件。

## `previewImage`
布尔类型，设置为预览图片状态，用户选择图片文件后，会在组件中预览图片。

## `accept`
字符串类型，设置接受的文件类型，例如 `image/*` 表示接受所有图片文件，参考 [MDN 文档](https://developer.mozilla.org/docs/Web/API/HTMLInputElement/accept)。

## `multiple`
布尔类型，设置为多选状态，用户可以选择多个文件。

# 方法

## `openPicker`
打开文件选择器对话框，用户可以选择文件。

# 插槽

| 插槽名   | 描述                               |
| -------- | ---------------------------------- |
| `  `     | 默认插槽，用于显示占位符           |
| `before` | 显示于文件列表前，仅在有文件时显示 |
| `after`  | 显示于文件列表后，仅在有文件时显示 |

# `::part()` 选择器

| 选择器        | 描述       |
| ------------- | ---------- |
| `placeholder` | 占位符     |
| `before`      | 文件列表前 |
| `after`       | 文件列表后 |
