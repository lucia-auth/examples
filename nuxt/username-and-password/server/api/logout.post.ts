export default eventHandler(async (event) => {
	if (!event.context.session) {
		throw createError({
			statusCode: 403
		});
	}
	await lucia.invalidateSession(event.context.session.id);
	const cookie = lucia.createBlankSessionCookie();
	setCookie(event, cookie.name, cookie.value, cookie.attributes);
});
