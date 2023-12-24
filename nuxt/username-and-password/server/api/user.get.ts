export default defineEventHandler((event) => {
	return {
		user: event.context.user
	};
});
