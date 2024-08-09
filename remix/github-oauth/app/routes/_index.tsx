import { redirect, type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { Form, json, useLoaderData } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export function loader({ context }: LoaderFunctionArgs) {
  const { user } = context;
  if (!user) {
		return redirect("/login");
	}
  return json({
    user,
  });
}
export default function Index() {
  const {user} = useLoaderData<typeof loader>();

  return (
		<>
			<h1>Hi, {user.username}!</h1>
			<p>Your user ID is {user.id}.</p>
			<form action="/api/logout" method="post">
				<button>Sign out</button>
			</form>
		</>
	);
}
