import express from "express";
import { renderHTMLTemplate } from "../lib/html.js";
import { db } from "../lib/db.js";
import { hash } from "@node-rs/argon2";
import { lucia } from "../lib/auth.js";
import { SqliteError } from "better-sqlite3";
import { generateId } from "lucia";

export const signupRouter = express.Router();

signupRouter.get("/signup", async (_, res) => {
	if (res.locals.session) {
		return res.redirect("/");
	}
	const html = await renderPage();
	return res.setHeader("Content-Type", "text/html").status(200).send(html);
});

signupRouter.post("/signup", async (req, res) => {
	const username: string | null = req.body.username ?? null;
	if (!username || username.length < 3 || username.length > 31 || !/^[a-z0-9_-]+$/.test(username)) {
		const html = await renderPage({
			username_value: username ?? "",
			error: "Invalid password"
		});
		return res.setHeader("Content-Type", "text/html").status(400).send(html);
	}
	const password: string | null = req.body.password ?? null;
	if (!password || password.length < 6 || password.length > 255) {
		const html = await renderPage({
			username_value: username,
			error: "Invalid password"
		});
		return res.setHeader("Content-Type", "text/html").status(400).send(html);
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
		return res
			.appendHeader("Set-Cookie", lucia.createSessionCookie(session.id).serialize())
			.redirect("/");
	} catch (e) {
		if (e instanceof SqliteError && e.code === "SQLITE_CONSTRAINT_UNIQUE") {
			const html = await renderPage({
				username_value: username,
				error: "Username already used"
			});
			return res.setHeader("Content-Type", "text/html").status(400).send(html);
		}
		const html = await renderPage({
			username_value: username,
			error: "An unknown error occurred"
		});
		return res.setHeader("Content-Type", "text/html").status(500).send(html);
	}
});

async function renderPage(args?: { username_value?: string; error?: string }): Promise<string> {
	return await renderHTMLTemplate("routes/signup.template.html", {
		username_value: args?.username_value ?? "",
		error: args?.error ?? ""
	});
}
