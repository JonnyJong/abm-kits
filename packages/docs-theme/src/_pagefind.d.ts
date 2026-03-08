// Type definitions for Pagefind
// Project: https://github.com/Pagefind/pagefind
// Definitions by: Based on official Pagefind documentation

declare module '@pagefind' {
	/**
	 * 初始化 Pagefind
	 * @description 加载 Pagefind 依赖项和站点元数据。此方法是可选的，如果省略，将在调用第一个搜索或过滤函数时进行初始化。
	 * 当搜索界面获得焦点时调用此方法，有助于在用户输入搜索查询时加载核心依赖项。
	 */
	export function init(): void;

	/**
	 * 配置 Pagefind 选项
	 * @description 在运行 pagefind.init() 之前设置 Pagefind 选项。在初始化后调用 pagefind.options 也可以，但传递 bundlePath 等设置将在初始化后无效。
	 * @param options 配置选项
	 */
	export function options(options: PagefindIndexOptions): Promise<void>;

	/**
	 * 执行搜索
	 * @description 执行搜索查询并返回匹配的结果
	 * @param query 搜索查询字符串
	 * @param options 搜索选项
	 * @returns 搜索结果
	 */
	export function search(
		query: string | null,
		options?: PagefindSearchOptions,
	): Promise<PagefindSearchResults>;

	/**
	 * 防抖搜索
	 * @description 等待指定持续时间后执行搜索，如果在等待期间进行了后续调用，则返回 null
	 * @param query 搜索查询字符串
	 * @param options 搜索选项
	 * @param timeout 防抖超时时间（毫秒），默认为 300
	 * @returns 搜索结果或 null（如果被后续搜索调用取消）
	 */
	export function debouncedSearch(
		query: string,
		options?: PagefindSearchOptions,
		timeout?: number,
	): Promise<PagefindSearchResults | null>;

	/**
	 * 预加载搜索词
	 * @description 在用户输入时预加载索引，以加速后续搜索查询。不会导致冗余网络请求。
	 * @param query 要预加载的搜索查询
	 * @param options 搜索选项
	 */
	export function preload(query: string, options?: PagefindSearchOptions): void;

	/**
	 * 获取可用过滤器
	 * @description 加载可用的过滤器及其结果计数
	 * @returns 过滤器及其计数字典
	 */
	export function filters(): Promise<PagefindFilterCounts>;

	/**
	 * 销毁 Pagefind 实例
	 * @description 卸载活动的 Pagefind 实例，并重置所有通过 pagefind.options() 传递的设置
	 */
	export function destroy(): Promise<void>;

	/**
	 * Pagefind 索引配置选项
	 */
	export interface PagefindIndexOptions {
		/**
		 * 基础 URL
		 * @description 默认为 "/"。如果站点托管在子路径上，可以提供此选项，它将附加到所有搜索结果 URL 的前面。
		 * @default "/"
		 */
		baseUrl?: string;

		/**
		 * 包路径
		 * @description 覆盖包目录。在大多数情况下，这应该通过导入 URL 自动检测。如果搜索不工作并且看到控制台警告无法检测到此路径，请设置此选项。
		 */
		bundlePath?: string;

		/**
		 * 摘要长度
		 * @description 设置生成的摘要的最大长度
		 * @default 30
		 */
		excerptLength?: number;

		/**
		 * 高亮查询参数
		 * @description 如果设置，Pagefind 将搜索词作为同名的查询参数添加
		 */
		highlightParam?: string;

		/**
		 * 自定义排名权重
		 * @description 提供微调 Pagefind 排名算法的能力，以更好地适应您的数据集
		 */
		ranking?: PagefindRankingWeights;

		/**
		 * 索引权重
		 * @description 将此索引的所有排名乘以给定的权重。仅适用于多站点设置。
		 */
		indexWeight?: number;

		/**
		 * 合并过滤器
		 * @description 将所有搜索查询中的过滤器对象合并到此索引中。仅适用于多站点设置。
		 */
		mergeFilter?: object;

		/**
		 * 禁用 Web Worker
		 * @description 默认为 false。如果设置为 true，强制 Pagefind 在主线程上运行所有搜索操作而不是使用 Web Worker。
		 * @default false
		 */
		noWorker?: boolean;
	}

