import { Hono } from "hono";
import { renderHTMLTemplate } from "../lib/html.js";

import type { Context } from "../lib/context.js";

export const mainRouter = new Hono<Context>();

mainRouter.get("/", async (c) => {
	const user = c.get("user");
	if (!user) {
		return c.redirect("/login");
	}
	const html = await renderHTMLTemplate("routes/index.template.html", {
		username: user.username,
		user_id: user.id
	});
	return c.html(html, 200);
});
