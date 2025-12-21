import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * IPv4-mapped IPv6アドレスからIPv4部分を抽出
 * 例: ::ffff:192.168.1.1 -> 192.168.1.1
 */
function normalizeIp(ip: string): string {
  // IPv4-mapped IPv6 (::ffff:x.x.x.x) からIPv4部分を抽出
  const ipv4Mapped = ip.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i);
  if (ipv4Mapped) {
    return ipv4Mapped[1];
  }
  return ip;
}

/**
 * クライアントのIPアドレスを取得
 * Vercel/Cloudflare等のプロキシヘッダーを優先
 */
function getClientIp(request: NextRequest): string {
  let ip = '0.0.0.0';
  
  // Vercel固有のヘッダー
  const vercelIp = request.headers.get('x-vercel-forwarded-for');
  if (vercelIp) {
    ip = vercelIp.split(',')[0].trim();
  }
  // 標準的なプロキシヘッダー
  else {
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
      ip = forwarded.split(',')[0].trim();
    } else {
      const realIp = request.headers.get('x-real-ip');
      if (realIp) {
        ip = realIp;
      }
    }
  }
  
  // IPv4-mapped IPv6アドレスを正規化
  return normalizeIp(ip);
}

/**
 * /_next/image エンドポイントのURLパラメータを検証
 * ディレクトリトラバーサル攻撃を防止
 */
function validateImageUrl(url: string | null): boolean {
  if (!url) return false;

  // URLデコードして正規化（複数回デコードを試みてエンコードされた攻撃を検出）
  let decodedUrl = url;
  try {
    // 最大3回までデコードを試みる（多重エンコード対策）
    for (let i = 0; i < 3; i++) {
      const newDecoded = decodeURIComponent(decodedUrl);
      if (newDecoded === decodedUrl) break;
      decodedUrl = newDecoded;
    }
  } catch {
    // デコード失敗は不正なURLとして拒否
    return false;
  }

  // パストラバーサルパターンを禁止
  if (decodedUrl.includes('..') || decodedUrl.includes('./')) {
    return false;
  }

  // バックスラッシュによるトラバーサルも禁止
  if (decodedUrl.includes('..\\') || decodedUrl.includes('.\\')) {
    return false;
  }

  // ローカルパスは / で始まる必要がある
  if (!decodedUrl.startsWith('/') && !decodedUrl.startsWith('http')) {
    return false;
  }

  // リモートURLの場合は許可されたドメインのみ
  if (decodedUrl.startsWith('http')) {
    const allowedHosts = [
      'dev-images.tamanomi.com',
      'images.tamanomi.com',
      'localhost',
      '127.0.0.1',
    ];
    try {
      const urlObj = new URL(decodedUrl);
      return allowedHosts.some(host => urlObj.hostname === host || urlObj.hostname === `${host}:9000`);
    } catch {
      return false;
    }
  }

  return true;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // メンテナンスモードチェック（最優先で実行）
  if (process.env.MAINTENANCE_MODE === 'true') {
    // メンテナンスページ自体と静的ファイルは除外
    if (pathname === '/maintenance' || pathname.startsWith('/_next/') || pathname.startsWith('/api/')) {
      // メンテナンスページはそのまま表示
      if (pathname === '/maintenance') {
        const response = NextResponse.next();
        response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
        return response;
      }
    } else {
      // IPホワイトリストチェック
      const clientIp = getClientIp(request);
      const allowedIps = (process.env.MAINTENANCE_ALLOWED_IPS || '').split(',').map(ip => ip.trim()).filter(Boolean);
      
      if (!allowedIps.includes(clientIp)) {
        // メンテナンスページへリダイレクト
        const url = request.nextUrl.clone();
        url.pathname = '/maintenance';
        url.search = '';
        const redirectResponse = NextResponse.redirect(url);
        redirectResponse.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
        redirectResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        return redirectResponse;
      }
    }
  }

  // /_next/image エンドポイントのURLパラメータを検証（ディレクトリトラバーサル対策）
  if (pathname === '/_next/image') {
    const imageUrl = request.nextUrl.searchParams.get('url');
    if (!validateImageUrl(imageUrl)) {
      console.warn('[middleware] Invalid image URL blocked', {
        url: imageUrl,
        method: request.method,
        fullUrl: request.nextUrl.toString(),
      });
      return NextResponse.json({ message: 'Invalid image URL' }, { status: 403 });
    }
    // 検証通過後は通常の処理へ
    const response = NextResponse.next();
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    // 画像リクエストにもキャッシュ無効化ヘッダーを設定
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  }

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
      const redirectResponse = NextResponse.redirect(url)
      // リダイレクトレスポンスにもキャッシュ無効化ヘッダーを設定
      redirectResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private')
      redirectResponse.headers.set('Pragma', 'no-cache')
      redirectResponse.headers.set('Expires', '0')
      return redirectResponse
    }
    // 署名検証はAPI層で実施。ここではCookieの存在のみでガード。
  }

  const response = NextResponse.next()

  // HSTS: HTTPSの接続を強制（1年間）
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')

  // キャッシュ制御: 全てのページでキャッシュを無効化して機密情報の漏洩を防止
  // ユーザー固有情報（お気に入り状態など）が含まれる可能性があるため、
  // 共有キャッシュによる情報漏洩を防止
  // Next.jsのデフォルトのCache-Controlヘッダーを削除してから設定
  response.headers.delete('Cache-Control')
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')

  return response
}

// 静的ファイル以外のすべてのルートに適用
// 注意: _next/image は検証のためマッチャーに含める（ディレクトリトラバーサル対策）
export const config = {
  matcher: [
    '/((?!_next/static|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
