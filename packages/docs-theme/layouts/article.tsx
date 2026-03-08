import base from './base';

export default base(
	<>
		<h1 class="text-display">{context.page.title}</h1>
		{context.page.data.source ? (
			<a
				class="source-link"
				href={`https://github.com/JonnyJong/abm-kits/blob/main/${context.page.data.source}`}
			>
				<abm-icon key="code" />
				<abm-i18n key="source" />
			</a>
		) : null}
		<RawHTML html={context.page!.content} />
	</>,
);
