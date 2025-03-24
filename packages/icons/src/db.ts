import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import cliProgress from 'cli-progress';
import { Column, DataSource, Entity, Index, PrimaryColumn } from 'typeorm';
import { QueryOptions } from '../types';
import { IconsToCompile } from './compiler';
import { DB, ICONS } from './path';
import { Project } from './project';

const INSERT_LIMIT = 150;

const PATTERN = /(?<name>.*)_(?<size>\d+)_(?<type>\S+)\.svg/;
const NAME_PATTERN = /^.|_./g;

@Entity()
class Config {
	@PrimaryColumn()
	key!: string;
	@Column({ nullable: false })
	value!: string;
}

@Entity()
class Icon {
	@PrimaryColumn()
	file!: string;
	@Column({ nullable: false })
	id!: string;
	@Column({ nullable: false })
	@Index()
	name!: string;
	@Column('varchar', { nullable: false, length: 8 })
	region!: string;
	@Column('varchar', { nullable: false, length: 8 })
	@Index()
	type!: string;
	@Column({ nullable: false })
	@Index()
	size!: number;
}

const dataSource = new DataSource({
	type: 'sqlite',
	database: DB,
	synchronize: true,
	entities: [Config, Icon, Project],
});

async function checkUpdateStatus() {
	if (!(await dataSource.getRepository(Icon).findAndCount({ take: 1 })))
		return true;

	const date = await dataSource
		.getRepository(Config)
		.findOne({ where: { key: 'date' } });
	if (!date) return true;

	const mtime = (await stat(ICONS)).mtimeMs.toString(36);
	if (date.value !== mtime) return true;

	return false;
}

function parse(file: string) {
	let [region, main] = file.split('/');
	if (!main) {
		main = region;
		region = '';
	}
	const matched = main.match(PATTERN);
	if (!matched) return null;
	const name = matched[1];
	const type = matched[3];
	const size = parseInt(matched[2]);
	let id = name.replace(NAME_PATTERN, (a) => {
		if (a.length === 1) return a.toUpperCase();
		return a[1].toUpperCase();
	});
	if (size !== 20) id += `-${size}`;
	if (type !== 'regular') id += `-${type}`;
	if (region) id += `-${region}`;
	return {
		id,
		name,
		region,
		type,
		size,
	};
}

async function buildDB() {
	console.log('Building database...');
	const progress = new cliProgress.SingleBar(
		{ fps: 2 },
		cliProgress.Presets.rect,
	);
	const icons = dataSource.getRepository(Icon);
	await icons.clear();

	const files = (
		await readdir(ICONS, {
			withFileTypes: true,
			recursive: true,
		})
	)
		.filter((dirent) => dirent.isFile())
		.map((dirent) =>
			path
				.relative(ICONS, path.join(dirent.parentPath, dirent.name))
				.replace('\\', '/'),
		);
	progress.start(files.length, 0);
	let i = 0;
	let data = [];
	for (const file of files) {
		progress.update(++i);
		const info = parse(file);
		if (!info) {
			console.log(`Could not parse ${file}`);
			continue;
		}
		data.push({ ...info, file });
		if (data.length >= INSERT_LIMIT) {
			await icons.insert(data);
			data = [];
		}
	}
	if (data.length) await icons.insert(data);
	progress.stop();

	const mtime = (await stat(ICONS)).mtimeMs.toString(36);
	await dataSource.getRepository(Config).save({
		key: 'date',
		value: mtime,
	});
}

export async function initDB() {
	await dataSource.initialize();
	if (await checkUpdateStatus()) await buildDB();
}

function normalize(icon: Icon) {
	return {
		id: icon.id,
		name: icon.name,
		region: icon.region,
		type: icon.type,
		size: icon.size,
		file: icon.file,
	};
}

export async function queryIcon({
	name,
	region,
	type,
	size,
}: QueryOptions = {}) {
	// 创建子查询构建器
	const subQuery = dataSource
		.getRepository(Icon)
		.createQueryBuilder('icon')
		.addSelect('*')
		.addSelect(
			`ROW_NUMBER() OVER (
				PARTITION BY icon.name
				ORDER BY
					CASE icon.type
						${['regular', 'filled', 'light', 'color'].map((t, i) => `WHEN '${t}' THEN ${i}`).join(' ')}
						ELSE 4
					END ASC,
					CASE WHEN icon.size = 20 THEN 0 ELSE 1 END ASC,
					icon.size ASC,
					CASE WHEN icon.region = '' THEN 0 ELSE 1 END ASC
			)`,
			'rn',
		);

	// 应用过滤条件
	if (name) {
		subQuery.andWhere('icon.name LIKE :name', { name: `%${name}%` });
	}

	if (typeof region === 'string') {
		subQuery.andWhere('icon.region = :region', { region });
	}

	if (type) {
		subQuery.andWhere('icon.type = :type', { type });
	}

	if (size) {
		subQuery.andWhere('icon.size = :size', { size });
	}

	// 创建主查询
	const mainQuery = dataSource
		.getRepository(Icon)
		.createQueryBuilder('main')
		.select([
			'main.file',
			'main.id',
			'main.name',
			'main.region',
			'main.type',
			'main.size',
		])
		.innerJoin(
			`(${subQuery.getQuery()})`,
			'sub',
			'main.file = sub.icon_file AND main.id = sub.icon_id',
		)
		.where('sub.rn = 1')
		.setParameters(subQuery.getParameters());

	return (await mainQuery.getMany()).map(normalize);
}

export function getValues() {
	const icons = dataSource.getRepository(Icon);

	const regions = icons
		.createQueryBuilder('icon')
		.select('DISTINCT icon.region', 'region')
		.getRawMany();
	const types = icons
		.createQueryBuilder('icon')
		.select('DISTINCT icon.type', 'type')
		.getRawMany();
	const sizes = icons
		.createQueryBuilder('icon')
		.select('DISTINCT icon.size', 'size')
		.getRawMany();

	return Promise.all([regions, types, sizes]).then(([regions, types, sizes]) => {
		return {
			regions: regions.map((region) => region.region),
			types: types.map((type) => type.type),
			sizes: sizes.map((size) => size.size),
		};
	});
}

export function getIcon(name: string) {
	return dataSource
		.getRepository(Icon)
		.find({ where: { name } })
		.then((icons) => icons.map(normalize));
}

export function getDB() {
	return dataSource;
}

export function getAllIcons(): Promise<IconsToCompile> {
	return dataSource
		.getRepository(Icon)
		.find({
			select: ['file', 'id'],
		})
		.then((icons) =>
			icons.map((icon) => {
				return [icon.file, icon.id];
			}),
		);
}
