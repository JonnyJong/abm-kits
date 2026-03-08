---
title: 样式
source: packages/abm-ui/src/infra/style.ts
---

```ts
import 'abm-ui/infra/style';
```

# 类型 `StyleDeclaration`
样式声明，`object` 类型。

## 键名转换
样式声明中键名处理如下：
- `$` 前缀转换为 `--`
- 大写字母转换为 `-` 加小写

示例：
- `--theme-color` -> `--theme-color`
- `--themeColor` -> `--theme-color`
- `$theme-color` -> `--theme-color`
- `$themeColor` -> `--theme-color`

## 键值转换
样式声明中键值处理如下：
- 若键值为字符串，且前缀为 `$`，则与键名转换相同，并以 `var()` 包裹（`$themeColor` -> `var(--theme-color)`）
- 若键值为数字，默认在结尾追加 `px`
  - 若为以下键名，则在结尾追加 `s`
    - `animationDelay`
    - `animationDuration`
    - `transitionDelay`
    - `transitionDuration`
  - 若为以下键名，则在结尾追加 `deg`
    - `imageOrientation`
    - `rotate`
  - 若为以下键名，则在结尾追加 `%`
    - `fontStretch`
    - `wordSpacing`
  - 若为以下键名，则不追加
    - `aspectRatio`
    - `animationIterationCount`
    - `columnCount`
    - `fillOpacity`
    - `flexGrow`
    - `flexShrink`
    - `floodOpacity`
    - `fontSizeAdjust`
    - `fontWeight`
    - `hyphenateLimitChars`
    - `initialLetter`
    - `maskBorderSlice`
    - `maskBorderWidth`
    - `mathDepth`
    - `opacity`
    - `order`
    - `orphans`
    - `scale`
    - `stopOpacity`
    - `strokeMiterlimit`
    - `strokeOpacity`
    - `zIndex`
    - `zoom`
- 若为数组，则每个值单独处理，优先尝试 ` `（空格）拼接，后尝试 `, `（逗号）拼接

# 函数 `$style`
应用样式到指定元素。

# 函数 `css`
CSS 样式表生成标签模板函数，该模版将在样式前添加 `*{box-sizing:border-box;}` 基础样式。

# 函数 `rawCss`
CSS 样式表生成标签模板函数，该模版不会添加任何基础样式。

# 函数 `compileCSS`
从字符串创建 [`CSSStyleSheet`](https://developer.mozilla.org/docs/Web/API/CSSStyleSheet)。
