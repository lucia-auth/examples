import express from "express";
import { renderHTMLTemplate } from "../lib/html.js";
import { db } from "../lib/db.js";
import { Argon2id } from "oslo/password";
import { lucia } from "../lib/auth.js";

import type { DatabaseUser } from "../lib/db.js";

export const loginRouter = express.Router();

loginRouter.get("/login", async (_, res) => {
	if (res.locals.session) {
		return res.redirect("/");
	}
	const html = await renderPage();
	return res.setHeader("Content-Type", "text/html").status(200).send(html);
});

loginRouter.post("/login", async (req, res) => {
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

	const existingUser = db.prepare("SELECT * FROM user WHERE username = ?").get(username) as
		| DatabaseUser
		| undefined;
	if (!existingUser) {
		const html = await renderPage({
			username_value: username,
			error: "Incorrect username or password"
		});
		return res.setHeader("Content-Type", "text/html").status(400).send(html);
	}

	const validPassword = await new Argon2id().verify(existingUser.password, password);
	if (!validPassword) {
		const html = await renderPage({
			username_value: username,
			error: "Incorrect username or password"
		});
		return res.setHeader("Content-Type", "text/html").status(400).send(html);
	}

	const session = await lucia.createSession(existingUser.id, {});
	res
		.appendHeader("Set-Cookie", lucia.createSessionCookie(session.id).serialize())
		.appendHeader("Location", "/")
		.redirect("/");
});

async function renderPage(args?: { username_value?: string; error?: string }): Promise<string> {
	return await renderHTMLTemplate("routes/login.template.html", {
		username_value: args?.username_value ?? "",
		error: args?.error ?? ""
	});
}
