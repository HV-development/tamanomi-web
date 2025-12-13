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
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '9000', pathname: '/tamanomi/**' },
      { protocol: 'http', hostname: '127.0.0.1', port: '9000', pathname: '/tamanomi/**' },
      // Docker 内部名でのアクセスにも対応
      { protocol: 'http', hostname: process.env.MINIO_HOST || 'minio', port: process.env.MINIO_PORT || '9000', pathname: '/tamanomi/**' },
    ],
  },
  // 静的ファイル配信の設定
  assetPrefix: '',
  trailingSlash: false,
  // Google Maps API用の外部ドメイン許可
  async headers() {
    const securityHeaders = [
      {
        key: 'Content-Security-Policy',
        value: "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com https://maps.gstatic.com https://api.mapbox.com https://vercel.live; object-src 'none'; worker-src 'self' blob:; child-src 'self' blob:; connect-src 'self' ws: wss: *.webcontainer-api.io https://api.mapbox.com https://events.mapbox.com https://zipcloud.ibsnet.co.jp http://localhost:3001 http://localhost:3002 https://tamanomi-api-develop.up.railway.app http://localhost:9000 http://127.0.0.1:9000; img-src 'self' data: blob: https: http: http://localhost:9000 http://127.0.0.1:9000 http://minio:9000 https://images.pexels.com *.webcontainer-api.io;"
      },
      {
        key: 'X-Frame-Options',
        value: 'DENY'
      },
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff'
      },
      {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin'
      },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=(self)'
      },
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains; preload'
      },
      {
        key: 'Cache-Control',
        value: 'no-store, no-cache, must-revalidate, private',
      },
      {
        key: 'Pragma',
        value: 'no-cache',
      },
    ]

    if (process.env.VERCEL_ENV === 'preview') {
      securityHeaders.push({
        key: 'X-Robots-Tag',
        value: 'noindex, nofollow, noarchive'
      })
    }

    return [
      {
        // 全てのルートに適用（静的ファイルを除く）
        source: '/(.*)',
        headers: securityHeaders,
      },
      {
        // APIルートにも明示的に適用
        source: '/api/:path*',
        headers: securityHeaders,
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