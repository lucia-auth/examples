// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			auth: import('lucia').AuthRequest;
		}
	}
}

/// <reference types="lucia" />
declare global {
	namespace Lucia {
		type Auth = import('$lib/server/lucia').Auth;
		type DatabaseUserAttributes = {
			name: string;
			email: string | null;
			image: string;
		};
		type DatabaseSessionAttributes = {
			access_token: string;
			refresh_token: string | null;
		};
	}
}

export { };
