import { betterSqlite3 } from "@lucia-auth/adapter-sqlite";
import {lucia} from "lucia"
import { qwik } from "lucia/middleware"
import Database from "better-sqlite3";
import fs from 'node:fs';

const db = Database(':memory:');
db.exec(fs.readFileSync('schema.sql', 'utf8'));


export const auth = lucia({
  adapter: betterSqlite3(db, {
    user: 'user',
    key: 'user_key',
    session: 'user_session',
  }),
  env: process.env.NODE_ENV === "production" ? "PROD" : "DEV",
  middleware: qwik(),
  getUserAttributes: (data) => ({
    username: data.username
  })
});

export type Auth = typeof auth;