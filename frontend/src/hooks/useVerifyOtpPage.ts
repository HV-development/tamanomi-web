"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export const useVerifyOtpPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [email, setEmail] = useState<string>("")

  // セキュリティ改善：URLパラメータからメールアドレスを取得せず、サーバーサイドセッションから取得
  // requestIdのみをURLパラメータから取得
  const requestId = searchParams.get('requestId') || ""

  // Cookieベースのセッションからメールアドレスを取得
  useEffect(() => {
    const fetchEmailFromSession = async () => {
      if (!requestId) {
        return
      }

      try {
        // Cookieからセッション情報を取得
        const response = await fetch('/api/auth/otp/session', {
          method: 'GET',
          credentials: 'include', // Cookieを送信
        })

        if (!response.ok) {
          await response.json().catch(() => ({}))
          setError('セッションが無効です。再度ログインしてください。')
          router.replace('/login?skip-auth-check=true')
          return
        }

        const sessionData = await response.json()
        const sessionEmail = sessionData.email as string | undefined
        const sessionRequestId = sessionData.requestId as string | undefined

        // requestIdが一致する場合のみメールアドレスを使用
        if (sessionEmail && sessionRequestId === requestId) {
          setEmail(sessionEmail)
        } else {
          // セッションにメールアドレスがない、またはrequestIdが一致しない場合はエラー
          setError('セッションが無効です。再度ログインしてください。')
          router.replace('/login?skip-auth-check=true')
        }
      } catch {
        setError('セッション情報の取得に失敗しました。再度ログインしてください。')
        router.replace('/login?skip-auth-check=true')
      }
    }

    if (requestId) {
      fetchEmailFromSession()
    }
  }, [requestId, router])

  // ログイン後のリダイレクトフラグをチェック
  // Cookieベースのセッション管理に変更したため、sessionStorageは使用しない
  // リダイレクトは即座に実行されるため、このチェックは不要
  useEffect(() => {
    setIsRedirecting(false)
  }, [])

  // 認証状態チェック（OTP入力画面ではスキップ）
  // パスワード認証成功時にトークンが発行されるため、OTP認証完了まで認証チェックをスキップする
  useEffect(() => {
    // skip-auth-check パラメータがある場合は認証チェックをスキップ
    const urlParams = new URLSearchParams(window.location.search)
    const skipAuthCheck = urlParams.get('skip-auth-check')

    if (skipAuthCheck === 'true') {
      // URLパラメータをクリア
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('skip-auth-check')
      window.history.replaceState({}, '', newUrl.toString())
    }

    // OTP入力画面では認証チェックをスキップ
    // パスワード認証成功時にトークンが発行されるが、OTP認証が完了するまではログインを完了させない
    setIsCheckingAuth(false)
  }, [])

  // requestIdが無い場合はログインページへリダイレクト
  useEffect(() => {
    if (!isCheckingAuth && !requestId) {
      router.replace('/login?skip-auth-check=true')
    }
  }, [requestId, isCheckingAuth, router])

  // OTP認証
  const handleOtpVerify = useCallback(async (otp: string) => {
    // 連続押下を防ぐ
    if (isLoading) {
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp, requestId }),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMessage = data.error || data.message || 'ワンタイムパスワードの認証に失敗しました'
        throw new Error(errorMessage)
      }

      // トークンはCookieに保存されているため、プラン登録状況を確認
      let hasPlan = false
      try {
        const userResponse = await fetch('/api/user/me')

        if (userResponse.ok) {
          const userData = await userResponse.json()
          hasPlan = userData.plan !== null && userData.plan !== undefined
        }
      } catch {
        // エラー処理
      }

      // リダイレクト先を決定
      // Cookieベースのセッション管理に変更したため、sessionStorageは使用しない
      let targetPath: string
      if (!hasPlan) {
        targetPath = '/plan-registration'
      } else {
        targetPath = '/home'
      }

      // 遷移前にisRedirectingをtrueに設定
      setIsRedirecting(true)

      // 少し待ってから遷移
      requestAnimationFrame(() => {
        router.replace(targetPath)
      })

      // 成功時はsetIsLoading(false)を呼ばない（リダイレクト後に自動的にアンマウントされるため）
      return
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'ワンタイムパスワードの認証に失敗しました'
      setError(errorMessage)
      setIsLoading(false)
    }
  }, [email, requestId, router, isLoading])

  // OTP再送信
  const handleResendOtp = useCallback(async () => {
    // 連続押下を防ぐ
    if (isLoading) {
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // セキュリティ改善：メールアドレスはサーバーサイドセッションから取得
      if (!email) {
        throw new Error('メールアドレスが見つかりません')
      }

      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        throw new Error('ワンタイムパスワードの再送信に失敗しました')
      }

      const data = await response.json()

      // セキュリティ改善：メールアドレスをURLパラメータで送信しない
      // 新しいrequestIdでURLパラメータを更新（requestIdのみ）
      if (data.requestId) {
        const newUrl = `/login/verify-otp?requestId=${encodeURIComponent(data.requestId)}`
        router.replace(newUrl)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ワンタイムパスワードの再送信に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }, [email, router, isLoading])

  // ログイン画面に戻る
  const handleBackToLogin = useCallback(() => {
    router.replace('/login?skip-auth-check=true')
  }, [router])

  return {
    isLoading: isLoading || isRedirecting,
    error,
    email,
    isCheckingAuth,
    handleOtpVerify,
    handleResendOtp,
    handleBackToLogin,
  }
}

