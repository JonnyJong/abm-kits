---
title: 布局控制器
source: packages/abm-ui/src/layout.ts
---

# 使用
:::全局导入
```ts
import { LayoutController } from 'abm-ui';
```
:::按需导入
```ts
import { LayoutController } from 'abm-ui/layout';
```
:::

# 类 `LayoutController`

## 构造参数
- `target`：目标元素
- `updateLayout`：布局更新回调

## 属性

### `target`
目标元素。

### `updateLayout`
布局更新回调。

### `running`
运行中。

## 方法

### `start`
开始计算布局，参数：
- `skipFirst`：布尔类型，跳过第一次布局，默认 `false`

### `stop`
停止计算布局。

### `forceUpdate`
强制更新布局，无视运行状态和元素大小/位置是否发生变化。
