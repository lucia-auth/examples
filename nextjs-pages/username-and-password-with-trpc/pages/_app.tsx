import "@/styles/globals.css";
import Head from "next/head";
import type { AppProps, AppType } from "next/app";
import { trpc } from '../utils/trpc';

const MyApp: AppType = ({ Component, pageProps }: AppProps) => {
	return (
		<>
			<Head>
				<title>Username & password auth with Lucia</title>
			</Head>
			<Component {...pageProps} />;
		</>
	);
}

export default trpc.withTRPC(MyApp);
