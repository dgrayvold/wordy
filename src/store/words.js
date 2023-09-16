import { reactive } from 'vue';
import { defineStore } from 'pinia';

export const useWords = defineStore('wordy-words', () => {
	const words = reactive([]);

	return { words };
});
