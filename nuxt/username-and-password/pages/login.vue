<script lang="ts" setup>
const error = ref<string | null>(null);

async function login(e: Event) {
	if (!(e.target instanceof HTMLFormElement)) return;
	const result = await useFetch("/api/login", {
		method: "POST",
		body: new FormData(e.target)
	});
	if (result.error.value) {
		error.value = result.error.value.data?.message ?? null;
	} else {
		await navigateTo("/");
	}
}
</script>

<template>
	<h1>Sign in</h1>
	<form method="post" action="/api/login" @submit.prevent="login">
		<label htmlFor="username">Username</label>
		<input name="username" id="username" />
		<br />
		<label htmlFor="password">Password</label>
		<input type="password" name="password" id="password" />
		<br />
		<button>Continue</button>
		<p>{{ error }}</p>
	</form>
	<NuxtLink to="/signup">Create an account</NuxtLink>
</template>
