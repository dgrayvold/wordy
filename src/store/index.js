import { createStore } from 'vuex';

export const store = createStore({
	state() {
		return {
			record: [],
			currentStreak: 0,
			bestStreak: 0,
			onHighStreak: false,
		};
	},

	mutations: {
		saveGameRecord(state, gameDetails) {
			if (gameDetails.won) {
				state.currentStreak++;

				if (state.currentStreak > state.bestStreak) {
					state.bestStreak = state.currentStreak;
					state.onHighStreak = true;
				}
			} else {
				state.currentStreak = 0;
				state.onHighStreak = false;
			}

			state.record.push(gameDetails);
		},
	},

	getters: {
		stats: state => {
			return {
				bestStreak: state.bestStreak,
				currentStreak: state.currentStreak,
				onHighStreak: state.onHighStreak,
				distribution: state.record.reduce(
					(result, current) => {
						if (current.won) {
							result[current.guesses]++;
						}

						return result;
					},
					{ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
				),
				gamesWon: state.record.filter(game => game.won).length,
				gamesPlayed: state.record.length,
			};
		},
	},
});
