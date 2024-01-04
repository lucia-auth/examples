import { github, lucia } from "@/lib/auth";
import { OAuth2RequestError } from "arctic";
import { db } from "@/lib/db";
import { generateId } from "lucia";

import type { NextApiRequest, NextApiResponse } from "next";
import type { DatabaseUser } from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== "GET") {
		res.status(404).end();
		return;
	}
	const code = req.query.code?.toString() ?? null;
	const state = req.query.state?.toString() ?? null;
	const storedState = req.cookies.github_oauth_state ?? null;
	if (!code || !state || !storedState || state !== storedState) {
		console.log(code, state, storedState);
		res.status(400).end();
		return;
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
			return res
				.appendHeader("Set-Cookie", lucia.createSessionCookie(session.id).serialize())
				.redirect("/");
		}

		const userId = generateId(15);
		db.prepare("INSERT INTO user (id, github_id, username) VALUES (?, ?, ?)").run(
			userId,
			githubUser.id,
			githubUser.login
		);
		const session = await lucia.createSession(userId, {});
		return res
			.appendHeader("Set-Cookie", lucia.createSessionCookie(session.id).serialize())
			.redirect("/");
	} catch (e) {
		if (e instanceof OAuth2RequestError && e.message === "bad_verification_code") {
			// invalid code
			res.status(400).end();
			return;
		}
		res.status(500).end();
		return;
	}
}

interface GitHubUser {
	id: string;
	login: string;
}
