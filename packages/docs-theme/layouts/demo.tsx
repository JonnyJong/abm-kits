import { URL } from 'ezal';

export default () => (
	<Doc>
		<head>
			<meta charset="UTF-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			<title>{`${context.page.title} - ABM Kits Demo`}</title>
			<link rel="shortcut icon" href={URL.for('favicon.svg')} />
			<link rel="stylesheet" href={URL.for('abm.css')} />
			<link rel="stylesheet" href={URL.for('demo.css')} />
			<script src={URL.for('deps/base.js')} />
			<script src={URL.for('deps/abm.js')} />
			<script src={URL.for('deps/log2dom.js')} />
		</head>
		<body>
			<div class="main">
				<main />
				<aside class="surface" />
			</div>
			<script src={URL.for('demo.js')} />
		</body>
	</Doc>
);
