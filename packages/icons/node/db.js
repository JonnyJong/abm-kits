"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDB = initDB;
exports.queryIcon = queryIcon;
exports.getValues = getValues;
exports.getIcon = getIcon;
exports.getDB = getDB;
exports.getAllIcons = getAllIcons;
const promises_1 = require("node:fs/promises");
const node_path_1 = __importDefault(require("node:path"));
const cli_progress_1 = __importDefault(require("cli-progress"));
const typeorm_1 = require("typeorm");
const path_1 = require("./path");
const project_1 = require("./project");
const INSERT_LIMIT = 150;
const PATTERN = /(?<name>.*)_(?<size>\d+)_(?<type>\S+)\.svg/;
const NAME_PATTERN = /^.|_./g;
let Config = class Config {
    key;
    value;
};
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", String)
], Config.prototype, "key", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", String)
], Config.prototype, "value", void 0);
Config = __decorate([
    (0, typeorm_1.Entity)()
], Config);
let Icon = class Icon {
    file;
    id;
    name;
    region;
    type;
    size;
};
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", String)
], Icon.prototype, "file", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", String)
], Icon.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Icon.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: false, length: 8 }),
    __metadata("design:type", String)
], Icon.prototype, "region", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: false, length: 8 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Icon.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Number)
], Icon.prototype, "size", void 0);
Icon = __decorate([
    (0, typeorm_1.Entity)()
], Icon);
const dataSource = new typeorm_1.DataSource({
    type: 'sqlite',
    database: path_1.DB,
    synchronize: true,
    entities: [Config, Icon, project_1.Project],
});
async function checkUpdateStatus() {
    if (!(await dataSource.getRepository(Icon).findAndCount({ take: 1 })))
        return true;
    const date = await dataSource
        .getRepository(Config)
        .findOne({ where: { key: 'date' } });
    if (!date)
        return true;
    const mtime = (await (0, promises_1.stat)(path_1.ICONS)).mtimeMs.toString(36);
    if (date.value !== mtime)
        return true;
    return false;
}
function parse(file) {
    let [region, main] = file.split('/');
    if (!main) {
        main = region;
        region = '';
    }
    const matched = main.match(PATTERN);
    if (!matched)
        return null;
    const name = matched[1];
    const type = matched[3];
    const size = parseInt(matched[2]);
    let id = name.replace(NAME_PATTERN, (a) => {
        if (a.length === 1)
            return a.toUpperCase();
        return a[1].toUpperCase();
    });
    if (size !== 20)
        id += `-${size}`;
    if (type !== 'regular')
        id += `-${type}`;
    if (region)
        id += `-${region}`;
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
    const progress = new cli_progress_1.default.SingleBar({ fps: 2 }, cli_progress_1.default.Presets.rect);
    const icons = dataSource.getRepository(Icon);
    await icons.clear();
    const files = (await (0, promises_1.readdir)(path_1.ICONS, {
        withFileTypes: true,
        recursive: true,
    }))
        .filter((dirent) => dirent.isFile())
        .map((dirent) => node_path_1.default
        .relative(path_1.ICONS, node_path_1.default.join(dirent.parentPath, dirent.name))
        .replace('\\', '/'));
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
    if (data.length)
        await icons.insert(data);
    progress.stop();
    const mtime = (await (0, promises_1.stat)(path_1.ICONS)).mtimeMs.toString(36);
    await dataSource.getRepository(Config).save({
        key: 'date',
        value: mtime,
    });
}
async function initDB() {
    await dataSource.initialize();
    if (await checkUpdateStatus())
        await buildDB();
}
function normalize(icon) {
    return {
        id: icon.id,
        name: icon.name,
        region: icon.region,
        type: icon.type,
        size: icon.size,
        file: icon.file,
    };
}
/* export async function queryIcon({
    name,
    region,
    type,
    size,
}: QueryOptions = {}) {
    const queryBuilder = dataSource.getRepository(Icon).createQueryBuilder('icon');

    if (name) {
        queryBuilder.andWhere('icon.name LIKE :name', { name: `%${name}%` });
    }

    if (typeof region === 'string') {
        queryBuilder.andWhere('icon.region = :region', { region });
    } else {
        queryBuilder.addOrderBy(
            "CASE WHEN icon.region = '' THEN 0 ELSE 1 END",
            'ASC',
        );
    }

    if (type) {
        queryBuilder.andWhere('icon.type = :type', { type });
    } else {
        const typeOrder = ['regular', 'filled', 'light', 'color'];
        const typeOrderStr = typeOrder
            .map((t, index) => `WHEN icon.type = '${t}' THEN ${index}`)
            .join(' ');
        queryBuilder.addOrderBy(
            `CASE ${typeOrderStr} ELSE ${typeOrder.length} END`,
            'ASC',
        );
    }

    if (size) {
        queryBuilder.andWhere('icon.size = :size', { size });
    } else {
        queryBuilder.addOrderBy('CASE WHEN icon.size = 20 THEN 0 ELSE 1 END', 'ASC');
        queryBuilder.addOrderBy('icon.size', 'ASC');
    }

    queryBuilder.groupBy('icon.name');

    return (await queryBuilder.getMany()).map(normalize);
} */
async function queryIcon({ name, region, type, size, } = {}) {
    // 创建子查询构建器
    const subQuery = dataSource
        .getRepository(Icon)
        .createQueryBuilder('icon')
        .addSelect('*')
        .addSelect(`ROW_NUMBER() OVER (
				PARTITION BY icon.name
				ORDER BY
					CASE icon.type
						${['regular', 'filled', 'light', 'color'].map((t, i) => `WHEN '${t}' THEN ${i}`).join(' ')}
						ELSE 4
					END ASC,
					CASE WHEN icon.size = 20 THEN 0 ELSE 1 END ASC,
					icon.size ASC,
					CASE WHEN icon.region = '' THEN 0 ELSE 1 END ASC
			)`, 'rn');
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
        .innerJoin(`(${subQuery.getQuery()})`, 'sub', 'main.file = sub.icon_file AND main.id = sub.icon_id')
        .where('sub.rn = 1')
        .setParameters(subQuery.getParameters());
    // console.log(mainQuery.getQuery());
    return (await mainQuery.getMany()).map(normalize);
}
function getValues() {
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
function getIcon(name) {
    return dataSource
        .getRepository(Icon)
        .find({ where: { name } })
        .then((icons) => icons.map(normalize));
}
function getDB() {
    return dataSource;
}
function getAllIcons() {
    return dataSource
        .getRepository(Icon)
        .find({
        select: ['file', 'id'],
    })
        .then((icons) => icons.map((icon) => {
        return [icon.file, icon.id];
    }));
}
//# sourceMappingURL=db.js.map