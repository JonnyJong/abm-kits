import { wrapInRange } from './math';

export type Rect = {
	top: number;
	right: number;
	bottom: number;
	left: number;
};
export type Direction4 = 'up' | 'right' | 'down' | 'left';
export type Vec2 = [x: number, y: number];

function toVec2(vec2: Vec2 | Vector2) {
	let x: number;
	let y: number;
	if (vec2 instanceof Vector2) {
		x = vec2.x;
		y = vec2.y;
	} else {
		x = vec2[0];
		y = vec2[1];
	}
	return [x, y];
}

export class Vector2 {
	#x = 0;
	#y = 0;
	constructor(vector2: Vec2);
	constructor(x: number, y: number);
	constructor();
	constructor(arg0?: [number, number] | number, arg1?: number) {
		if (Array.isArray(arg0)) {
			this.vec = arg0;
		} else if (typeof arg1 === 'number') {
			this.vec = [arg0!, arg1];
		}
	}
	get vec(): Vec2 {
		return [this.#x, this.#y];
	}
	set vec(value: Vec2) {
		if (!Array.isArray(value)) return;
		this.x = value[0];
		this.y = value[1];
	}
	get x() {
		return this.#x;
	}
	set x(value: number) {
		if (typeof value !== 'number' || !Number.isFinite(value)) return;
		this.#x = value;
	}
	get y() {
		return this.#y;
	}
	set y(value: number) {
		if (typeof value !== 'number' || !Number.isFinite(value)) return;
		this.#y = value;
	}
	/**
	 * 角度（弧度制）
	 */
	get radians(): number {
		return Math.atan2(this.#y, this.#x);
	}
	set radians(value: number) {
		if (typeof value !== 'number' || !Number.isFinite(value)) return;
		value = wrapInRange(value, 2 * Math.PI);
		const length = this.length;
		this.#y = length * Math.sin(value);
		this.#x = length * Math.cos(value);
	}
	/**
	 * 角度（度数制）
	 */
	get angle(): number {
		return (this.radians * 180) / Math.PI;
	}
	set angle(value: number) {
		if (typeof value !== 'number' || !Number.isFinite(value)) return;
		if (this.length === 0) return;
		this.radians = (value * Math.PI) / 180;
	}
	/**
	 * 向量长度
	 */
	get length(): number {
		return Math.sqrt(this.#x ** 2 + this.#y ** 2);
	}
	set length(value: number) {
		if (typeof value !== 'number' || !Number.isFinite(value)) return;
		const angle = this.radians;
		this.#x = value * Math.cos(angle);
		this.#y = value * Math.sin(angle);
	}
	/**
	 * 将向量转化为单位向量
	 */
	normalization() {
		this.length = 1;
	}
	/**
	 * 方向（上下左右）
	 */
	get direction(): Direction4 | undefined {
		// biome-ignore lint/nursery/noUselessUndefined: Necessary return value
		if (this.length === 0) return undefined;
		const deg = this.angle;

		if (deg >= -45 && deg < 45) {
			return 'right';
		}
		if (deg >= 45 && deg < 135) {
			return 'down';
		}
		if (deg >= 135 || deg < -135) {
			return 'left';
		}
		return 'up';
	}
	equals(vec: Vector2 | Vec2): boolean {
		return Vector2.equals(this, vec);
	}
	static equals(a: Vector2 | Vec2, b: Vector2 | Vec2): boolean {
		const [ax, ay] = toVec2(a);
		const [bx, by] = toVec2(b);
		return ax === bx && ay === by;
	}
	static add(a: Vec2, b: Vec2): Vec2;
	static add(a: Vector2, b: Vector2): Vector2;
	static add(a: Vec2, b: Vector2): Vector2;
	static add(a: Vector2, b: Vec2): Vector2;
	static add(a: Vec2 | Vector2, b: Vec2 | Vector2): Vec2 | Vector2 {
		const [ax, ay] = toVec2(a);
		const [bx, by] = toVec2(b);
		const c: Vec2 = [ax + bx, ay + by];
		if (a instanceof Vector2 || b instanceof Vector2) return new Vector2(c);
		return c;
	}
	static subtract(a: Vec2, b: Vec2): Vec2;
	static subtract(a: Vector2, b: Vector2): Vector2;
	static subtract(a: Vec2, b: Vector2): Vector2;
	static subtract(a: Vector2, b: Vec2): Vector2;
	static subtract(a: Vec2 | Vector2, b: Vec2 | Vector2): Vec2 | Vector2 {
		const [ax, ay] = toVec2(a);
		const [bx, by] = toVec2(b);
		const c: Vec2 = [ax - bx, ay - by];
		if (a instanceof Vector2 || b instanceof Vector2) return new Vector2(c);
		return c;
	}
	static multiply(a: Vec2 | Vector2, b: Vec2 | Vector2): number {
		const [ax, ay] = toVec2(a);
		const [bx, by] = toVec2(b);
		return ax * bx + ay * by;
	}
	static distance(a: Vec2 | Vector2, b: Vec2 | Vector2): number {
		const [ax, ay] = toVec2(a);
		const [bx, by] = toVec2(b);
		return Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);
	}
	clone(): Vector2 {
		return new Vector2(this.#x, this.#y);
	}
}
