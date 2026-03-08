import Head from './components/Head';
import Nav from './components/Nav';
import Sidebar from './components/Sidebar';

export default (...elements: JSX.Element[]) => (
	<Doc lang={context.language}>
		<head>
			<Head />
		</head>
		<body>
			<Nav />
			<main>
				<Sidebar />
				<article>{elements}</article>
			</main>
		</body>
	</Doc>
);
