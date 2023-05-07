import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import UnoCSS from 'unocss/vite';

export default defineConfig({
	plugins: [vue(), UnoCSS()],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
	server: {
		host: true,
		hmr: true,
		port: 3000,
	},
});
