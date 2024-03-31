import { Hono } from "hono";
import { renderHTMLTemplate } from "../lib/html.js";
import { db } from "../lib/db.js";
import { Argon2id } from "oslo/password";
import { lucia } from "../lib/auth.js";

import type { DatabaseUser } from "../lib/db.js";
import type { Context } from "../lib/context.js";

export const loginRouter = new Hono<Context>();

loginRouter.get("/login", async (c) => {
  const session = c.get("session")
	if (session) {
		return c.redirect("/");
	}
	const html = await renderPage();
  return new Response(html, { 
    headers: {
      "Content-Type": "text/html"
    } ,
    status: 200
  })
});

loginRouter.post("/login", async (c) => {
  const body = await c.req.parseBody<{
    username: string;
    password: string;
  }>()
	const username: string | null = body.username ?? null;
	if (!username || username.length < 3 || username.length > 31 || !/^[a-z0-9_-]+$/.test(username)) {
		const html = await renderPage({
			username_value: username ?? "",
			error: "Invalid password"
		});
    return new Response(html, { 
      headers: {
        "Content-Type": "text/html"
      } ,
      status: 200
    })
	}
	const password: string | null = body.password ?? null;
	if (!password || password.length < 6 || password.length > 255) {
		const html = await renderPage({
			username_value: username,
			error: "Invalid password"
		});
    return new Response(html, { 
      headers: {
        "Content-Type": "text/html"
      } ,
      status: 200
    })
	}

	const existingUser = db.prepare("SELECT * FROM user WHERE username = ?").get(username) as
		| DatabaseUser
		| undefined;
	if (!existingUser) {
		const html = await renderPage({
			username_value: username,
			error: "Incorrect username or password"
		});
    return new Response(html, { 
      headers: {
        "Content-Type": "text/html"
      } ,
      status: 200
    })
	}

	const validPassword = await new Argon2id().verify(existingUser.password, password);
	if (!validPassword) {
		const html = await renderPage({
			username_value: username,
			error: "Incorrect username or password"
		});
    return new Response(html, { 
      headers: {
        "Content-Type": "text/html"
      } ,
      status: 200
    })
	}

	const session = await lucia.createSession(existingUser.id, {});
	c.header("Set-Cookie", lucia.createSessionCookie(session.id).serialize(), { append: true })
  c.header("Location", "/", { append: true })
  return c.redirect("/");
});

async function renderPage(args?: { username_value?: string; error?: string }): Promise<string> {
	return await renderHTMLTemplate("routes/login.template.html", {
		username_value: args?.username_value ?? "",
		error: args?.error ?? ""
	});
}
