/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    images: { unoptimized: true },
    async redirects() {
        return [
            {
                source: '/dashboard',
                destination: '/admin',
                permanent: true,
            },
        ];
    },
};

export default nextConfig;
