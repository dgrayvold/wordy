import { computed, toRefs } from 'vue';
import { defineStore } from 'pinia';
import { useStorage } from '@vueuse/core';
import { GameRecord } from '@/types';

export const useSaveData = defineStore('wordy-save-data', () => {
	const state = useStorage('wordy-save-data', {
		// The list of previous games and their results
		record: [] as GameRecord[],

		// How many games have been won in a row
		currentStreak: 0,

		// The greatest win streak the player has made
		bestStreak: 0,

		// Whether the current streak is the highest streak
		onHighStreak: false,
	});

	const { record, currentStreak, bestStreak, onHighStreak } = toRefs(state.value);

	// The number of wins per number of guesses
	const distribution = computed(() =>
		record.value.reduce(
			(result: { [key: number]: number }, current) => {
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
	function migrateOldSaveData(dataString: string) {
		const data = JSON.parse(dataString);

		record.value = data.record;
		currentStreak.value = data.currentStreak;
		bestStreak.value = data.bestStreak;
		onHighStreak.value = data.onHighStreak;
	}

	/**
	 * Save a game's record into the store
	 *
	 * @param {GameRecord} gameDetails The played game's details
	 */
	function saveGameRecord(gameDetails: GameRecord) {
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
});
