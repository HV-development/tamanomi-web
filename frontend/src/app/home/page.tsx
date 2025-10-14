"use client"

/**
 * ホーム画面（店舗一覧・マイページなど）
 * ログイン後にアクセスする画面
 */

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

  // URLパラメータからauto-loginとviewを取得
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const autoLogin = urlParams.get('auto-login')
      const view = urlParams.get('view')

      if (autoLogin === 'true') {
        // 自動ログイン処理（トークンがある場合）
        const accessToken = localStorage.getItem('accessToken')
        if (accessToken && !auth.isAuthenticated) {
          // モックユーザーでログイン（暫定対応）
          import("@/data/mock-user").then(({ mockUser, mockPlan, mockUsageHistory, mockPaymentHistory }) => {
            auth.login({
              ...mockUser,
              contractStartDate: new Date("2019-01-01")
            }, mockPlan, mockUsageHistory, mockPaymentHistory)

            // viewパラメータがmypageの場合はマイページに遷移
            if (view === 'mypage') {
              navigation.navigateToView("mypage", "mypage")
              navigation.navigateToMyPage("main")
            }
          })
        }

        // URLパラメータをクリア
        window.history.replaceState({}, '', window.location.pathname + (view ? `?view=${view}` : ''))
      }
    }
  }, [auth, navigation])

  // useReducerで状態管理を統合
  const [state, dispatch] = useReducer(appReducer, initialState)

  // データ読み込みの最適化
  const { loadData } = useDataLoader()

  // データの遅延読み込み
  useEffect(() => {
    const initializeData = async () => {
      const data = await loadData()
      dispatch({ type: 'SET_STORES', payload: data.stores })
      dispatch({ type: 'SET_NOTIFICATIONS', payload: data.notifications })
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

