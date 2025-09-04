"use client"

import { useState, useEffect } from "react"
import { HomeLayout } from "@/components/templates/home-layout"
import { mockStores } from "@/data/mock-stores"
import { mockNotifications } from "@/data/mock-notifications"
import type { Store } from "@/types/store"
import type { Notification } from "@/types/notification"
import { mockCoupons } from "@/data/mock-coupons"
import type { Coupon } from "@/types/coupon"

import { mockUser, mockPlan, mockUsageHistory, mockPaymentHistory } from "@/data/mock-user"
import type { User, Plan, UsageHistory, PaymentHistory } from "@/types/user"
import { calculateUserRank } from "@/utils/rank-calculator"

export default function HomePage() {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])
  const [selectedAreas, setSelectedAreas] = useState<string[]>([])
  const [isFavoritesFilter, setIsFavoritesFilter] = useState(false)
  const [activeTab, setActiveTab] = useState("home")
  const [currentView, setCurrentView] = useState<
    "home" | "login" | "email-registration" | "signup" | "confirmation" | "subscription" | "mypage" | "password-reset" | "email-confirmation" | "coupon-confirmation" | "usage-guide"
  >("home")
  const [loginStep, setLoginStep] = useState<"email" | "otp">("email")
  const [loginEmail, setLoginEmail] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [signupData, setSignupData] = useState<any>(null)

  const [stores, setStores] = useState<Store[]>(mockStores)
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)

  const [user, setUser] = useState<User | undefined>(undefined)
  const [plan, setPlan] = useState<Plan | undefined>(undefined)
  const [usageHistory, setUsageHistory] = useState<UsageHistory[]>([])
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([])
  const [myPageView, setMyPageView] = useState<
    | "main"
    | "profile-edit"
    | "email-change"
    | "password-change"
    | "usage-history"
    | "payment-history"
    | "plan-management"
    | "plan-change"
    | "withdrawal"
    | "withdrawal-complete"
  >("main")
  const [emailChangeStep, setEmailChangeStep] = useState<"form" | "complete">("form")
  const [passwordChangeStep, setPasswordChangeStep] = useState<"form" | "complete">("form")
  const [newEmail, setNewEmail] = useState("")

  const [isCouponListOpen, setIsCouponListOpen] = useState(false)
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false)
  const [selectedStore, setSelectedStore] = useState<Store | null>(null)
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null)

  // クーポン使用完了モーダルの状態
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  
  // ログインが必要なモーダルの状態
  const [isLoginRequiredModalOpen, setIsLoginRequiredModalOpen] = useState(false)

  // パスワード再設定関連の状態
  const [passwordResetStep, setPasswordResetStep] = useState<"form" | "complete">("form")
  const [passwordResetEmail, setPasswordResetEmail] = useState("")
  
  // メールアドレス認証関連の状態
  const [emailRegistrationStep, setEmailRegistrationStep] = useState<"form" | "complete">("form")
  const [emailRegistrationEmail, setEmailRegistrationEmail] = useState("")

  // 確認メール送信完了関連の状態
  const [emailConfirmationEmail, setEmailConfirmationEmail] = useState("")
  // 店舗詳細画面の状態を追加
  const [isStoreDetailOpen, setIsStoreDetailOpen] = useState(false)
  const [isStoreDetailPopupOpen, setIsStoreDetailPopupOpen] = useState(false)
  const [currentUserRank, setCurrentUserRank] = useState<string | null>(null)

  const [historyStores, setHistoryStores] = useState<Store[]>([])
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false)

  // 店舗詳細関連の状態
  const favoriteStores = stores.filter((store) => store.isFavorite)
  
  // クライアントサイドでのみランク計算を実行
  useEffect(() => {
    if (isAuthenticated && user) {
      const contractStartDate = user.contractStartDate || user.createdAt
      const rank = calculateUserRank(contractStartDate)
      setCurrentUserRank(rank)
    } else {
      setCurrentUserRank(null)
    }
  }, [isAuthenticated, user])

  // フィルタリングされた店舗データ
  const filteredStores = stores.filter((store) => {
    // お気に入りフィルター
    if (isFavoritesFilter && !store.isFavorite) {
      return false
    }
    return true
  })

  const hasNotification = notifications.some((n) => !n.isRead)

  const handleCurrentLocationClick = () => {
    setSelectedGenres([])
    setSelectedEvents([])
    setSelectedAreas([])
    setIsFavoritesFilter(false)
  }

  const handleTabChange = (tab: string) => {
          if (tab === "mypage") {
        if (!isAuthenticated) {
          setCurrentView("login")
        } else {
          setCurrentView("mypage")
          setActiveTab(tab)
          setMyPageView("main")
        }
      } else {
        setActiveTab(tab)
        if (currentView !== "home") {
          setCurrentView("home")
        }
      }
  }

  const handleLogin = async (email: string, otp: string) => {
    setIsLoading(true)
    
    if (otp === "") {
      // メールアドレス送信（ワンタイムパスワード送信）
      setTimeout(() => {
        setLoginEmail(email)
        setLoginStep("otp")
        setIsLoading(false)
      }, 1500)
    } else {
      // ワンタイムパスワード認証
      setTimeout(() => {
        setIsAuthenticated(true)
        setUser(mockUser)
        setPlan(mockPlan)
        setUsageHistory(mockUsageHistory)
        setPaymentHistory(mockPaymentHistory)
        setCurrentView("home") // トップ画面（ホーム）に遷移
        setActiveTab("home")
        setMyPageView("main")
        setLoginStep("email") // リセット
        setLoginEmail("") // リセット
        setIsLoading(false)
      }, 1500)
    }
  }

  const handleSignup = () => {
    setCurrentView("email-registration")
  }

  const handleForgotPassword = () => {
    setPasswordResetStep("form")
    setPasswordResetEmail("")
    setCurrentView("password-reset")
  }

  const handleBackToHome = () => {
    setCurrentView("home")
    setActiveTab("home")
    setMyPageView("main")
    setSignupData(null)
  }

  const handleBackToLogin = () => {
    setCurrentView("login")
    setLoginStep("email")
    setLoginEmail("")
    setPasswordResetStep("form")
    setPasswordResetEmail("")
  }

  const handleBackToEmailLogin = () => {
    setLoginStep("email")
    setLoginEmail("")
  }

  const handleResendOtp = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 1500)
  }

  const handleEmailSubmit = (email: string) => {
    setIsLoading(true)
    setTimeout(() => {
      setEmailRegistrationEmail(email)
      setEmailRegistrationStep("complete")
      setIsLoading(false)
    }, 1500)
  }

  const handleEmailRegistrationBackToLogin = () => {
    setCurrentView("login")
    setEmailRegistrationStep("form")
    setEmailRegistrationEmail("")
  }

  const handleEmailRegistrationResend = () => {
    // メールアドレスを保持したままフォーム画面に戻る
    setEmailRegistrationStep("form")
    // emailRegistrationEmailは保持される
  }

  const handleSignupSubmit = (data: any) => {
    setSignupData(data)
    setCurrentView("confirmation")
  }

  const handleSignupCancel = () => {
    setCurrentView("login")
    setSignupData(null)
  }

  const handleConfirmRegister = async () => {
    setIsLoading(true)
    setTimeout(() => {
      // 確認メール送信完了画面に遷移
      setEmailConfirmationEmail(signupData?.email || "")
      setCurrentView("email-confirmation")
      setIsLoading(false)
    }, 2000)
  }

  const handleConfirmEdit = () => {
    // パスワード以外の登録内容を保持したまま新規登録フォームに戻る
    const dataWithoutPassword = {
      ...signupData,
      password: "",
      passwordConfirm: "",
    }
    setSignupData(dataWithoutPassword)
    setCurrentView("signup")
  }

  const handleSubscribe = async (planId: string) => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setCurrentView("home")
      setActiveTab("home")
    }, 2000)
  }

  // パスワード再設定関連のハンドラー
  const handlePasswordResetSubmit = async (email: string) => {
    setIsLoading(true)
    setTimeout(() => {
      setPasswordResetEmail(email)
      setPasswordResetStep("complete")
      setIsLoading(false)
    }, 1500)
  }

  const handlePasswordResetCancel = () => {
    setCurrentView("login")
    setPasswordResetStep("form")
    setPasswordResetEmail("")
  }

  const handlePasswordResetResend = () => {
    setPasswordResetStep("form")
  }


  const handleMenuItemClick = (itemId: string) => {

    switch (itemId) {
      case "terms":
        break
      case "privacy":
        break
      case "commercial-law":
        break
      case "contact":
        break
      case "login":
        setCurrentView("login")
        setActiveTab("map")
        break
      case "logout":
        handleLogout()
        break
      default:
        break
    }
  }

  const handleFavoritesClick = () => {
    setIsFavoritesOpen(true)
  }

  const handleHistoryClick = () => {
  }

  const handleFavoritesClose = () => {
    setIsFavoritesOpen(false)
  }

  const handleHistoryClose = () => {
  }

  const handleNotificationClick = () => {
    // 通知パネルを開く処理をここに実装
  }

  const handleNotificationItemClick = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
    )
  }

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  const handleFavoriteToggle = (storeId: string) => {
    setStores((prevStores) =>
      prevStores.map((store) => (store.id === storeId ? { ...store, isFavorite: !store.isFavorite } : store)),
    )
    
    // 選択中の店舗も更新
    if (selectedStore && selectedStore.id === storeId) {
      setSelectedStore(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null)
    }
  }

  const handleCouponsClick = (storeId: string) => {
    const store = stores.find((s) => s.id === storeId)
    if (store) {
      setSelectedStore(store)
      setIsCouponListOpen(true)
      setIsStoreDetailOpen(false)
    }
  }

  const handleMyPageViewChange = (view: string) => {
    setMyPageView(view as any)
  }

  const handleEditProfile = () => {
    setMyPageView("profile-edit")
  }

  const handleChangeEmail = () => {
    setEmailChangeStep("form")
    setMyPageView("email-change")
  }

  const handleChangePassword = () => {
    setPasswordChangeStep("form")
    setMyPageView("password-change")
  }

  const handleViewPlan = () => {
    setMyPageView("plan-management")
  }

  const handleChangePlan = () => {
    setMyPageView("plan-change")
  }

  const handlePlanChangeSubmit = async (planId: string) => {
    setIsLoading(true)
    setTimeout(() => {

      // プラン情報を更新
      const planMap: Record<string, { name: string; price: number; description: string }> = {
        "3days": {
          name: "3daysプラン",
          price: 300,
          description: "短期間でTAMAYOIを体験できるお試しプラン",
        },
        monthly: {
          name: "マンスリープラン",
          price: 980,
          description: "毎日お得にお酒を楽しめる定番プラン",
        },
        premium: {
          name: "プレミアムプラン",
          price: 1980,
          description: "より充実したサービスを楽しめる上位プラン",
        },
      }

      const newPlanData = planMap[planId]
      if (newPlanData && plan) {
        setPlan({
          ...plan,
          id: planId,
          name: newPlanData.name,
          price: newPlanData.price,
          description: newPlanData.description,
        })
      }

      // プラン変更完了後、マイページのメイン画面に戻る
      setMyPageView("main")
      setIsLoading(false)
    }, 1500)
  }

  const handlePlanChangeBack = () => {
    // プラン変更完了モーダルを閉じてマイページのメイン画面に戻る
    setMyPageView("main")
  }

  const handleViewUsageHistory = () => {
    setMyPageView("usage-history")
  }

  const handleViewPaymentHistory = () => {
    setMyPageView("payment-history")
  }

  const handleCancelSubscription = () => {
    console.log("サブスクリプションキャンセル処理")
  }

  const handleWithdraw = () => {
    console.log("退会確認画面に遷移")
    setMyPageView("withdrawal")
  }

  const handleWithdrawConfirm = () => {
    setMyPageView("withdrawal-complete")
  }

  const handleWithdrawCancel = () => {
    setMyPageView("profile-edit")
  }

  const handleWithdrawComplete = () => {
    // 退会完了時の処理
    setIsAuthenticated(false)
    setUser(undefined)
    setPlan(undefined)
    setUsageHistory([])
    setPaymentHistory([])
    setCurrentView("home")
    setActiveTab("home")
    setMyPageView("main")
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setUser(undefined)
    setPlan(undefined)
    setUsageHistory([])
    setPaymentHistory([])
    
    setCurrentView("home")
    setActiveTab("home")
    setMyPageView("main")
  }

  // 利用履歴関連のハンドラー
  const handleShowStoreOnHome = (storeId: string) => {
    // ホーム画面に戻って該当店舗を表示
    setCurrentView("home")
    setActiveTab("home")
    setMyPageView("main")
    // 実際の実装では、店舗IDに基づいてホームの位置を調整
  }

  const handleUseSameCoupon = (couponId: string) => {
    // 認証チェック
    if (!isAuthenticated) {
      setIsLoginRequiredModalOpen(true)
      return
    }
    
    // クーポン利用画面に遷移
    // 実際の実装では、該当クーポンの利用画面を表示
  }

  const handleLogoClick = () => {
    setCurrentView("home")
    setActiveTab("home")
    setMyPageView("main")
  }

  const handleCouponListClose = () => {
    setIsCouponListOpen(false)
    setSelectedStore(null)
  }

  const handleCouponListBack = () => {
    setIsCouponListOpen(false)
    setSelectedStore(null)
  }

  const handleUseCoupon = (couponId: string) => {
    // 認証チェック
    if (!isAuthenticated) {
      setIsLoginRequiredModalOpen(true)
      return
    }
    
    const storeCoupons = selectedStore ? mockCoupons[selectedStore.id] || [] : []
    const coupon = storeCoupons.find((c) => c.id === couponId)
    if (coupon) {
      setSelectedCoupon(coupon)
      setCurrentView("coupon-confirmation")
      setIsCouponListOpen(false)
    }
  }

  const handleConfirmCoupon = () => {
    // 大きい成功モーダルを表示（selectedCouponとselectedStoreをクリアする前に）
    setIsSuccessModalOpen(true)
    // 確認ページを閉じてホームに戻る
    setCurrentView("home")
  }

  const handleSuccessModalClose = () => {
    setIsSuccessModalOpen(false)
    // 成功モーダルを閉じる時に必要な状態のみクリア
    setSelectedCoupon(null)
    setSelectedStore(null)
    // 不要な状態変更を削除してモーダルの重複表示を防ぐ
  }

  const handleLoginRequiredModalClose = () => {
    setIsLoginRequiredModalOpen(false)
  }

  const handleLoginRequiredModalLogin = () => {
    setIsLoginRequiredModalOpen(false)
    setCurrentView("login")
  }

  const handleCancelCoupon = () => {
    setCurrentView("home")
    setIsCouponListOpen(true)
    setSelectedCoupon(null)
  }

  const handleUsageGuideClick = () => {
    setCurrentView("usage-guide")
  }

  const handleUsageGuideBack = () => {
    setCurrentView("coupon-confirmation")
  }

  const handleStoreClick = (store: Store) => {
    setSelectedStore(store)
    setIsStoreDetailPopupOpen(true)
  }

  const handleStoreDetailPopupClose = () => {
    setIsStoreDetailPopupOpen(false)
    setSelectedStore(null)
  }

  const handleProfileEditSubmit = async (data: any) => {
    setIsLoading(true)
    setTimeout(() => {
      // ユーザー情報を更新
      setUser((prev) => (prev ? { ...prev, ...data } : prev))
      setIsLoading(false)
      // 成功モーダルはProfileEditContainerで表示される
    }, 1500)
  }

  const handleEmailChangeSubmit = async (currentPassword: string, newEmail: string) => {
    setIsLoading(true)
    setTimeout(() => {
      setNewEmail(newEmail)
      setEmailChangeStep("complete")
      setIsLoading(false)
    }, 1500)
  }

  const handleEmailChangeResend = () => {
    // 前回送信したメールアドレス（newEmail）を保持してフォーム画面に戻る
    setEmailChangeStep("form")
    // newEmailは保持される（initialNewEmailとして渡される）
  }

  const handlePasswordChangeSubmit = async (currentPassword: string, newPassword: string) => {
    setIsLoading(true)
    
    // パスワード変更処理をシミュレート
    setTimeout(() => {
      // ログアウト処理
      setIsAuthenticated(false)
      setUser(undefined)
      setPlan(undefined)
      setUsageHistory([])
      setPaymentHistory([])
      
      // ログイン画面に遷移
      setCurrentView("login")
      setActiveTab("map")
      setMyPageView("main")
      setPasswordChangeStep("form")
      setIsLoading(false)
    }, 1500)
  }

  const handlePasswordChangeComplete = () => {
    // ログアウト処理
    setIsAuthenticated(false)
    setUser(undefined)
    setPlan(undefined)
    setUsageHistory([])
    setPaymentHistory([])
    // ログイン画面に遷移
    setCurrentView("login")
    setActiveTab("map")
    setMyPageView("main")
    setPasswordChangeStep("form")
  }

  const handlePasswordChangeBackToLogin = () => {
    // パスワード変更完了後はログアウトしてログイン画面に遷移
    setIsAuthenticated(false)
    setUser(undefined)
    setPlan(undefined)
    setUsageHistory([])
    setPaymentHistory([])
    setCurrentView("login")
    setActiveTab("map")
    setMyPageView("main")
    setPasswordChangeStep("form") // リセット
    console.log("パスワード変更完了 - ログイン画面に遷移")
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 to-green-100 w-full">
      <HomeLayout
      selectedGenres={selectedGenres}
      selectedEvents={selectedEvents}
      selectedAreas={selectedAreas}
      isFavoritesFilter={isFavoritesFilter}
      stores={filteredStores}
      activeTab={activeTab}
      currentView={currentView}
      isAuthenticated={isAuthenticated}
      isLoading={isLoading}
      signupData={signupData}
      hasNotification={hasNotification}
      favoriteStores={favoriteStores}
      historyStores={historyStores}
      isHistoryOpen={isHistoryOpen}
      isFavoritesOpen={isFavoritesOpen}
      notifications={notifications}
      user={user}
      plan={plan}
      usageHistory={usageHistory}
      paymentHistory={paymentHistory}
      myPageView={myPageView}
      passwordResetStep={passwordResetStep}
      passwordResetEmail={passwordResetEmail}
      emailRegistrationStep={emailRegistrationStep}
      emailRegistrationEmail={emailRegistrationEmail}
      emailConfirmationEmail={emailConfirmationEmail}
      onGenresChange={setSelectedGenres}
      onEventsChange={setSelectedEvents}
      onAreasChange={setSelectedAreas}
      onCurrentLocationClick={handleCurrentLocationClick}
      onTabChange={handleTabChange}
      onFavoritesClick={handleFavoritesClick}
      onFavoritesClose={handleFavoritesClose}
      onHistoryClick={handleHistoryClick}

      onHistoryClose={handleHistoryClose}
      onFavoriteToggle={handleFavoriteToggle}
      onCouponsClick={handleCouponsClick}
      onStoreClick={handleStoreClick}
      isStoreDetailPopupOpen={isStoreDetailPopupOpen}
      onStoreDetailClose={handleStoreDetailPopupClose}
      onMyPageViewChange={handleMyPageViewChange}
      onEditProfile={handleEditProfile}
      onChangeEmail={handleChangeEmail}
      onChangePassword={handleChangePassword}
      onViewPlan={handleViewPlan}
      onChangePlan={handleChangePlan}
      onPlanChangeSubmit={handlePlanChangeSubmit}
      onPlanChangeBack={handlePlanChangeBack}
      onViewUsageHistory={handleViewUsageHistory}
      onViewPaymentHistory={handleViewPaymentHistory}
      onCancelSubscription={handleCancelSubscription}
      onWithdraw={handleWithdraw}
      onWithdrawConfirm={handleWithdrawConfirm}
      onWithdrawCancel={handleWithdrawCancel}
      onWithdrawComplete={handleWithdrawComplete}
      onLogout={handleLogout}
      onLogin={handleLogin}
      onSignup={handleSignup}
      onForgotPassword={handleForgotPassword}
      onBackToHome={handleBackToHome}
      onBackToLogin={handleBackToLogin}
      onEmailSubmit={handleEmailSubmit}
      onEmailRegistrationBackToLogin={handleEmailRegistrationBackToLogin}
      onEmailRegistrationResend={handleEmailRegistrationResend}
      onSignupSubmit={handleSignupSubmit}
      onSignupCancel={handleSignupCancel}
      onConfirmRegister={handleConfirmRegister}
      onConfirmEdit={handleConfirmEdit}
      onSubscribe={handleSubscribe}
      onPasswordResetSubmit={handlePasswordResetSubmit}
      onPasswordResetCancel={handlePasswordResetCancel}
      onPasswordResetResend={handlePasswordResetResend}
      onNotificationClick={handleNotificationClick}
      onNotificationItemClick={handleNotificationItemClick}
      onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
      onMenuItemClick={handleMenuItemClick}

      onLogoClick={handleLogoClick}
      loginStep={loginStep}
      loginEmail={loginEmail}
      onResendOtp={handleResendOtp}
      onBackToEmailLogin={handleBackToEmailLogin}
      isCouponListOpen={isCouponListOpen}
      selectedStore={selectedStore}
      selectedCoupon={selectedCoupon}
      storeCoupons={selectedStore ? mockCoupons[selectedStore.id] || [] : []}
      onCouponListClose={handleCouponListClose}
      onCouponListBack={handleCouponListBack}
      onUseCoupon={handleUseCoupon}
      onUseSameCoupon={handleUseSameCoupon}
      onConfirmCoupon={handleConfirmCoupon}
      onCancelCoupon={handleCancelCoupon}
      onUsageGuideClick={handleUsageGuideClick}
      onUsageGuideBack={handleUsageGuideBack}
      onProfileEditSubmit={handleProfileEditSubmit}
      onEmailChangeSubmit={handleEmailChangeSubmit}
      onPasswordChangeSubmit={handlePasswordChangeSubmit}
      onEmailChangeResend={handleEmailChangeResend}
      emailChangeStep={emailChangeStep}
      isSuccessModalOpen={isSuccessModalOpen}
      onSuccessModalClose={handleSuccessModalClose}
      isLoginRequiredModalOpen={isLoginRequiredModalOpen}
      onLoginRequiredModalClose={handleLoginRequiredModalClose}
      onLoginRequiredModalLogin={handleLoginRequiredModalLogin}
      passwordChangeStep={passwordChangeStep}
      newEmail={newEmail}
      currentUserRank={currentUserRank}
      />
    </div>
  )
}