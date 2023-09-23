export interface GameRecord {
	// Whether the game was won
	won: boolean;

	// The number of guesses used
	guesses: number;

	// The word to guess
	word: string;
}
