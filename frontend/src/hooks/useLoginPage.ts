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

  // Cookieベースのセッション管理に変更したため、sessionStorageは使用しない
  // リダイレクトは即座に実行されるため、このチェックは不要
  useEffect(() => {
    setIsRedirecting(false)
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
        const response = await fetch('/api/user/me', {
          credentials: 'include', // Cookieを送信
        })

        if (response.ok) {
          const userData = await response.json()
          const hasPlan = userData.plan !== null && userData.plan !== undefined

          let targetPath: string
          if (!hasPlan) {
            // Cookieベースのセッション管理に変更したため、sessionStorageは使用しない
            targetPath = '/plan-registration'
          } else {
            targetPath = '/home'
          }

          // Cookieベースのセッション管理に変更したため、sessionStorageは使用しない
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
  // Cookieベースのセッション管理に変更したため、sessionStorageは使用しない
  // リダイレクト先はURLパラメータから直接取得する
  useEffect(() => {
    // URLパラメータの処理は必要に応じて実装
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
    // 連続押下を防ぐ
    if (isLoading) {
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Cookieを送信
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
        credentials: 'include', // Cookieを送信
        body: JSON.stringify({ email: loginData.email }),
      })

      if (!otpResponse.ok) {
        throw new Error('ワンタイムパスワードの送信に失敗しました')
      }

      const otpData = await otpResponse.json()

      // セキュリティ改善：メールアドレスをURLパラメータで送信しない
      // requestIdのみをURLパラメータで送信（メールアドレスはサーバーサイドセッションに保存済み）
      // skip-auth-checkパラメータを追加して、OTP入力画面での認証チェックをスキップ
      const targetUrl = `/login/verify-otp?requestId=${encodeURIComponent(otpData.requestId)}&skip-auth-check=true`

      // window.location.hrefを使って強制的にページ遷移
      window.location.href = targetUrl
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'ログインに失敗しました'
      setError(errorMessage)
      setIsLoading(false)
    }
  }, [isLoading])

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
