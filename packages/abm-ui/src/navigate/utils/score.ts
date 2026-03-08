import type { RectNode } from '../types';

/** 弧度权重 */
const RADIANS_WEIGHT = 2000; // 弧度数量级为 1
/** 距离权重 */
const DISTANCE_WEIGHT = 10; // 距离数量级通常为 1000
/** 大小权重 */
const SIZE_WEIGHT = 0.01; // 大小数量级通常为 100000
/** 弧度阈值 */
const RADIANS_THRESHOLD = (20 / 180) * Math.PI;
/** 最大弧度阈值溢出 */
const MAX_RADIANS_EXCESS = Math.PI / 2 - RADIANS_THRESHOLD;
/** 弧度因子 */
const RADIANS_EXP = 1.5;
/** 距离因子 */
const DISTANCE_EXP = 1;
/** 大小因子 */
const SIZE_EXP = 1;

/** 带符号幂运算 */
function signedPow(x: number, y: number): number {
	return Math.sign(x) * Math.abs(x) ** y;
}

/**
 * 计算目标得分
 * @param target 目标元素
 * @returns 分数越低越好
 */
export function computeScore(target: RectNode): number {
	const { radians, distance, width, height } = target;
	const size = width * height;
	// 弧度
	let radiansScore: number;
	if (radians <= RADIANS_THRESHOLD) {
		radiansScore = Math.sqrt(radians / RADIANS_THRESHOLD);
	} else {
		const excess = radians - RADIANS_THRESHOLD;
		radiansScore = 1 + (excess / MAX_RADIANS_EXCESS) ** RADIANS_EXP;
	}
	// 距离
	const distanceScore = signedPow(distance, DISTANCE_EXP);
	// 目标大小
	const sizeScore = Math.max(size, 10) ** SIZE_EXP;

	// 结果
	return (
		radiansScore * RADIANS_WEIGHT +
		distanceScore * DISTANCE_WEIGHT +
		sizeScore * SIZE_WEIGHT
	);
}
