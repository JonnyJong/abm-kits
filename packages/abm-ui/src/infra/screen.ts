const rect = { top: 0, right: 0, bottom: 0, left: 0 };

/** 屏幕安全区边框 */
export const safeRect = {
	/** 顶部间距 */
	get top() {
		return rect.top;
	},
	set top(value) {
		if (!Number.isFinite(value)) return;
		rect.top = Math.max(0, value);
		document.body.style.setProperty('--safe-top', `${rect.top}px`);
	},
	/** 右侧间距 */
	get right() {
		return rect.right;
	},
	set right(value) {
		if (!Number.isFinite(value)) return;
		rect.right = Math.max(0, value);
		document.body.style.setProperty('--safe-right', `${rect.right}px`);
	},
	/** 底部间距 */
	get bottom() {
		return rect.bottom;
	},
	set bottom(value) {
		if (!Number.isFinite(value)) return;
		rect.bottom = Math.max(0, value);
		document.body.style.setProperty('--safe-bottom', `${rect.bottom}px`);
	},
	/** 左侧间距 */
	get left() {
		return rect.left;
	},
	set left(value) {
		if (!Number.isFinite(value)) return;
		rect.left = Math.max(0, value);
		document.body.style.setProperty('--safe-left', `${rect.left}px`);
	},
	/** 垂直方向起始坐标 */
	get vStart() {
		return this.top;
	},
	/** 垂直方向结束坐标 */
	get vEnd() {
		return innerHeight - this.bottom;
	},
	/** 垂直方向大小 */
	get vSize() {
		return innerHeight - this.bottom - this.top;
	},
	/** 水平方向起始坐标 */
	get hStart() {
		return this.left;
	},
	/** 水平方向结束坐标 */
	get hEnd() {
		return innerWidth - this.right;
	},
	/** 水平方向大小 */
	get hSize() {
		return innerWidth - this.right - this.left;
	},
} as const;
