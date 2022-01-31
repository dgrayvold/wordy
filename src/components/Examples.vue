<template>
	<main
		class="
			min-h-400px
			max-w-600px
			bg-blue-200
			mx-auto
			my-16
			px-16
			py-8
			rounded
			text-center
		"
	>
		<h1 class="text-center text-3xl pb-8">Hello world</h1>
		<output>Count: {{ count }} </output>
	</main>
</template>

<script>
export default {
	data() {
		this.$store.commit('increment');
		return {
			count: this.$store.state.count,
		};
	},
};
</script>
