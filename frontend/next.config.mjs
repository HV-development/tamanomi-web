/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // 静的ファイル配信の設定
  assetPrefix: '',
  trailingSlash: false,
  // publicディレクトリの明示的な設定
  publicRuntimeConfig: {
    staticFolder: '/public',
  },
  // Google Maps API用の外部ドメイン許可
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com https://maps.gstatic.com https://api.mapbox.com https://vercel.live; object-src 'none'; worker-src 'self' blob:; child-src 'self' blob:; connect-src 'self' ws: wss: *.webcontainer-api.io https://api.mapbox.com https://events.mapbox.com https://zipcloud.ibsnet.co.jp http://localhost:3001 http://localhost:3002 https://tamanomi-api-develop.up.railway.app; img-src 'self' 'unsafe-inline' data: blob: https: *.webcontainer-api.io;"
          }
        ],
      },
    ]
  },
  // 静的ファイルのリライト設定
  async rewrites() {
    return [
      {
        source: '/:path*.png',
        destination: '/:path*.png',
      },
    ]
  },

}

export default nextConfig