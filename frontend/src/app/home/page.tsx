"use client"

/**
 * ホーム画面（店舗一覧・マイページなど）
 * ログイン後にアクセスする画面
 */

import { useEffect, useMemo, Suspense, useReducer, useRef, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useNavigation } from "@/hooks/useNavigation"
import { useFilters } from "@/hooks/useFilters"
import { useRouter } from "next/navigation"
// 店舗データは HomeLayout 内の無限スクロールで取得するため、ここでは型の直接参照は不要

// 分離したコンポーネントとフックをインポート
import { AppContext } from "@/contexts/AppContext"
import { initialState, appReducer } from "@/hooks/useAppReducer"
// 店舗データの読み込みは HomeLayout に移譲
import { useComputedValues } from "@/hooks/useComputedValues"
import { useAppHandlers } from "@/hooks/useAppHandlers"
import dynamic from "next/dynamic"

// HomeLayoutを動的インポート（遅延読み込み）
const HomeLayout = dynamic(() => import("@/components/templates/HomeLayout").then(mod => ({ default: mod.HomeLayout })), {
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-green-600 font-medium">読み込み中...</p>
      </div>
    </div>
  ),
  ssr: false,
})

// メインコンポーネント
export default function HomePage() {
  // カスタムフックを使用
  const auth = useAuth();
  const navigation = useNavigation();
  const filters = useFilters();
  const router = useRouter()
  
  // 初期化フラグ（初回のみ実行するため）
  const isInitialized = useRef(false)

  // ★一時的な対応：正式リリースまではマイページをデフォルト表示
  // 正式リリース時には店舗一覧をデフォルト表示に変更
  useEffect(() => {
    // 初回のみ実行
    if (isInitialized.current) {
      return
    }
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const view = urlParams.get('view')
      
      // useAuthが自動的にCookieから認証チェックするため、特別な処理は不要
      // ここではビューパラメータに応じた遷移のみ処理
      if (view === 'mypage' && auth.isAuthenticated) {
        // マイページに遷移
        navigation.navigateToView("mypage", "mypage")
        navigation.navigateToMyPage("main")
      }
      
      // 初期化完了フラグを立てる
      isInitialized.current = true
    }
  }, [auth, navigation, router])

  // useReducerで状態管理を統合
  const [state, dispatch] = useReducer(appReducer, initialState)

  // デバッグ用のログ（開発環境のみ）
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
    }
  }, [state.isDataLoaded, state.stores.length, state.notifications.length, navigation.currentView, auth.isAuthenticated])

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

  // ログイン後のリダイレクトフラグをチェック
  const [isLoginRedirecting, setIsLoginRedirecting] = useState(false)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loginRedirecting = sessionStorage.getItem('loginRedirecting')
      setIsLoginRedirecting(loginRedirecting === '/home' || loginRedirecting?.startsWith('/home') || false)
    }
  }, [])

  // ログイン後のリダイレクトフラグを定期的にチェック（HomeLayoutでクリアされるまで）
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkRedirecting = () => {
        const loginRedirecting = sessionStorage.getItem('loginRedirecting')
        setIsLoginRedirecting(loginRedirecting === '/home' || loginRedirecting?.startsWith('/home') || false)
      }
      
      // 初回チェック
      checkRedirecting()
      
      // 定期的にチェック（HomeLayoutでフラグがクリアされるまで）
      const interval = setInterval(checkRedirecting, 100)
      
      return () => clearInterval(interval)
    }
  }, [])

  // データが読み込まれたら、ログイン後のリダイレクトフラグをクリア（フォールバック）
  useEffect(() => {
    if (state.isDataLoaded && typeof window !== 'undefined') {
      const loginRedirecting = sessionStorage.getItem('loginRedirecting')
      if (loginRedirecting === '/home' || loginRedirecting?.startsWith('/home')) {
        // レンダリングが完了するのを待つため、複数のフレームでフラグをクリア
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              sessionStorage.removeItem('loginRedirecting')
              setIsLoginRedirecting(false)
            })
          })
        })
      }
    }
  }, [state.isDataLoaded])

  // タイムアウト: 10秒経過後に強制的にフラグをクリア（セーフティネット）
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loginRedirecting = sessionStorage.getItem('loginRedirecting')
      if (loginRedirecting === '/home' || loginRedirecting?.startsWith('/home')) {
        const timeout = setTimeout(() => {
          sessionStorage.removeItem('loginRedirecting')
          setIsLoginRedirecting(false)
        }, 10000) // 10秒後に強制的にクリア
        
        return () => clearTimeout(timeout)
      }
    }
  }, [])

  // ログイン後のリダイレクト中のみローディング表示（データ読み込みはHomeLayout内で部分的に表示）
  if (isLoginRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-green-600 font-medium">読み込み中...</p>
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
          <HomeLayout onMount={() => setIsLoginRedirecting(false)} />
        </Suspense>
      </div>
    </AppContext.Provider>
  )
}

