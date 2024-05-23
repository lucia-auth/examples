import { generateCodeVerifier, generateState } from "arctic";
import { authentik } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET(): Promise<Response> {
	const state = generateState();
	const codeVerifier = generateCodeVerifier();
	const url = await authentik.createAuthorizationURL(state, codeVerifier, {
		// optional
		scopes: ["profile", "email", "offline_access"] // "openid" always included
	});

	cookies().set("authentik_oauth_state", state, {
		path: "/",
		secure: process.env.NODE_ENV === "production",
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: "lax"
	});

	// store code verifier as cookie
	cookies().set("code_verifier", codeVerifier, {
		path: "/",
		secure: process.env.NODE_ENV === "production", // set to false in localhost
		httpOnly: true,
		maxAge: 60 * 10, // 10 min
		sameSite: "lax"
	});

	return Response.redirect(url);
}
