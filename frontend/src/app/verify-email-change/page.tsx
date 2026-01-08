"use client"

import { useEffect, useState, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"

function VerifyEmailChangeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  
  // 重複実行を防ぐためのフラグ
  const hasExecutedRef = useRef(false)
  const processedTokenRef = useRef<string | null>(null)

  useEffect(() => {
    const token = searchParams.get('token')

    // トークンがない場合はエラー
    if (!token) {
      if (!hasExecutedRef.current) {
        hasExecutedRef.current = true
        setStatus('error')
        setMessage('トークンが見つかりません')
      }
      return
    }

    // 既に同じトークンで処理済みの場合は実行しない
    if (hasExecutedRef.current && processedTokenRef.current === token) {
      return
    }

    // 処理済みフラグを立てる
    hasExecutedRef.current = true
    processedTokenRef.current = token

    const verifyEmailChange = async () => {
      try {
        console.log('🔍 [verify-email-change] Starting verification for token:', token?.substring(0, 8) + '...')
        const response = await fetch(`/api/auth/email/change/confirm?token=${encodeURIComponent(token)}`)
        const data = await response.json()

        if (response.ok) {
          setStatus('success')
          setMessage(data.data?.message || 'メールアドレスの変更が完了しました')
        } else {
          setStatus('error')
          // エラー構造を確認（data.error.error.code または data.error.code のどちらかに対応）
          const errorCode = data.error?.error?.code || data.error?.code
          const errorMessage = data.error?.error?.message || data.error?.message || 'メールアドレス変更の確認に失敗しました'
          
          // エラーコードに基づいてエラーメッセージを日本語化
          if (errorCode) {
            switch (errorCode) {
              case 'INVALID_TOKEN':
                setMessage('無効なトークンです')
                break
              case 'TOKEN_ALREADY_USED':
                setMessage('このトークンは既に使用されています。メールアドレス変更は既に完了しています。')
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
          } else {
            // エラーコードがない場合は、メッセージをそのまま使用
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

  const handleLoginRedirect = async () => {
    // ログイン画面に遷移する前に、認証状態をクリア
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error('ログアウトAPIエラー:', error)
      // エラーが発生してもログイン画面に遷移する
    }
    
    // マイページ（localhost:3000）のログイン画面に遷移
    // window.location.originを使って現在のオリジンを取得し、ポート番号を3000に変更
    if (typeof window !== 'undefined') {
      const origin = window.location.origin
      // ポート番号を3000に変更（localhost:3001 → localhost:3000）
      const webUrl = origin.replace(/:\d+$/, ':3000')
      window.location.href = `${webUrl}/?view=login&skip-auth-check=true`
    } else {
      // サーバーサイドの場合は相対パスで遷移
      router.push('/?view=login&skip-auth-check=true')
    }
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

