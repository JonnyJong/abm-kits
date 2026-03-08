---
title: 颜色
source: packages/abm-ui/src/infra/color.ts
---

<style>
  td:has(.color) { position: relative }
  .color {
    position: absolute;
    display: block;
    inset: 0;
    height: 100%;
    width: 100%;
    background:
      linear-gradient(45deg, #888 25%, #0000 0px, #0000 75%, #888 0px) 0px 0px / 16px 16px,
      linear-gradient(45deg, #888 25%, #0000 0px, #0000 75%, #888 0px) 8px 8px / 16px 16px,
      #ddd;
    /* border: 1px dashed; */
  }
  .color::before {
    content: '';
    position: absolute;
    display: block;
    inset: 0;
    height: 100%;
    width: 100%;
    background: var(--c);
  }
</style>

```ts
import 'abm-ui/infra/color';
```

# 颜色令牌

| CSS 变量                    | 颜色                                                              | 层级 | 区域 | 状态 |
| --------------------------- | ----------------------------------------------------------------- | ---- | ---- | ---- |
| `--bg`                      | <i class="color" style="--c: var(--bg)"></i>                      |      | 背景 |      |
| `--fg`                      | <i class="color" style="--c: var(--fg)"></i>                      |      | 前景 |      |
| `--fg-dim`                  | <i class="color" style="--c: var(--fg-dim)"></i>                  |      | 前景 | 暗色 |
| `--surface`                 | <i class="color" style="--c: var(--surface)"></i>                 |      | 背景 |      |
| `--surface-border`          | <i class="color" style="--c: var(--surface-border)"></i>          |      | 边框 |      |
| `--ui-bg`                   | <i class="color" style="--c: var(--ui-bg)"></i>                   |      | 背景 |      |
| `--ui-bg-hover`             | <i class="color" style="--c: var(--ui-bg-hover)"></i>             |      | 背景 | 悬停 |
| `--ui-bg-active`            | <i class="color" style="--c: var(--ui-bg-active)"></i>            |      | 背景 | 激活 |
| `--ui-bg-focus`             | <i class="color" style="--c: var(--ui-bg-focus)"></i>             |      | 背景 | 焦点 |
| `--ui-border`               | <i class="color" style="--c: var(--ui-border)"></i>               |      | 边框 |      |
| `--ui-border-hover`         | <i class="color" style="--c: var(--ui-border-hover)"></i>         |      | 边框 | 悬停 |
| `--ui-border-active`        | <i class="color" style="--c: var(--ui-border-active)"></i>        |      | 边框 | 激活 |
| `--ui-border-focus`         | <i class="color" style="--c: var(--ui-border-focus)"></i>         |      | 边框 | 焦点 |
| `--danger`                  | <i class="color" style="--c: var(--danger)"></i>                  | 危险 |      |      |
| `--danger-bg`               | <i class="color" style="--c: var(--danger-bg)"></i>               | 危险 | 背景 |      |
| `--danger-bg-hover`         | <i class="color" style="--c: var(--danger-bg-hover)"></i>         | 危险 | 背景 | 悬停 |
| `--danger-bg-active`        | <i class="color" style="--c: var(--danger-bg-active)"></i>        | 危险 | 背景 | 激活 |
| `--danger-bg-focus`         | <i class="color" style="--c: var(--danger-bg-focus)"></i>         | 危险 | 背景 | 焦点 |
| `--danger-fg`               | <i class="color" style="--c: var(--danger-fg)"></i>               | 危险 | 前景 |      |
| `--danger-fg-hover`         | <i class="color" style="--c: var(--danger-fg-hover)"></i>         | 危险 | 前景 | 悬停 |
| `--danger-fg-active`        | <i class="color" style="--c: var(--danger-fg-active)"></i>        | 危险 | 前景 | 激活 |
| `--danger-fg-focus`         | <i class="color" style="--c: var(--danger-fg-focus)"></i>         | 危险 | 前景 | 焦点 |
| `--danger-border`           | <i class="color" style="--c: var(--danger-border)"></i>           | 危险 | 边框 |      |
| `--danger-border-hover`     | <i class="color" style="--c: var(--danger-border-hover)"></i>     | 危险 | 边框 | 悬停 |
| `--danger-border-active`    | <i class="color" style="--c: var(--danger-border-active)"></i>    | 危险 | 边框 | 激活 |
| `--danger-border-focus`     | <i class="color" style="--c: var(--danger-border-focus)"></i>     | 危险 | 边框 | 焦点 |
| `--critical-bg`             | <i class="color" style="--c: var(--danger-bg)"></i>               | 严重 | 背景 |      |
| `--critical-bg-hover`       | <i class="color" style="--c: var(--danger-bg-hover)"></i>         | 严重 | 背景 | 悬停 |
| `--critical-bg-active`      | <i class="color" style="--c: var(--danger-bg-active)"></i>        | 严重 | 背景 | 激活 |
| `--critical-bg-focus`       | <i class="color" style="--c: var(--danger-bg-focus)"></i>         | 严重 | 背景 | 焦点 |
| `--critical-fg`             | <i class="color" style="--c: var(--danger-fg)"></i>               | 严重 | 前景 |      |
| `--critical-fg-hover`       | <i class="color" style="--c: var(--danger-fg-hover)"></i>         | 严重 | 前景 | 悬停 |
| `--critical-fg-active`      | <i class="color" style="--c: var(--danger-fg-active)"></i>        | 严重 | 前景 | 激活 |
| `--critical-fg-focus`       | <i class="color" style="--c: var(--danger-fg-focus)"></i>         | 严重 | 前景 | 焦点 |
| `--critical-border`         | <i class="color" style="--c: var(--danger-border)"></i>           | 严重 | 边框 |      |
| `--critical-border-hover`   | <i class="color" style="--c: var(--danger-border-hover)"></i>     | 严重 | 边框 | 悬停 |
| `--critical-border-active`  | <i class="color" style="--c: var(--danger-border-active)"></i>    | 严重 | 边框 | 激活 |
| `--critical-border-focus`   | <i class="color" style="--c: var(--danger-border-focus)"></i>     | 严重 | 边框 | 焦点 |
| `--selection`               | <i class="color" style="--c: var(--selection)"></i>               | 主色 | 选区 |      |
| `--primary`                 | <i class="color" style="--c: var(--primary)"></i>                 | 主色 |      |      |
| `--primary-bg`              | <i class="color" style="--c: var(--primary-bg)"></i>              | 主色 | 背景 |      |
| `--primary-bg-hover`        | <i class="color" style="--c: var(--primary-bg-hover)"></i>        | 主色 | 背景 | 悬停 |
| `--primary-bg-active`       | <i class="color" style="--c: var(--primary-bg-active)"></i>       | 主色 | 背景 | 激活 |
| `--primary-bg-focus`        | <i class="color" style="--c: var(--primary-bg-focus)"></i>        | 主色 | 背景 | 焦点 |
| `--primary-fg`              | <i class="color" style="--c: var(--primary-fg)"></i>              | 主色 | 前景 |      |
| `--primary-fg-hover`        | <i class="color" style="--c: var(--primary-fg-hover)"></i>        | 主色 | 前景 | 悬停 |
| `--primary-fg-active`       | <i class="color" style="--c: var(--primary-fg-active)"></i>       | 主色 | 前景 | 激活 |
| `--primary-fg-focus`        | <i class="color" style="--c: var(--primary-fg-focus)"></i>        | 主色 | 前景 | 焦点 |
| `--primary-border`          | <i class="color" style="--c: var(--primary-border)"></i>          | 主色 | 边框 |      |
| `--primary-border-hover`    | <i class="color" style="--c: var(--primary-border-hover)"></i>    | 主色 | 边框 | 悬停 |
| `--primary-border-active`   | <i class="color" style="--c: var(--primary-border-active)"></i>   | 主色 | 边框 | 激活 |
| `--primary-border-focus`    | <i class="color" style="--c: var(--primary-border-focus)"></i>    | 主色 | 边框 | 焦点 |
| `--secondary-bg`            | <i class="color" style="--c: var(--secondary-bg)"></i>            | 次色 | 背景 |      |
| `--secondary-bg-hover`      | <i class="color" style="--c: var(--secondary-bg-hover)"></i>      | 次色 | 背景 | 悬停 |
| `--secondary-bg-active`     | <i class="color" style="--c: var(--secondary-bg-active)"></i>     | 次色 | 背景 | 激活 |
| `--secondary-bg-focus`      | <i class="color" style="--c: var(--secondary-bg-focus)"></i>      | 次色 | 背景 | 焦点 |
| `--secondary-fg`            | <i class="color" style="--c: var(--secondary-fg)"></i>            | 次色 | 前景 |      |
| `--secondary-fg-hover`      | <i class="color" style="--c: var(--secondary-fg-hover)"></i>      | 次色 | 前景 | 悬停 |
| `--secondary-fg-active`     | <i class="color" style="--c: var(--secondary-fg-active)"></i>     | 次色 | 前景 | 激活 |
| `--secondary-fg-focus`      | <i class="color" style="--c: var(--secondary-fg-focus)"></i>      | 次色 | 前景 | 焦点 |
| `--secondary-border`        | <i class="color" style="--c: var(--secondary-border)"></i>        | 次色 | 边框 |      |
| `--secondary-border-hover`  | <i class="color" style="--c: var(--secondary-border-hover)"></i>  | 次色 | 边框 | 悬停 |
| `--secondary-border-active` | <i class="color" style="--c: var(--secondary-border-active)"></i> | 次色 | 边框 | 激活 |
| `--secondary-border-focus`  | <i class="color" style="--c: var(--secondary-border-focus)"></i>  | 次色 | 边框 | 焦点 |

# 类型 `ThemeColor`
该类型由以下类型联合：
- `string`：HEX 格式颜色字符串，为亮/暗色模式设置相同主题色
- [`Color`](../utils/color#类-color)：Color 类，为亮/暗色模式设置相同主题色
- `[light: string | Color, dark: string | Color]`：分别为亮/暗色模式设置不同的主题色
- `{ hue: number, chroma?: number }`：使用色相、色度为亮/暗色模式设置相同主题色

# 函数 `$color`
在指定元素上设置主题色。

# 函数 `applyAccessibleColorTokens`
在指定函数上通过色相、色度设置主题色，并确保符合 WCAG 对比度标准。

# 函数 `getColorTokens`
生成颜色令牌。

# 函数 `getRawLightColorTokens`
生成原始亮色令牌。

# 函数 `getRawDarkColorTokens`
生成原始暗色令牌。
