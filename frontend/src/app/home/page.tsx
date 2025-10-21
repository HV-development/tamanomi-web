"use client"

/**
 * ホーム画面（店舗一覧・マイページなど）
 * ログイン後にアクセスする画面
 */

import { useEffect, useMemo, Suspense, useReducer, useRef } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useNavigation } from "@/hooks/useNavigation"
import { useFilters } from "@/hooks/useFilters"
import { useRouter } from "next/navigation"
import { Store, Notification } from '@hv-development/schemas'

// 分離したコンポーネントとフックをインポート
import { AppContext } from "@/contexts/AppContext"
import { initialState, appReducer } from "@/hooks/useAppReducer"
import { useDataLoader } from "@/hooks/useDataLoader"
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
      const autoLogin = urlParams.get('auto-login')
      const view = urlParams.get('view')
      const token = urlParams.get('token')
      
      // ★URLパラメータからトークンを取得してlocalStorageに保存（auto-loginの場合）
      if (autoLogin === 'true' && token) {
        localStorage.setItem('accessToken', token)
      }

      // アクセストークンを取得
      const accessToken = localStorage.getItem('accessToken')

      // ログインしているかチェック（auto-loginパラメータがない場合のみ）
      if (!accessToken && view !== 'map' && autoLogin !== 'true') {
        // ログインしていない場合はログインページにリダイレクト（マップビュー以外）
        router.push('/')
        return
      }
      
      // 自動ログイン処理（トークンがあり、まだ認証されていない場合）
      if (accessToken && !auth.isAuthenticated) {
        // トークンがある場合、ユーザー情報を取得
        fetch('/api/user/me', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        })
          .then(response => {
            if (!response.ok) {
              throw new Error('Failed to fetch user data')
            }
            return response.json()
          })
          .then(userData => {
            // ユーザーデータでauth.loginを呼び出す
            auth.login(userData, userData.plan, [], [])

            // プラン登録状況を確認して適切な画面に遷移
            const hasPlan = userData.plan !== null && userData.plan !== undefined

            // ビューパラメータに応じて遷移
            if (view === 'mypage') {
              // マイページに遷移
              navigation.navigateToView("mypage", "mypage")
              navigation.navigateToMyPage("main")
            } else if (!view) {
              // ビューパラメータがない場合（リロード時など）
              if (!hasPlan) {
                // プラン未登録の場合はプラン登録画面へ
                router.push('/plan-registration')
                return
              } else {
                // プラン登録済みの場合はマイページへ（一時的な対応）
                navigation.navigateToView("mypage", "mypage")
                navigation.navigateToMyPage("main")
              }
            }
          })
          .catch(() => {
            // トークンが無効な場合はクリア
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            // ログインページにリダイレクト
            router.push('/')
          })
      } else if (accessToken && auth.isAuthenticated) {
        // 既に認証済みの場合（リロード時など）
        
        // ビューパラメータがない場合はマイページへ遷移（一時的な対応）
        if (!view) {
          navigation.navigateToView("mypage", "mypage")
          navigation.navigateToMyPage("main")
        } else if (view === 'mypage') {
          navigation.navigateToView("mypage", "mypage")
          navigation.navigateToMyPage("main")
        }
      } else if (!accessToken && view !== 'map') {
        // トークンがない場合でviewパラメータがある場合の処理
        if (view === 'mypage') {
          navigation.navigateToView("mypage", "mypage")
          navigation.navigateToMyPage("main")
        }
      }

      // ★URLパラメータをクリア（auto-loginパラメータのみ削除）
      if (autoLogin === 'true') {
        const newUrl = new URL(window.location.href)
        newUrl.searchParams.delete('auto-login')
        window.history.replaceState({}, '', newUrl.toString())
      }
      
      // 初期化完了フラグを立てる
      isInitialized.current = true
    }
  }, [auth, navigation, router])

  // useReducerで状態管理を統合
  const [state, dispatch] = useReducer(appReducer, initialState)

  // データ読み込みの最適化
  const { loadData } = useDataLoader()

  // データの遅延読み込み
  useEffect(() => {
    const initializeData = async () => {
      const data = await loadData()
      dispatch({ type: 'SET_STORES', payload: data.stores as Store[] })
      dispatch({ type: 'SET_NOTIFICATIONS', payload: data.notifications as Notification[] })
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

