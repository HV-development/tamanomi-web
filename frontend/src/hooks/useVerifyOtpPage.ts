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

  // サーバーサイドセッションからメールアドレスを取得
  useEffect(() => {
    const fetchEmailFromSession = async () => {
      if (!requestId) {
        return
      }

      try {
        // sessionStorageからメールアドレスとrequestIdを取得
        const sessionEmail = typeof window !== 'undefined' ? sessionStorage.getItem('otpEmail') : null
        const sessionRequestId = typeof window !== 'undefined' ? sessionStorage.getItem('otpRequestId') : null

        // デバッグログ：セッション取得結果を確認
        console.log('🔍 [useVerifyOtpPage] Session check:', {
          urlRequestId: requestId,
          sessionEmail: sessionEmail,
          sessionEmailType: typeof sessionEmail,
          sessionEmailExists: !!sessionEmail,
          sessionRequestId: sessionRequestId,
          sessionRequestIdType: typeof sessionRequestId,
          sessionRequestIdExists: !!sessionRequestId,
          requestIdMatch: sessionRequestId === requestId,
          requestIdMatchStrict: sessionRequestId === requestId ? 'true' : 'false',
          bothExist: !!sessionEmail && !!sessionRequestId,
          conditionResult: sessionEmail && sessionRequestId === requestId
        })

        // requestIdが一致する場合のみメールアドレスを使用
        if (sessionEmail && sessionRequestId === requestId) {
          console.log('✅ [useVerifyOtpPage] Session validation passed, setting email:', sessionEmail)
          setEmail(sessionEmail)
        } else {
          // セッションにメールアドレスがない、またはrequestIdが一致しない場合はエラー
          console.warn('❌ [useVerifyOtpPage] Session validation failed:', {
            hasEmail: !!sessionEmail,
            hasRequestId: !!sessionRequestId,
            requestIdMatch: sessionRequestId === requestId,
            urlRequestId: requestId,
            sessionRequestId: sessionRequestId,
            emailValue: sessionEmail
          })
          setError('セッションが無効です。再度ログインしてください。')
          router.replace('/login?skip-auth-check=true')
        }
      } catch (error) {
        console.error('Failed to get email from session:', error)
        setError('セッション情報の取得に失敗しました。再度ログインしてください。')
        router.replace('/login?skip-auth-check=true')
      }
    }

    if (requestId) {
      fetchEmailFromSession()
    }
  }, [requestId, router])

  // ログイン後のリダイレクトフラグをチェック
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkRedirecting = () => {
        const loginRedirecting = sessionStorage.getItem('loginRedirecting')
        const shouldRedirect = !!loginRedirecting
        setIsRedirecting(shouldRedirect)
      }

      checkRedirecting()
      const interval = setInterval(checkRedirecting, 50)

      return () => clearInterval(interval)
    }
  }, [])

  // 認証状態チェック（OTP入力画面ではスキップ）
  // パスワード認証成功時にトークンが発行されるため、OTP認証完了まで認証チェックをスキップする
  useEffect(() => {
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

      // リダイレクト
      const redirectPath = sessionStorage.getItem('redirectAfterLogin')

      let targetPath: string
      if (redirectPath) {
        sessionStorage.removeItem('redirectAfterLogin')
        targetPath = redirectPath
      } else {
        if (!hasPlan) {
          targetPath = '/plan-registration'
        } else {
          targetPath = '/home'
        }
      }

      // ローディング継続フラグをセッションストレージに設定
      sessionStorage.setItem('loginRedirecting', targetPath)

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
      console.error('OTP verification error:', errorMessage)
      setError(errorMessage)
      setIsLoading(false)
    }
  }, [email, requestId, router])

  // OTP再送信
  const handleResendOtp = useCallback(async () => {
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
  }, [email, router])

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