	/**
	 * Pagefind 排名权重配置
	 */
	export interface PagefindRankingWeights {
		/**
		 * 术语相似性权重
		 * @description 控制基于术语与搜索查询相似性（长度）的页面排名。
		 * 增加此数值意味着当页面包含与查询非常接近的单词时排名更高，
		 * 例如，如果搜索 "part"，那么包含 "party" 的页面将比包含 "partition" 的页面排名更高。
		 * 最小值为 0.0，此时 "party" 和 "partition" 将被视为同等重要。
		 */
		termSimilarity?: number;

		/**
		 * 页面长度权重
		 * @description 控制平均页面长度对排名的影响程度。
		 * 最大值为 1.0，排名将强烈偏向比站点平均页面短的页面。
		 * 最小值为 0.0，排名将仅查看术语频率，而不考虑文档长度。
		 */
		pageLength?: number;

		/**
		 * 术语饱和度权重
		 * @description 控制术语在页面上饱和并减少对排名影响的速度。
		 * 最大值为 2.0，页面需要很长时间才能饱和，具有非常高术语频率的页面将占据主导地位。
		 * 当此数值趋近于 0 时，不需要很多术语就会饱和，并允许其他参数影响排名。
		 * 最小值为 0.0，术语将立即饱和，结果不会区分一个术语和多个术语。
		 */
		termSaturation?: number;

		/**
		 * 术语频率权重
		 * @description 控制排名使用术语频率与原始术语计数的程度。
		 * 最大值为 1.0，术语频率完全适用并且是主要排名因素。
		 * 最小值为 0.0，术语频率不适用，页面基于单词和权重的原始总和进行排名。
		 * 0.0 到 1.0 之间的值将在两种排名方法之间进行插值。
		 * 减少此数值是提升较长文档在搜索结果中排名的好方法，因为它们不再因术语频率低而受到惩罚。
		 */
		termFrequency?: number;
	}

	/**
	 * Pagefind 搜索选项
	 */
	export interface PagefindSearchOptions {
		/**
		 * 过滤器配置
		 * @description 与此搜索一起执行的过滤器集。输入类型非常灵活，请参阅过滤文档了解详细信息。
		 */
		filters?: object;

		/**
		 * 排序配置
		 * @description 用于此搜索的排序集，而不是相关性排序
		 */
		sort?: object;

		/**
		 * 预加载模式
		 * @description 如果设置，此调用将加载所有资源但在搜索之前返回。建议改用 pagefind.preload()
		 */
		preload?: boolean;

		/**
		 * 详细模式
		 * @description 如果设置，此搜索查询将在控制台输出更详细的日志记录
		 */
		verbose?: boolean;
	}

	/**
	 * 过滤器计数字典
	 */
	export interface PagefindFilterCounts {
		[filter: string]: {
			[value: string]: number;
		};
	}

	/**
	 * Pagefind 搜索结果
	 */
	export interface PagefindSearchResults {
		/**
		 * 匹配搜索查询和提供的过滤器的所有页面
		 */
		results: PagefindSearchResult[];

		/**
		 * 如果省略过滤器，将会有多少结果
		 */
		unfilteredResultCount: number;

		/**
		 * 给定查询和提供的过滤器，每个过滤器下还有多少剩余结果？
		 */
		filters: PagefindFilterCounts;

		/**
		 * 如果移除搜索的过滤器，每个过滤器的总结果数是多少？
		 */
		totalFilters: PagefindFilterCounts;

		/**
		 * Pagefind 执行此查询所用时间的信息
		 */
		timings: {
			/** 预加载时间（毫秒） */
			preload: number;
			/** 搜索时间（毫秒） */
			search: number;
			/** 总时间（毫秒） */
			total: number;
		};
	}

	/**
	 * Pagefind 单个搜索结果（在加载实际数据之前）
	 */
	export interface PagefindSearchResult {
		/**
		 * Pagefind 内部为此页面分配的 ID，在整个站点中唯一
		 */
		id: string;

		/**
		 * Pagefind 内部对查询匹配此页面的评分，用于对这些结果进行排名
		 */
		score: number;

		/**
		 * 此页面中所有匹配单词的位置
		 */
		words: number[];

		/**
		 * 数据加载函数
		 * @description 调用 data() 加载显示此结果所需的最终数据片段。
		 * 仅在需要显示数据时调用此函数，而不是一次性全部调用。
		 * （例如，一次一页，或在滚动监听器中）
		 * @returns 包含完整结果的 Promise
		 */
		data(): Promise<PagefindSearchFragment>;
	}

