import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Lucia example"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}
