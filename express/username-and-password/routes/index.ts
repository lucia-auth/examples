import express from "express";
import { renderHTMLTemplate } from "../lib/html.js";

export const mainRouter = express.Router();

mainRouter.get("/", async (_, res) => {
	if (!res.locals.user) {
		return res.redirect("/login");
	}
	const html = await renderHTMLTemplate("routes/index.template.html", {
		username: res.locals.user.username,
		user_id: res.locals.user.id
	});
	return res.setHeader("Content-Type", "text/html").status(200).send(html);
});
