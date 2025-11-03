import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 認証必須ページへのアクセスをサーバー側でガード
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

  return NextResponse.next()
}

// 対象ルート（保護対象）
export const config = {
  matcher: [
    '/home/:path*',
    '/mypage/:path*',
    '/plan-registration/:path*',
    '/payment-method-change/:path*',
    '/usage-guide/:path*',
  ],
}

