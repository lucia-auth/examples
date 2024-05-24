import { createMiddleware } from "@solidjs/start/middleware";
import { getCookie, setCookie } from "vinxi/http";
import { lucia } from "./lib/auth";

export default createMiddleware({
	onRequest: async (e) => {
		const sessionId = getCookie(lucia.sessionCookieName);

		if (!sessionId) {
			return;
		}

		const { session, user } = await lucia.validateSession(sessionId);

		if (session?.fresh) {
			const cookie = lucia.createSessionCookie(session.id);

			setCookie(cookie.name, cookie.value, cookie.attributes);
		}

		if (!session) {
			const cookie = lucia.createBlankSessionCookie();

			setCookie(cookie.name, cookie.value, cookie.attributes);
		}

		e.locals.user = user;
		e.locals.session = session;
	}
});
