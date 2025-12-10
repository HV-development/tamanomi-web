import { NextRequest, NextResponse } from 'next/server'
import { buildApiUrl } from '@/lib/api-config'

export const dynamic = 'force-dynamic'


export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body
    
    // API_BASE_URLから末尾の/api/v1を削除（重複を防ぐ）
    const fullUrl = buildApiUrl('/otp/send')
    
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Send OTP API error:', errorData)
      return NextResponse.json(
        { error: errorData.message || 'OTP送信に失敗しました' },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    
    // セキュリティ改善：メールアドレスをURLパラメータで送信しないため、サーバーサイドセッションに保存
    // OTP検証時にrequestIdからメールアドレスを取得できるようにする
    const res = NextResponse.json(data)
    
    // セッションにメールアドレスとrequestIdを保存（OTP検証用）
    // 既存のregister-session APIを使用（内部で直接Cookieを設定）
    const sessionCookie = request.cookies.get('register_session')
    let existingData: Record<string, unknown> = {}
    
    if (sessionCookie?.value) {
      try {
        // 既存のセッションデータを復号化（簡易版、実際の復号化処理はregister-session APIと同じロジックを使用）
        // ここでは直接Cookieを操作するのではなく、register-session APIを呼び出す
        const sessionUrl = new URL('/api/auth/register/session', request.url)
        const sessionResponse = await fetch(sessionUrl.toString(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': request.headers.get('cookie') || '',
          },
          body: JSON.stringify({ 
            key: 'otpEmail',
            value: email 
          }),
        })
        
        if (sessionResponse.ok) {
          // requestIdも保存
          await fetch(sessionUrl.toString(), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Cookie': request.headers.get('cookie') || '',
            },
            body: JSON.stringify({ 
              key: 'otpRequestId',
              value: data.requestId 
            }),
          })
        } else {
          console.warn('Failed to save OTP email to session, but OTP send succeeded')
        }
      } catch (error) {
        console.warn('Error saving OTP email to session:', error)
      }
    } else {
      // セッションが存在しない場合は新規作成
      try {
        const sessionUrl = new URL('/api/auth/register/session', request.url)
        await fetch(sessionUrl.toString(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': request.headers.get('cookie') || '',
          },
          body: JSON.stringify({ 
            key: 'otpEmail',
            value: email 
          }),
        })
        await fetch(sessionUrl.toString(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': request.headers.get('cookie') || '',
          },
          body: JSON.stringify({ 
            key: 'otpRequestId',
            value: data.requestId 
          }),
        })
      } catch (error) {
        console.warn('Error creating OTP session:', error)
      }
    }
    
    return res
  } catch (error) {
    console.error('Send OTP API fetch error:', error)
    return NextResponse.json(
      { error: 'OTP送信処理中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

