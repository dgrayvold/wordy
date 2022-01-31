<template>
	<li>
		<span
			v-for="index in 5"
			:key="index"
			class="block max-w-500 transform transition-all"
			:class="{
				'border-[#09f]': state == `active`,
				'border-[#037]': state != `active`,
				'bg-blue-500':
					state == `complete` &&
					characterMatches[index - 1] == `matches`,
				'bg-black':
					state == `complete` &&
					characterMatches[index - 1] == `misses`,
				'bg-gray-500':
					state == `complete` &&
					characterMatches[index - 1] == `appears`,
				'!text-black':
					state == `complete` &&
					characterMatches[index - 1] == `appears`,
				'-rotate-30': state !== 'complete' && !displayed[index - 1],
				'opacity-0': state !== 'complete' && !displayed[index - 1],
			}"
		>
			{{ currentGuess[index - 1] ?? `` }}
		</span>
	</li>
</template>

<script>
export default {
	props: {
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
	},

	computed: {
		/**
		 * How each character relates to the corresponding answer's character
		 * Possible values are 'hits', 'misses', and 'appears'
		 */
		characterMatches() {
			const currentGuessCharacters = Array.from(this.currentGuess);
			const wordCharacters = Array.from(this.word);
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
		},
	},

	data() {
		return {
			/**
			 * Whether each character box is visible
			 */
			displayed: Array(5).fill(false),
		};
	},

	methods: {
		/**
		 * Shake the row to indicate the guess is not valid
		 */
		indicateError() {
			this.$el.animate(
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
		},

		/**
		 * Animate the row in
		 */
		present() {
			for (let i = 0; i < 5; i++) {
				setTimeout(() => (this.displayed[i] = true), i * 100);
			}
		},

		/**
		 * Reset animation properties of the row
		 */
		resetPresentation() {
			for (let i = 0; i < 5; i++) {
				this.displayed[i] = false;
			}
		},
	},

	mounted() {
		if (this.presentOnMount) {
			this.present();
		}
	},
};
</script>
<style scoped lang="postcss">
li {
	@apply block text-theme block flex gap-4 mb-4 justify-center;
}
span {
	@apply inline-block w-12 h-12 border-2 text-theme text-2xl text-center leading-11 rounded;
}
</style>
