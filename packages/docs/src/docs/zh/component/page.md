---
title: 页面
source: packages/abm-ui/src/component/page.ts
---

# 尝试一下
{{[demo](../../../demo/component/page.tsx)}}

# 使用
:::全局导入
```ts
import { PageHost } from 'abm-ui';
```
:::按需导入
```ts
import { PageHost } from 'abm-ui/component/page';
```
:::注册导入
```ts
import 'abm-ui/component/page';
```
:::

# 属性

## `history`
页面历史记录管理器，用于管理页面历史记录。

在未进行任何历史记录相关操作前，可设置历史记录管理器实例；默认使用 `NonPageHistory` 类。

## `current`
只读属性，当前活动的页面，若为 `undefined` 则表示无活动页面。

## `transition`
页面切换默认动画，未指定时默认使用此属性值，默认为 `suppress`。

支持以下切换动画：
- `suppress`：直接切换，无动画
- `fade`：淡入淡出切换动画
- `entrance`：从下往上切换动画
- `drill`：缩放切换动画
- `slideFromRight`：从右往左切换动画
- `slideFromLeft`：从左往右切换动画

## `autoHeight`
是否自动根据页面高度调整页面宿主高度，默认为 `false`。

# 方法

## `push`
打开指定页面。

可传入页面类或已注册的页面名称，支持向页面传入额外参数。
```ts
host.push(MyPage); // 直接传入页面类
host.push('my-page'); // 传入已注册的页面名称

// 向页面传入额外参数
host.push(MyPage, 'foo', 'bar');
host.push('my-page', 'foo', 'bar');

// 额外切换动画
host.push({
  page: MyPage, // 或 'my-page'
  transition: 'fade', // 覆盖默认切换动画
  // 连接动画元素集
  connectFrom: {
    cover: coverElement,
    title: titleElement,
  },
  // 连接动画是否为单向
  connectOneWay: false,
})
```

## `back`
返回上一页。

参数：
- `force`：是否强制返回上一页，默认为 `false`；强制返回时，最后一个页面会被关闭
- `options`：切换动画配置，可选
  - `transition`：切换动画类型

## `forward`
前进到下一页。

参数：
- `options`：切换动画配置，可选
  - `transition`：切换动画类型

## `goto`
跳转到指定页面。

参数：
- `index`：目标页面索引，从 `0` 开始
- `options`：切换动画配置，可选
  - `transition`：切换动画类型

## `register`
为页面类注册页面名称，用于在 `push` 方法中传入页面名称。

参数：
- `name`：页面名称
- `pageClass`：页面类

若已存在对应名称或页面类，则返回 `false`。

## `unregister`
取消注册页面名称。

参数：
- `pageClass`：页面类

## `isRegistered`
检查页面是否已经注册。

参数：
- `page`：页面名称或页面类

## `getName`
获取已注册的页面名称。

参数：
- `pageClass`：页面类

## `getPage`
获取已注册的页面类。

参数：
- `name`：页面名称

# 静态方法

## `new`
用于便捷地创建页面实例并注册页面。

# 类 `Page`
基础页面类，所有页面都需要继承该类。

## 属性

### `host`
获取当前页面宿主，在构建阶段阶段后可用。

### `root`
获取页面根元素，在构建阶段阶段后可用。

## 生命周期回调
以下方法在页面生命周期中调用，无默认实现。

| 方法名    | 描述                                                                                               |
| --------- | -------------------------------------------------------------------------------------------------- |
| `init`    | 初始化页面，在构建阶段阶段后调用                                                                   |
| `enter`   | 页面进入回调，在页面加入页面宿主子元素列表后，播放页面切换动画前调用                               |
| `exit`    | 页面退出回调，在新页面加入页面宿主子元素列表后，播放页面切换动画前、从页面宿主子元素列表移除前调用 |
| `destroy` | 页面销毁回调                                                                                       |

## 方法 `collectConnectableElements`
收集页面中所有可连接的元素，用于播放连接动画，返回 [`ConnectableElements`](#类型-connectableelements)。

# 类 `SingletonPage`
单例页面基类，所有单例页面都需要继承该类，该类继承自 [`Page`](#类-page) 类。

该类新增了 `setup` 方法，用于页面复用配置，在调用 `enter` 前调用；
该类的 `destroy` 方法将永远不会被调用。

# 接口 `PageHistory`
页面历史记录管理器接口，用于管理页面历史记录。

该接口有一个泛型参数 `T`，表示历史记录项数据类型。

## 属性

### `current`
只读属性，当前活动的历史记录项，若为 `undefined` 则表示无活动历史记录项。

### `currentIndex`
只读属性，当前活动历史记录项的索引，若为 `-1` 则表示无活动历史记录项。

### `length`
只读属性，历史记录项数量。

## 方法

### `push`
将一个新项推入历史记录栈。

### `back`
导航到历史记录中的上一项，返回上一项数据，若无上一项则返回 `undefined`。

### `forward`
导航到历史记录中的下一项，返回下一项数据，若无下一项则返回 `undefined`。

### `goto`
跳转到历史记录栈中的指定索引位置，返回对应项数据，若索引无效则返回 `undefined`。

## 预制实现类

| 类名               | 描述                                                               |
| ------------------ | ------------------------------------------------------------------ |
| `NonPageHistory`   | 无历史记录管理器类，用于无历史记录场景，只会保留当前活动项。       |
| `StackPageHistory` | 栈式历史记录管理器类，用于栈式历史记录场景，会保留所有历史记录项。 |

# 类型 `ConnectableElements`
`Record<string, HTMLElement>` 的别名，用于表示可连接的元素集合，键为元素 ID，值为元素实例。

计算连接动画时，若前后两个页面都提供了 ID 相同的元素，则会为这两个元素播放连接动画。
