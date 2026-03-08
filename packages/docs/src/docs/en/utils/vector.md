---
title: Vector Utilities
source: packages/abm-utils/src/vector.ts
---

```ts
import 'abm-utils/vector';
```

# Type `Rect`
Declares a rectangle using coordinates of its four sides.

# Type `Direction4`
Four-directional direction enum.

# Type `Direction8`
Eight-directional direction enum.

# Type `Vec2`
Number tuple, 2D vector.

# Object `Vector2`
2D vector operation function set.

| Function Name       | Description                                                                           |
| ------------------- | ------------------------------------------------------------------------------------- |
| `isVec2`            | Determines if a value is a 2D vector                                                  |
| `toVec2`            | Converts a value to a 2D vector                                                       |
| `zero`              | Creates a zero vector                                                                 |
| `isZero`            | Determines if a vector is a zero vector                                                |
| `radians`           | Calculates the radians of a vector or the radians of the line between two coordinates |
| `length`            | Calculates the length of a vector or the distance between two coordinates              |
| `add`               | Vector addition                                                                       |
| `sub`               | Vector subtraction                                                                    |
| `mul`               | Calculates the product of a vector with a scalar or the cross product with another vector |
| `dot`               | Calculates the product of a vector with a scalar or the dot product with another vector |
| `scale`             | Component-wise multiplication of two vectors                                          |
| `clamp`             | Clamps a target vector within a specified range                                       |
| `scalarProjection`  | Calculates the scalar projection of a vector onto another vector                       |
| `normalize`         | Normalizes a vector, setting its length to 1 while preserving direction; returns zero vector if length is 0 |