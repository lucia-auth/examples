import { validateRequest } from "@/lib/auth";

import type { GetServerSidePropsResult, GetServerSidePropsContext } from "next";

export async function getServerSideProps(
	context: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<{}>> {
	const { user } = await validateRequest(context.req, context.res);
	if (user) {
		return {
			redirect: {
				permanent: false,
				destination: "/"
			}
		};
	}
	return {
		props: {}
	};
}

export default function Page() {
	return (
		<>
			<h1>Sign in</h1>
			<a href="/api/login/github">Sign in with GitHub</a>
		</>
	);
}
