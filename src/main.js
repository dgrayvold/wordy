// import { createApp } from 'vue';
import { ViteSSG } from 'vite-ssg/single-page';
import { store } from './store/index.js';
import App from './App.vue';
import 'virtual:windi.css';
import '@fontsource/exo';

// `export const createApp` is required
export const createApp = ViteSSG(App, ({ app }) => {
	app.use(store);
});
// const app = createApp(App);

// app.use(store);

// app.mount('#app');
