<template>
	<li class="flex-grow">
		<p class="text-2xl text-center">{{ number }}</p>
		<p class="text-center text-xs">{{ subject }}</p>
	</li>
</template>

<script setup lang="ts">
defineProps<{
	/**
	 * The stat's value
	 */
	number: number;

	/**
	 * What the stat's value is for (e.g. 'Games won')
	 */
	subject: string;
}>();
</script>
