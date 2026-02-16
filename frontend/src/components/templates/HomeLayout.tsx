"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { HomeContainer } from "../organisms/HomeContainer"
import { LoginLayout } from "./LoginLayout"
import { EmailRegistrationContainer } from "../organisms/EmailRegistrationContainer"
import { RegisterContainer } from "../organisms/RegisterContainer"
import { ConfirmationContainer } from "../organisms/ConfirmationContainer"
import { SubscriptionContainer } from "../organisms/SubscriptionContainer"
import { PasswordResetContainer } from "../organisms/PasswordResetContainer"

import { HistoryPopup } from "../molecules/HistoryPopup"
import { SearchBar } from "../molecules/SearchBar"
import { MyPageLayout } from "./MypageLayout"
import { PlanManagementContainer } from "../organisms/PlanManagementContainer"
import { PlanChangeContainer } from "../organisms/PlanChangeContainer"
import { StoreIntroductionForm } from "../organisms/StoreIntroductionForm"
import { CouponListPopup } from "../molecules/CouponListPopup"
import { CouponUsedSuccessModal } from "../molecules/CouponUsedSuccessModal"
import { LoginRequiredModal } from "../molecules/LoginRequiredModal"
import { PlanRequiredModal } from "../molecules/PlanRequiredModal"
import { EmailChangeSuccessModal } from "../organisms/EmailChangeSuccessModal"
import { StoreDetailPopup } from "@/components/organisms/StoreDetailPopup"
import { Logo } from "../atoms/Logo"
import { EmailConfirmationComplete } from "../molecules/EmailConfirmationComplete"
import CouponConfirmationPage from "../molecules/CouponConfirmationPage"
import { UsageGuidePage } from "../molecules/UsageGuidePage"
import { FooterNavigation } from "../molecules/FooterNavigation"
import { BannerCarousel } from "@/components/organisms/BannerCarousel"
import { AreaPopup } from "../molecules/AreaPopup"
import { GenrePopup } from "../molecules/GenrePopup"
import { HamburgerMenu } from "../molecules/HamburgerMenu"
import { UsageGuideModal } from "@/components/organisms/UsageGuideModal"
import { useAppContext } from "@/contexts/AppContext"
import type { Store } from "@/types/store"
import type { Coupon as UiCoupon } from "@/types/coupon"
import type { MyPageViewType } from "@/types/navigation"
import type { AppAction, Coupon as SchemaCoupon } from '@hv-development/schemas'
import { useInfiniteStores } from "@/hooks/useInfiniteStores"
import { useFavorites } from "@/hooks/useFavorites"
import { checkTodayUsage } from "@/utils/coupon-usage-check"
import type { CreateStoreIntroductionRequest } from "@/types/store-introduction"

interface HomeLayoutProps {
  onMount?: () => void
}

