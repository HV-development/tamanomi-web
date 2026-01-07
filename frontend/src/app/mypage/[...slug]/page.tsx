"use client"

import { useMemo, Suspense, useReducer, useEffect, useRef } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useNavigation } from "@/hooks/useNavigation"
import { useFilters } from "@/hooks/useFilters"
import { useRouter, useParams } from "next/navigation"

// 分離したコンポーネントとフックをインポート
import { AppContext } from "@/contexts/AppContext"
import { initialState, appReducer } from "@/hooks/useAppReducer"
import { useComputedValues } from "@/hooks/useComputedValues"
import { useAppHandlers } from "@/hooks/useAppHandlers"
import { HomeLayout } from "@/components/templates/HomeLayout"

// マイページサブページコンポーネント（/mypage/edit, /mypage/email, /mypage/password など）
export default function MypageSubPage() {
  // カスタムフックを使用
  const auth = useAuth();
  const navigation = useNavigation();
  const filters = useFilters();
  const router = useRouter()
  const params = useParams()
  
  // 初期化フラグ（初回のみ実行するため）
  const isInitialized = useRef(false)

  // useReducerで状態管理を統合
  const [state, dispatch] = useReducer(appReducer, initialState)

  // URLパスに応じたビュー遷移処理
  useEffect(() => {
    // 初回のみ実行
    if (isInitialized.current) {
      return
    }
    if (typeof window !== 'undefined') {
      // マイページビューに遷移
      if (auth.isAuthenticated) {
        navigation.navigateToView("mypage", "mypage")
        
        // サブページに応じたビューを設定
        const slug = params.slug as string[] | undefined
        if (slug && slug.length > 0) {
          const subPage = slug[0]
          switch (subPage) {
            case 'edit':
              navigation.navigateToMyPage("edit")
              break
            case 'email':
              navigation.navigateToMyPage("email")
              break
            case 'password':
              navigation.navigateToMyPage("password")
              break
            case 'history':
              navigation.navigateToMyPage("history")
              break
            case 'payments':
            case 'payment':
              navigation.navigateToMyPage("payments")
              break
            case 'subscription':
              navigation.navigateToMyPage("subscription")
              break
            default:
              navigation.navigateToMyPage("main")
          }
        } else {
          navigation.navigateToMyPage("main")
        }
      } else {
        // 未認証の場合はログイン画面に遷移
        navigation.navigateToView("login")
      }
      
      // 初期化完了フラグを立てる
      isInitialized.current = true
    }
  }, [navigation, router, auth.isAuthenticated, params.slug])

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

