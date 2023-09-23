import { defineConfig, presetAttributify, presetWind } from 'unocss';
import transformerDirectives from '@unocss/transformer-directives';
import transformerVariantGroup from '@unocss/transformer-variant-group';

export default defineConfig({
	presets: [presetAttributify(), presetWind()],

	transformers: [transformerDirectives(), transformerVariantGroup()],

	theme: {
		colors: {
			theme: '#09f',
			light: '#fcfcff',
		},
		fontFamily: {
			exo: ['Exo', 'sans-serif'],
		},
	},
});
