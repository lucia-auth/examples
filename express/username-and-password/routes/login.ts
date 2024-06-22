import express from "express";
import { renderHTMLTemplate } from "../lib/html.js";
import { db } from "../lib/db.js";
import { verify } from "@node-rs/argon2";
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
