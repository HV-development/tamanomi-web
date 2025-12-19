import { NextRequest } from 'next/server'
import { secureFetchWithCommonHeaders } from '@/lib/fetch-utils'
import { createNoCacheResponse } from '@/lib/response-utils'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const zipcode = searchParams.get('zipcode')

    if (!zipcode) {
      return createNoCacheResponse(
        { success: false, message: '郵便番号が指定されていません' },
        { status: 400 }
      )
    }

    // 郵便番号の形式チェック
    const cleanedZipcode = zipcode.replace(/-/g, '')
    if (!/^\d{7}$/.test(cleanedZipcode)) {
      return createNoCacheResponse(
        { success: false, message: '郵便番号は7桁の数字で入力してください' },
        { status: 400 }
      )
    }

    // zipcloud APIを呼び出し（外部APIなのでsecureFetchWithCommonHeadersを使用）
    const apiUrl = `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${cleanedZipcode}`
    const response = await secureFetchWithCommonHeaders(request, apiUrl, {
      method: 'GET',
      headerOptions: {
        requireAuth: false, // 外部APIなので認証不要
        setContentType: false, // 外部APIなのでContent-Typeは設定しない
      },
    })
    const data = await response.json()

    if (data.status === 200 && data.results && data.results.length > 0) {
      const result = data.results[0]
      const fullAddress = `${result.address1}${result.address2}${result.address3}`
      
      return createNoCacheResponse({
        success: true,
        address: fullAddress,
        data: result
      })
    } else {
      return createNoCacheResponse(
        { success: false, message: '該当する住所が見つかりませんでした' },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('住所検索エラー:', error)
    return createNoCacheResponse(
      { success: false, message: '住所検索サービスに接続できませんでした' },
      { status: 500 }
    )
  }
}
