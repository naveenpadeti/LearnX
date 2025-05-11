/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'kyksdkprjlczpdhzdwao.supabase.co',
                port: '',
                pathname: '/**',
            },
        ],
    },
};

export default nextConfig;