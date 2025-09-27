---
title: 对话框
order: 2
icon: Window
source:
	- packages/abm-ui/src/components/dialog.ts
---

# 尝试一下
```demo components/dialog
locale: { clickMe: '点击我', dialog: { title: '对话框标题' } }
```

# 接口

## 接口 `DialogInitBase`
- `title`：`string` 或 [`UIContentInit`](/@/components/content#接口-uicontentinit) 或 [`UIContent`](/@/components/content#类-uicontent) 类型对话框标题
- `content`：[`DOMContents`](/@/utils/dom#类型-domcontents) 类型，对话框内容
- `autoHide`：按钮激活时关闭对话框，默认 `false`
- `theme`：[`Color`](/@/utils/color#类-color) 或 `string` 类型，对话框主题色
- `maskAction`：点击遮罩时触发的 action ID

## 接口 `DialogActionInit`
- `id`：按钮对应的 action ID
- `content`：[`DOMContents`](/@/utils/dom#类型-domcontents) 类型，按钮内容，可选
- `icon`：按钮图标键名，可选
- `key`：按钮内容本地化键名，可选
- `state`：按钮状态，可选
  - `  `：默认
  - `primary`：主要
  - `danger`：危险
- `delay`：按钮长按激活时长，单位毫秒，可选
- `progress`：按钮显示进度，可选
- `disabled`：禁用按钮，可选
- `color`：[`Color`](/@/utils/color#类-color) 或 `string` 类型，按钮颜色，可选
- `size`：按钮发现，可选
  - `auto`：自动，默认
  - `max-content`：根据内容
  - `[number]`：`flex-grow` 值
  - `[string]`：`width` 值，使用字面量

## 接口 `DialogInit`
该接口继承 [`DialogInitBase`](#接口-dialoginitbase) 接口。

- `actions`：[`DialogActionInit`](#接口-dialogactioninit) 类型数组，对话框按钮列表

## 接口 `DialogConfirmInit`
该接口继承 [`DialogInitBase`](#接口-dialoginitbase) 接口。

- `actions`：[`DialogActionInit`](#接口-dialogactioninit) 类型数组，对话框按钮列表，可选

不论指定任意数量的按钮，最终只会显示两个按钮，且其 action ID 分别为 `confirm` 和 `cancel`。

## 接口 `DialogAlertInit`
该接口继承 [`DialogInitBase`](#接口-dialoginitbase) 接口。

- `actions`：[`DialogActionInit`](#接口-dialogactioninit) 类型数组，对话框按钮列表，可选

不论指定任意数量的按钮，最终只会显示一个按钮，且其 action ID 为 `ok`。

## 接口 `DialogEvents`
对话框事件列表。

- `action`：对话框按钮触发，[`EventValue`](/@/utils/events#类-eventvalue) 类型。

## 类 `Dialog`
该接口实现 [`IEventSource`](/@/utils/events#接口-ieventsource) 接口。

## 静态属性与方法

### `ACTION_CONFIRM`
确认按钮模版，只读。

### `ACTION_DANGER_CONFIRM`
危险确认按钮模版，只读。

### `ACTION_CANCEL`
取消按钮模版，只读。

- 激活延迟：1000 毫秒
- 状态：`danger`

### `ACTION_OK`
OK 按钮模版，只读。

### `confirm()`
创建并显示确认对话框。

参数：
- `options`：[`DialogConfirmInit`](#接口-dialogconfirminit) 类型

返回 `Promise<boolean> & { dialog: Dialog<'confirm' | 'cancel'> }`。

### `alert()`
创建并显示提示对话框。

参数：
- `options`：[`DialogAlertInit`](#接口-dialogalertinit) 类型

返回 `Promise<void> & { dialog: Dialog<'confirm' | 'cancel'> }`。

### `overlay()`
创建并显示无按钮对话框。

参数：
- `options`：[`DialogInitBase`](#接口-dialoginitbase) 类型

返回 `Dialog` 实例。

## 实例属性与方法

### `constructor()`
参数：
- `options`：[`DialogInit`](#接口-dialoginit) 类型

### `title`
对话框标题。
读取为 [`UIContent`](/@/components/content#类-uicontent) 类型，允许设置为 `string | UIContentInit | UIContent` 类型。

### `content`
对话框内容，[`DOMContents`](/@/utils/dom#类型-domcontents) 类型。

### `autoHide`
按钮激活时关闭对话框。

### `maskAction`
点击遮罩时触发的 action ID。

### `actions`
对话框按钮。

### `theme`
对话框主题色。

### `waitForAction()`
等待按钮点击，返回 `Promise<string>`，按钮点击时将兑现该 `Promise`。

### `show()`
显示对话框。

### `hide()`
隐藏对话框。
