/** biome-ignore-all lint/performance/noBarrelFile: Module entry */
/** biome-ignore-all assist/source/organizeImports: Sort manually */

//#region 预设
export { LOCALES } from './constant';

//#region 基础设施
export * from './infra/event';
export * from './infra/interaction';
export * from './infra/decorator';
export * from './infra/color';
export * from './infra/style';
export * from './infra/dom';
export * from './jsx-runtime';
export { viewportTracker } from './infra/viewport-tacker';

//#region 控制
export {
	type KeyCode,
	type KeyboardEventMap,
	KEY_CODE,
	keyboard,
} from './input/keyboard';
export * from './input/game-controller';
export * from './navigate/index';
export * from './state/index';
export * from './movement';

//#region 组件
export { Component } from './component/base';
export * from './component/keyed';
export * from './component/i18n';
export * from './component/icon';
export * from './component/page';
export * from './component/progress';
export * from './component/spinner';
export * from './component/button';
export * from './component/collapsible';
export * from './component/hint/hint';
export * from './component/hint/mouse';
export * from './component/hint/key';
export * from './component/hint/gamepad';
export * from './component/hint/touch';
export * from './component/hint/pen';
export * from './component/form';
export * from './component/list';
export * from './component/grid';
export * from './component/input';
export * from './component/slider';
export * from './component/select';
export * from './component/vec2-pad';
export * from './component/switch';
export * from './component/checkbox';
export * from './component/nav';
export * from './component/color-picker';
export * from './component/color-box';
export * from './component/table';
export * from './component/img';
export * from './component/avatar';
export * from './component/file-picker';
export * from './component/radio';
export * from './component/value';
export * from './component/segment-input';

//#region 部件
export * from './widget/flyout';
export * from './widget/dialog';
export { tooltip } from './widget/tooltip';
export * from './widget/toast';
export * from './widget/menu';

//#region 预制件
export * from './prefab/list';
export * from './prefab/grid';
export * from './prefab/number';
export * from './prefab/tabs';

//#region 初始化
export * from './setup';
