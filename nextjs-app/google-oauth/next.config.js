/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		serverComponentsExternalPackages: ["oslo"]
	}
};

module.exports = nextConfig;
