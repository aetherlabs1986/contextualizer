/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
        return [
            {
                // Disable COOP/COEP to fix Firebase Google Auth signInWithPopup issues
                source: '/(.*)',
                headers: [
                    {
                        key: 'Cross-Origin-Opener-Policy',
                        value: 'unsafe-none',
                    },
                    {
                        key: 'Cross-Origin-Embedder-Policy',
                        value: 'unsafe-none',
                    }
                ],
            },
        ];
    },
};

export default nextConfig;