	/**
	 * Pagefind 搜索片段 - 搜索结果的有用数据
	 */
	export interface PagefindSearchFragment {
		/**
		 * Pagefind 处理过的此页面的 URL。如果配置了 baseUrl，将包含 baseUrl
		 */
		url: string;

		/**
		 * Pagefind 未处理的此页面的原始 URL
		 */
		raw_url?: string;

		/**
		 * 此页面的完整处理后的内容文本
		 */
		content: string;

		/**
		 * 内部类型 - 暂时忽略
		 */
		raw_content?: string;

		/**
		 * 此结果的处理后的摘要，匹配术语用 `<mark>` 元素包裹
		 */
		excerpt: string;

		/**
		 * 页面的哪些区域匹配此搜索查询？
		 * @description 基于带有 ID 的 h1->6 标签预先计算，使用每个标签之间的文本。
		 */
		sub_results: PagefindSubResult[];

		/**
		 * 此页面上总共有多少个单词？
		 */
		word_count: number;

		/**
		 * 此页面中所有匹配单词的位置
		 */
		locations: number[];

		/**
		 * 此页面中所有匹配单词的位置，
		 * 配对其权重和与此查询相关性的数据
		 */
		weighted_locations: PagefindWordLocation[];

		/**
		 * 此页面标记的过滤器键和值
		 */
		filters: Record<string, string[]>;

		/**
		 * 此页面标记的元数据键和值
		 */
		meta: Record<string, string>;

		/**
		 * Pagefind 用于生成 sub_results 的原始锚点数据。
		 * @description 包含页面上所有具有 ID 的元素，因此可用于使用不同的语义实现您自己的子结果计算。
		 */
		anchors: PagefindSearchAnchor[];
	}

	/**
	 * 页面内匹配段的数据
	 */
	export interface PagefindSubResult {
		/**
		 * 此子结果的标题 - 从标题内容派生。
		 * @description 如果这是页面在任何带有 ID 的标题之前的部分的结果，这将与页面的 meta.title 值相同。
		 */
		title: string;

		/**
		 * 此子结果的直接 URL，由页面的 URL 加上标题的哈希字符串组成。
		 * @description 如果这是页面在任何带有 ID 的标题之前的部分的结果，这将与页面 URL 相同。
		 */
		url: string;

		/**
		 * 此段中所有匹配单词的位置
		 */
		locations: number[];

		/**
		 * 此段中所有匹配单词的位置，
		 * 配对其权重和与此查询相关性的数据
		 */
		weighted_locations: PagefindWordLocation[];

		/**
		 * 此段的处理后的摘要，匹配术语用 `<mark>` 元素包裹
		 */
		excerpt: string;

		/**
		 * 与此子结果关联的锚点元素的原始数据。
		 * @description 省略此字段意味着此子结果是针对在第一个具有 ID 的标题之前页面上找到的文本。
		 */
		anchor?: PagefindSearchAnchor;
	}

	/**
	 * 页面上匹配单词的信息
	 */
	export interface PagefindWordLocation {
		/**
		 * 此单词最初标记的权重
		 */
		weight: number;

		/**
		 * Pagefind 为此单词计算的内部分数。
		 * @description 绝对值有些无意义，但该值可用于与此组搜索结果中的其他值进行比较以执行自定义排名。
		 */
		balanced_score: number;

		/**
		 * 此单词在结果内容中的索引。
		 * @description 按空白分割 content 键并按此数字索引将产生正确的单词。
		 */
		location: number;
	}

	/**
	 * Pagefind 在索引页面时遇到的带有 ID 的元素的原始数据
	 */
	export interface PagefindSearchAnchor {
		/**
		 * 此锚点是什么元素类型？例如 "h1"、"div"
		 */
		element: string;

		/**
		 * 元素的原始 id="..." 属性内容
		 */
		id: string;

		/**
		 * 此元素的文本内容。
		 * @description 为了防止为每个锚点重复大部分页面数据，
		 * Pagefind 将仅获取顶级文本节点，或嵌套在 <a> 和 <span> 等内联元素内的文本节点。
		 */
		text?: string;

		/**
		 * 此锚点在结果内容中的位置。
		 * @description 按空白分割 content 键并按此数字索引将产生在此元素的 ID 之后索引的第一个单词。
		 */
		location: number;
	}
}
