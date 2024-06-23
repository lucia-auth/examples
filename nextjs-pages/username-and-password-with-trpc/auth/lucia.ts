import { lucia } from "lucia";
import { nextjs_future } from "lucia/middleware";
import { betterSqlite3 } from "@lucia-auth/adapter-sqlite";
// import "lucia/polyfill/node";

import sqlite from "better-sqlite3";
import fs from "fs";

const db = sqlite("./mydb.db");
try {
	db.exec(fs.readFileSync("schema.sql", "utf8"));
} catch (e) {
	// prevent re-migration
}

export const auth = lucia({
	adapter: betterSqlite3(db, {
		user: "user",
		session: "user_session",
		key: "user_key"
	}),
	env: process.env.NODE_ENV === "development" ? "DEV" : "PROD",
	middleware: nextjs_future(),
	getUserAttributes: (data) => {
		return {
			username: data.username
		};
	}
});

export type Auth = typeof auth;
