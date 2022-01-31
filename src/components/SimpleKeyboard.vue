<template>
	<div class="relative overflow-hidden">
		<div class="keyboard"></div>
	</div>
</template>

<script>
import Keyboard from 'simple-keyboard';
import 'simple-keyboard/build/css/index.css';

export default {
	name: 'SimpleKeyboard',

	props: {
		/**
		 * The list of guessed characters and their relation to the game word
		 */
		characters: {
			type: Object,
		},

		/**
		 * Whether the game is loaded and ready to present the keyboard
		 */
		loaded: {
			type: Boolean,
		},
	},

	watch: {
		input(input) {
			this.keyboard.setInput(input);
		},

		loaded() {
			this.keyboard.setOptions({
				theme: `hg-theme-default hg-layout-default myTheme`,
			});
		},

		characters: {
			handler: function (n) {
				const buttonThemeEntries = [];

				if (n.missed.length) {
					buttonThemeEntries.push({
						class: 'miss',
						buttons: n.missed.join(' '),
					});
				}
				if (n.appeared.length) {
					buttonThemeEntries.push({
						class: 'appear',
						buttons: n.appeared.join(' '),
					});
				}
				if (n.matched.length) {
					buttonThemeEntries.push({
						class: 'match',
						buttons: n.matched.join(' '),
					});
				}

				this.keyboard.setOptions({
					buttonTheme: buttonThemeEntries,
				});
			},
			deep: true,
		},
	},

	data: () => ({
		keyboard: null,
	}),

	mounted() {
		this.keyboard = new Keyboard('keyboard', {
			onChange: this.onChange,
			onKeyPress: this.onKeyPress,
			disableButtonHold: true,
			display: {
				'{Enter}': 'TRY',
				'{Del}': '⌫',
			},
			layout: {
				default: [
					'Q W E R T Y U I O P {Del}',
					'A S D F G H J K L',
					'{Enter} Z X C V B N M {Enter}',
				],
			},
			theme: 'hg-theme-default hg-layout-default myTheme loading',
			useButtonTag: true,
		});
	},

	methods: {
		/**
		 * Emit a change event on input
		 *
		 * @param {String} input The input value that triggered the event
		 */
		onChange(input) {
			this.$emit('change', input);
		},

		/**
		 * Emit a change event on key down of the keyboard
		 *
		 * @param {String} button The value of the key that triggered the event
		 */
		onKeyPress(button) {
			this.$emit('keypress', button);
		},
	},
};
</script>

<style lang="postcss">
.myTheme {
	@apply bg-true-gray-900 transition-all duration-500 delay-500 transform translate-y-0 max-w-200 mx-auto;
}

.myTheme.loading {
	@apply translate-y-full;
}

.hg-button {
	@apply !border-2 !border-transparent !bg-true-gray-700 font-bold text-theme transition-colors min-w-6;
	@apply hover:(!bg-true-gray-500);
}

.miss {
	@apply !bg-black text-theme;
}

.appear {
	@apply !border-[#09f];
}

.match,
.appear.match {
	@apply !bg-[#09f] !text-black;
}
</style>
