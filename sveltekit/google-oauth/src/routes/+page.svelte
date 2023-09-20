<script lang="ts">
	import { enhance } from '$app/forms';

	import type { PageData } from './$types';

	export let data: PageData;
</script>

<h1>Profile</h1>
<p>User id: {data.userId}</p>
<p>Name: {data.name}</p>
<img src={data.image} alt={` ${data.name} Avatar Image `} />
<form method="post" action="?/logout" use:enhance>
	<input type="submit" value="Sign out" />
</form>
