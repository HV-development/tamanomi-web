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
  
  // URLパラメータからemailとrequestIdを取得
  const email = searchParams.get('email') || ""
  const requestId = searchParams.get('requestId') || ""

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

  // 認証状態チェック（既にログイン済みの場合はリダイレクト）
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/user/me')

        if (response.ok) {
          const userData = await response.json()
          const hasPlan = userData.plan !== null && userData.plan !== undefined
          
          const targetPath = hasPlan ? '/home' : '/plan-registration'
          
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

  // emailまたはrequestIdが無い場合はログインページへリダイレクト
  useEffect(() => {
    if (!isCheckingAuth && (!email || !requestId)) {
      router.replace('/login?skip-auth-check=true')
    }
  }, [email, requestId, isCheckingAuth, router])

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
      
      // 新しいrequestIdでURLパラメータを更新
      if (data.requestId) {
        const newUrl = `/login/verify-otp?email=${encodeURIComponent(email as string)}&requestId=${encodeURIComponent(data.requestId)}`
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


