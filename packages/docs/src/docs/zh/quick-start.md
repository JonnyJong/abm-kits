---
title: 快速开始
order: -1
---

# 安装

:::NPM
```sh
npm install --save abm-ui
```
:::PNPM
```sh
pnpm add abm-ui
```
:::YARN
```sh
yarn add abm-ui
```
:::

# 导入

## CSS
```css
@import 'abm-ui/style.css';
```

```tsx
import 'abm-ui/style.css';
```

```html
<link rel="stylesheet" href="node_modules/abm-ui/style.css">
```

# 配置
:::全局导入
```ts
import { setup } from 'abm-ui';
```
:::按需导入
```ts
import { setup } from 'abm-ui/setup';
```
:::

```ts
setup({
  /* 配置参数 */
}).then(() => {
  /* DOMContentLoaded 事件触发后 */
})
```

配置参数：
- [`color`](./infra/color#类型-themecolor)：主题色，默认 `['#222',  '#eee']`
- [`localeLoader`](./utils/locale#属性-loader)：翻译词典加载器
- `locales`：语言列表，默认 `navigator.languages`
- `icons`：图标包
- [`toast`](./widget/toast#静态属性)：吐司通知设置
  - [`verticalAnchor`](./widget/toast#verticalanchor)：垂直锚点
  - [`horizontalAnchor`](./widget/toast#horizontalanchor)：水平锚点
  - [`horizontalOffset`](./widget/toast#horizontaloffset)：水平偏移
  - [`verticalOffset`](./widget/toast#verticaloffset)：垂直偏移
- `safeRect`：安全区边框
  - `top`：顶部
  - `right`：靠右
  - `bottom`：底部
  - `left`：靠左

## 本地化
```ts
import { LOCALES } from 'abm-ui';
import type { LocaleDict, LocalePackage, LocaleVariant } from 'abm-utils';

declare module 'abm-utils' {
	interface LocaleRegistry extends LocalePackage<typeof ZH> {}
}

const ZH = {
  ...LOCALES.ZH,
  appName: '应用名',
  // ...
} as const satisfies LocaleDict;

const EN: LocaleVariant<typeof ZH> = {
  ...LOCALES.EN,
  appName: 'App Name',
  // ...
};

setup({
  localeLoader: (locale) => {
    if (locale === 'zh') return ZH;
    if (locale === 'en') return EN;
    return null;
  },
});
```

## 图标
该 UI 库未内置图标包，需手动配置图标包，ABM UI 默认支持 SVG 图标。

以下是支持的图标包，也支持搭配/混搭其他图标包。
| 包名                                                                       | 官网                                                                                                                                           |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| [`@fluentui/svg-icons`](https://www.npmjs.com/package/@fluentui/svg-icons) | [https://storybooks.fluentui.dev/react/?path=/docs/icons-catalog--docs](https://storybooks.fluentui.dev/react/?path=/docs/icons-catalog--docs) |
| [`lucide-static`](https://www.npmjs.com/package/lucide-static)             | [https://lucide.dev/icons/](https://lucide.dev/icons/)                                                                                         |
| [`heroicons`](https://www.npmjs.com/package/heroicons)                     | [https://heroicons.com](https://heroicons.com)                                                                                                 |
| [`feather-icons`](https://www.npmjs.com/package/feather-icons)             | [https://feathericons.com](https://feathericons.com)                                                                                           |
| [`remixicon`](https://www.npmjs.com/package/remixicon)                     | [https://remixicon.com](https://remixicon.com)                                                                                                 |
| [`bootstrap-icons`](https://www.npmjs.com/package/bootstrap-icons)         | [https://icons.bootcss.com](https://icons.bootcss.com)                                                                                         |
| Material Icons                                                             | [https://fonts.google.com/icons](https://fonts.google.com/icons)                                                                               |

+++`@fluentui/svg-icons` 预设图标推荐
```ts
import type { IconPackageDefine, PresetIcons } from 'abm-ui';
import Add from '@fluentui/svg-icons/icons/add_20_regular.svg';
import ArrowDown from '@fluentui/svg-icons/icons/arrow_down_20_regular.svg';
import ArrowEnterLeft from '@fluentui/svg-icons/icons/arrow_enter_left_20_regular.svg';
import ArrowLeft from '@fluentui/svg-icons/icons/arrow_left_20_regular.svg';
import ArrowRight from '@fluentui/svg-icons/icons/arrow_right_20_regular.svg';
import ArrowUp from '@fluentui/svg-icons/icons/arrow_up_20_regular.svg';
import Backspace from '@fluentui/svg-icons/icons/backspace_20_regular.svg';
import Checkmark from '@fluentui/svg-icons/icons/checkmark_20_regular.svg';
import CheckmarkCircle from '@fluentui/svg-icons/icons/checkmark_circle_20_regular.svg';
import ChevronDown from '@fluentui/svg-icons/icons/chevron_down_20_regular.svg';
import ChevronLeft from '@fluentui/svg-icons/icons/chevron_left_20_regular.svg';
import ChevronRight from '@fluentui/svg-icons/icons/chevron_right_20_regular.svg';
import ChevronUpDown from '@fluentui/svg-icons/icons/chevron_up_down_20_regular.svg';
import Dismiss from '@fluentui/svg-icons/icons/dismiss_20_regular.svg';
import Document from '@fluentui/svg-icons/icons/document_20_regular.svg';
import ErrorCircle from '@fluentui/svg-icons/icons/error_circle_20_regular.svg';
import Home from '@fluentui/svg-icons/icons/home_20_regular.svg';
import KeyboardShift from '@fluentui/svg-icons/icons/keyboard_shift_20_regular.svg';
import KeyboardTab from '@fluentui/svg-icons/icons/keyboard_tab_20_regular.svg';
import SlashForward from '@fluentui/svg-icons/icons/slash_forward_20_regular.svg';
import Spacebar from '@fluentui/svg-icons/icons/spacebar_20_regular.svg';
import Subtract from '@fluentui/svg-icons/icons/subtract_20_regular.svg';
import TriangleLeft from '@fluentui/svg-icons/icons/triangle_left_20_regular.svg';
import TriangleRight from '@fluentui/svg-icons/icons/triangle_right_20_regular.svg';
import Warning from '@fluentui/svg-icons/icons/warning_20_regular.svg';

const PRESET_ICONS: PresetIcons = {
	selectExpand: ChevronUpDown,
	increase: Add,
	decrease: Subtract,
	success: CheckmarkCircle,
	warn: Warning,
	error: ErrorCircle,
	increasing: ChevronDown,
	file: Document,
	removeFile: Dismiss,
	keyInvalid: ErrorCircle,
	keyTab: KeyboardTab,
	keyEnter: ArrowEnterLeft,
	keyNumpadAdd: Add,
	keyNumpadSubtract: Subtract,
	keyNumpadMultiply: Dismiss,
	keyNumpadDivide: SlashForward,
	keyArrowUp: ArrowUp,
	keyArrowRight: ArrowRight,
	keyArrowDown: ArrowDown,
	keyArrowLeft: ArrowLeft,
	keySpace: Spacebar,
	keyHome: Home,
	keyBackspace: Backspace,
	keyShift: KeyboardShift,
	keyBack: TriangleLeft,
	keyStart: TriangleRight,
	menuEnter: ChevronRight,
	menuBack: ChevronLeft,
	menuCheckmark: Checkmark,
	dialogClose: Dismiss,
};
```
+++

:::vite
```ts vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  assetsInclude: ['**/*.svg'], // 确保 SVG 被识别为资产

  // 方式一：使用 ?raw 后缀导入（推荐，无需额外配置）
  // 在组件中：import icon from './icon.svg?raw'

  // 方式二：全局将 SVG 默认导入为字符串（通过自定义插件）
  plugins: [
    {
      name: 'svg-as-string',
      transform(code, id) {
        if (id.endsWith('.svg')) {
          // 将 SVG 文件内容转换为默认导出字符串的模块
          return {
            code: `export default ${JSON.stringify(code)};`,
            map: null,
          }
        }
      },
    },
  ],
})
```
:::rollup
```js rollup.config.js
import { defineConfig } from 'rollup'
import string from 'rollup-plugin-string' // 需要安装: npm i -D rollup-plugin-string

export default defineConfig({
  plugins: [
    string({
      include: '**/*.svg', // 将匹配的 SVG 文件作为字符串导入
    }),
  ],
})
```
:::esbuild
```ts
import esbuild from 'esbuild';

esbuild.build({
  loader: { '.svg': 'text' }, // 将 SVG 导入为字符串
});
```
:::
