<template>
	<main class="flex flex-col justify-center items-between max-h-full">
		<ul
			class="
				max-w-[90vw]
				mx-auto
				grid grid-flow-row
				pt-4
				flex-grow
				content-center
			"
		>
			<WordRow
				v-for="x in totalTries"
				:ref="`row-${x}`"
				:key="x"
				:word="currentWord ?? ``"
				:currentGuess="guesses[Number(x) - 1]"
				:presentOnMount="false"
				:state="calculateRowState(x - 1)"
			/>
		</ul>

		<SimpleKeyboard
			@keypress="updateCurrentGuess"
			:characters="characters"
			:loaded="loaded"
		/>
	</main>

	<client-only>
		<IntroDialog @complete="presentGame" />

		<GameOverDialog
			:active="gameOver"
			:won="gameWon"
			:word="currentWord"
			@reset="resetGame"
		/>
	</client-only>
</template>

<script>
import WordRow from '@/components/WordRow.vue';
import SimpleKeyboard from '@/components/SimpleKeyboard.vue';
import GameOverDialog from '@/components/GameOverDialog.vue';
import IntroDialog from '@/components/IntroDialog.vue';

export default {
	components: {
		SimpleKeyboard,
		WordRow,
		GameOverDialog,
		IntroDialog,
	},

	data() {
		return {
			/**
			 * The word for the current round
			 */
			currentWord: null,

			/**
			 * The list of guesses the user has made
			 */
			guesses: Array(6).fill(''),

			/**
			 * The index of the current guess
			 */
			activeGuessIndex: 0,

			/**
			 * The total number of tries the user gets
			 */
			totalTries: 6,

			/**
			 * The list of possible words
			 */
			words: null,

			/**
			 * Whether the game has finished
			 */
			gameOver: false,

			/**
			 * Whether the current game was won
			 */
			gameWon: null,

			/**
			 * Whether the game is ready to present
			 */
			loaded: false,

			/**
			 * The list of characters guessed
			 */
			characters: {
				appeared: [], // In the word but not in the correct position
				missed: [], // Not in the word
				matched: [], // In the word in the correct position
			},
		};
	},

	computed: {
		/**
		 * Which guess in the list is currently active
		 */
		activeGuess() {
			return this.guesses[this.activeGuessIndex];
		},
	},

	async beforeCreate() {
		let saveData = null;

		if (typeof window != 'undefined') {
			saveData = localStorage.getItem('saveData');
		}

		if (saveData) {
			this.$store.replaceState(JSON.parse(saveData));
		}

		this.$store.subscribe(async mutation => {
			localStorage.setItem('saveData', JSON.stringify(this.$store.state));
		});
	},

	async mounted() {
		// Load the word list
		this.words = await fetch('/words.txt')
			.then(r => r.text())
			.then(content => content.split('\n'));
		const randomPosition = Math.floor(Math.random() * this.words.length);

		this.currentWord = this.words[randomPosition];

		// Listen for physical keyboard presses
		window.addEventListener('keydown', this.handleKeyboardAction);
	},

	methods: {
		/**
		 * Generate the state value of each word row
		 *
		 * @param {Number} rowIndex The index of the row to calculate the state of
		 */
		calculateRowState(rowIndex) {
			if (
				this.activeGuessIndex > rowIndex ||
				(this.gameOver && this.activeGuessIndex >= rowIndex)
			) {
				return 'complete';
			} else if (this.activeGuessIndex == rowIndex) {
				return 'active';
			}

			return 'inactive';
		},

		/**
		 * Set game state based on the latest word guess
		 */
		checkGuess() {
			// Current guess is not a recognized word
			if (!this.words.includes(this.activeGuess)) {
				this.$refs[`row-${this.activeGuessIndex + 1}`].indicateError();
				return;
			}

			// Current guess is a word

			const wordCharacters = Array.from(this.currentWord);

			Array.from(this.activeGuess).forEach(
				(character, index, allCharacters) => {
					if (
						wordCharacters[index] == character &&
						!this.characters.matched.includes(character)
					) {
						this.characters.matched.push(character);
					} else if (
						wordCharacters.includes(character) &&
						!this.characters.appeared.includes(character)
					) {
						this.characters.appeared.push(character);
					} else if (!this.characters.missed.includes(character)) {
						this.characters.missed.push(character);
					}
				},
			);

			// Word guessed
			if (this.currentWord == this.activeGuess) {
				this.gameWon = true;
				this.gameOver = true;

				this.storeGameRecord();

				return;
			}

			this.activeGuessIndex++;

			// Total guesses spent, game over
			if (this.activeGuessIndex == this.totalTries) {
				this.gameWon = false;
				this.gameOver = true;

				this.storeGameRecord();

				return;
			}
		},

		/**
		 * Handle physical keyboard events
		 *
		 * @param {Event} event The triggering event
		 */
		handleKeyboardAction(event) {
			const { altKey, ctrlKey, shiftKey, metaKey } = event;

			if (!this.loaded) {
				return;
			}

			if ([altKey, ctrlKey, shiftKey, metaKey].includes(true)) {
				return;
			}
			if (this.gameOver) {
				return;
			}
			if (['Tab', 'Space'].includes(event.code)) {
				return;
			}

			event.stopPropagation();
			event.preventDefault();

			if (event.key.match(/^[a-z]$/i)) {
				this.updateCurrentGuess(event.key.toUpperCase());
			} else if (['Delete', 'Backspace'].includes(event.key)) {
				this.updateCurrentGuess('{Del}');
			} else if (
				this.activeGuess.length == 5 &&
				['Enter', 'Return'].includes(event.key)
			) {
				this.updateCurrentGuess('{Enter}');
			}
		},

		/**
		 * Show the game UI when the intro is complete
		 */
		presentGame() {
			for (let i = 1; i <= 6; i++) {
				setTimeout(() => this.$refs[`row-${i}`].present(), i * 100);
			}

			setTimeout(() => (this.loaded = true), 600);
		},

		/**
		 * Choose a new word and reset the game UI
		 */
		resetGame() {
			for (let i = 1; i <= 6; i++) {
				this.$refs[`row-${i}`].resetPresentation();
			}

			this.gameOver = false;
			this.gameWon = null;
			this.activeGuessIndex = 0;
			this.guesses = Array(6).fill('');
			this.characters = {
				appeared: [],
				missed: [],
				matched: [],
			};
			this.currentWord =
				this.words[Math.floor(Math.random() * this.words.length)];

			setTimeout(this.presentGame, 500);
		},

		/**
		 * Store the result of a game
		 */
		storeGameRecord() {
			this.$store.commit('saveGameRecord', {
				won: this.gameWon,
				guesses: this.activeGuessIndex + (this.gameWon ? 1 : 0),
				word: this.currentWord,
			});
		},

		/**
		 * Set the value of the current guess based on physical or on-screen
		 * keyboard input
		 *
		 * @param {String} value The key or value (such as {Del}) to update with
		 */
		updateCurrentGuess(value) {
			const currentValue = this.activeGuess;

			if (value == '{Del}') {
				if (currentValue.length > 0) {
					this.guesses[this.activeGuessIndex] = currentValue.slice(
						0,
						currentValue.length - 1,
					);
				}
			} else if (currentValue.length == 5) {
				if (value != '{Enter}') {
					return;
				} else {
					this.checkGuess();
				}
			} else {
				this.guesses[this.activeGuessIndex] += value;
			}
		},
	},
};
</script>

<style scoped lang="postcss">
main {
	@apply bg-black w-full;

	height: 100vh;
	max-height: -webkit-fill-available;
	max-height: -moz-available;
	max-height: fill-available;

	padding-top: env(safe-area-inset-top);
	padding-left: env(safe-area-inset-left);
	padding-right: env(safe-area-inset-right);
	padding-bottom: env(safe-area-inset-bottom);
}

@media screen and (max-height: 550px) {
	main {
		display: block;
	}
}
</style>
