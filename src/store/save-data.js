import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

export const useSaveData = defineStore(
	'wordy-save-data',
	() => {
		// The list of previous games and their results
		const record = ref([]);

		// How many games have been won in a row
		const currentStreak = ref(0);

		// The greatest win streak the player has made
		const bestStreak = ref(0);

		// Whether the current streak is the highest streak
		const onHighStreak = ref(false);

		// The number of wins per number of guesses
		const distribution = computed(() =>
			record.value.reduce(
				(result, current) => {
					if (current.won) {
						result[current.guesses]++;
					}

					return result;
				},
				{ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
			),
		);

		// How many games out of all played so far were won
		const gamesWon = computed(() => record.value.filter(game => game.won).length);

		/**
		 * Migrate save data from an old saveData localStorage key
		 *
		 * @param {String} dataString The JSON save data from localStorage
		 */
		function migrateOldSaveData(dataString) {
			const data = JSON.parse(dataString);

			record.value = data.record;
			currentStreak.value = data.currentStreak;
			bestStreak.value = data.bestStreak;
			onHighStreak.value = data.onHighStreak;
		}

		/**
		 * Save a game's record into the store
		 *
		 * @param {Object} gameDetails The played game's details
		 * @param {Boolean} gameDetails.won Whether the game was won
		 * @param {Number} gameDetails.guesses The number of guesses used
		 * @param {String} gameDetails.word The word to guess
		 */
		function saveGameRecord(gameDetails) {
			if (gameDetails.won) {
				currentStreak.value++;

				if (currentStreak.value > bestStreak.value) {
					bestStreak.value = currentStreak.value;
					onHighStreak.value = true;
				}
			} else {
				currentStreak.value = 0;
				onHighStreak.value = false;
			}

			record.value.push(gameDetails);
		}

		return {
			record,
			distribution,
			currentStreak,
			bestStreak,
			onHighStreak,
			gamesWon,
			migrateOldSaveData,
			saveGameRecord,
		};
	},
	{
		persist: {
			key: 'wordy-save-data',
		},
	},
);
