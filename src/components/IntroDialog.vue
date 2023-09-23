<template>
	<Dialog :open="dialogActive" class="fixed inset-0 z-20">
		<DialogTitle class="hidden">WELCOME TO WORDY</DialogTitle>

		<DialogOverlay
			class="
				fixed
				w-full
				h-full
				inset-0
				bg-black bg-opacity-100
				backdrop-filter backdrop-blur-3px
				transition-opacity
				duration-700
			"
			:class="{
				'opacity-0': !dialogDisplayed,
			}"
		/>

		<div
			class="
				relative
				grid grid-flow-row
				justify-center
				content-center
				text-theme
				w-full
				h-full
				top-0
				transition-opacity
				duration-700
			"
			:class="{
				'opacity-0': !dialogDisplayed,
			}"
			tabindex="0"
		>
			<WordRow :word="title" :currentGuess="currentWord" :state="rowState" />
		</div>
	</Dialog>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Dialog, DialogOverlay, DialogTitle } from '@headlessui/vue';
import WordRow from '@/components/WordRow.vue';

// Used to animate the title into the word row
const currentWord = ref('');

const title = 'WORDY';

const rowState = ref<InstanceType<typeof WordRow>['$props']['state']>('active');

// Whether the dialog is physically present
const dialogActive = ref(true);

// Whether the dialog is visible
const dialogDisplayed = ref(true);

const emit = defineEmits(['complete']);

for (let x = 0; x < 5; x++) {
	setTimeout(() => (currentWord.value = title.slice(0, x + 1)), (x + 1) * 150 + 400);
}

onMounted(() => {
	setTimeout(() => (rowState.value = 'complete'), 2000);
	setTimeout(() => (dialogDisplayed.value = false), 4000);
	setTimeout(() => {
		dialogActive.value = false;
		emit('complete');
	}, 4700);
});
</script>
