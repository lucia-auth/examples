import { verifyRequestOrigin, type Cookie } from "lucia";

import type { User, Session } from "lucia";

export default defineEventHandler(async (event) => {
	if (!isMethod(event, 'GET')) {
		const originHeader = getHeader(event, "Origin") ?? null;
		const hostHeader = getHeader(event, "Host") ?? null;
		if (!originHeader || !hostHeader || !verifyRequestOrigin(originHeader, [hostHeader])) {
			setResponseStatus(event, 403)

			return;
		}
	}

	const sessionId = getCookie(event, lucia.sessionCookieName) ?? null;
	if (!sessionId) {
		event.context.session = null;
		event.context.user = null;
		return;
	}

	const { session, user } = await lucia.validateSession(sessionId);
	let cookie: Cookie | undefined

	if (!session) {
		cookie = lucia.createBlankSessionCookie();
	} else if (session.fresh) {
		cookie = lucia.createSessionCookie(session.id);
	}

	if (cookie) {
		setCookie(event, cookie.name, cookie.value, cookie.attributes);
	}

	event.context.session = session;
	event.context.user = user;
});

declare module "h3" {
	interface H3EventContext {
		user: User | null;
		session: Session | null;
	}
}
