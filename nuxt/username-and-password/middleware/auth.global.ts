export default defineNuxtRouteMiddleware(async () => {
	const user = useUser();
	user.value = await $fetch("/api/user");
});
