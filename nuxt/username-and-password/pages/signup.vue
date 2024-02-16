<script lang="ts" setup>
const error = ref<string | null>(null);

async function signup(e: Event) {
	try {
		await $fetch("/api/signup", {
			method: "POST",
			body: new FormData(e.target as HTMLFormElement)
		});
		await navigateTo("/");
	} catch (err) {
		error.value = err.data?.message ?? null;
	}
}
</script>

<template>
	<h1>Create an account</h1>
	<form method="post" action="/api/login" @submit.prevent="signup">
		<label htmlFor="username">Username</label>
		<input name="username" id="username" />
		<br />
		<label htmlFor="password">Password</label>
		<input type="password" name="password" id="password" />
		<br />
		<button>Continue</button>
		<p>{{ error }}</p>
	</form>
	<NuxtLink to="/login">Sign in</NuxtLink>
</template>
