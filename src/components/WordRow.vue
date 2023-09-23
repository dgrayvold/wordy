<template>
	<li ref="element">
		<span
			v-for="(_, index) in 5"
			:key="index"
			class="block max-w-500 transform transition-all"
			:class="generateCharacterCellClasses(state, characterMatches[index], displayed[index])"
		>
			{{ currentGuess[index] }}
		</span>
	</li>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

const props = withDefaults(
	defineProps<{
		/**
		 * The current game's word
		 */
		word: string;

		/**
		 * The current user guess for this row
		 */
		currentGuess: string;

		/**
		 * Whether or not the word row should animate on mount. If set to false,
		 * call this.present() when ready to present
		 */
		presentOnMount?: boolean;

		/**
		 * Whether the current row is active, completed, or not yet started
		 */
		state: 'active' | 'complete' | 'inactive';
	}>(),
	{
		word: '',
		presentOnMount: true,
	},
);

/**
 * Whether each character cell is visible
 */
const displayed = ref<boolean[]>(Array(5).fill(false));

const element = ref<Element>();

/**
 * How each character relates to the corresponding answer's character
 * Possible values are 'hits', 'misses', and 'appears'
 */
const characterMatches = computed(() => {
	const currentGuessCharacters = Array.from(props.currentGuess);
	const wordCharacters = Array.from(props.word);
	let wordCharacterCounts: { [key: string]: number } = {};
	let result: string[] = Array(5).fill('misses');

	// Map the occurrences of each letter
	wordCharacters.forEach(character => {
		if (!wordCharacterCounts[character]) {
			wordCharacterCounts[character] = 1;
		} else {
			wordCharacterCounts[character]++;
		}
	});

	// Mark matching characters first
	wordCharacters.forEach((character, index) => {
		if (currentGuessCharacters[index] == character) {
			wordCharacterCounts[currentGuessCharacters[index]]--;
			result[index] = 'matches';
		}
	});

	// Mark characters appearing in word but in wrong place
	wordCharacters.forEach((_character, index, allCharacters) => {
		if (
			!allCharacters.includes(currentGuessCharacters[index]) ||
			wordCharacterCounts[currentGuessCharacters[index]] < 1
		) {
			return;
		}

		wordCharacterCounts[currentGuessCharacters[index]]--;

		if (result[index] !== 'matches') {
			result[index] = 'appears';
		}
	});

	return result;
});

onMounted(() => {
	if (props.presentOnMount) {
		present();
	}
});

/**
 *
 * @param {String} state Whether the row is active or completed
 * @param {String} characterState Whether the cell's character is a miss, match, or appearance
 * @param {Boolean} cellIsDisplayed Whether the character cell is currently displayed
 *
 * @returns {String} The list of classes for the character cell
 */
function generateCharacterCellClasses(
	state: string,
	characterState: string,
	cellIsDisplayed: boolean,
) {
	const classes = {
		'border-theme': state == `active`,
		'border-[#037]': state != `active`,
		'bg-blue-500': state == `complete` && characterState == `matches`,
		'bg-black': state == `complete` && characterState == `misses`,
		'bg-gray-500': state == `complete` && characterState == `appears`,
		'!text-black': state == `complete` && characterState == `appears`,
		'-rotate-30': state !== 'complete' && !cellIsDisplayed,
		'opacity-0': state !== 'complete' && !cellIsDisplayed,
	};

	return Object.entries(classes)
		.filter(([_, isIncluded]) => isIncluded)
		.map(([name]) => name)
		.join(' ');
}

/**
 * Shake the row to indicate the guess is not valid
 */
function indicateError() {
	element.value?.animate(
		{
			transform: [
				'translateX(10px)',
				'translateX(-10px)',
				'translateX(5px)',
				'translateX(-5px)',
				'translateX(0)',
			],
		},
		{ duration: 400 },
	);
}

/**
 * Animate the row in
 */
function present() {
	for (let i = 0; i < 5; i++) {
		setTimeout(() => (displayed.value[i] = true), i * 100);
	}
}

/**
 * Reset animation properties of the row
 */
function resetPresentation() {
	for (let i = 0; i < 5; i++) {
		displayed.value[i] = false;
	}
}

defineExpose({
	indicateError,
	present,
	resetPresentation,
});
</script>

<style scoped lang="postcss">
li {
	@apply block text-light block flex gap-4 mb-4 justify-center;
}
span {
	@apply inline-block w-12 h-12 border-2 text-light text-2xl text-center leading-11 rounded;
}
</style>
