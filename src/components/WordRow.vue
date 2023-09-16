<template>
	<li ref="element">
		<span
			v-for="index in 5"
			:key="index"
			class="block max-w-500 transform transition-all"
			:class="{
				'border-[#09f]': state == `active`,
				'border-[#037]': state != `active`,
				'bg-blue-500': state == `complete` && characterMatches[index - 1] == `matches`,
				'bg-black': state == `complete` && characterMatches[index - 1] == `misses`,
				'bg-gray-500': state == `complete` && characterMatches[index - 1] == `appears`,
				'!text-black': state == `complete` && characterMatches[index - 1] == `appears`,
				'-rotate-30': state !== 'complete' && !displayed[index - 1],
				'opacity-0': state !== 'complete' && !displayed[index - 1],
			}"
		>
			{{ currentGuess[index - 1] ?? `` }}
		</span>
	</li>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';

const props = defineProps({
	/**
	 * The current game's word
	 */
	word: { type: String, required: true },

	/**
	 * The current user guess for this row
	 */
	currentGuess: { type: String, required: true },

	/**
	 * Whether or not the word row should animate on mount. If set to false,
	 * call this.present() when ready to present
	 */
	presentOnMount: { type: Boolean, required: false, default: true },

	/**
	 * Whether the current row is active, completed, or not yet started.
	 * Possible values are 'active', 'complete', and 'inactive' respectively
	 */
	state: { type: String, required: true },
});

/**
 * Whether each character box is visible
 */
const displayed = ref(Array(5).fill(false));

const element = ref(null);

/**
 * How each character relates to the corresponding answer's character
 * Possible values are 'hits', 'misses', and 'appears'
 */
const characterMatches = computed(() => {
	const currentGuessCharacters = Array.from(props.currentGuess);
	const wordCharacters = Array.from(props.word);
	let wordCharacterCounts = {};
	let result = Array(5).fill('misses');

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
	wordCharacters.forEach((character, index, allCharacters) => {
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
	@apply block text-theme block flex gap-4 mb-4 justify-center;
}
span {
	@apply inline-block w-12 h-12 border-2 text-theme text-2xl text-center leading-11 rounded;
}
</style>
