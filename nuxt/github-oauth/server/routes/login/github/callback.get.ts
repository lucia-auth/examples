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
		const githubUser = await $fetch<GitHubUser>("https://api.github.com/user", {
			headers: {
				Authorization: `Bearer ${tokens.accessToken}`
			}
		});
		let user = db.prepare("SELECT * FROM user WHERE github_id = ?").get(githubUser.id) as
			| DatabaseUser
			| undefined;

		if (!user) {
			const userId = generateId(15);
			db.prepare("INSERT INTO user (id, github_id, username) VALUES (?, ?, ?)").run(
				userId,
				githubUser.id,
				githubUser.login
			);

			user = {
				id: userId,
				username: githubUser.login,
				github_id: Number(githubUser.id),
			};
		}

		const session = await lucia.createSession(user.id, {});
		setLuciaCookie(event, lucia.createSessionCookie(session.id));
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
