"use client"

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export const useLoginPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [isRedirecting, setIsRedirecting] = useState(false)

  // URLパラメータをメモ化
  const urlParams = useMemo(() => ({
    paymentSuccess: searchParams.get('payment-success'),
    view: searchParams.get('view'),
    error: searchParams.get('error'),
    email: searchParams.get('email')
  }), [searchParams])

  // ログイン後のリダイレクトフラグをチェック（ページ遷移中もローディングを継続）
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkRedirecting = () => {
        const loginRedirecting = sessionStorage.getItem('loginRedirecting')
        const shouldRedirect = !!loginRedirecting
        setIsRedirecting(shouldRedirect)
      }
      
      // 初回チェック
      checkRedirecting()
      
      // 定期的にチェック（遷移先のページでフラグがクリアされるまで）
      // ページ遷移が始まっても、ログインページがアンマウントされるまでチェックを継続
      const interval = setInterval(checkRedirecting, 50) // より頻繁にチェック
      
      return () => clearInterval(interval)
    }
  }, [])

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
          
          let targetPath: string
          if (!hasPlan) {
            // プラン未登録の場合はプラン登録画面へ（セッションストレージにメールアドレスを保存）
            sessionStorage.setItem('userEmail', userData.email)
            targetPath = '/plan-registration'
          } else {
            targetPath = '/home'
          }

          // ローディング継続フラグをセッションストレージに設定
          // 遷移先のページで完全に表示されたらクリアされる
          sessionStorage.setItem('loginRedirecting', targetPath)
          setIsRedirecting(true)
          
          router.replace(targetPath)
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
      
      // OTP入力ページへ遷移
      const targetUrl = `/login/verify-otp?email=${encodeURIComponent(loginData.email)}&requestId=${encodeURIComponent(otpData.requestId)}`
      
      // window.location.hrefを使って強制的にページ遷移
      window.location.href = targetUrl
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'ログインに失敗しました'
      setError(errorMessage)
      setIsLoading(false)
    }
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
    isLoading: isLoading || isRedirecting,
    error,
    isCheckingAuth,
    handlePasswordLogin,
    handleSignup,
    handleForgotPassword,
  }
}
