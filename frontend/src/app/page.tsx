"use client"

/**
 * モニター登録期間用の一時的な対応
 * ドメインルートでログイン画面を表示
 * 
 * 正式リリース時は、下部のコメントアウトされたコードに戻して
 * トップ画面を掲載店の一覧画面に変更する予定
 */

import { useRouter, useSearchParams } from "next/navigation"
import { LoginLayout } from "@/components/templates/login-layout"
import { Suspense, useState, useEffect, useCallback, useMemo } from "react"

function LoginPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [loginStep, setLoginStep] = useState<"password" | "otp">("password")
  const [email, setEmail] = useState<string>("")
  const [requestId, setRequestId] = useState<string>("")

  // URLパラメータをメモ化して不要な再レンダリングを防ぐ
  const urlParams = useMemo(() => ({
    paymentSuccess: searchParams.get('payment-success'),
    view: searchParams.get('view'),
    error: searchParams.get('error'),
    email: searchParams.get('email')
  }), [searchParams])

  // URLパラメータの処理をuseEffectに移動
  useEffect(() => {
    const { paymentSuccess, view } = urlParams

    // payment-success パラメータがある場合、またはviewがmypageの場合は元のページに遷移
    if (paymentSuccess === 'true' || view === 'mypage') {
      // 現時点ではログイン画面にリダイレクト
      // ログイン後にマイページに遷移するようにする
      if (typeof window !== 'undefined' && view === 'mypage') {
        sessionStorage.setItem('redirectAfterLogin', `/home?view=mypage${paymentSuccess ? '&payment-success=true' : ''}`)
      }
    }
  }, [urlParams.paymentSuccess, urlParams.view])

  // URLパラメータからエラーメッセージを取得
  useEffect(() => {
    const { error: errorParam, email: emailParam } = urlParams

    if (errorParam === 'already_registered') {
      setError(`このメールアドレス（${emailParam}）は既に登録されています。ログイン画面からログインしてください。`)
    }
  }, [urlParams.error, urlParams.email])

  // ステップ1: パスワード認証 + OTP送信（useCallbackでメモ化）
  const handlePasswordLogin = useCallback(async (loginData: { email: string; password: string }) => {
    setIsLoading(true)
    setError("")

    try {
      // パスワード認証を実行
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: loginData.email, password: loginData.password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'パスワード認証に失敗しました')
      }

      console.log('Password authentication successful:', data)

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
      console.log('OTP sent successfully:', otpData)

      // パスワード認証成功 → OTP入力画面へ
      setEmail(loginData.email)
      setRequestId(otpData.requestId) // requestIdを保存
      setLoginStep("otp")
    } catch (err) {
      console.error('Login error:', err)
      setError(err instanceof Error ? err.message : 'ログインに失敗しました')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // ステップ2: OTP認証（useCallbackでメモ化）
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
        throw new Error(data.error || 'ワンタイムパスワードの認証に失敗しました')
      }

      // ログイン成功
      console.log('OTP verification successful:', data)

      // トークンをlocalStorageに保存
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken)
      }
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken)
      }

      // リダイレクト先を確認
      const redirectPath = sessionStorage.getItem('redirectAfterLogin')
      if (redirectPath) {
        sessionStorage.removeItem('redirectAfterLogin')
        router.push(redirectPath)
      } else {
        // モニター登録期間中はマイページに遷移
        // 正式リリース後は店舗一覧画面に変更
        router.push('/home?view=mypage&auto-login=true')
      }
    } catch (err) {
      console.error('OTP verification error:', err)
      setError(err instanceof Error ? err.message : 'ワンタイムパスワードの認証に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }, [email, requestId, router])

  // OTP再送信（useCallbackでメモ化）
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
      setRequestId(otpData.requestId) // 新しいrequestIdを保存
      console.log('OTP resent successfully:', otpData)
    } catch (err) {
      console.error('OTP resend error:', err)
      setError(err instanceof Error ? err.message : 'ワンタイムパスワードの再送信に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }, [email])

  // パスワード入力画面に戻る（useCallbackでメモ化）
  const handleBackToPassword = useCallback(() => {
    setLoginStep("password")
    setError("")
  }, [])

  const handleSignup = useCallback(() => {
    router.push('/email-registration')
  }, [router])

  const handleForgotPassword = useCallback(() => {
    router.push('/password-reset')
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      <LoginLayout
        onLogin={handlePasswordLogin}
        onVerifyOtp={handleOtpVerify}
        onSignup={handleSignup}
        onForgotPassword={handleForgotPassword}
        onResendOtp={handleResendOtp}
        onBackToPassword={handleBackToPassword}
        isLoading={isLoading}
        error={error}
        loginStep={loginStep}
        email={email}
      />
    </div>
  )
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-green-600 font-medium">読み込み中...</p>
          </div>
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  )
}

/*
===============================================================================
以下は正式リリース時に使用する元のコード（店舗一覧画面）
モニター登録期間終了後、上記のコードを削除してこちらを有効化する
===============================================================================

"use client"

import { useEffect, useMemo, Suspense, useReducer } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useNavigation } from "@/hooks/useNavigation"
import { useFilters } from "@/hooks/useFilters"
import { useRouter } from "next/navigation"

// 分離したコンポーネントとフックをインポート
import { AppContext } from "@/contexts/AppContext"
import { initialState, appReducer } from "@/hooks/useAppReducer"
import { useDataLoader } from "@/hooks/useDataLoader"
import { useComputedValues } from "@/hooks/useComputedValues"
import { useAppHandlers } from "@/hooks/useAppHandlers"
import { HomeLayout } from "@/components/layouts/HomeLayout"

// メインコンポーネント
export default function HomePage() {
  // カスタムフックを使用
  const auth = useAuth();
  const navigation = useNavigation();
  const filters = useFilters();
  const router = useRouter()

  // useReducerで状態管理を統合
  const [state, dispatch] = useReducer(appReducer, initialState)

  // データ読み込みの最適化
  const { loadData, isLoading: dataLoading, error: dataError } = useDataLoader()

  // データの遅延読み込み
  useEffect(() => {
    const initializeData = async () => {
      const data = await loadData()
      dispatch({ type: 'SET_STORES', payload: data.stores as any })
      dispatch({ type: 'SET_NOTIFICATIONS', payload: data.notifications as any })
      dispatch({ type: 'SET_DATA_LOADED', payload: true })
    }

    initializeData()
  }, [loadData])

  // デバッグ用のログ（開発環境のみ）
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
    }
  }, [state.isDataLoaded, state.stores.length, state.notifications.length, navigation.currentView, auth.isAuthenticated])

  // 計算値をカスタムフックで分離
  const computedValues = useComputedValues(
    state.stores as any[],
    state.notifications as any[],
    auth,
    filters
  )

  // ハンドラーを作成
  const handlers = useAppHandlers(dispatch, auth, navigation, filters, router, state)

  // Context値をメモ化
  const contextValue = useMemo(() => ({
    state,
    dispatch,
    handlers,
    auth,
    navigation,
    filters,
    computedValues
  }), [state, dispatch, handlers, auth, navigation, filters, computedValues])

  // 背景色をメモ化
  const backgroundColorClass = useMemo(() => {
    return "bg-gradient-to-br from-green-50 to-green-100"
  }, [])

  // データが読み込まれるまでローディング表示
  if (!state.isDataLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-green-600 font-medium">データを読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <AppContext.Provider value={contextValue}>
      <div className={`min-h-screen flex flex-col ${backgroundColorClass} w-full`}>
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-green-600 font-medium">読み込み中...</p>
            </div>
          </div>
        }>
          <HomeLayout />
        </Suspense>
      </div>
    </AppContext.Provider>
  )
}
*/
