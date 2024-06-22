import fs from "fs/promises";
import { githubLoginRouter } from "./github.js";
import { Hono } from "hono";

import type { Context } from "../../lib/context.js";

export const loginRouter = new Hono<Context>();

loginRouter.route("/", githubLoginRouter);

loginRouter.get("/login", async (c) => {
	const session = c.get("session");
	if (session) {
		return c.redirect("/");
	}
	const htmlFile = await fs.readFile("routes/login/index.html");
	return c.html(htmlFile.toString(), 200);
});
