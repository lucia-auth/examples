import { db } from "@/lib/db";
import { verify } from "@node-rs/argon2";
import { lucia } from "@/lib/auth";

import type { NextApiRequest, NextApiResponse } from "next";
import type { DatabaseUser } from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== "POST") {
		res.status(404).end();
		return;
	}

	const body: null | Partial<{ username: string; password: string }> = req.body;
	const username = body?.username;
	if (!username || username.length < 3 || username.length > 31 || !/^[a-z0-9_-]+$/.test(username)) {
		res.status(400).json({
			error: "Invalid username"
		});
		return;
	}
	const password = body?.password;
	if (!password || password.length < 6 || password.length > 255) {
		res.status(400).json({
			error: "Invalid password"
		});
		return;
	}

	const existingUser = db.prepare("SELECT * FROM user WHERE username = ?").get(username) as
		| DatabaseUser
		| undefined;
	if (!existingUser) {
		res.status(400).json({
			error: "Incorrect username or password"
		});
		return;
	}

	const validPassword = await verify(existingUser.password_hash, password, {
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1
	});
	if (!validPassword) {
		// NOTE:
		// Returning immediately allows malicious actors to figure out valid usernames from response times,
		// allowing them to only focus on guessing passwords in brute-force attacks.
		// As a preventive measure, you may want to hash passwords even for invalid usernames.
		// However, valid usernames can be already be revealed with the signup page among other methods.
		// It will also be much more resource intensive.
		// Since protecting against this is non-trivial,
		// it is crucial your implementation is protected against brute-force attacks with login throttling, 2FA, etc.
		// If usernames are public, you can outright tell the user that the username is invalid.
		res.status(400).json({
			error: "Incorrect username or password"
		});
		return;
	}

	const session = await lucia.createSession(existingUser.id, {});
	res
		.appendHeader("Set-Cookie", lucia.createSessionCookie(session.id).serialize())
		.status(200)
		.end();
}
