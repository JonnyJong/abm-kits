import path from 'node:path';

export const ICONS = path.join(
	__dirname,
	'../node_modules/@fluentui/svg-icons/icons',
);
export const DB = path.join(__dirname, '../icons.sqlite');
export const PROJECT_LIST = path.join(__dirname, '../projects.json');
