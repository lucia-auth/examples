import { createMiddleware} from "@solidjs/start/middleware";
import { Session, User, verifyRequestOrigin } from "lucia";
import { lucia } from "./lib/auth";
import { appendHeader, getCookie, getHeader } from "vinxi/http";
import { FetchEvent } from "@solidjs/start/server";

export default createMiddleware({
	onRequest: [ async (event: FetchEvent) => {
		if (event.request.method !== "GET") {
			const originHeader = getHeader("Origin") ?? null;
			const hostHeader = getHeader( "Host") ?? null;
			if (!originHeader || !hostHeader || !verifyRequestOrigin(originHeader, [hostHeader])) {
				event.response.status = 403;
				return;
			}
		}

		const sessionId = getCookie(lucia.sessionCookieName) ?? null;
		if (!sessionId) {
			event.locals.session = null;
			event.locals.user = null;
			return;
		}

		const { session, user } = await lucia.validateSession(sessionId);
		if (session && session.fresh) {
			appendHeader("Set-Cookie", lucia.createSessionCookie(session.id).serialize());
		}
		if (!session) {
			appendHeader("Set-Cookie", lucia.createBlankSessionCookie().serialize());
		}
		event.locals.session = session;
		event.locals.user = user;
	}]
});

declare module "@solidjs/start/server" {
	interface RequestEventLocals {
		user: User | null;
		session: Session | null;
	}
}
