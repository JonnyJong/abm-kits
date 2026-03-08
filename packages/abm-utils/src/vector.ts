export type Rect = {
	top: number;
	right: number;
	bottom: number;
	left: number;
};
export type Direction4 = 'up' | 'right' | 'down' | 'left';
export type Direction8 =
	| Direction4
	| 'right-up'
	| 'right-down'
	| 'left-down'
	| 'left-up';
export type Vec2 = [x: number, y: number];

/** 检查是否为 {@link Vec2} 类型 */
function isVec2(input: unknown): input is Vec2 {
	if (!Array.isArray(input)) return false;
	if (input.length < 2) return false;
	if (typeof input[0] !== 'number') return false;
	if (typeof input[1] !== 'number') return false;
	return true;
}

/** 转换为 {@link Vec2} 类型 */
function toVec2(input: Vec2 | number): Vec2 {
	if (typeof input === 'number') return [input, input];
	return input.slice(0, 2) as Vec2;
}

/** 创建零向量 */
function zero(): Vec2 {
	return [0, 0];
}

/** 是否为零向量 */
function isZero(vec: Vec2): boolean;
function isZero([x, y]: Vec2): boolean {
	return Math.abs(x) < Number.EPSILON && Math.abs(y) < Number.EPSILON;
}

/** 计算向量弧度 */
function radians(vec: Vec2): number;
/** 计算两坐标连线弧度 */
function radians(a: Vec2, b: Vec2): number;
function radians([x1, y1]: Vec2, vec?: Vec2): number {
	if (vec) {
		x1 -= vec[0];
		y1 -= vec[1];
	}
	return Math.atan2(y1, x1);
}

/** 计算向量长度 */
function length(vec: Vec2): number;
/** 计算两坐标连线长度 */
function length(a: Vec2, b: Vec2): number;
function length([x1, y1]: Vec2, vec2?: Vec2): number {
	if (vec2) {
		x1 -= vec2[0];
		y1 -= vec2[1];
	}
	return Math.sqrt(x1 ** 2 + y1 ** 2);
}

/** 相加 */
function add(a: Vec2, b: Vec2): Vec2;
function add([x1, y1]: Vec2, [x2, y2]: Vec2): Vec2 {
	return [x1 + x2, y1 + y2];
}

/** 相减 */
function sub(a: Vec2, b: Vec2): Vec2;
function sub([x1, y1]: Vec2, [x2, y2]: Vec2): Vec2 {
	return [x1 - x2, y1 - y2];
}

/** 向量乘以数值 */
function mul(vec: Vec2, num: number): Vec2;
/** 向量与向量叉乘（向量积） */
function mul(a: Vec2, b: Vec2): number;
function mul([x, y]: Vec2, n: number | Vec2): Vec2 | number {
	if (typeof n === 'number') return [x * n, y * n];
	return x * n[1] - n[0] * y;
}

/** 向量乘以数值 */
function dot(vec: Vec2, num: number): Vec2;
/** 向量与向量点乘（内积、数量积） */
function dot(a: Vec2, b: Vec2): number;
function dot([x, y]: Vec2, n: number | Vec2): Vec2 | number {
	if (typeof n === 'number') return [x * n, y * n];
	return x * n[0] + y * n[1];
}

/** 逐分量乘 */
function scale(a: Vec2, b: Vec2): Vec2;
function scale([x1, y1]: Vec2, [x2, y2]: Vec2): Vec2 {
	return [x1 * x2, y1 * y2];
}

/** 将向量限制在范围内 */
function clamp(from: Vec2, target: Vec2, to: Vec2): Vec2;
function clamp([x1, y1]: Vec2, [x, y]: Vec2, [x2, y2]: Vec2): Vec2 {
	if (x1 < x2) [x1, x2] = [x2, x1];
	if (y1 < y2) [y1, y2] = [y2, y1];
	return [Math.min(x1, Math.max(x, x2)), Math.min(y1, Math.max(y, y2))];
}

/** 计算向量在 base 上的投影 */
function scalarProjection(base: Vec2, vec: Vec2): number {
	const len = length(base);
	const d = dot(vec, base);
	return d / len;
}

/**
 * 归一化
 * @description
 * 返回方向相同，长度为 1 的新向量；
 * 若为 0 向量，则返回零向量
 */
function normalize(vec: Vec2): Vec2 {
	const len = length(vec);
	if (len < Number.EPSILON) return [0, 0];
	return [vec[0] / len, vec[1] / len];
}

/** 二维向量 */
export const Vector2 = {
	/** 检查是否为 {@link Vec2} 类型 */
	isVec2,
	/** 转换为 {@link Vec2} 类型 */
	toVec2,
	/** 创建零向量 */
	zero,
	/** 是否为零向量 */
	isZero,
	/** 计算弧度 */
	radians,
	/** 计算长度 */
	length,
	/** 相加 */
	add,
	/** 相减 */
	sub,
	/** 叉乘 */
	mul,
	/** 点乘 */
	dot,
	/** 逐分量乘 */
	scale,
	/** 将向量限制在范围内 */
	clamp,
	/** 计算向量在 base 上的投影 */
	scalarProjection,
	/**
	 * 归一化
	 * @description
	 * 返回方向相同，长度为 1 的新向量；
	 * 若为 0 向量，则返回零向量
	 */
	normalize,
} as const;
