<template>
	<main class="flex flex-col justify-center items-between max-h-full">
		<ul class="max-w-[90vw] mx-auto grid grid-flow-row pt-4 flex-grow content-center">
			<WordRow
				v-for="x in totalTries"
				:ref="el => (rows[x - 1] = el)"
				:key="x"
				:word="currentWord ?? ``"
				:currentGuess="guesses[Number(x) - 1]"
				:presentOnMount="false"
				:state="calculateRowState(x - 1)"
			/>
		</ul>

		<SimpleKeyboard @keypress="updateCurrentGuess" :characters="characters" :loaded="loaded" />
	</main>

	<client-only>
		<IntroDialog @complete="presentGame" />

		<GameOverDialog :active="gameOver" :won="gameWon" :word="currentWord" @reset="resetGame" />
	</client-only>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import WordRow from '@/components/WordRow.vue';
import SimpleKeyboard from '@/components/SimpleKeyboard.vue';
import GameOverDialog from '@/components/GameOverDialog.vue';
import IntroDialog from '@/components/IntroDialog.vue';
import { useSaveData } from '@/store/save-data.js';
import { useWords } from '@/store/words.js';

const { saveGameRecord } = useSaveData();

const { words } = useWords();

/**
 * The total number of tries the user gets
 */
const totalTries = 6;

/**
 * Which guess in the list is currently active
 */
const activeGuess = computed(() => {
	return guesses.value[activeGuessIndex.value];
});

/**
 * The index of the current guess
 */
const activeGuessIndex = ref(0);

/**
 * The list of characters guessed
 */
const characters = reactive({
	appeared: [], // In the word but not in the correct position
	missed: [], // Not in the word
	matched: [], // In the word in the correct position
});

/**
 * The word for the current round
 */
const currentWord = ref(null);

/**
 * Whether the game has finished
 */
const gameOver = ref(false);

/**
 * Whether the current game was won
 */
const gameWon = ref(null);

/**
 * The list of guesses the user has made
 */
const guesses = ref(Array(6).fill(''));

/**
 * Whether the game is ready to present
 */
const loaded = ref(false);

/**
 * The list of word row refs
 */
const rows = reactive([]);

onMounted(async () => {
	const randomPosition = Math.floor(Math.random() * words.length);

	currentWord.value = words[randomPosition];

	// Listen for physical keyboard presses
	window.addEventListener('keydown', handleKeyboardAction);
});

/**
 * Generate the state value of each word row
 *
 * @param {Number} rowIndex The index of the row to calculate the state of
 */
function calculateRowState(rowIndex) {
	if (
		activeGuessIndex.value > rowIndex ||
		(gameOver.value && activeGuessIndex.value >= rowIndex)
	) {
		return 'complete';
	} else if (activeGuessIndex.value == rowIndex) {
		return 'active';
	}

	return 'inactive';
}

/**
 * Set game state based on the latest word guess
 */
function checkGuess() {
	// Current guess is not a recognized word
	if (!words.includes(activeGuess.value)) {
		rows[activeGuessIndex.value].indicateError();
		return;
	}

	// Current guess is a word
	const wordCharacters = Array.from(currentWord.value);

	Array.from(activeGuess.value).forEach((character, index) => {
		if (wordCharacters[index] == character && !characters.matched.includes(character)) {
			characters.matched.push(character);
		} else if (wordCharacters.includes(character) && !characters.appeared.includes(character)) {
			characters.appeared.push(character);
		} else if (!wordCharacters.includes(character) && !characters.missed.includes(character)) {
			characters.missed.push(character);
		}
	});

	// Word guessed
	if (currentWord.value == activeGuess.value) {
		gameWon.value = true;
		gameOver.value = true;

		storeGameRecord();

		return;
	}

	activeGuessIndex.value++;

	// Total guesses spent, game over
	if (activeGuessIndex.value == totalTries) {
		gameWon.value = false;
		gameOver.value = true;

		storeGameRecord();

		return;
	}
}

/**
 * Handle physical keyboard events
 *
 * @param {Event} event The triggering event
 */
function handleKeyboardAction(event) {
	const { altKey, ctrlKey, shiftKey, metaKey } = event;

	if (!loaded.value) {
		return;
	}

	if ([altKey, ctrlKey, shiftKey, metaKey].includes(true)) {
		return;
	}
	if (gameOver.value) {
		return;
	}
	if (['Tab', 'Space'].includes(event.code)) {
		return;
	}

	event.stopPropagation();
	event.preventDefault();

	if (event.key.match(/^[a-z]$/i)) {
		updateCurrentGuess(event.key.toUpperCase());
	} else if (['Delete', 'Backspace'].includes(event.key)) {
		updateCurrentGuess('{Del}');
	} else if (activeGuess.value.length == 5 && ['Enter', 'Return'].includes(event.key)) {
		updateCurrentGuess('{Enter}');
	}
}

/**
 * Show the game UI when the intro is complete
 */
function presentGame() {
	for (let i = 0; i <= 5; i++) {
		setTimeout(() => rows[i].present(), i * 100);
	}

	setTimeout(() => (loaded.value = true), 600);
}

/**
 * Choose a new word and reset the game UI
 */
function resetGame() {
	for (let i = 0; i <= 5; i++) {
		rows[i].resetPresentation();
	}

	gameOver.value = false;
	gameWon.value = null;
	activeGuessIndex.value = 0;
	guesses.value = Array(6).fill('');

	Object.assign(characters, {
		appeared: [],
		missed: [],
		matched: [],
	});

	currentWord.value = words[Math.floor(Math.random() * words.length)];

	setTimeout(presentGame, 500);
}

/**
 * Store the result of a game
 */
function storeGameRecord() {
	saveGameRecord({
		won: gameWon.value,
		guesses: activeGuessIndex.value + (gameWon.value ? 1 : 0),
		word: currentWord.value,
	});
}

/**
 * Set the value of the current guess based on physical or on-screen
 * keyboard input
 *
 * @param {String} value The key or value (such as {Del}) to update with
 */
function updateCurrentGuess(value) {
	const currentValue = activeGuess.value;

	if (value == '{Del}') {
		if (currentValue.length > 0) {
			guesses.value[activeGuessIndex.value] = currentValue.slice(0, currentValue.length - 1);
		}
	} else if (currentValue.length == 5) {
		if (value != '{Enter}') {
			return;
		} else {
			checkGuess();
		}
	} else {
		guesses.value[activeGuessIndex.value] += value;
	}
}
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
