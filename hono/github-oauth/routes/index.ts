import fs from "fs/promises";
import { Hono } from "hono";

import type { Context } from "../lib/context.js";

export const mainRouter = new Hono<Context>();

mainRouter.get("/", async (c) => {
	const user = c.get("user");
	if (!user) {
		return c.redirect("/login");
	}
	const templateFile = await fs.readFile("routes/index.template.html");
	let template = templateFile.toString("utf-8");
	template = template.replaceAll("%username%", user.username);
	template = template.replaceAll("%user_id%", user.id);
	return new Response(template, {
		headers: {
			"Content-Type": "text/html"
		},
		status: 200
	});
});
