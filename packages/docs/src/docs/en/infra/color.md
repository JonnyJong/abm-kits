---
title: Color
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

# Color Tokens

| CSS Variable                | Color                                                              | Level | Area   | State  |
| --------------------------- | ----------------------------------------------------------------- | ----- | ------ | ------ |
| `--bg`                      | <i class="color" style="--c: var(--bg)"></i>                      |       | Background |        |
| `--fg`                      | <i class="color" style="--c: var(--fg)"></i>                      |       | Foreground |        |
| `--fg-dim`                  | <i class="color" style="--c: var(--fg-dim)"></i>                  |       | Foreground | Dim    |
| `--surface`                 | <i class="color" style="--c: var(--surface)"></i>                 |       | Background |        |
| `--surface-border`          | <i class="color" style="--c: var(--surface-border)"></i>          |       | Border     |        |
| `--ui-bg`                   | <i class="color" style="--c: var(--ui-bg)"></i>                   |       | Background |        |
| `--ui-bg-hover`             | <i class="color" style="--c: var(--ui-bg-hover)"></i>             |       | Background | Hover  |
| `--ui-bg-active`            | <i class="color" style="--c: var(--ui-bg-active)"></i>            |       | Background | Active |
| `--ui-bg-focus`             | <i class="color" style="--c: var(--ui-bg-focus)"></i>             |       | Background | Focus  |
| `--ui-border`               | <i class="color" style="--c: var(--ui-border)"></i>               |       | Border     |        |
| `--ui-border-hover`         | <i class="color" style="--c: var(--ui-border-hover)"></i>         |       | Border     | Hover  |
| `--ui-border-active`        | <i class="color" style="--c: var(--ui-border-active)"></i>        |       | Border     | Active |
| `--ui-border-focus`         | <i class="color" style="--c: var(--ui-border-focus)"></i>         |       | Border     | Focus  |
| `--danger`                  | <i class="color" style="--c: var(--danger)"></i>                  | Danger |        |        |
| `--danger-bg`               | <i class="color" style="--c: var(--danger-bg)"></i>               | Danger | Background |        |
| `--danger-bg-hover`         | <i class="color" style="--c: var(--danger-bg-hover)"></i>         | Danger | Background | Hover  |
| `--danger-bg-active`        | <i class="color" style="--c: var(--danger-bg-active)"></i>        | Danger | Background | Active |
| `--danger-bg-focus`         | <i class="color" style="--c: var(--danger-bg-focus)"></i>         | Danger | Background | Focus  |
| `--danger-fg`               | <i class="color" style="--c: var(--danger-fg)"></i>               | Danger | Foreground |        |
| `--danger-fg-hover`         | <i class="color" style="--c: var(--danger-fg-hover)"></i>         | Danger | Foreground | Hover  |
| `--danger-fg-active`        | <i class="color" style="--c: var(--danger-fg-active)"></i>        | Danger | Foreground | Active |
| `--danger-fg-focus`         | <i class="color" style="--c: var(--danger-fg-focus)"></i>         | Danger | Foreground | Focus  |
| `--danger-border`           | <i class="color" style="--c: var(--danger-border)"></i>           | Danger | Border     |        |
| `--danger-border-hover`     | <i class="color" style="--c: var(--danger-border-hover)"></i>     | Danger | Border     | Hover  |
| `--danger-border-active`    | <i class="color" style="--c: var(--danger-border-active)"></i>    | Danger | Border     | Active |
| `--danger-border-focus`     | <i class="color" style="--c: var(--danger-border-focus)"></i>     | Danger | Border     | Focus  |
| `--critical-bg`             | <i class="color" style="--c: var(--danger-bg)"></i>               | Critical | Background |        |
| `--critical-bg-hover`       | <i class="color" style="--c: var(--danger-bg-hover)"></i>         | Critical | Background | Hover  |
| `--critical-bg-active`      | <i class="color" style="--c: var(--danger-bg-active)"></i>        | Critical | Background | Active |
| `--critical-bg-focus`       | <i class="color" style="--c: var(--danger-bg-focus)"></i>         | Critical | Background | Focus  |
| `--critical-fg`             | <i class="color" style="--c: var(--danger-fg)"></i>               | Critical | Foreground |        |
| `--critical-fg-hover`       | <i class="color" style="--c: var(--danger-fg-hover)"></i>         | Critical | Foreground | Hover  |
| `--critical-fg-active`      | <i class="color" style="--c: var(--danger-fg-active)"></i>        | Critical | Foreground | Active |
| `--critical-fg-focus`       | <i class="color" style="--c: var(--danger-fg-focus)"></i>         | Critical | Foreground | Focus  |
| `--critical-border`         | <i class="color" style="--c: var(--danger-border)"></i>           | Critical | Border     |        |
| `--critical-border-hover`   | <i class="color" style="--c: var(--danger-border-hover)"></i>     | Critical | Border     | Hover  |
| `--critical-border-active`  | <i class="color" style="--c: var(--danger-border-active)"></i>    | Critical | Border     | Active |
| `--critical-border-focus`   | <i class="color" style="--c: var(--danger-border-focus)"></i>     | Critical | Border     | Focus  |
| `--selection`               | <i class="color" style="--c: var(--selection)"></i>               | Primary | Selection  |        |
| `--primary`                 | <i class="color" style="--c: var(--primary)"></i>                 | Primary |            |        |
| `--primary-bg`              | <i class="color" style="--c: var(--primary-bg)"></i>              | Primary | Background |        |
| `--primary-bg-hover`        | <i class="color" style="--c: var(--primary-bg-hover)"></i>        | Primary | Background | Hover  |
| `--primary-bg-active`       | <i class="color" style="--c: var(--primary-bg-active)"></i>       | Primary | Background | Active |
| `--primary-bg-focus`        | <i class="color" style="--c: var(--primary-bg-focus)"></i>        | Primary | Background | Focus  |
| `--primary-fg`              | <i class="color" style="--c: var(--primary-fg)"></i>              | Primary | Foreground |        |
| `--primary-fg-hover`        | <i class="color" style="--c: var(--primary-fg-hover)"></i>        | Primary | Foreground | Hover  |
| `--primary-fg-active`       | <i class="color" style="--c: var(--primary-fg-active)"></i>       | Primary | Foreground | Active |
| `--primary-fg-focus`        | <i class="color" style="--c: var(--primary-fg-focus)"></i>        | Primary | Foreground | Focus  |
| `--primary-border`          | <i class="color" style="--c: var(--primary-border)"></i>          | Primary | Border     |        |
| `--primary-border-hover`    | <i class="color" style="--c: var(--primary-border-hover)"></i>    | Primary | Border     | Hover  |
| `--primary-border-active`   | <i class="color" style="--c: var(--primary-border-active)"></i>   | Primary | Border     | Active |
| `--primary-border-focus`    | <i class="color" style="--c: var(--primary-border-focus)"></i>    | Primary | Border     | Focus  |
| `--secondary-bg`            | <i class="color" style="--c: var(--secondary-bg)"></i>            | Secondary | Background |        |
| `--secondary-bg-hover`      | <i class="color" style="--c: var(--secondary-bg-hover)"></i>      | Secondary | Background | Hover  |
| `--secondary-bg-active`     | <i class="color" style="--c: var(--secondary-bg-active)"></i>     | Secondary | Background | Active |
| `--secondary-bg-focus`      | <i class="color" style="--c: var(--secondary-bg-focus)"></i>      | Secondary | Background | Focus  |
| `--secondary-fg`            | <i class="color" style="--c: var(--secondary-fg)"></i>            | Secondary | Foreground |        |
| `--secondary-fg-hover`      | <i class="color" style="--c: var(--secondary-fg-hover)"></i>      | Secondary | Foreground | Hover  |
| `--secondary-fg-active`     | <i class="color" style="--c: var(--secondary-fg-active)"></i>     | Secondary | Foreground | Active |
| `--secondary-fg-focus`      | <i class="color" style="--c: var(--secondary-fg-focus)"></i>      | Secondary | Foreground | Focus  |
| `--secondary-border`        | <i class="color" style="--c: var(--secondary-border)"></i>        | Secondary | Border     |        |
| `--secondary-border-hover`  | <i class="color" style="--c: var(--secondary-border-hover)"></i>  | Secondary | Border     | Hover  |
| `--secondary-border-active` | <i class="color" style="--c: var(--secondary-border-active)"></i> | Secondary | Border     | Active |
| `--secondary-border-focus`  | <i class="color" style="--c: var(--secondary-border-focus)"></i>  | Secondary | Border     | Focus  |

# Type `ThemeColor`
This type is a union of the following types:
- `string`: HEX format color string, set the same theme color for light/dark mode
- [`Color`](../utils/color#class-color): Color class, set the same theme color for light/dark mode
- `[light: string | Color, dark: string | Color]`: Set different theme colors for light/dark mode respectively
- `{ hue: number, chroma?: number }`: Use hue and chroma to set the same theme color for light/dark mode

# Function `$color`
Set theme color on the specified element.

# Function `applyAccessibleColorTokens`
Set theme color on the specified function by hue and chroma, and ensure it meets WCAG contrast standards.

# Function `getColorTokens`
Generate color tokens.

# Function `getRawLightColorTokens`
Generate raw light color tokens.

# Function `getRawDarkColorTokens`
Generate raw dark color tokens.