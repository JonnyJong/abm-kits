import { URL } from 'ezal';

export default () => (
	<nav>
		<a class="site-logo" href={URL.for(context.language)}>
			{/* <picture>
				<source media="(prefers-color-scheme: dark)" srcset={URL.for('icon.svg')} />
				<img class="site-icon" src={URL.for('icon.light.svg')} alt="logo" />
			</picture> */}
			<div class="site-icon" />
			ABM Kits
		</a>
		<div class="nav-flex" />
	</nav>
);
