import { lucia, validateRequest } from "@/lib/auth";

import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== "POST") {
		return res.status(404).end();
	}
	const { session } = await validateRequest(req, res);
	if (!session) {
		return res.status(401).end();
	}
	return res
		.setHeader("Set-Cookie", lucia.createBlankSessionCookie().serialize())
		.status(200)
		.end();
}
