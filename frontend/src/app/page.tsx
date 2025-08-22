"use client"

import { useState } from "react"
import { HomeLayout } from "@/components/templates/home-layout"
import { mockStores } from "@/data/mock-stores"
import { mockNotifications } from "@/data/mock-notifications"
import type { Store } from "@/types/store"
import type { Notification } from "@/types/notification"
import { mockCoupons } from "@/data/mock-coupons"
import type { Coupon } from "@/types/coupon"

import { mockUser, mockPlan, mockUsageHistory, mockPaymentHistory } from "@/data/mock-user"
import type { User, Plan, UsageHistory, PaymentHistory } from "@/types/user"

export default function HomePage() {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [selectedArea, setSelectedArea] = useState<string>("")
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

  const [historyStores, setHistoryStores] = useState<Store[]>([])
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)

  // 店舗詳細関連の状態
  const favoriteStores = stores.filter((store) => store.isFavorite)
  
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
    console.log("全て表示ボタンがクリックされました - フィルターをクリア")
    setSelectedGenres([])
    setSelectedArea("")
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
        console.log("ワンタイムパスワード送信:", email)
        setLoginEmail(email)
        setLoginStep("otp")
        setIsLoading(false)
      }, 1500)
    } else {
      // ワンタイムパスワード認証
      setTimeout(() => {
        console.log("ワンタイムパスワード認証:", email, otp)
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
      console.log("ワンタイムパスワード再送信:", loginEmail)
      setIsLoading(false)
    }, 1500)
  }

  const handleEmailSubmit = (email: string) => {
    setIsLoading(true)
    setTimeout(() => {
      console.log("認証メール送信:", email)
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
    console.log("登録データ:", data)
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
      console.log("登録完了:", signupData)
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
    console.log('Setting signup data for edit:', dataWithoutPassword)
    setSignupData(dataWithoutPassword)
    setCurrentView("signup")
  }

  const handleSubscribe = async (planId: string) => {
    setIsLoading(true)
    setTimeout(() => {
      console.log("サブスクリプション登録:", planId)
      setIsLoading(false)
      setCurrentView("home")
      setActiveTab("home")
    }, 2000)
  }

  // パスワード再設定関連のハンドラー
  const handlePasswordResetSubmit = async (email: string) => {
    setIsLoading(true)
    setTimeout(() => {
      console.log("パスワード再設定メール送信:", email)
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
    console.log("メニュー項目クリック:", itemId)

    switch (itemId) {
      case "terms":
        console.log("利用規約画面を表示")
        break
      case "privacy":
        console.log("プライバシーポリシー画面を表示")
        break
      case "commercial-law":
        console.log("特定商取引法画面を表示")
        break
      case "contact":
        console.log("お問い合わせ画面を表示")
        break
      case "login":
        console.log("ログイン画面に遷移")
        setCurrentView("login")
        setActiveTab("map")
        break
      default:
        break
    }
  }

  const handleFavoritesClick = () => {
    setIsFavoritesFilter(!isFavoritesFilter)
  }

  const handleHistoryClick = () => {
    console.log("履歴ボタンがクリックされました")
  }



  const handleHistoryClose = () => {
    console.log("履歴パネルを閉じる")
  }

  const handleNotificationClick = () => {
    console.log("通知パネルを開く")
    // 通知パネルを開く処理をここに実装
  }

  const handleNotificationItemClick = (notificationId: string) => {
    console.log("通知項目クリック:", notificationId)
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
    )
  }

  const handleMarkAllNotificationsRead = () => {
    console.log("すべての通知を既読にする")
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  const handleFavoriteToggle = (storeId: string) => {
    console.log("お気に入りトグル:", storeId)
    setStores((prevStores) =>
      prevStores.map((store) => (store.id === storeId ? { ...store, isFavorite: !store.isFavorite } : store)),
    )
    
    // 選択中の店舗も更新
    if (selectedStore && selectedStore.id === storeId) {
      setSelectedStore(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null)
    }
  }

  const handleCouponsClick = (storeId: string) => {
    console.log("handleCouponsClick called with storeId:", storeId)
    const store = stores.find((s) => s.id === storeId)
    console.log("Found store:", store?.name)
    if (store) {
      setSelectedStore(store)
      console.log("Setting isCouponListOpen to true")
      setIsCouponListOpen(true)
      console.log("Setting isStoreDetailOpen to false")
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
      console.log("プラン変更:", planId)

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
    console.log("退会処理実行")
    setMyPageView("withdrawal-complete")
  }

  const handleWithdrawCancel = () => {
    console.log("退会キャンセル - プロフィール編集に戻る")
    setMyPageView("profile-edit")
  }

  const handleWithdrawComplete = () => {
    console.log("退会完了 - ログアウトしてトップ画面に戻る")
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
    console.log("ログアウト")
  }

  // 利用履歴関連のハンドラー
  const handleShowStoreOnHome = (storeId: string) => {
    console.log("ホームで店舗を表示:", storeId)
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
    
    console.log("同じクーポンを利用:", couponId)
    // クーポン利用画面に遷移
    // 実際の実装では、該当クーポンの利用画面を表示
  }

  const handleLogoClick = () => {
    console.log("ロゴクリック - ホームに遷移")
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
    console.log("クーポン使用確定:", selectedCoupon?.id)
    // 大きい成功モーダルを表示（selectedCouponとselectedStoreをクリアする前に）
    setIsSuccessModalOpen(true)
    // 確認ページを閉じてホームに戻る
    setCurrentView("home")
  }

  const handleSuccessModalClose = () => {
    console.log("成功モーダルを閉じる")
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
    console.log("クーポン確認をキャンセル - クーポン一覧に戻る")
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
    console.log("店舗詳細ポップアップを表示:", store.name)
    console.log("現在のisStoreDetailPopupOpen:", isStoreDetailPopupOpen)
    setSelectedStore(store)
    console.log("setSelectedStore実行完了")
    setIsStoreDetailPopupOpen(true)
    console.log("setIsStoreDetailPopupOpen(true)実行完了")
    console.log("更新後のisStoreDetailPopupOpen:", true)
  }

  const handleStoreDetailPopupClose = () => {
    console.log("店舗詳細ポップアップを閉じる")
    console.log("現在のisStoreDetailPopupOpen:", isStoreDetailPopupOpen)
    setIsStoreDetailPopupOpen(false)
    console.log("setIsStoreDetailPopupOpen(false)実行完了")
    setSelectedStore(null)
    console.log("setSelectedStore(null)実行完了")
  }

  const handleProfileEditSubmit = async (data: any) => {
    setIsLoading(true)
    setTimeout(() => {
      console.log("プロフィール更新:", data)
      // ユーザー情報を更新
      setUser((prev) => (prev ? { ...prev, ...data } : prev))
      setIsLoading(false)
      // 成功モーダルはProfileEditContainerで表示される
    }, 1500)
  }

  const handleEmailChangeSubmit = async (currentPassword: string, newEmail: string) => {
    setIsLoading(true)
    setTimeout(() => {
      console.log("メールアドレス変更:", { currentPassword, newEmail })
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
    console.log("🔍 handlePasswordChangeSubmit START")
    console.log("🔍 Received data:", { currentPassword: "***", newPassword: "***" })
    setIsLoading(true)
    console.log("🔍 setIsLoading(true) executed")
    
    // パスワード変更処理をシミュレート
    setTimeout(() => {
      console.log("🔍 setTimeout callback START")
      console.log("🔍 パスワード変更完了 - ログイン画面に遷移")
      
      // ログアウト処理
      console.log("🔍 Starting logout process")
      setIsAuthenticated(false)
      console.log("🔍 setIsAuthenticated(false) executed")
      setUser(undefined)
      console.log("🔍 setUser(undefined) executed")
      setPlan(undefined)
      console.log("🔍 setPlan(undefined) executed")
      setUsageHistory([])
      console.log("🔍 setUsageHistory([]) executed")
      setPaymentHistory([])
      console.log("🔍 setPaymentHistory([]) executed")
      
      // ログイン画面に遷移
      console.log("🔍 Starting navigation to login")
      setCurrentView("login")
      console.log("🔍 setCurrentView('login') executed")
      setActiveTab("map")
      console.log("🔍 setActiveTab('map') executed")
      setMyPageView("main")
      console.log("🔍 setMyPageView('main') executed")
      setPasswordChangeStep("form")
      console.log("🔍 setPasswordChangeStep('form') executed")
      setIsLoading(false)
      console.log("🔍 setIsLoading(false) executed")
      console.log("🔍 setTimeout callback END")
    }, 1500)
    console.log("🔍 handlePasswordChangeSubmit END")
  }

  const handlePasswordChangeComplete = () => {
    console.log("パスワード変更完了 - ログイン画面に遷移")
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
    <HomeLayout
      selectedGenres={selectedGenres}
      selectedArea={selectedArea}
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
      onAreaChange={setSelectedArea}
      onCurrentLocationClick={handleCurrentLocationClick}
      onTabChange={handleTabChange}
      onFavoritesClick={handleFavoritesClick}
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
    />
  )
}