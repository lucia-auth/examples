export default defineNuxtRouteMiddleware(async () => {
	const user = useUser();
	const { data } = await useFetch("/api/user");
	if (data.value) {
		user.value = data.value;
	}
});
