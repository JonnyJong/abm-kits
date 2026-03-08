---
title: JSX
source: packages/abm-ui/src/jsx-runtime.ts
---

```ts
import 'abm-ui/jsx-runtime';
```

ABM UI 提供了基础的 JSX 运行时，基于原生 DOM 实现，无中间层或虚拟 DOM。

# TypeScript 配置
仅需在 `tsconfig.json` 添加两行配置即可使用。

```json tsconfig.json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "abm-ui"
  }
}
```

# 类 `Fragment`
[`DocumentFragment`](https://developer.mozilla.org/docs/Web/API/DocumentFragment) 别名。

# 函数 `jsx`
[`$new`](./dom#函数-new) 别名。

# 函数 `jsxs`
[`$new`](./dom#函数-new) 别名。

# 开发运行时
```ts
import 'abm-ui/jsx-runtime-dev';
```

开发运行时提供了增强的开发体验，包括源码位置追踪和元素检查功能。

## 函数 `jsxDEV`

开发运行时的 JSX 转换函数，支持源码位置追踪和组件实例关联。

## 调试功能

开发运行时提供了 **Alt + 左键点击** 的调试功能：

1. 在任意元素上按住 `Alt` 键并点击
2. 控制台会输出该元素的详细信息，包括：
   - DOM 节点本身
   - 所属组件实例（如果有）
   - 源码位置（文件名、行号、列号）
3. 自动尝试在编辑器中打开对应源码位置
