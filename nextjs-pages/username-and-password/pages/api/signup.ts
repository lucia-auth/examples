import { lucia } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateId } from "lucia";
import { hash } from "@node-rs/argon2";
import { SqliteError } from "better-sqlite3";

import type { NextApiRequest, NextApiResponse } from "next";

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

	const passwordHash = await hash(password, {
		// recommended minimum parameters
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1
	});
	const userId = generateId(15);

	try {
		db.prepare("INSERT INTO user (id, username, password_hash) VALUES(?, ?, ?)").run(
			userId,
			username,
			passwordHash
		);

		const session = await lucia.createSession(userId, {});
		res
			.appendHeader("Set-Cookie", lucia.createSessionCookie(session.id).serialize())
			.status(200)
			.end();
		return;
	} catch (e) {
		if (e instanceof SqliteError && e.code === "SQLITE_CONSTRAINT_UNIQUE") {
			res.status(400).json({
				error: "Username already used"
			});
			return;
		}
		res.status(500).json({
			error: "An unknown error occurred"
		});
		return;
	}
}
