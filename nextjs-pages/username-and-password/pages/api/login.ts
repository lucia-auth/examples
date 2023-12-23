import { db } from "@/lib/db";
import { Argon2id } from "oslo/password";
import { lucia } from "@/lib/auth";

import type { NextApiRequest, NextApiResponse } from "next";
import type { DatabaseUser } from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== "POST") {
		return res.status(404).end();
	}

	const body: null | Partial<{ username: string; password: string }> = req.body;
	const username = body?.username;
	if (!username || username.length < 3 || username.length > 31 || !/^[a-z0-9_-]+$/.test(username)) {
		return res.status(400).json({
			error: "Invalid username"
		});
	}
	const password = body?.password;
	if (!password || password.length < 6 || password.length > 255) {
		return res.status(400).json({
			error: "Invalid password"
		});
	}

	const existingUser = db.prepare("SELECT * FROM user WHERE username = ?").get(username) as
		| DatabaseUser
		| undefined;
	if (!existingUser) {
		return res.status(400).json({
			error: "Incorrect username or password"
		});
	}

	const validPassword = await new Argon2id().verify(existingUser.password, password);
	if (!validPassword) {
		return res.status(400).json({
			error: "Incorrect username or password"
		});
	}

	const session = await lucia.createSession(existingUser.id, {});
	res
		.appendHeader("Set-Cookie", lucia.createSessionCookie(session.id).serialize())
		.status(200)
		.end();
}
