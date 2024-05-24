import { OAuth2RequestError } from "arctic";
import { generateId } from "lucia";
import { github, lucia } from "~/lib/auth";
import { db } from "~/lib/db";

import type { DatabaseUser } from "~/lib/db";
import { createError, getCookie, getQuery, setCookie } from "vinxi/http";

export async function GET() {
	const query = getQuery();
	const code = query.code?.toString() ?? null;
	const state = query.state?.toString() ?? null;
	const storedState = getCookie("github_oauth_state") ?? null;
	if (!code || !state || !storedState || state !== storedState) {
		throw createError({
			status: 400
		});
	}

	try {
		const tokens = await github.validateAuthorizationCode(code);
		const githubUserResponse = await fetch("https://api.github.com/user", {
			headers: {
				Authorization: `Bearer ${tokens.accessToken}`
			}
		});
		const githubUser: GitHubUser = await githubUserResponse.json();
		const existingUser = db.prepare("SELECT * FROM user WHERE github_id = ?").get(githubUser.id) as
			| DatabaseUser
			| undefined;

		if (existingUser) {
			const session = await lucia.createSession(existingUser.id, {});
			const cookie = lucia.createSessionCookie(session.id);

			setCookie(cookie.name, cookie.value, cookie.attributes);
		}

		const userId = generateId(15);
		db.prepare("INSERT INTO user (id, github_id, username) VALUES (?, ?, ?)").run(
			userId,
			githubUser.id,
			githubUser.login
		);
		const session = await lucia.createSession(userId, {});
		const cookie = lucia.createSessionCookie(session.id);

		setCookie(cookie.name, cookie.value, cookie.attributes);
		return Response.redirect("/");
	} catch (e) {
		if (e instanceof OAuth2RequestError && e.message === "bad_verification_code") {
			// invalid code
			throw createError({
				status: 400
			});
		}
		throw createError({
			status: 500
		});
	}
}
interface GitHubUser {
	id: string;
	login: string;
}
