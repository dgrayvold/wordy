// import { createApp } from 'vue';
import { ViteSSG } from 'vite-ssg/single-page';
import { store } from './store/index.js';
import App from './App.vue';
import 'virtual:windi.css';
import '@fontsource/exo';
import words from 'word-list/words.txt?raw';

export const createApp = ViteSSG(App, ({ app, isClient, initialState }) => {
	// Process the word list on build
	if (import.meta.env.SSR || import.meta.env.DEV) {
		const gameWords = words
			.split('\n')
			.filter(word => word.length == 5)
			.map(word => word.toUpperCase());

		initialState.data = { words: gameWords };
	}

	// Hydrate the game state and word list on load
	let gameData;

	if (isClient) {
		const storedSaveData = localStorage.getItem('saveData');

		gameData = storedSaveData
			? JSON.parse(storedSaveData)
			: JSON.parse(JSON.stringify(store.state.game));
	}

	store.replaceState({
		data: {
			words: initialState.data.words,
		},
		game: gameData,
	});

	app.use(store);
});
