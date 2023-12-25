import { cache, redirect } from "@solidjs/router";
import { getRequestEvent } from "solid-js/web";

export const getAuthenticatedUser = cache(async () => {
	"use server";
	const event = getRequestEvent()!;
	if (!event.context.user) {
		throw redirect("/login");
	}
	return event.context.user;
}, "user");