export function HomeLayout({ onMount }: HomeLayoutProps) {
  // Context から必要な値を取得
  const { state, dispatch, handlers, auth, navigation, filters, computedValues } = useAppContext()

  // ポップアップとモーダルの状態管理
  const [isAreaPopupOpen, setIsAreaPopupOpen] = useState(false)
  const [isGenrePopupOpen, setIsGenrePopupOpen] = useState(false)
  const [isUsageGuideModalOpen, setIsUsageGuideModalOpen] = useState(false)
  // 検索モードの状態管理
  const [isSearchMode, setIsSearchMode] = useState(false)
  const [searchResults, setSearchResults] = useState<Store[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchKeyword, setSearchKeyword] = useState<string>('')

  // 検索ボタンが押されたときに検索モードをトグル
  useEffect(() => {
    setIsSearchMode(state.isSearchPopupOpen)
    // 検索モードが閉じられたら検索結果もクリア
    if (!state.isSearchPopupOpen) {
      setSearchResults([])
    }
  }, [state.isSearchPopupOpen])
  const [isCouponUsedToday, setIsCouponUsedToday] = useState(false)
  const [isCheckingUsage, setIsCheckingUsage] = useState(false)
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(false)
  const [hasStoreIntroduction, setHasStoreIntroduction] = useState(false)
  const [storeIntroductionData, setStoreIntroductionData] = useState<{
    storeName1: string;
    recommendedMenu1: string;
    storeName2: string;
    recommendedMenu2: string;
    storeName3: string;
    recommendedMenu3: string;
  } | null>(null)

  // 必要な値をローカル変数として定義
  const selectedGenres = filters.selectedGenres
  const selectedEvents = filters.selectedEvents
  const selectedAreas = filters.selectedAreas
  const isNearbyFilter = filters.isNearbyFilter
  const isFavoritesFilter = filters.isFavoritesFilter
  // AppContext の AppState は schemas 側の型に固定されているため、UI 側の Store 型として扱う
  const stores = state.stores as unknown as Store[]
  const currentView = navigation.currentView
  const myPageView = navigation.myPageView
  const isAuthenticated = auth.isAuthenticated
  const isLoading = auth.isLoading
  const signupData = state.signupData
  const isFavoritesOpen = state.isFavoritesOpen
  const historyStores: Store[] = [] // TODO: 履歴データの実装
  const isHistoryOpen = state.isHistoryOpen

  // お気に入り一覧をAPIから取得、またはセッションストレージから取得
  const { favoriteStores: apiFavoriteStores } = useFavorites(isFavoritesOpen, isAuthenticated, { allStores: stores })
  // ローカルフィルタリングによるお気に入り一覧（フィルター表示用）
  const favoriteStores = isFavoritesOpen ? apiFavoriteStores : computedValues.favoriteStores

  // 認証済みユーザーの場合、お気に入り状態を同期する
  useEffect(() => {
    if (!isAuthenticated || !stores.length) return

    const syncFavorites = async () => {
      try {
        const response = await fetch('/api/favorites', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
          credentials: 'include', // Cookieを送信
        })

        if (!response.ok) {
          return
        }

        const data = await response.json()
        const favoriteShopIds = (data.shops || []).map((shop: { id: string }) => shop.id) as string[]

        // 各店舗のisFavorite状態を同期
        dispatch({
          type: 'SYNC_FAVORITES',
          payload: favoriteShopIds
        })
      } catch (error) {
        console.error('❌ [HomeLayout] Error syncing favorites:', error)
      }
    }

    // 初回ロード時とログイン時に同期
    syncFavorites()
  }, [isAuthenticated, stores.length, dispatch])

  // 店舗紹介登録状態を取得（マイページ表示時のみ）
  useEffect(() => {
    const checkStoreIntroduction = async () => {
      // マイページ表示中かつ認証済みの場合のみチェック
      if (!isAuthenticated || currentView !== 'mypage') {
        setHasStoreIntroduction(false)
        setStoreIntroductionData(null)
        return
      }

      try {
        // /api/store-introductionsのGETエンドポイントを使用
        const response = await fetch('/api/store-introductions', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
          credentials: 'include',
        })

        // 200ならデータがあるかチェック、404なら未登録
        if (response.ok) {
          const data = await response.json()
          // データがオブジェクトで、idが存在すれば登録済み
          if (data && typeof data === 'object' && 'id' in data) {
            setHasStoreIntroduction(true)
            // フォーム用のデータを保存
            setStoreIntroductionData({
              storeName1: data.storeName1 || '',
              recommendedMenu1: data.recommendedMenu1 || '',
              storeName2: data.storeName2 || '',
              recommendedMenu2: data.recommendedMenu2 || '',
              storeName3: data.storeName3 || '',
              recommendedMenu3: data.recommendedMenu3 || '',
            })
          } else {
            setHasStoreIntroduction(false)
            setStoreIntroductionData(null)
          }
        } else {
          // 401, 404などのエラーは未登録として扱う
          setHasStoreIntroduction(false)
          setStoreIntroductionData(null)
        }
      } catch {
        // ネットワークエラーなども未登録として扱う
        setHasStoreIntroduction(false)
        setStoreIntroductionData(null)
      }
    }

    checkStoreIntroduction()
  }, [isAuthenticated, currentView, myPageView])

  // storesが変更されたときにも同期する（店舗データが読み込まれた後）
  useEffect(() => {
    if (!isAuthenticated || !stores.length) return

    // 少し遅延してから同期（店舗データが完全に読み込まれた後）
    const timer = setTimeout(() => {
      const syncFavorites = async () => {
        try {
          const response = await fetch('/api/favorites', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            cache: 'no-store',
            credentials: 'include', // Cookieを送信
          })

          if (!response.ok) return

          const data = await response.json()
          const favoriteShopIds = (data.shops || []).map((shop: { id: string }) => shop.id) as string[]

          // 各店舗のisFavorite状態を同期
          dispatch({
            type: 'SYNC_FAVORITES',
            payload: favoriteShopIds
          })
        } catch (error) {
          console.error('❌ [HomeLayout] Error syncing favorites:', error)
        }
      }

      syncFavorites()
    }, 1000)

    return () => clearTimeout(timer)
  }, [stores.length, isAuthenticated, dispatch])

  const user = auth.user
  const plan = auth.plan
  const usageHistory = auth.usageHistory || []
  const paymentHistory = auth.paymentHistory || []
  const isCouponListOpen = state.isCouponListOpen
  const selectedStore = state.selectedStore as unknown as Store | null
  const selectedSchemaCoupon = state.selectedCoupon
  const storeSchemaCoupons = state.storeCoupons
  const passwordResetStep = state.passwordResetStep
  const passwordResetEmail = state.passwordResetEmail
  const emailRegistrationStep = state.emailRegistrationStep
  const emailRegistrationEmail = state.emailRegistrationEmail

  const getStoreNameById = useCallback((storeId: string) => {
    if (selectedStore?.id === storeId) return selectedStore.name
    return stores.find((s) => s.id === storeId)?.name
  }, [selectedStore, stores])

  const toUiCoupon = useCallback((coupon: SchemaCoupon): UiCoupon => {
    const storeName = getStoreNameById(coupon.shopId)
    if (!storeName) {
      console.error('❌ [HomeLayout] storeName not found for coupon.shopId:', coupon.shopId)
    }
    return {
      id: coupon.id,
      uuid: coupon.id,
      title: coupon.title,
      description: coupon.description,
      conditions: coupon.conditions,
      imageUrl: coupon.imageUrl,
      drinkType: coupon.drinkType ?? null,
      status: coupon.status,
      storeId: coupon.shopId,
      storeName: storeName ?? "",
      createdAt: coupon.createdAt,
      updatedAt: coupon.updatedAt,
    }
  }, [getStoreNameById])

  const selectedCoupon = useMemo(() => {
    if (!selectedSchemaCoupon) return null
    return toUiCoupon(selectedSchemaCoupon)
  }, [selectedSchemaCoupon, toUiCoupon])

  const storeCoupons = useMemo(() => {
    return storeSchemaCoupons.map(toUiCoupon)
  }, [storeSchemaCoupons, toUiCoupon])

  // クーポン使用履歴のチェック
  useEffect(() => {
    const checkUsage = async () => {
      if (!isCouponListOpen || !selectedStore) {
        setIsCouponUsedToday(false)
        setIsCheckingUsage(false)
        return
      }

      if (!isAuthenticated) {
        setIsCouponUsedToday(false)
        setIsCheckingUsage(false)
        return
      }

      setIsCheckingUsage(true)
      try {
        const hasUsedToday = await checkTodayUsage(selectedStore.id)
        setIsCouponUsedToday(hasUsedToday)
      } catch (error) {
        console.error('使用履歴チェックエラー:', error)
        setIsCouponUsedToday(false)
      } finally {
        setIsCheckingUsage(false)
      }
    }

    checkUsage()
  }, [isCouponListOpen, selectedStore, isAuthenticated])

  // イベントハンドラーを Context から取得
  const onGenresChange = filters.setSelectedGenres
  const onEventsChange = filters.setSelectedEvents
  const onAreasChange = filters.setSelectedAreas
  const onCurrentLocationClick = handlers.handleCurrentLocationClick
  const onFavoritesClose = handlers.handleFavoritesClose
  const onHistoryClose = handlers.handleHistoryClose
  const onFavoriteToggle = handlers.handleFavoriteToggle
  // クーポン取得中のローディング状態を管理するラッパー
  const onCouponsClick = useCallback(async (storeId: string) => {
    setIsLoadingCoupons(true)
    try {
      // 検索結果から店舗を探す（検索モードの場合）
      if (isSearchMode && searchKeyword.trim()) {
        const searchStore = searchResults.find((s) => s.id === storeId)
        if (searchStore && !state.stores.find((s) => s.id === storeId)) {
          // 検索結果の店舗がstate.storesに存在しない場合は追加
          dispatch({ type: 'SET_STORES', payload: [...state.stores, searchStore] } as AppAction)
        }
      }
      await handlers.handleCouponsClick(storeId)
    } finally {
      setIsLoadingCoupons(false)
    }
  }, [handlers, isSearchMode, searchKeyword, searchResults, state.stores, dispatch])
  const onMyPageViewChange = navigation.navigateToMyPage
  const onEditProfile = handlers.handleEditProfile
  const onChangeEmail = handlers.handleChangeEmail
  const onChangePassword = handlers.handleChangePassword
  const onViewPlan = handlers.handleViewPlan
  const onPlanChangeSubmit = handlers.handlePlanChangeSubmit
  const onViewUsageHistory = handlers.handleViewUsageHistory
  const onViewPaymentHistory = handlers.handleViewPaymentHistory
  const onCancelSubscription = handlers.handleCancelSubscription
  const onWithdraw = handlers.handleWithdraw
  const onWithdrawConfirm = handlers.handleWithdrawConfirm
  const onWithdrawCancel = handlers.handleWithdrawCancel
  const onWithdrawComplete = handlers.handleWithdrawComplete
  interface ExtendedHandlers {
    handleStoreIntroduction: () => void;
    handleStoreIntroductionSubmit: (data: CreateStoreIntroductionRequest) => Promise<void>;
  }
  // AppContext上のhandlers型がAppHandlersに固定されているため、実体に合わせてunknown経由で拡張分を取り出す
  const extendedHandlers = handlers as unknown as ExtendedHandlers
  const onStoreIntroduction = extendedHandlers.handleStoreIntroduction
  const onStoreIntroductionSubmit = extendedHandlers.handleStoreIntroductionSubmit
  const onLogout = handlers.handleLogout
  const onLogin = handlers.handleLogin
  const onSignup = handlers.handleSignup
  const onForgotPassword = handlers.handleForgotPassword
  const onBackToHome = handlers.handleBackToHome
  const onBackToLogin = handlers.handleBackToLogin
  const onEmailSubmit = handlers.handleEmailSubmit
  const onEmailRegistrationBackToLogin = handlers.handleEmailRegistrationBackToLogin
  const onEmailRegistrationResend = handlers.handleEmailRegistrationResend
  const onSignupSubmit = handlers.handleSignupSubmit
  const onSignupCancel = handlers.handleSignupCancel
  const onConfirmRegister = handlers.handleConfirmRegister
  const onConfirmEdit = handlers.handleConfirmEdit
  const onSubscribe = handlers.handleSubscribe
  const onPasswordResetSubmit = handlers.handlePasswordResetSubmit
  const onPasswordResetCancel = handlers.handlePasswordResetCancel
  const onPasswordResetResend = handlers.handlePasswordResetResend
  const onMenuItemClick = handlers.handleMenuItemClick
  const onPlanChangeBack = handlers.handlePlanChangeBack
  const onLogoClick = handlers.handleLogoClick
  // handlers 側の型は schemas の Store だが、UI コンポーネント側は "@/types/store" を期待するため、ここで型を合わせる
  const onStoreClick = handlers.handleStoreClick as unknown as (store: Store) => void
  const onCouponListClose = handlers.handleCouponListClose
  const onCouponListBack = handlers.handleCouponListBack
  const onUseCoupon = handlers.handleUseCoupon
  const onConfirmCoupon = handlers.handleConfirmCoupon
  const onCancelCoupon = handlers.handleCancelCoupon
  const onUseSameCoupon = handlers.handleUseSameCoupon
  const onUsageGuideBack = handlers.handleUsageGuideBack
  const isSuccessModalOpen = state.isSuccessModalOpen
  const onSuccessModalClose = handlers.handleSuccessModalClose
  const isLoginRequiredModalOpen = state.isLoginRequiredModalOpen
  const onLoginRequiredModalClose = handlers.handleLoginRequiredModalClose
  const onLoginRequiredModalLogin = handlers.handleLoginRequiredModalLogin
  const isPlanRequiredModalOpen = state.isPlanRequiredModalOpen
  const onPlanRequiredModalClose = handlers.handlePlanRequiredModalClose
  const onPlanRequiredModalRegister = handlers.handlePlanRequiredModalRegister
  const onProfileEditSubmit = handlers.handleProfileEditSubmit
  const onEmailChangeSubmit = handlers.handleEmailChangeSubmit
  const onPasswordChangeSubmit = handlers.handlePasswordChangeSubmit
  const onEmailChangeResend = handlers.handleEmailChangeResend
  const emailChangeStep = state.emailChangeStep
  const passwordChangeStep = state.passwordChangeStep
  const passwordChangeError = state.passwordChangeError
  const newEmail = state.newEmail
  const onStoreDetailClose = handlers.handleStoreDetailPopupClose
  const isStoreDetailPopupOpen = state.isStoreDetailPopupOpen
  const currentUserRank = computedValues.currentUserRank

  // 無限スクロール: 初回ロードと追加ロード
  const { isLoading: isStoresLoading, isLoadingMore, error, sentinelRef, items } = useInfiniteStores({
    limit: 20,
    selectedAreas: selectedAreas ?? [],
    selectedGenres: selectedGenres ?? [],
    isNearbyFilter,
    currentLocation: state.currentLocation,
    isLocationLoading: state.isLocationLoading,
  })

  // itemsとstate.storesをマージして、isFavorite状態を同期
  const mergedStores = useMemo(() => {
    if (items.length === 0) {
      return stores
    }

    // state.storesからisFavorite状態のマップを作成
    const favoriteMap = new Map<string, boolean>()
    stores.forEach(store => {
      favoriteMap.set(store.id, store.isFavorite)
    })

    // itemsの各店舗にisFavorite状態を適用
    return items.map(item => ({
      ...item,
      isFavorite: favoriteMap.get(item.id) ?? item.isFavorite
    }))
  }, [items, stores])

  // 検索処理を関数として抽出
  // エリアとジャンルで絞った条件（mergedStores）から店名をAND検索で絞る
  const performSearch = useCallback((keyword: string) => {
    if (!keyword.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    // mergedStoresは既にエリア・ジャンルでフィルタリング済み
    // その結果から店名でAND検索で絞る
    const keywordLower = keyword.toLowerCase().trim()
    const results = mergedStores.filter(store => {
      return store.name.toLowerCase().includes(keywordLower)
    })

    setSearchResults(results)
    setIsSearching(false)
  }, [mergedStores])

  // エリアやジャンルが変更された時に、検索モード中で検索キーワードがある場合は再検索
  useEffect(() => {
    if (isSearchMode && searchKeyword.trim()) {
      performSearch(searchKeyword)
    }
  }, [isSearchMode, searchKeyword, performSearch])

  // 初回ページの要素を Context の stores に反映するため、監視と反映
  const initialAppliedRef = useRef(false)
  useEffect(() => {
    // フックが管理する items を Context の stores に反映
    if (!initialAppliedRef.current && !isStoresLoading) {
      initialAppliedRef.current = true
    }
    // 長さが違う or 先頭IDが違う場合に更新（簡易判定）
    const needUpdate = (state.stores?.length || 0) !== (items?.length || 0)
      || (state.stores?.[0]?.id !== items?.[0]?.id)
    if (needUpdate) {
      // itemsをStore型に変換（型アサーションを使用）
      dispatch({ type: 'SET_STORES', payload: items } as AppAction)
      dispatch({ type: 'SET_DATA_LOADED', payload: true })
    }
  }, [items, isStoresLoading, dispatch, state.stores])

  // データが完全に読み込まれたら、マウント通知を送信
  // ログインリダイレクトフラグはhome/page.tsxで管理（メモリ内stateのみ）
  useEffect(() => {
    if (state.isDataLoaded && !isStoresLoading && onMount) {
      // レンダリングが完了するのを待つため、複数のフレームで通知
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            onMount()
          })
        })
      })
    }
  }, [state.isDataLoaded, isStoresLoading, onMount])

  // 追加ロード時の stores 追記（セントリネル交差で loadNext 実行済み）
  // 追加ロードはフック内部の items 更新で反映されるため、ここでの明示的処理は不要

  // 初回マウント時に位置情報を取得（近くのお店フィルターがデフォルトON）
  const initialLocationFetchedRef = useRef(false)
  useEffect(() => {
    if (initialLocationFetchedRef.current) return
    initialLocationFetchedRef.current = true
    
    // 初期表示時に位置情報を取得（handleCurrentLocationClickはトグルなので直接取得処理を実行）
    const fetchInitialLocation = async () => {
      dispatch({ type: 'SET_LOCATION_LOADING', payload: true })
      dispatch({ type: 'SET_LOCATION_ERROR', payload: null })
      
      try {
        const { getCurrentPosition } = await import('@/utils/location')
        const location = await getCurrentPosition()
        dispatch({ type: 'SET_CURRENT_LOCATION', payload: location })
        dispatch({ type: 'SET_LOCATION_ERROR', payload: null })
        // isNearbyFilter は初期値が true なのでそのまま
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '位置情報の取得に失敗しました'
        dispatch({ type: 'SET_LOCATION_ERROR', payload: errorMessage })
        dispatch({ type: 'SET_CURRENT_LOCATION', payload: null })
        // 位置情報取得に失敗した場合はフィルターをOFFにしてカナ順表示
        filters.setIsNearbyFilter(false)
      } finally {
        dispatch({ type: 'SET_LOCATION_LOADING', payload: false })
      }
    }
    
    fetchInitialLocation()
  }, [dispatch, filters])

  // 先頭へ戻るフローティングボタンの制御
  const [showBackToTop, setShowBackToTop] = useState(false)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    const onScroll = () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current)
        hideTimerRef.current = null
      }
      if (window.scrollY > 200) {
        setShowBackToTop(true)
        hideTimerRef.current = setTimeout(() => {
          setShowBackToTop(false)
        }, 1500)
      } else {
        setShowBackToTop(false)
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    }
  }, [])

  // ランクに基づく背景色を取得
  const getBackgroundColorByRank = (rank: string | null, isAuth: boolean) => {
    if (!isAuth || !rank) {
      return "bg-gradient-to-br from-green-50 to-green-100" // 非会員・ブロンズ
    }

    switch (rank) {
      case "bronze":
        return "bg-gradient-to-br from-green-50 to-green-100"
      case "silver":
        return "bg-gradient-to-br from-rose-50 to-rose-100"
      case "gold":
        return "bg-gradient-to-br from-amber-50 to-amber-100"
      case "diamond":
        return "bg-gradient-to-br from-sky-50 to-sky-100"
      default:
        return "bg-gradient-to-br from-green-50 to-green-100"
    }
  }

  const backgroundColorClass = getBackgroundColorByRank(currentUserRank ?? null, isAuthenticated)
  if (currentView === "coupon-confirmation") {
    return (
      <CouponConfirmationPage
        coupon={selectedCoupon}
        onConfirm={onConfirmCoupon}
        onCancel={onCancelCoupon}
      />
    )
  }

  if (currentView === "usage-guide") {
    return (
      <UsageGuidePage
        onBack={onUsageGuideBack}
        onLogoClick={onLogoClick}
      />
    )
  }

  if (currentView === "email-confirmation") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex flex-col">
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="flex items-center justify-center">
            <Logo size="lg" onClick={onLogoClick} />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <EmailConfirmationComplete />
          </div>
        </div>
      </div>
    )
  }

  if (currentView === "password-reset") {
    return (
      <PasswordResetContainer
        currentStep={passwordResetStep}
        email={passwordResetEmail}
        onSubmit={onPasswordResetSubmit}
        onCancel={onPasswordResetCancel}
        onBackToLogin={onBackToLogin}
        onResend={onPasswordResetResend}
        onLogoClick={onLogoClick}
        isLoading={isLoading}
        backgroundColorClass="bg-gradient-to-br from-green-50 to-green-100"
      />
    )
  }

  // マイページの表示
  if (currentView === "mypage") {
    // メールアドレス変更成功モーダルが表示されている場合は、ユーザー情報の読み込み状態を無視
    const isEmailChangeSuccessModalOpen = state.isEmailChangeSuccessModalOpen || false

    // ユーザー情報が読み込まれていない場合はローディング表示
    // プラン情報はnullの場合もあるため、チェックしない
    // ただし、メールアドレス変更成功モーダルが表示されている場合は無視
    if (!user && !isEmailChangeSuccessModalOpen) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-green-600 font-medium">ユーザー情報を読み込み中...</p>
          </div>
        </div>
      )
    }

    // プラン変更画面の場合
    if (myPageView === "plan-change") {
      if (!plan) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-green-600 font-medium">プラン情報を読み込み中...</p>
            </div>
          </div>
        )
      }
      return (
        <PlanChangeContainer
          currentPlan={plan}
          onPlanChange={onPlanChangeSubmit}
          onBack={onPlanChangeBack}
          onLogoClick={onLogoClick}
          isLoading={isLoading}
          backgroundColorClass="bg-gradient-to-br from-green-50 to-green-100"
        />
      )
    }

    // プラン管理画面の場合
    if (myPageView === "plan-management") {
      // カード登録状態を確認（Cookieベースの認証のみを使用、sessionStorageは使用しない）
      // PaymentSessionから取得するか、APIから直接取得
      const hasPaymentMethod = false // 一時的にfalse（APIから取得する必要がある）

      if (!plan) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-green-600 font-medium">プラン情報を読み込み中...</p>
            </div>
          </div>
        )
      }

      return (
        <PlanManagementContainer
          plan={plan}
          onChangePlan={() => onMyPageViewChange("plan-change")}
          onCancelSubscription={onCancelSubscription}
          onChangePaymentMethod={() => {
            // 支払い方法変更の専用画面に遷移
            window.location.href = '/payment-method-change'
          }}
          hasPaymentMethod={hasPaymentMethod}
          onBack={() => onMyPageViewChange("main")}
          onLogoClick={onLogoClick}
          backgroundColorClass="bg-gradient-to-br from-green-50 to-green-100"
        />
      )
    }

    // 店舗紹介画面の場合
    if (myPageView === "store-introduction") {
      return (
        <StoreIntroductionForm
          onSubmit={onStoreIntroductionSubmit}
          onBack={() => onMyPageViewChange("main")}
          isLoading={isLoading}
          initialData={storeIntroductionData}
          isEditMode={hasStoreIntroduction}
        />
      )
    }

    return (
      <MyPageLayout
        user={user}
        plan={plan}
        usageHistory={usageHistory}
        paymentHistory={paymentHistory}
        currentView={myPageView}
        onViewChange={(view: string) => onMyPageViewChange(view as MyPageViewType)}
        onEditProfile={onEditProfile}
        onChangeEmail={onChangeEmail}
        onChangePassword={onChangePassword}
        onViewPlan={onViewPlan}
        onViewUsageHistory={onViewUsageHistory}
        onViewPaymentHistory={onViewPaymentHistory}
        onStoreIntroduction={onStoreIntroduction}
        hasStoreIntroduction={hasStoreIntroduction}
        onCancelSubscription={onCancelSubscription}
        onWithdraw={onWithdraw}
        onWithdrawConfirm={onWithdrawConfirm}
        onWithdrawCancel={onWithdrawCancel}
        onWithdrawComplete={onWithdrawComplete}
        onLogout={onLogout}
        onBack={onBackToHome}
        onShowStoreOnHome={onBackToHome}
        onUseSameCoupon={onUseSameCoupon}
        onLogoClick={onLogoClick}
        onProfileEditSubmit={onProfileEditSubmit || (() => { })}
        onEmailChangeSubmit={onEmailChangeSubmit}
        onPasswordChangeSubmit={onPasswordChangeSubmit}
        onPasswordChangeBackToLogin={handlers.handlePasswordChangeComplete}
        onEmailChangeResend={onEmailChangeResend}
        emailChangeStep={emailChangeStep}
        passwordChangeStep={passwordChangeStep}
        passwordChangeError={passwordChangeError}
        newEmail={newEmail}
        currentUserRank={currentUserRank}
        isEmailChangeSuccessModalOpen={isEmailChangeSuccessModalOpen}
      />
    )
  }

  if (currentView === "subscription") {
    return <SubscriptionContainer onSubscribe={onSubscribe} onLogoClick={onLogoClick} isLoading={isLoading} backgroundColorClass="bg-gradient-to-br from-green-50 to-green-100" />
  }

  if (currentView === "confirmation") {
    if (!signupData) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
          <div className="text-center">
            <p className="text-green-600 font-medium">登録データが見つかりません</p>
          </div>
        </div>
      )
    }
    return (
      <ConfirmationContainer
        data={{
          nickname: signupData.nickname,
          password: signupData.password,
          passwordConfirm: signupData.passwordConfirm,
          postalCode: signupData.postalCode,
          address: signupData.address,
          birthDate: signupData.birthDate,
          gender: signupData.gender,
          saitamaAppId: "",
        }}
        onRegister={onConfirmRegister}
        onEdit={onConfirmEdit}
        onLogoClick={onLogoClick}
        isLoading={isLoading}
        backgroundColorClass="bg-gradient-to-br from-green-50 to-green-100"
      />
    )
  }

  if (currentView === "login") {
    return (
      <LoginLayout
        onLogin={onLogin}
        onSignup={onSignup}
        onForgotPassword={onForgotPassword}
        onHomeClick={onBackToHome}
        isLoading={isLoading}
        error={state.loginError ?? undefined}
      />
    )
  }

  if (currentView === "email-registration") {
    return (
      <EmailRegistrationContainer
        currentStep={emailRegistrationStep ?? "form"}
        email={emailRegistrationEmail}
        onSubmit={(data) => {
          // handleEmailSubmitは(email: string, campaignCode?: string) => voidだが、
          // EmailRegistrationContainerは(data: UserRegistrationRequest) => voidを期待
          // ラッパー関数で変換
          onEmailSubmit(data.email, data.campaignCode)
        }}
        onBack={onBackToHome}
        onBackToLogin={onEmailRegistrationBackToLogin}
        onResend={onEmailRegistrationResend}
        onLogoClick={onLogoClick}
        isLoading={isLoading}
        backgroundColorClass="bg-gradient-to-br from-green-50 to-green-100"
      />
    )
  }

  if (currentView === "signup") {
    return (
      <RegisterContainer
        email={signupData?.email}
        initialFormData={signupData ? {
          email: signupData.email || "",
          nickname: signupData.nickname || "",
          postalCode: signupData.postalCode || "",
          address: signupData.address || "",
          birthDate: signupData.birthDate || "",
          gender: (signupData.gender === "male" || signupData.gender === "female" || signupData.gender === "other")
            ? signupData.gender
            : "male",
          phone: "",
          saitamaAppId: "",
          password: "",
          passwordConfirm: "",
        } : null}
        onSubmit={(data) => {
          // handleSignupSubmitは(data: Record<string, string>) => voidだが、
          // RegisterContainerは(data: UserRegistrationComplete) => voidを期待
          // ラッパー関数で変換
          onSignupSubmit({
            nickname: data.nickname,
            postalCode: data.postalCode,
            address: data.address,
            birthDate: data.birthDate,
            gender: data.gender,
            password: data.password,
            passwordConfirm: data.passwordConfirm,
            email: data.email || "",
          })
        }}
        onCancel={onSignupCancel}
        onLogoClick={onLogoClick}
        isLoading={isLoading}
        backgroundColorClass="bg-gradient-to-br from-green-50 to-green-100"
      />
    )
  }

  // 店舗データの初回ロード中かどうか
  const isInitialStoresLoading = isStoresLoading && items.length === 0

  return (
    <div className={`min-h-screen flex flex-col ${backgroundColorClass} w-full pb-20`}>
      {/* ヘッダー部分のみ */}
      <div className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 py-3">
          {/* 左側: ハンバーガーメニューとランク */}
          <div className="flex items-center gap-3 w-20">
            <HamburgerMenu onMenuItemClick={onMenuItemClick} isAuthenticated={isAuthenticated} />
          </div>

          {/* 中央: ロゴ */}
          <div className="flex-1 flex justify-center">
            <Logo size="lg" onClick={onLogoClick} />
          </div>

          {/* 右側: ユーザーメニュー（ログイン時のみ） */}
          <div className="flex items-center justify-end w-20">
            {/* TODO: 将来的に解放予定 - ランク表示 */}
            {/* {isAuthenticated ? (
              user && currentUserRank && (
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border-2 border-green-600">
                  <div className="relative w-5 h-5">
                    <Image
                      src={`/${currentUserRank}.svg`}
                      alt={`${currentUserRank}ランク`}
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              )
            ) : null} */}
          </div>
        </div>
      </div>

      {/* バナーカルーセル */}
      <BannerCarousel />

      {/* フィルターボタン */}
      <div className="bg-white border-b border-gray-100">
        <div className="grid grid-cols-3 gap-1 px-2 py-4">
          <button
            onClick={onCurrentLocationClick}
            className={`w-full flex items-center justify-center gap-1 px-2 py-2 border rounded-full text-xs font-medium transition-colors whitespace-nowrap ${isNearbyFilter
              ? "border-green-500 bg-green-50 text-green-700"
              : "border-gray-300 bg-white text-gray-700 hover:border-green-300 hover:bg-green-50"
              }`}
          >
            {isNearbyFilter && (
              <span className="text-green-600 text-xs">✓</span>
            )}
            近くのお店
          </button>
          <button
            onClick={(e) => {
              (e.currentTarget as HTMLButtonElement).blur()
              setIsAreaPopupOpen(true)
            }}
            className={`w-full flex items-center justify-center gap-1 px-2 py-2 border rounded-full text-xs font-medium transition-colors whitespace-nowrap active:bg-gray-100 ${(selectedAreas?.length ?? 0) > 0
              ? "border-green-500 bg-green-50 text-green-700"
              : "border-gray-300 bg-white text-gray-700"
              }`}
          >
            <span>エリア</span>
            {(selectedAreas?.length ?? 0) > 0 && (
              <span className="bg-green-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                {selectedAreas?.length ?? 0}
              </span>
            )}
          </button>
          <button
            onClick={(e) => {
              (e.currentTarget as HTMLButtonElement).blur()
              setIsGenrePopupOpen(true)
            }}
            className={`w-full flex items-center justify-center gap-1 px-2 py-2 border rounded-full text-xs font-medium transition-colors whitespace-nowrap active:bg-gray-100 ${(selectedGenres?.length ?? 0) > 0
              ? "border-green-500 bg-green-50 text-green-700"
              : "border-gray-300 bg-white text-gray-700"
              }`}
          >
            <span>ジャンル</span>
            {(selectedGenres?.length ?? 0) > 0 && (
              <span className="bg-green-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                {selectedGenres?.length ?? 0}
              </span>
            )}
          </button>
        </div>
        {/* 特定商取引法についてのリンク */}
        <div className="px-2 pb-2 text-center">
          <a
            href="/lp/commercial-law"
            className="text-xs text-gray-600 hover:text-gray-800 underline"
          >
            特定商取引法について
          </a>
        </div>
      </div>

      {/* 検索バー */}
      {isSearchMode && (
        <SearchBar
          onClose={() => {
            handlers.handleSearchClose()
            setSearchResults([])
          }}
          onSearch={(keyword) => {
            setSearchKeyword(keyword)
            performSearch(keyword)
          }}
          isLoading={isSearching}
        />
      )}

      {/* エリア選択ポップアップ */}
      <AreaPopup
        isOpen={isAreaPopupOpen}
        selectedAreas={selectedAreas ?? []}
        onAreaToggle={(area) => {
          const currentAreas = selectedAreas ?? []
          const newAreas = currentAreas.includes(area)
            ? currentAreas.filter((a: string) => a !== area)
            : [...currentAreas, area]
          onAreasChange(newAreas)
        }}
        onClose={() => setIsAreaPopupOpen(false)}
        onClear={() => onAreasChange([])}
      />

      {/* ジャンル選択ポップアップ */}
      <GenrePopup
        isOpen={isGenrePopupOpen}
        selectedGenres={selectedGenres ?? []}
        onGenreToggle={(genre) => {
          const currentGenres = selectedGenres ?? []
          const newGenres = currentGenres.includes(genre)
            ? currentGenres.filter((g: string) => g !== genre)
            : [...currentGenres, genre]
          onGenresChange(newGenres)
        }}
        onClose={() => setIsGenrePopupOpen(false)}
        onClear={() => {
          onGenresChange([])
          onEventsChange([])
        }}
      />

      <div className="flex-1 overflow-hidden">
        <HomeContainer
          selectedGenres={selectedGenres}
          selectedEvents={selectedEvents}
          selectedAreas={selectedAreas}
          isNearbyFilter={isNearbyFilter}
          isFavoritesFilter={isFavoritesFilter}
          stores={isSearchMode && searchKeyword.trim() ? searchResults : mergedStores}
          onStoreClick={onStoreClick}
          onFavoriteToggle={onFavoriteToggle}
          onCouponsClick={onCouponsClick}
          isModalOpen={isCouponListOpen || isSuccessModalOpen || isHistoryOpen || isStoreDetailPopupOpen}
          loadMoreRef={isSearchMode ? undefined : sentinelRef}
          isLoadingMore={isSearchMode ? false : isLoadingMore}
          bottomError={isSearchMode ? null : error}
          backgroundColorClass={backgroundColorClass}
          currentLocation={state.currentLocation}
          isInitialLoading={isSearchMode ? isSearching : isInitialStoresLoading}
        />
      </div>

      {/* お気に入り一覧ポップアップ */}
      <HistoryPopup
        isOpen={isFavoritesOpen}
        stores={favoriteStores}
        onClose={onFavoritesClose}
        onFavoriteToggle={onFavoriteToggle}
        onCouponsClick={onCouponsClick}
        onStoreClick={onStoreClick}
      />

      {/* 閲覧履歴ポップアップ */}
      <HistoryPopup
        isOpen={isHistoryOpen}
        stores={historyStores}
        onClose={onHistoryClose ?? (() => { })}
        onFavoriteToggle={onFavoriteToggle}
        onCouponsClick={onCouponsClick}
        onStoreClick={onStoreClick}
      />

      <StoreDetailPopup
        isOpen={isStoreDetailPopupOpen ?? false}
        store={selectedStore}
        onClose={() => {
          if (onStoreDetailClose) {
            onStoreDetailClose()
          }
        }}
        onFavoriteToggle={onFavoriteToggle}
        onCouponsClick={onCouponsClick}
      />

      {/* クーポン関連ポップアップ */}
      <CouponListPopup
        isOpen={isCouponListOpen}
        storeName={selectedStore?.name || ""}
        coupons={storeCoupons}
        onClose={onCouponListClose}
        onBack={onCouponListBack}
        onUseCoupon={onUseCoupon}
        onUsageGuideClick={() => setIsUsageGuideModalOpen(true)}
        userBirthDate={user?.birthDate}
        isUsedToday={isCouponUsedToday}
        isCheckingUsage={isCheckingUsage || isLoadingCoupons}
        couponUsageStart={selectedStore?.couponUsageStart}
        couponUsageEnd={selectedStore?.couponUsageEnd}
        couponUsageDays={selectedStore?.couponUsageDays}
      />

      {/* 使用方法ガイドモーダル */}
      <UsageGuideModal
        isOpen={isUsageGuideModalOpen}
        onClose={() => setIsUsageGuideModalOpen(false)}
      />

      {/* クーポン使用成功モーダル */}
      <CouponUsedSuccessModal
        isOpen={isSuccessModalOpen}
        coupon={selectedCoupon}
        onClose={onSuccessModalClose ?? (() => { })}
      />

      {/* ログインが必要なモーダル */}
      <LoginRequiredModal
        isOpen={isLoginRequiredModalOpen}
        onClose={onLoginRequiredModalClose}
        onLogin={onLoginRequiredModalLogin}
      />

      {/* プランが必要なモーダル */}
      <PlanRequiredModal
        isOpen={isPlanRequiredModalOpen}
        onClose={onPlanRequiredModalClose}
        onRegisterPlan={onPlanRequiredModalRegister}
      />

      {/* メールアドレス変更成功モーダル */}
      <EmailChangeSuccessModal
        isOpen={state.isEmailChangeSuccessModalOpen || false}
        newEmail={state.newEmail || ""}
        onClose={handlers.handleEmailChangeSuccessModalClose}
      />

      {/* フッターナビゲーション */}
      <FooterNavigation />

      {/* 先頭へ戻るフローティングボタン */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-20 right-4 z-40 px-4 py-3 rounded-full shadow-lg bg-green-600 text-white text-sm hover:bg-green-700 transition-colors"
          aria-label="先頭へ戻る"
        >
          先頭へ戻る
        </button>
      )}

    </div>
  )
}