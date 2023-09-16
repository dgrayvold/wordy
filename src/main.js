import { ViteSSG } from 'vite-ssg/single-page';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import App from './App.vue';
import 'virtual:uno.css';
import '@unocss/reset/tailwind.css';
import '@fontsource/exo';
import sourceWords from 'word-list/words.txt?raw';
import { useSaveData } from '@/store/save-data';
import { useWords } from '@/store/words.js';

export const createApp = ViteSSG(App, ({ app, isClient, initialState }) => {
	const pinia = createPinia();

	app.use(pinia);

	// Process the word list on build
	if (import.meta.env.SSR || import.meta.env.MODE == 'development') {
		const gameWords = sourceWords
			.split('\n')
			.filter(word => word.length == 5)
			.map(word => word.toUpperCase());

		initialState.data = { words: gameWords };
	}

	if (isClient) {
		pinia.use(piniaPluginPersistedstate);

		const oldSaveData = localStorage.getItem('saveData');

		if (oldSaveData != null) {
			console.info('Old save data found, migrating…');

			const { migrateOldSaveData } = useSaveData(pinia);

			migrateOldSaveData(oldSaveData);

			localStorage.removeItem('saveData');
		}

		// Load word list
		const { words } = useWords(pinia);

		words.push(...initialState.data.words);
	}
});
