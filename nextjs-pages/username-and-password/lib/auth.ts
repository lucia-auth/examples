import { Lucia } from "lucia";
import { BetterSqlite3Adapter } from "@lucia-auth/adapter-sqlite";
import { db } from "./db";
import { webcrypto } from "crypto";

import type { Session, User } from "lucia";
import type { IncomingMessage, ServerResponse } from "http";
import type { DatabaseUser } from "./db";

globalThis.crypto = webcrypto as Crypto;

const adapter = new BetterSqlite3Adapter(db, {
	user: "user",
	session: "session"
});

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			secure: process.env.NODE_ENV === "production"
		}
	},
	getUserAttributes: (attributes) => {
		return {
			username: attributes.username
		};
	}
});

declare module "lucia" {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: Omit<DatabaseUser, "id">;
	}
}

export async function validateRequest(
	req: IncomingMessage,
	res: ServerResponse
): Promise<{ user: User; session: Session } | { user: null; session: null }> {
	const sessionId = lucia.readSessionCookie(req.headers.cookie ?? "");
	if (!sessionId) {
		return {
			user: null,
			session: null
		};
	}
	const result = await lucia.validateSession(sessionId);
	if (result.session && result.session.fresh) {
		res.appendHeader("Set-Cookie", lucia.createSessionCookie(result.session.id).serialize());
	}
	if (!result.session) {
		res.appendHeader("Set-Cookie", lucia.createBlankSessionCookie().serialize());
	}
	return result;
}
