import { lucia } from 'lucia';
import { betterSqlite3 } from '@lucia-auth/adapter-sqlite';
import { sveltekit } from 'lucia/middleware';
import { google } from '@lucia-auth/oauth/providers';
import { dev } from '$app/environment';
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } from '$env/static/private';

import sqlite from 'better-sqlite3';
import fs from 'fs';

const db = sqlite(':auth:');
db.exec(fs.readFileSync('schema.sql', 'utf8'));

export const auth = lucia({
	adapter: betterSqlite3(db, {
		user: 'user',
		session: 'user_session',
		key: 'user_key'
	}),
	middleware: sveltekit(),
	env: dev ? 'DEV' : 'PROD',
	getUserAttributes: (data) => {
		return {
			id: data.id,
			name: data.name,
			email: data.email,
			image: data.image
		};
	},
	getSessionAttributes: (session) => {
		return session;
	}
});

export const googleAuth = google(auth, {
	clientId: GOOGLE_CLIENT_ID,
	clientSecret: GOOGLE_CLIENT_SECRET,
	accessType: 'offline',
	redirectUri: GOOGLE_REDIRECT_URI,
	scope: ['openid', 'email', 'profile']
});

export type Auth = typeof auth;
