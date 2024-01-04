<script lang="ts" setup>
definePageMeta({
	middleware: ["protected"]
});

const user = useAuthenticatedUser();

async function logout() {
	await useFetch("/api/logout", {
		method: "POST"
	});
	navigateTo("/login");
}
</script>

<template>
	<h1>Hi, {{ user.username }}!</h1>
	<p>Your user ID is {{ user.id }}.</p>
	<form @submit.prevent="logout">
		<button>Sign out</button>
	</form>
</template>
