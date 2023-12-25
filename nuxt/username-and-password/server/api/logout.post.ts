export default eventHandler(async (event) => {
	if (!event.context.session) {
		throw createError({
			statusCode: 403
		});
	}
	await lucia.invalidateSession(event.context.session.id);
	setLuciaCookie(event, lucia.createBlankSessionCookie());
});
