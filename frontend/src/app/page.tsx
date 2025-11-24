"use client"

import { useMemo, Suspense, useReducer, useEffect, useRef } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useNavigation } from "@/hooks/useNavigation"
import { useFilters } from "@/hooks/useFilters"
import { useRouter } from "next/navigation"

// 分離したコンポーネントとフックをインポート
import { AppContext } from "@/contexts/AppContext"
import { initialState, appReducer } from "@/hooks/useAppReducer"
import { useComputedValues } from "@/hooks/useComputedValues"
import { useAppHandlers } from "@/hooks/useAppHandlers"
import { HomeLayout } from "@/components/templates/HomeLayout"

// メインコンポーネント
export default function HomePage() {
  // カスタムフックを使用
  const auth = useAuth();
  const navigation = useNavigation();
  const filters = useFilters();
  const router = useRouter()
  
  // 初期化フラグ（初回のみ実行するため）
  const isInitialized = useRef(false)

  // URLパラメータに応じたビュー遷移処理
  useEffect(() => {
    // 初回のみ実行
    if (isInitialized.current) {
      return
    }
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const view = urlParams.get('view')
      
      if (view === 'login') {
        // ログイン画面に遷移
        navigation.navigateToView("login")
      }
      
      // 初期化完了フラグを立てる
      isInitialized.current = true
    }
  }, [navigation, router])

  // useReducerで状態管理を統合
  const [state, dispatch] = useReducer(appReducer, initialState)

  // デバッグ用のログ（開発環境のみ）
  // state.stores は HomeLayout 内の無限スクロールで更新

  // 計算値をカスタムフックで分離
  const computedValues = useComputedValues({
    stores: state.stores,
    notifications: state.notifications,
    auth,
    filters
  })

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

  // データ読み込みはHomeLayout内で部分的に表示するため、ここでのローディング表示は不要
  // （店舗一覧部分のみローディング表示）

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

/*
===============================================================================
以下はモニター登録期間用の一時的な対応（ログイン画面）
正式リリース時に削除する
===============================================================================

"use client"

import { LoginLayout } from "@/components/templates/LoginLayout"
import { Suspense } from "react"
import { useLoginPage } from "@/hooks/useLoginPage"

function LoginPageContent() {
  const {
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
  } = useLoginPage()

  // 認証チェック中はローディング表示
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-green-600 font-medium">認証状態を確認中...</p>
        </div>
      </div>
    )
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
*/
