import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start";
import { Suspense } from "solid-js";

export default function App() {
	return (
		<Router
			root={(props) => {
				return <Suspense fallback={<p>loading...</p>}>{props.children}</Suspense>;
			}}
		>
			<FileRoutes />
		</Router>
	);
}
