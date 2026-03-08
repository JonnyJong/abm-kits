(() => {
	const LOCALES: string[] = Object.keys((globalThis as any).__LOCALES);
	function getPreferredLocale(): string {
		for (let language of navigator.languages) {
			while (true) {
				if (LOCALES.includes(language)) return language;
				const splitter = language.indexOf('-');
				if (splitter === -1) break;
				language = language.slice(0, splitter);
			}
		}
		return LOCALES[0];
	}

	const paths = location.pathname
		.split('/')
		.filter((v) => !!v)
		.slice(1);
	if (paths.length === 0) {
		location.pathname = `/abm-kits/${getPreferredLocale()}`;
		return;
	}
	if (!LOCALES.includes(paths[0])) {
		location.pathname = `/abm-kits/${getPreferredLocale()}/${paths.join('/')}`;
		return;
	}

	document.addEventListener('DOMContentLoaded', () => {
		document.body.innerHTML = '<h1>404 Not Found</h1>';
	});
})();
