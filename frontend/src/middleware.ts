import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // アプリの保護ページはCookieが無ければログインへ
  const protectedPaths = [
    '/home',
    '/mypage',
    '/plan-registration',
    '/payment-method-change',
    '/usage-guide',
  ]
  
  if (protectedPaths.some(p => pathname === p || pathname.startsWith(`${p}/`))) {
    const token = request.cookies.get('accessToken')?.value || request.cookies.get('__Host-accessToken')?.value
    if (!token) {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      url.searchParams.set('session', 'expired')
      return NextResponse.redirect(url)
    }
    // 署名検証はAPI層で実施。ここではCookieの存在のみでガード。
  }

  const response = NextResponse.next()

  // HSTS: HTTPSの接続を強制（1年間）
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')

  // キャッシュ制御
  if (pathname.startsWith('/api/')) {
    // 公開API: 短いキャッシュを許可
    const publicApis = ['/api/shops', '/api/genres', '/api/plans']
    const isPublicApi = publicApis.some(api => pathname === api || pathname.startsWith(`${api}/`))
    
    if (isPublicApi) {
      response.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=30')
    } else {
      // 機密APIはキャッシュ無効化
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private')
      response.headers.set('Pragma', 'no-cache')
      response.headers.set('Expires', '0')
    }
  }

  return response
}

// 静的ファイル以外のすべてのルートに適用
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
