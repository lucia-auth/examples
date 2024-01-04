import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Page() {
	const { user } = await validateRequest();
	if (user) {
		return redirect("/");
	}
	return (
		<>
			<h1>Sign in</h1>
			<a href="/login/github">Sign in with GitHub</a>
		</>
	);
}
