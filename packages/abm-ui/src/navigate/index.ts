/** biome-ignore-all lint/performance/noBarrelFile: Submodule entry */

import { $ready } from '../infra/dom';
import { GameController } from '../input/game-controller';
import { back, coreConfig, nav } from './core';
import {
	bindController,
	initInput,
	inputConfig,
	unbindController,
} from './input';
import {
	addLayer,
	getCurrentLayer,
	initLayers,
	lock,
	rmLayer,
	setCurrent,
	unlock,
} from './layer';
import type { Navigable } from './types';
import { isContains } from './utils';
import { view } from './view';

$ready(() => {
	initLayers();
	view.init();
	initInput();
});

/** 导航 API */
export const navigate = {
	nav,
	back,
	addLayer,
	rmLayer,
	lock,
	unlock,
	get disableRootCallback() {
		return coreConfig.disableRootCallback;
	},
	set disableRootCallback(value) {
		coreConfig.disableRootCallback = value;
	},
	/** 全局返回处理 */
	get onBack() {
		return coreConfig.onBack;
	},
	set onBack(value) {
		coreConfig.onBack = value;
	},
	/** 键盘相关 */
	keyboard: {
		/** 禁用键盘 */
		get disabled() {
			return inputConfig.keyboardDisabled;
		},
		set disabled(value) {
			inputConfig.keyboardDisabled = value;
		},
	},
	/** 游戏控制器相关 */
	gameController: {
		/** 禁用游戏控制器 */
		get disabled() {
			return inputConfig.controllerDisabled;
		},
		set disabled(value) {
			inputConfig.controllerDisabled = value;
		},
		/** 游戏控制器索引 */
		get index() {
			return inputConfig.controller.index;
		},
		set index(value) {
			const newController = GameController.get(value);
			if (inputConfig.controller === newController) return;
			unbindController();
			inputConfig.controller = newController;
			bindController();
			window.dispatchEvent(new Event('__ABM_NAV:gamepad'));
		},
		/** 启用左摇杆 */
		get ls() {
			return inputConfig.ls;
		},
		set ls(value) {
			inputConfig.ls = value;
		},
		/** 启用右摇杆 */
		get rs() {
			return inputConfig.rs;
		},
		set rs(value) {
			inputConfig.rs = value;
		},
	},
	/** 设置当前导航目标 */
	setCurrent(target: Navigable): void {
		const { root, current, lock } = getCurrentLayer();
		if (lock || !current || current === target) return;
		if (!isContains(root, target)) return;
		setCurrent(target);
	},
} as const;

export type { Navigable, NavState } from './types';
