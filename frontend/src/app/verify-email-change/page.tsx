"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"

function VerifyEmailChangeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const verifyEmailChange = async () => {
      const token = searchParams.get('token')

      if (!token) {
        setStatus('error')
        setMessage('トークンが見つかりません')
        return
      }

      try {
        const response = await fetch(`/api/auth/email/change/confirm?token=${encodeURIComponent(token)}`)
        const data = await response.json()

        if (response.ok) {
          setStatus('success')
          setMessage(data.data?.message || 'メールアドレスの変更が完了しました')
        } else {
          setStatus('error')
          const errorMessage = data.error?.message || 'メールアドレス変更の確認に失敗しました'
          
          // エラーメッセージを日本語化
          switch (errorMessage) {
            case 'INVALID_TOKEN':
              setMessage('無効なトークンです')
              break
            case 'TOKEN_ALREADY_USED':
              setMessage('このトークンは既に使用されています')
              break
            case 'TOKEN_EXPIRED':
              setMessage('トークンの有効期限が切れています')
              break
            case 'EMAIL_ALREADY_EXISTS':
              setMessage('このメールアドレスは既に使用されています')
              break
            default:
              setMessage(errorMessage)
          }
        }
      } catch {
        setStatus('error')
        setMessage('メールアドレス変更の確認中にエラーが発生しました')
      }
    }

    verifyEmailChange()
  }, [searchParams])

  const handleLoginRedirect = () => {
    router.push('/?view=login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* ローディング状態 */}
        {status === 'loading' && (
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-green-600 animate-spin mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              メールアドレスを変更中...
            </h1>
            <p className="text-gray-600">
              しばらくお待ちください
            </p>
          </div>
        )}

        {/* 成功状態 */}
        {status === 'success' && (
          <div className="text-center">
            <div className="mb-6">
              <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              メールアドレス変更完了
            </h1>
            <p className="text-gray-600 mb-8">
              {message}
            </p>
            <div className="space-y-3">
              <button
                onClick={handleLoginRedirect}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                ログイン画面へ
              </button>
            </div>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                新しいメールアドレスでログインしてください
              </p>
            </div>
          </div>
        )}

        {/* エラー状態 */}
        {status === 'error' && (
          <div className="text-center">
            <div className="mb-6">
              <XCircle className="w-16 h-16 text-red-600 mx-auto" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              メールアドレス変更に失敗しました
            </h1>
            <p className="text-gray-600 mb-8">
              {message}
            </p>
            <div className="space-y-3">
              <button
                onClick={handleLoginRedirect}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                ログイン画面へ
              </button>
            </div>
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800">
                トークンの有効期限が切れている場合は、再度メールアドレス変更を試してください
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function VerifyEmailChangePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-green-600 animate-spin mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              読み込み中...
            </h1>
          </div>
        </div>
      </div>
    }>
      <VerifyEmailChangeContent />
    </Suspense>
  )
}

