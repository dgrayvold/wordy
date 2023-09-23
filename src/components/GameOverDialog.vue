<template>
	<Dialog :open="active" class="fixed inset-0 z-20">
		<DialogTitle class="invisible">Game over</DialogTitle>

		<DialogOverlay
			class="
				fixed
				w-full
				h-full
				inset-0
				bg-black bg-opacity-70
				backdrop-filter backdrop-blur-3px
			"
		/>

		<div
			class="
				dialog-measurements dialog-content
				flex flex-col
				justify-end
				border-2 border-theme
				rounded-xl
				bg-black
				text-light
				overflow-y-scroll
			"
		>
			<p class="text-3xl text-center">You {{ won ? 'won' : 'lost' }}!</p>

			<p class="text-xs text-center pt-4">The word was</p>
			<p v-show="active" class="text-3xl text-center flex-grow">
				{{ word }}
			</p>

			<ul class="flex pt-4">
				<Stat :number="gamesWon" subject="Games won" />
				<Stat :number="currentStreak" subject="Current streak" />
				<Stat :number="bestStreak" subject="Best streak" />
			</ul>

			<figure class="pt-8 pb-2">
				<div
					v-for="(count, guesses) in distribution"
					:key="guesses"
					class="grid grid-cols-[1.2rem_1fr] my-1"
				>
					<span> {{ guesses }}: </span>
					<span
						class="bg-theme min-w-5 pl-1 rounded"
						:style="`width: ${(count / gamesWon) * 100}%`"
					>
						{{ count }}
					</span>
				</div>
			</figure>

			<button @click="() => emit('reset')">Play again</button>
		</div>

		<div class="dialog-measurements pointer-events-none">
			<div class="block w-1 mx-auto">
				<ConfettiExplosion
					v-if="active && currentStreak >= 3 && onHighStreak"
					:colors="[`#09f`, `#05f`, `#01f`, `#019`]"
				/>
			</div>
		</div>
	</Dialog>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useSaveData } from '@/store/save-data';
import Stat from '@/components/Stat.vue';
import { Dialog, DialogOverlay, DialogTitle } from '@headlessui/vue';
import ConfettiExplosion from 'vue-confetti-explosion';

withDefaults(
	defineProps<{
		word: string;
		active: boolean;
		won: boolean;
	}>(),
	{
		active: false,
		won: false,
	},
);

const { distribution, currentStreak, bestStreak, onHighStreak, gamesWon } = storeToRefs(
	useSaveData(),
);

const emit = defineEmits(['reset']);
</script>

<style scoped lang="postcss">
@media screen and (max-height: 550px) {
	.dialog-content {
		display: block;
	}
}

button {
	@apply w-full px-2 py-1 mt-4 border-2 border-theme rounded transition-colors;
	@apply hover:(bg-theme text-black) focus:(bg-theme text-black outline-none);
}

.dialog-measurements {
	@apply absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 w-92 h-124 max-h-full p-4;
}
</style>
