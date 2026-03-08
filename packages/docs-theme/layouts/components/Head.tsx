import { URL } from 'ezal';

export default () => (
	<>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>
			{context.page.layout === 'index'
				? context.page.title
				: `${context.page.title} - ABM Kits Docs`}
		</title>
		<link rel="shortcut icon" href={URL.for('favicon.svg')} />
		<link rel="stylesheet" href={URL.for('abm.css')} />
		<link rel="stylesheet" href={URL.for('main.css')} />
		<script src={URL.for('deps/base.js')} />
		<script src={URL.for('deps/abm.js')} />
		<script>
			<RawHTML html={`globalThis.__LOCALES=${JSON.stringify(context.locales)}`} />
		</script>
		<script src={URL.for('main.js')} />
	</>
);
