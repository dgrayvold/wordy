<template>
	<div class="relative overflow-hidden">
		<div class="keyboard"></div>
	</div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import Keyboard from 'simple-keyboard';
import 'simple-keyboard/build/css/index.css';

const props = defineProps({
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
});

const emit = defineEmits(['change', 'keypress']);

const keyboard = ref<Keyboard>();

onMounted(() => {
	keyboard.value = new Keyboard('keyboard', {
		onChange: onChange,
		onKeyPress: onKeyPress,
		disableButtonHold: true,
		display: {
			'{Enter}': 'TRY',
			'{Del}': '⌫',
		},
		layout: {
			default: ['Q W E R T Y U I O P', 'A S D F G H J K L', '{Del} Z X C V B N M {Enter}'],
		},
		theme: 'hg-theme-default hg-layout-default myTheme loading',
		useButtonTag: true,
	});
});

watch(props, () => {
	keyboard.value?.setOptions({
		theme: `hg-theme-default hg-layout-default myTheme`,
	});
});

// Watch characters prop
watch(
	props,
	newValues => {
		if (!newValues.characters) {
			return;
		}

		const n = newValues.characters;
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

		keyboard.value?.setOptions({
			buttonTheme: buttonThemeEntries,
		});
	},
	{ deep: true },
);

/**
 * Emit a change event on input
 *
 * @param {String} input The input value that triggered the event
 */
function onChange(input: string) {
	emit('change', input);
}

/**
 * Emit a change event on key down of the keyboard
 *
 * @param {String} button The value of the key that triggered the event
 */
function onKeyPress(button: string) {
	emit('keypress', button);
}
</script>

<style lang="postcss">
.myTheme {
	@apply bg-true-gray-900 transition-all duration-500 delay-500 transform translate-y-0 max-w-200 mx-auto;
}

.myTheme.loading {
	@apply translate-y-full;
}

.hg-button {
	@apply !border-2 !border-transparent !bg-true-gray-700 font-bold text-theme transition-colors min-w-6 text-[1.2rem];
	@apply hover:(!bg-true-gray-500);
}

.hg-theme-default button.hg-button.hg-button-Del {
	@apply !text-[1.5rem];
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
