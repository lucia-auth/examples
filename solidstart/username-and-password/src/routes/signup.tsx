import { action, redirect, useSubmission } from "@solidjs/router";
import { generateId } from "lucia";
import { hash } from "@node-rs/argon2";
import { Show, getRequestEvent } from "solid-js/web";
import { appendHeader } from "@solidjs/start/server";
import { lucia } from "~/lib/auth";
import { db } from "~/lib/db";
import { SqliteError } from "better-sqlite3";

export default function Index() {
	const submission = useSubmission(signup);
	return (
		<>
			<h1>Create an account</h1>
			<form method="post" action={signup}>
				<label for="username">Username</label>
				<input name="username" id="username" />
				<br />
				<label for="password">Password</label>
				<input type="password" name="password" id="password" />
				<br />
				<button>Continue</button>
				<Show when={submission.result}>{(result) => <p>{result().message}</p>}</Show>
			</form>
			<a href="/login">Sign in</a>
		</>
	);
}

const signup = action(async (formData: FormData) => {
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

	const passwordHash = await hash(password, {
		// recommended minimum parameters
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1
	});
	const userId = generateId(15);

	try {
		db.prepare("INSERT INTO user (id, username, password_hash) VALUES(?, ?, ?)").run(
			userId,
			username,
			passwordHash
		);

		const session = await lucia.createSession(userId, {});
		const event = getRequestEvent()!;
		appendHeader(event, "Set-Cookie", lucia.createSessionCookie(session.id).serialize());
	} catch (e) {
		if (e instanceof SqliteError && e.code === "SQLITE_CONSTRAINT_UNIQUE") {
			return new Error("Username already used");
		}
		return new Error("An unknown error occurred");
	}
	throw redirect("/");
});
