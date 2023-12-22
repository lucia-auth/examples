import { lucia } from "../../utils/auth";

import type { APIContext } from "astro";

export async function POST(context: APIContext): Promise<Response> {
	if (!context.locals.session) {
		return new Response(null, {
			status: 401
		});
	}

	await lucia.invalidateSession(context.locals.session.id);

	const blankSessionCookie = lucia.createBlankSessionCookie();
	context.cookies.set(
		blankSessionCookie.name,
		blankSessionCookie.value,
		blankSessionCookie.attributes
	);

	return new Response();
}
