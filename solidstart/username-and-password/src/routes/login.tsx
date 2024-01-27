import { action, redirect, useSubmission } from "@solidjs/router";
import { Argon2id } from "oslo/password";
import { Show, getRequestEvent } from "solid-js/web";
import { appendHeader } from "@solidjs/start/server";
import { lucia } from "~/lib/auth";
import { db } from "~/lib/db";

import type { DatabaseUser } from "~/lib/db";

export default function Index() {
	const submission = useSubmission(login);
	return (
		<>
			<h1>Sign in</h1>
			<form method="post" action={login}>
				<label for="username">Username</label>
				<input name="username" id="username" />
				<br />
				<label for="password">Password</label>
				<input type="password" name="password" id="password" />
				<br />
				<button>Continue</button>
				<Show when={submission.result}>{(result) => <p>{result().message}</p>}</Show>
			</form>
			<a href="/signup">Create an account</a>
		</>
	);
}

const login = action(async (formData: FormData) => {
	"use server";
	const username = formData.get("username");
	if (
		typeof username !== "string" ||
		username.length < 3 ||
		username.length > 31 ||
		!/^[a-z0-9_-]+$/.test(username)
	) {
		return new Error("Invalid username");
	}
	const password = formData.get("password");
	if (typeof password !== "string" || password.length < 6 || password.length > 255) {
		return new Error("Invalid password");
	}

	const existingUser = db.prepare("SELECT * FROM user WHERE username = ?").get(username) as
		| DatabaseUser
		| undefined;
	if (!existingUser) {
		return new Error("Incorrect username or password");
	}

	const validPassword = await new Argon2id().verify(existingUser.password, password);
	if (!validPassword) {
		return new Error("Incorrect username or password");
	}

	const session = await lucia.createSession(existingUser.id, {});
	const event = getRequestEvent()!;
	appendHeader(event, "Set-Cookie", lucia.createSessionCookie(session.id).serialize());
	throw redirect("/");
});
