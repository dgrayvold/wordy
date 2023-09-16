import { defineConfig, presetAttributify, presetWebFonts, presetWind } from 'unocss';
import transformerDirectives from '@unocss/transformer-directives';
import transformerVariantGroup from '@unocss/transformer-variant-group';

export default defineConfig({
	presets: [
		presetAttributify(),
		presetWebFonts({
			provider: 'none',
			fonts: {
				text: ['Exo'],
			},
		}),
		presetWind(),
	],

	transformers: [transformerDirectives(), transformerVariantGroup()],

	theme: {
		colors: {
			theme: '#fcfcff',
		},
		fontFamily: {
			text: [],
		},
	},
});
