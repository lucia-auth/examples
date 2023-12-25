export default defineNuxtRouteMiddleware(async () => {
	const user = useUser();
	// It has been in nuxt for a while but not documented ?
	// You could use bare `$fetch`, but the main issue is that it would not use
	// client headers for local request (nitro side), so the middleware
	// wont see session cookie even though it was there, but not sent.
	// `useRequestFetch` fixes it by using normal `$fetch` on client side
	// and nitro's own `$fetch` will will inherit headers from current event
	// and so cookies as well
	const fetch = useRequestFetch();
	const data = await fetch('/api/user')
		.catch(() => {
			throw createError("Failed to fetch data")
		})
	user.value = data.user ?? null;
});
