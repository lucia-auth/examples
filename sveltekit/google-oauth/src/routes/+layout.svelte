<script lang="ts">
	import { page } from '$app/stores';

	import '../app.css';
</script>

<svelte:head>
	<title>Google OAuth with Lucia</title>
</svelte:head>

<pre>{$page.url.pathname}</pre>

<slot />
