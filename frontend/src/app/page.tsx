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
import { Suspense, useState } from "react"
import { apiPost } from "@/lib/api"

function LoginPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [loginStep, setLoginStep] = useState<"password" | "otp">("password")
  const [email, setEmail] = useState<string>("")
  const [requestId, setRequestId] = useState<string>("")

  // URLパラメータから payment-success を確認（カード登録完了後の遷移用）
  const paymentSuccess = searchParams.get('payment-success')
  const view = searchParams.get('view')

  // payment-success パラメータがある場合、またはviewがmypageの場合は元のページに遷移
  if (paymentSuccess === 'true' || view === 'mypage') {
    // 元のホーム画面（店舗一覧）に遷移
    // TODO: 正式リリース時に有効化
    // router.push(`/home?view=${view || 'stores'}&payment-success=${paymentSuccess}`)
    
    // 現時点ではログイン画面にリダイレクト
    // ログイン後にマイページに遷移するようにする
    if (typeof window !== 'undefined' && view === 'mypage') {
      sessionStorage.setItem('redirectAfterLogin', `/home?view=mypage${paymentSuccess ? '&payment-success=true' : ''}`)
    }
  }

  // ステップ1: パスワード認証 + OTP送信
  const handlePasswordLogin = async (userEmail: string, password: string) => {
    setIsLoading(true)
    setError("")

    try {
      // パスワード認証を実行
      const data = await apiPost<{ success?: boolean; error?: string }>('/api/auth/login', {
        email: userEmail,
        password,
      })

      console.log('Password authentication successful:', data)

      // OTP送信
      const otpData = await apiPost<{ requestId: string }>('/api/auth/send-otp', {
        email: userEmail,
      })

      console.log('OTP sent successfully:', otpData)

      // パスワード認証成功 → OTP入力画面へ
      setEmail(userEmail)
      setRequestId(otpData.requestId) // requestIdを保存
      setLoginStep("otp")
    } catch (err) {
      console.error('Login error:', err)
      setError(err instanceof Error ? err.message : 'ログインに失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  // ステップ2: OTP認証
  const handleOtpVerify = async (otp: string) => {
    setIsLoading(true)
    setError("")

    try {
      const data = await apiPost<{ accessToken?: string; refreshToken?: string }>('/api/auth/verify-otp', {
        email,
        otp,
        requestId,
      })

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
  }

  // OTP再送信
  const handleResendOtp = async () => {
    setIsLoading(true)
    setError("")

    try {
      const otpData = await apiPost<{ requestId: string }>('/api/auth/send-otp', {
        email,
      })

      setRequestId(otpData.requestId) // 新しいrequestIdを保存
      console.log('OTP resent successfully:', otpData)
    } catch (err) {
      console.error('OTP resend error:', err)
      setError(err instanceof Error ? err.message : 'ワンタイムパスワードの再送信に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  // パスワード入力画面に戻る
  const handleBackToPassword = () => {
    setLoginStep("password")
    setError("")
  }

  const handleSignup = () => {
    router.push('/email-registration')
  }

  const handleForgotPassword = () => {
    router.push('/password-reset')
  }

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
