"use client"

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export const useLoginPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")
  
  const [loginStep, setLoginStep] = useState<"password" | "otp">("password")
  const [email, setEmail] = useState<string>("")
  const [requestId, setRequestId] = useState<string>("")
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  // URLパラメータをメモ化
  const urlParams = useMemo(() => ({
    paymentSuccess: searchParams.get('payment-success'),
    view: searchParams.get('view'),
    error: searchParams.get('error'),
    email: searchParams.get('email')
  }), [searchParams])

  // 認証状態チェック
  useEffect(() => {
    const checkAuth = async () => {
      // skip-auth-check パラメータがある場合は認証チェックをスキップ
      const urlParams = new URLSearchParams(window.location.search)
      const skipAuthCheck = urlParams.get('skip-auth-check')
      
      if (skipAuthCheck === 'true') {
        // URLパラメータをクリア
        const newUrl = new URL(window.location.href)
        newUrl.searchParams.delete('skip-auth-check')
        window.history.replaceState({}, '', newUrl.toString())
        setIsCheckingAuth(false)
        return
      }
      
      // Cookieから自動的に認証チェック
      try {
        const response = await fetch('/api/user/me')

        if (response.ok) {
          const userData = await response.json()
          const hasPlan = userData.plan !== null && userData.plan !== undefined
          
          if (!hasPlan) {
            // プラン未登録の場合はプラン登録画面へ（セッションストレージにメールアドレスを保存）
            sessionStorage.setItem('userEmail', userData.email)
            router.push('/plan-registration')
          } else {
            router.push('/home')
          }
        } else {
          setIsCheckingAuth(false)
        }
      } catch {
        setIsCheckingAuth(false)
      }
    }

    checkAuth()
  }, [router])

  // URLパラメータ処理
  useEffect(() => {
    const { paymentSuccess, view } = urlParams

    if (paymentSuccess === 'true' || view === 'mypage') {
      if (typeof window !== 'undefined' && view === 'mypage') {
        sessionStorage.setItem('redirectAfterLogin', `/home?view=mypage${paymentSuccess ? '&payment-success=true' : ''}`)
      }
    }
  }, [urlParams])

  // エラーメッセージ取得
  useEffect(() => {
    const { error: errorParam, email: emailParam } = urlParams

    if (errorParam === 'already_registered') {
      setError(`このメールアドレス（${emailParam}）は既に登録されています。ログイン画面からログインしてください。`)
    }
  }, [urlParams])

  // パスワード認証
  const handlePasswordLogin = useCallback(async (loginData: { email: string; password: string }) => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: loginData.email, password: loginData.password }),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMessage = data.error || data.message || 'パスワード認証に失敗しました'
        throw new Error(errorMessage)
      }

      // OTP送信
      const otpResponse = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: loginData.email }),
      })

      if (!otpResponse.ok) {
        throw new Error('ワンタイムパスワードの送信に失敗しました')
      }

      const otpData = await otpResponse.json()

      setEmail(loginData.email)
      setRequestId(otpData.requestId)
      setLoginStep("otp")
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'ログインに失敗しました'
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
  }, [])

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
      
      console.log('🔍 [useLoginPage] OTP response data:', data)
      console.log('🔍 [useLoginPage] Response ok:', response.ok)

      if (!response.ok) {
        const errorMessage = data.error || data.message || 'ワンタイムパスワードの認証に失敗しました'
        console.log('🔍 [useLoginPage] Error message:', errorMessage)
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
      
      if (redirectPath) {
        sessionStorage.removeItem('redirectAfterLogin')
        router.push(redirectPath)
      } else {
        if (!hasPlan) {
          router.push('/plan-registration')
        } else {
          router.push('/home')
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'ワンタイムパスワードの認証に失敗しました'
      console.error('OTP verification error:', errorMessage) // デバッグログ
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [email, requestId, router])

  // OTP再送信
  const handleResendOtp = useCallback(async () => {
    setIsLoading(true)
    setError("")

    try {
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

      const otpData = await response.json()
      setRequestId(otpData.requestId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ワンタイムパスワードの再送信に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }, [email])

  // パスワード入力画面に戻る
  const handleBackToPassword = useCallback(() => {
    setLoginStep("password")
    setError("")
  }, [])

  // 新規登録画面へ
  const handleSignup = useCallback(() => {
    router.push('/email-registration')
  }, [router])

  // パスワードリセット画面へ
  const handleForgotPassword = useCallback(() => {
    router.push('/password-reset')
  }, [router])

  return {
    isLoading,
    error,
    loginStep,
    email,
    isCheckingAuth,
    handlePasswordLogin,
    handleOtpVerify,
    handleResendOtp,
    handleBackToPassword,
    handleSignup,
    handleForgotPassword,
  }
}

