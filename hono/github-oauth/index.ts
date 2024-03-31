import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { verifyRequestOrigin } from "lucia";
import { lucia } from "./lib/auth.js";

import { mainRouter } from "./routes/index.js";
import { logoutRouter } from "./routes/logout.js";
import { loginRouter } from "./routes/login/index.js";

import type { Context } from "./lib/context.js";

const app = new Hono<Context>();

app.use("*", async (c, next) => {
	if (c.req.method === "GET") {
		return next();
	}
	const originHeader = c.req.header("origin") ?? null;
	const hostHeader = c.req.header("host") ?? null;
	if (!originHeader || !hostHeader || !verifyRequestOrigin(originHeader, [hostHeader])) {
		return new Response(null, { status: 400 });
	}
	return next();
});

app.use("*", async (c, next) => {
	const sessionId = lucia.readSessionCookie(c.req.header("cookie") ?? "");
	if (!sessionId) {
		c.set("user", null);
		c.set("session", null);
		return next();
	}

	const { session, user } = await lucia.validateSession(sessionId);
	if (session && session.fresh) {
		c.header("Set-Cookie", lucia.createSessionCookie(session.id).serialize(), { append: true });
	}
	if (!session) {
		c.header("Set-Cookie", lucia.createBlankSessionCookie().serialize(), { append: true });
	}
	c.set("user", user);
	c.set("session", session);
	return next();
});

app.route("/", mainRouter).route("/", loginRouter).route("/", logoutRouter);

serve(
	{
		fetch: app.fetch,
		port: 3000
	},
);

console.log("Server running on port 3000");
