'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { RegisterContainer } from '@/components/organisms/RegisterContainer'
import { UserRegistrationComplete } from "@hv-development/schemas"
import {
  getRegisterSession,
  setRegisterSessionItem,
  removeRegisterSessionItem
} from '@/lib/register-session'

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingEmail, setIsLoadingEmail] = useState(true)
  const [email, setEmail] = useState<string | undefined>(undefined)
  const [token, setToken] = useState<string | undefined>(undefined)
  const [shopId, setShopId] = useState<string | undefined>(undefined)
  const [isClient, setIsClient] = useState(false)
  const [initialFormData, setInitialFormData] = useState<UserRegistrationComplete | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // クライアントサイドでのみ searchParams を取得し、APIからメールアドレスを取得
  useEffect(() => {
    setIsClient(true)

    const initializePage = async () => {
      if (typeof window === 'undefined') return

      const urlParams = new URLSearchParams(window.location.search)
      const tokenParam = urlParams.get('token') || undefined
      const shop_id = urlParams.get('shop_id') || undefined
      const ref = urlParams.get('ref') // 紹介者IDを取得
      const isEdit = urlParams.get('edit') === 'true'
      const errorParam = urlParams.get('error') // エラーメッセージを取得

      // エラーパラメータがある場合は表示
      if (errorParam) {
        const decodedError = decodeURIComponent(errorParam)
        setError(decodedError)
      }

      // トークンが存在しない場合はメール登録画面にリダイレクト
      if (!tokenParam || tokenParam.trim() === '') {
        router.push('/email-registration')
        return
      }

      setToken(tokenParam)
      setShopId(shop_id)

      // URLパラメータから紹介者IDを取得してサーバーサイドセッションに保存
      if (ref) {
        await setRegisterSessionItem('referrerUserId', ref)
      }

      // 編集モードの場合、保存されたフォームデータを取得
      if (isEdit) {
        const sessionData = await getRegisterSession()
        const savedData = sessionData?.registerFormData
        if (savedData) {
          try {
            const parsedData = savedData as UserRegistrationComplete
            setInitialFormData(parsedData)
            await removeRegisterSessionItem('registerFormData')
          } catch {
            // エラーを無視
          }
        }
        // 編集モードの場合、サーバーサイドセッションからメールアドレスを取得
        const savedEmail = sessionData?.registerEmail
        if (savedEmail) {
          setEmail(savedEmail)
          setIsLoadingEmail(false)
          return
        }
      }

      // トークンからメールアドレスを取得（セキュリティ改善：POSTでトークンをボディ送信）
      try {
        const response = await fetch('/api/auth/register/token-info', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: tokenParam }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error('[register] Token info API error:', {
            status: response.status,
            statusText: response.statusText,
            errorData
          })
          if (errorData.error?.code === 'REGISTRATION_TOKEN_EXPIRED') {
            setError('トークンの有効期限が切れています。再度メール登録からやり直してください。')
          } else {
            setError('トークンが無効です。再度メール登録からやり直してください。')
          }
          setTimeout(() => router.push('/email-registration'), 3000)
          return
        }

        const data = await response.json()
        // セキュリティ改善：token-info APIはメールアドレスを返さないため、セッションから取得するか、表示用に別の方法を使用
        // メールアドレスは登録完了時にトークンから取得されるため、ここでは表示しない
        // セッションにトークンの有効性のみを保存
        if (data.valid) {
          // トークンが有効であることを確認
          // メールアドレスの表示は、登録完了時にトークンから取得されるため、ここでは不要
        }
      } catch (error) {
        console.error('[register] Token info fetch error:', error)
        if (error instanceof Error) {
          console.error('[register] Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
          })
        }
        setError('エラーが発生しました。再度お試しください。')
        setTimeout(() => router.push('/email-registration'), 3000)
      } finally {
        setIsLoadingEmail(false)
      }
    }

    initializePage()
  }, [router])

  const handleRegisterSubmit = async (data: UserRegistrationComplete) => {
    if (!token) {
      setError('トークンが見つかりません。再度メール登録からやり直してください。')
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    try {
      // emailはトークンから取得されるため、送信時には空文字列または除外
      // shop_idを追加
      const dataWithShopId = {
        ...data,
        email: data.email || '', // 空文字列を設定（サーバー側でトークンから取得される）
        shop_id: shopId || undefined,
      }

      // フォームデータをサーバーサイドセッションに保存
      try {
        const sessionSaved = await setRegisterSessionItem('registerFormData', dataWithShopId)

        if (!sessionSaved) {
          setError('フォームデータの保存に失敗しました。再度お試しください。')
          setIsLoading(false)
          return
        }

        // セッションが正しく保存されたか確認
        const verifySession = await getRegisterSession()
        if (!verifySession?.registerFormData) {
          setError('セッションの保存を確認できませんでした。再度お試しください。')
          setIsLoading(false)
          return
        }
      } catch (_sessionError) {
        setError('セッションの保存中にエラーが発生しました。再度お試しください。')
        setIsLoading(false)
        return
      }

      // 確認画面に遷移（emailパラメータを削除 - セキュリティ改善）
      const shopIdParam = shopId ? `&shop_id=${encodeURIComponent(shopId)}` : ''
      const confirmationUrl = `/register-confirmation?token=${encodeURIComponent(token)}${shopIdParam}`

      // router.pushの代わりにwindow.location.hrefを使用して確実に遷移
      if (typeof window !== 'undefined') {
        window.location.href = confirmationUrl
      } else {
        router.push(confirmationUrl)
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : '登録処理中にエラーが発生しました。再度お試しください。')
      setIsLoading(false)
    }
  }

  const handleCancel = () => router.push('/')
  const handleLogoClick = () => router.push('/')

  // クライアントサイドでの初期化が完了するまでローディング表示
  if (!isClient || isLoadingEmail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  // トークン関連のエラー（トークンが無効など）の場合は専用画面を表示
  if (error && (!token || !email)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <p className="text-gray-600">メール登録画面にリダイレクトします...</p>
        </div>
      </div>
    )
  }

  return (
    <RegisterContainer
      email={email}
      initialFormData={initialFormData}
      onSubmit={handleRegisterSubmit}
      onCancel={handleCancel}
      onLogoClick={handleLogoClick}
      isLoading={isLoading}
      backgroundColorClass="bg-gradient-to-br from-green-50 to-green-100"
      errorMessage={error || undefined}
    />
  )
}
