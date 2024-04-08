import { Hono } from "hono";
import { renderHTMLTemplate } from "../lib/html.js";
import { db } from "../lib/db.js";
import { Argon2id } from "oslo/password";
import { lucia } from "../lib/auth.js";
import { SqliteError } from "better-sqlite3";
import { generateId } from "lucia";

import type { Context } from "../lib/context.js";

export const signupRouter = new Hono<Context>();

signupRouter.get("/signup", async (c) => {
	const session = c.get("session");
	if (session) {
		return c.redirect("/");
	}
	const html = await renderPage();
	return c.text(html, 200, {
		"Content-Type": "text/html"
	});
});

signupRouter.post("/signup", async (c) => {
	const body = await c.req.parseBody<{
		username: string;
		password: string;
	}>();
	const username: string | null = body.username ?? null;
	if (!username || username.length < 3 || username.length > 31 || !/^[a-z0-9_-]+$/.test(username)) {
		const html = await renderPage({
			username_value: username ?? "",
			error: "Invalid password"
		});
		return c.text(html, 200, {
			"Content-Type": "text/html"
		});
	}
	const password: string | null = body.password ?? null;
	if (!password || password.length < 6 || password.length > 255) {
		const html = await renderPage({
			username_value: username,
			error: "Invalid password"
		});
		return c.text(html, 200, {
			"Content-Type": "text/html"
		});
	}

	const hashedPassword = await new Argon2id().hash(password);
	const userId = generateId(15);

	try {
		db.prepare("INSERT INTO user (id, username, password) VALUES(?, ?, ?)").run(
			userId,
			username,
			hashedPassword
		);

		const session = await lucia.createSession(userId, {});
		c.header("Set-Cookie", lucia.createSessionCookie(session.id).serialize(), { append: true });
		return c.redirect("/");
	} catch (e) {
		if (e instanceof SqliteError && e.code === "SQLITE_CONSTRAINT_UNIQUE") {
			const html = await renderPage({
				username_value: username,
				error: "Username already used"
			});
			return c.text(html, 200, {
				"Content-Type": "text/html"
			});
		}
		const html = await renderPage({
			username_value: username,
			error: "An unknown error occurred"
		});
		return c.text(html, 200, {
			"Content-Type": "text/html"
		});
	}
});

async function renderPage(args?: { username_value?: string; error?: string }): Promise<string> {
	return await renderHTMLTemplate("routes/signup.template.html", {
		username_value: args?.username_value ?? "",
		error: args?.error ?? ""
	});
}
