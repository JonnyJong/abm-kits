import { URL } from 'ezal';

export default () => (
	<Doc>
		<head>
			<meta charset="UTF-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			<title>Redirecting... - ABM Kits Docs</title>
			<link rel="shortcut icon" href={URL.for('favicon.svg')} />
			<link rel="stylesheet" href={URL.for('404.css')} />
			<script>
				<RawHTML html={`globalThis.__LOCALES=${JSON.stringify(context.locales)}`} />
			</script>
			<script src={URL.for('404.js')} />
		</head>
		<body>
			<h1>Redirecting...</h1>
		</body>
	</Doc>
);
