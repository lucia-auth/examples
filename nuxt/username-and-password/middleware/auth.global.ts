export default defineNuxtRouteMiddleware(async () => {
	const user = useUser();
	const fetch = useRequestFetch()
	user.value = await fetch("/api/user");
});
