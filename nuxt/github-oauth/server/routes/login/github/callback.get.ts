import { OAuth2RequestError } from "arctic";
import { generateId } from "lucia";

export default defineEventHandler(async (event) => {
	const query = getQuery(event);
	const code = query.code?.toString() ?? null;
	const state = query.state?.toString() ?? null;
	const storedState = getCookie(event, "github_oauth_state") ?? null;
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
			appendHeader(event, "Set-Cookie", lucia.createSessionCookie(session.id).serialize());
			return sendRedirect(event, "/");
		}

		const userId = generateId(15);
		db.prepare("INSERT INTO user (id, github_id, username) VALUES (?, ?, ?)").run(
			userId,
			githubUser.id,
			githubUser.login
		);
		const session = await lucia.createSession(userId, {});
		appendHeader(event, "Set-Cookie", lucia.createSessionCookie(session.id).serialize());
		return sendRedirect(event, "/");
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
});

interface GitHubUser {
	id: string;
	login: string;
}
