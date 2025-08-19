import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const zipcode = searchParams.get('zipcode')

    if (!zipcode) {
      return NextResponse.json(
        { success: false, message: '郵便番号が指定されていません' },
        { status: 400 }
      )
    }

    // 郵便番号の形式チェック
    const cleanedZipcode = zipcode.replace(/-/g, '')
    if (!/^\d{7}$/.test(cleanedZipcode)) {
      return NextResponse.json(
        { success: false, message: '郵便番号は7桁の数字で入力してください' },
        { status: 400 }
      )
    }

    // zipcloud APIを呼び出し
    const apiUrl = `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${cleanedZipcode}`
    const response = await fetch(apiUrl)
    const data = await response.json()

    if (data.status === 200 && data.results && data.results.length > 0) {
      const result = data.results[0]
      const fullAddress = `${result.address1}${result.address2}${result.address3}`
      
      return NextResponse.json({
        success: true,
        address: fullAddress,
        data: result
      })
    } else {
      return NextResponse.json(
        { success: false, message: '該当する住所が見つかりませんでした' },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('住所検索エラー:', error)
    return NextResponse.json(
      { success: false, message: '住所検索サービスに接続できませんでした' },
      { status: 500 }
    )
  }
}