import { action, createAsync, redirect } from "@solidjs/router";
import { getRequestEvent } from "solid-js/web";
import { appendHeader } from "vinxi/http";
import { lucia } from "~/lib/auth";
import { getAuthenticatedUser } from "~/lib/utils";

export default function Index() {
	const user = createAsync(() => getAuthenticatedUser());
	return (
		<>
			<h1>Hi, {user()?.username}!</h1>
			<p>Your user ID is {user()?.id}.</p>
			<form method="post" action={logout}>
				<button>Sign out</button>
			</form>
		</>
	);
}

const logout = action(async () => {
	"use server";
	const event = getRequestEvent()!;
	if (!event.locals.session) {
		return new Error("Unauthorized");
	}
	await lucia.invalidateSession(event.locals.session.id);
	appendHeader("Set-Cookie", lucia.createBlankSessionCookie().serialize());
	throw redirect("/login");
});
