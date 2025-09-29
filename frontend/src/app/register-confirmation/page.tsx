'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Home, User } from 'lucide-react'
import { Logo } from '@/components/atoms/logo'

export default function RegisterConfirmationPage() {
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()

  // クライアントサイドでの初期化
  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleGoToHome = () => {
    router.push('/')
  }

  const handleGoToLogin = () => {
    router.push('/?view=login')
  }

  const handleLogoClick = () => {
    router.push('/')
  }

  // クライアントサイドでの初期化が完了するまでローディング表示
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex flex-col">
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-center">
          <Logo size="lg" onClick={handleLogoClick} />
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* 成功アイコン */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">登録完了</h1>
              <p className="text-gray-600">TAMAYOIへの新規登録が完了しました</p>
            </div>

            {/* 完了メッセージ */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
              <div className="text-center">
                <h2 className="text-lg font-bold text-green-900 mb-3">🎉 ようこそTAMAYOIへ！</h2>
                <div className="text-green-800 space-y-2">
                  <p>アカウントの作成が正常に完了しました。</p>
                  <p>さいたま市内の美味しいお店で</p>
                  <p>お得なクーポンをお楽しみください。</p>
                </div>
              </div>
            </div>

            {/* 次のステップ */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
              <h3 className="text-blue-900 font-bold mb-3 text-center">次のステップ</h3>
              <div className="text-sm text-blue-800 space-y-2">
                <div className="flex items-start gap-2">
                  <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-bold flex-shrink-0 mt-0.5">1</span>
                  <span>ログインしてプランを選択</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-bold flex-shrink-0 mt-0.5">2</span>
                  <span>お近くの加盟店を探す</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-bold flex-shrink-0 mt-0.5">3</span>
                  <span>クーポンを使って乾杯！</span>
                </div>
              </div>
            </div>

            {/* ボタン */}
            <div className="space-y-3">
              <button
                onClick={handleGoToLogin}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-4 px-4 rounded-xl font-bold text-lg transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <User className="w-5 h-5" />
                ログインしてプランを選択
              </button>

              <button
                onClick={handleGoToHome}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium transition-colors border border-gray-300 flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" />
                ホーム画面を見る
              </button>
            </div>

            {/* 注意事項 */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                ※ クーポンのご利用にはプランへの登録が必要です
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}