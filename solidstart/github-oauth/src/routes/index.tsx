import { action, createAsync, redirect } from "@solidjs/router";
import { getRequestEvent } from "solid-js/web";
import { appendHeader } from "@solidjs/start/server";
import { lucia } from "~/lib/auth";
import { getAuthenticatedUser } from "~/lib/utils";

export default function Index() {
	const user = createAsync(getAuthenticatedUser);
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
	if (!event.context.session) {
		return new Error("Unauthorized");
	}
	await lucia.invalidateSession(event.context.session.id);
	appendHeader(event, "Set-Cookie", lucia.createBlankSessionCookie().serialize());
	throw redirect("/login");
});
