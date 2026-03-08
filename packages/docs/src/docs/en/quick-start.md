---
title: Quick Start
order: -1
---

# Installation

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

# Import

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

# Configuration
:::Global Import
```ts
import { setup } from 'abm-ui';
```
:::On-demand Import
```ts
import { setup } from 'abm-ui/setup';
```
:::

```ts
setup({
  /* Configuration parameters */
}).then(() => {
  /* After DOMContentLoaded event */
})
```

Configuration parameters:
- [`color`](./infra/color#type-themecolor): Theme color, default `['#222',  '#eee']`
- [`localeLoader`](./utils/locale#property-loader): Translation dictionary loader
- `locales`: Language list, default `navigator.languages`
- `icons`: Icon package
- [`toast`](./widget/toast#static-properties): Toast notification settings
  - [`verticalAnchor`](./widget/toast#verticalanchor): Vertical anchor
  - [`horizontalAnchor`](./widget/toast#horizontalanchor): Horizontal anchor
  - [`horizontalOffset`](./widget/toast#horizontaloffset): Horizontal offset
  - [`verticalOffset`](./widget/toast#verticaloffset): Vertical offset
- `safeRect`: Safe area borders
  - `top`: Top
  - `right`: Right
  - `bottom`: Bottom
  - `left`: Left

## Localization
```ts
import { LOCALES } from 'abm-ui';
import type { LocaleDict, LocalePackage, LocaleVariant } from 'abm-utils';

declare module 'abm-utils' {
	interface LocaleRegistry extends LocalePackage<typeof ZH> {}
}

const ZH = {
  ...LOCALES.ZH,
  appName: 'Application Name',
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

## Icons
This UI library does not include built-in icon packages. You need to manually configure icon packages. ABM UI supports SVG icons by default.

The following icon packages are supported. You can also use/mix other icon packages.
| Package Name                                                               | Official Website                                                                                                 |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| [`@fluentui/svg-icons`](https://www.npmjs.com/package/@fluentui/svg-icons) | [https://storybooks.fluentui.dev/react/?path=/docs/icons-catalog--docs](https://storybooks.fluentui.dev/react/?path=/docs/icons-catalog--docs) |
| [`lucide-static`](https://www.npmjs.com/package/lucide-static)             | [https://lucide.dev/icons/](https://lucide.dev/icons/)                                                           |
| [`heroicons`](https://www.npmjs.com/package/heroicons)                     | [https://heroicons.com](https://heroicons.com)                                                                   |
| [`feather-icons`](https://www.npmjs.com/package/feather-icons)             | [https://feathericons.com](https://feathericons.com)                                                             |
| [`remixicon`](https://www.npmjs.com/package/remixicon)                     | [https://remixicon.com](https://remixicon.com)                                                                   |
| [`bootstrap-icons`](https://www.npmjs.com/package/bootstrap-icons)         | [https://icons.bootcss.com](https://icons.bootcss.com)                                                           |
| Material Icons                                                             | [https://fonts.google.com/icons](https://fonts.google.com/icons)                                                 |

+++`@fluentui/svg-icons` Preset Icon Recommendation
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
  assetsInclude: ['**/*.svg'], // Ensure SVG is recognized as assets

  // Method 1: Import with ?raw suffix (recommended, no additional configuration needed)
  // In component: import icon from './icon.svg?raw'

  // Method 2: Globally import SVG as string by default (via custom plugin)
  plugins: [
    {
      name: 'svg-as-string',
      transform(code, id) {
        if (id.endsWith('.svg')) {
          // Convert SVG file content to module with default export string
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
import string from 'rollup-plugin-string' // Need to install: npm i -D rollup-plugin-string

export default defineConfig({
  plugins: [
    string({
      include: '**/*.svg', // Import matching SVG files as strings
    }),
  ],
})
```
:::esbuild
```ts
import esbuild from 'esbuild';

esbuild.build({
  loader: { '.svg': 'text' }, // Import SVG as string
});
```
:::