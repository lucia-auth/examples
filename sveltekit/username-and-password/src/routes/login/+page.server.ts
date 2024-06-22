import { lucia } from "$lib/server/auth";
import { fail, redirect } from "@sveltejs/kit";
import { verify } from "@node-rs/argon2";
import { db } from "$lib/server/db";

import type { Actions, PageServerLoad } from "./$types";
import type { DatabaseUser } from "$lib/server/db";

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		return redirect(302, "/");
	}
	return {};
};

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const username = formData.get("username");
		const password = formData.get("password");

		if (
			typeof username !== "string" ||
			username.length < 3 ||
			username.length > 31 ||
			!/^[a-z0-9_-]+$/.test(username)
		) {
			return fail(400, {
				message: "Invalid username"
			});
		}
		if (typeof password !== "string" || password.length < 6 || password.length > 255) {
			return fail(400, {
				message: "Invalid password"
			});
		}

		const existingUser = db.prepare("SELECT * FROM user WHERE username = ?").get(username) as
			| DatabaseUser
			| undefined;
		if (!existingUser) {
			return fail(400, {
				message: "Incorrect username or password"
			});
		}

		const validPassword = await verify(existingUser.password_hash, password, {
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		});
		if (!validPassword) {
			// NOTE:
		// Returning immediately allows malicious actors to figure out valid usernames from response times,
		// allowing them to only focus on guessing passwords in brute-force attacks.
		// As a preventive measure, you may want to hash passwords even for invalid usernames.
		// However, valid usernames can be already be revealed with the signup page among other methods.
		// It will also be much more resource intensive.
		// Since protecting against this is non-trivial,
		// it is crucial your implementation is protected against brute-force attacks with login throttling, 2FA, etc.
		// If usernames are public, you can outright tell the user that the username is invalid.
			return fail(400, {
				message: "Incorrect username or password"
			});
		}

		const session = await lucia.createSession(existingUser.id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: ".",
			...sessionCookie.attributes
		});

		return redirect(302, "/");
	}
};
