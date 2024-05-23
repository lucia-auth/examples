import { authentik, lucia } from "@/lib/auth";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { OAuth2RequestError, type AuthentikTokens } from "arctic";
import { generateId } from "lucia";

import type { DatabaseUser } from "@/lib/db";

export async function GET(request: Request): Promise<Response> {
	const url = new URL(request.url);
	const code = url.searchParams.get("code");
	const state = url.searchParams.get("state");

	const storedState = cookies().get("authentik_oauth_state")?.value ?? null;
	const storedCodeVerifier = cookies().get("code_verifier")?.value as string;

	if (!code || !state || !storedState || state !== storedState) {
		return new Response(null, {
			status: 400
		});
	}

	try {
		const tokens: AuthentikTokens = await authentik.validateAuthorizationCode(code, storedCodeVerifier);

		// Fetch user from Authentik
		const authentikUserResponse = await fetch(`${process.env.AUTHENTIK_REALM_URL!}/application/o/userinfo/`, {
			headers: {
				Authorization: `Bearer ${tokens.accessToken}`
			}
		});

		const authentikUser: AuthentikUser = await authentikUserResponse.json();
		const existingUser = db.prepare("SELECT * FROM user WHERE authentik_id = ?").get(authentikUser.sub) as
			| DatabaseUser
			| undefined;

		if (existingUser) {
			const session = await lucia.createSession(existingUser.id, {});
			const sessionCookie = lucia.createSessionCookie(session.id);
			cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
			return new Response(null, {
				status: 302,
				headers: {
					Location: "/"
				}
			});
		}

		const userId = generateId(15);
		db.prepare("INSERT INTO user (id, authentik_id, username) VALUES (?, ?, ?)").run(
			userId,
			authentikUser.sub,
			authentikUser.preferred_username
		);
		const session = await lucia.createSession(userId, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
		return new Response(null, {
			status: 302,
			headers: {
				Location: "/"
			}
		});
	} catch (e) {
		console.log({e})
		if (e instanceof OAuth2RequestError && e.message === "bad_verification_code") {
			// invalid code
			return new Response(null, {
				status: 400
			});
		}
		return new Response(null, {
			status: 500
		});
	}
}

interface AuthentikUser {
	sub: string;
	preferred_username: string;
}

