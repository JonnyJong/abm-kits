---
title: Color
source: packages/abm-utils/src/color.ts
---

```ts
import 'abm-utils/color';
```

# Type `RGB`
Numeric triplet type, channel names and ranges are as follows:
- R: 0~255
- G: 0~255
- B: 0~255

# Type `RGBA`
Numeric quadruplet type, channel names and ranges are as follows:
- R: 0~255
- G: 0~255
- B: 0~255
- A: 0~255

# Type `HSL`
Numeric triplet type, channel names and ranges are as follows:
- H: 0~360
- S: 0~1
- L: 0~1

# Type `HSLA`
Numeric quadruplet type, channel names and ranges are as follows:
- H: 0~360
- S: 0~1
- L: 0~1
- A: 0~1

# Type `Oklch`
Numeric triplet type, channel names and ranges are as follows:
- L: 0~1
- C: 0~Infinity
- H: 0~360

# Type `OklchAlpha`
Numeric quadruplet type, channel names and ranges are as follows:
- L: 0~1
- C: 0~Infinity
- H: 0~360
- A: 0~1

# Function `rgb2hsl`
Convert RGB value to HSL value.

# Function `hsl2rgb`
Convert HSL value to RGB value.

# Function `rgb2oklch`
Convert RGB value to Oklch value.

# Function `oklch2rgb`
Convert Oklch value to RGB value.

# Class `Color`

## Methods

### Set/Get Values
All the following methods get values when no parameters are passed, and set values when parameters are passed.
| Method Name  | Description                              |
| ------------ | ---------------------------------------- |
| `rgb`        | Set/get RGB value                        |
| `rgba`       | Set/get RGBA value                       |
| `hex`        | Set/get hexadecimal value                |
| `hexa`       | Set/get hexadecimal value (with alpha)   |
| `hsl`        | Set/get HSL value                        |
| `hsla`       | Set/get HSLA value                       |
| `oklch`      | Set/get Oklch value                      |
| `oklchAlpha` | Set/get OklchAlpha value                 |
| `alpha`      | Set/get alpha value                      |
| `alphaByte`  | Set/get alpha byte value                 |

### `clone`
Clone color instance.

### `invert`
Create a color instance with the opposite color value to the current one.

### `toString`
Convert color instance to HEX format string.

## Static Methods

### Create Color Instance
All the following methods are static methods used to create color instances.
| Method Name  | Description                                   |
| ------------ | --------------------------------------------- |
| `hex`        | Create color instance from hexadecimal value   |
| `hexa`       | Create color instance from hexadecimal value (with alpha) |
| `rgb`        | Create color instance from RGB value          |
| `rgba`       | Create color instance from RGBA value         |
| `hsl`        | Create color instance from HSL value          |
| `hsla`       | Create color instance from HSLA value         |
| `oklch`      | Create color instance from Oklch value        |
| `oklchAlpha` | Create color instance from OklchAlpha value   |

### `parseHEX`
Convert a string that may be in HEX format to RGBA value.

The following are conversion and output results for various inputs:
- Complete HEX format:
  - `abc` -> `#abc` -> `#aabbcc` -> `[170, 187, 204, 255]`
  - `abcd` -> `#abcd` -> `#aabbccdd` -> `[170, 187, 204, 221]`
- Incomplete HEX format:
  - `a` -> `aaa` -> `[170, 170, 170, 255]`
  - `ab` -> `aba` -> `[170, 187, 170, 255]`
  - `abcde` -> `#abcdea` -> `[171, 205, 234, 255]`
  - `abcdef3` -> `#abcdef33` -> `[171, 205, 239, 51]`
- Overlong HEX format:
  - `0123456789abcdef` -> `#01234567` -> `[1, 35, 69, 103]`
- Unsupported HEX format:
  - `` -> `null`
  - `#` -> `null`