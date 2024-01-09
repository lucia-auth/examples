<script lang="ts" setup>
definePageMeta({
	middleware: ["protected"]
});

const user = useAuthenticatedUser();

async function logout() {
	await $fetch("/api/logout", {
		method: "POST"
	});
	await navigateTo("/login");
}
</script>

<template>
	<h1>Hi, {{ user.username }}!</h1>
	<p>Your user ID is {{ user.id }}.</p>
	<form @submit.prevent="logout">
		<button>Sign out</button>
	</form>
</template>
