"use client"

import { FilterControls } from "../molecules/filter-controls"
import { NavigationBar } from "../molecules/navigation-bar"
import { HomeContainer } from "../organisms/home-container"
import { MapPin, Phone, Globe, Ticket } from "lucide-react"
import LoginLayout from "./login-layout"
import { EmailRegistrationLayout } from "./email-registration-layout"
import SignupLayout from "./signup-layout"
import { ConfirmationLayout } from "./confirmation-layout"
import { SubscriptionLayout } from "./subscription-layout"
import { PasswordResetLayout } from "./password-reset-layout"

import { HistoryPopup } from "../molecules/history-popup"
import { MyPageLayout } from "./mypage-layout"
import { PlanManagementLayout } from "./plan-management-layout"
import { PlanChangeLayout } from "./plan-change-layout"
import { CouponListPopup } from "../molecules/coupon-list-popup"
import { CouponConfirmationPopup } from "../molecules/coupon-confirmation-popup"
import { CouponUsedSuccessModal } from "../molecules/coupon-used-success-modal"
import { LoginRequiredModal } from "../molecules/login-required-modal"
import { StoreDetailPopup } from "../molecules/store-detail-popup"
import { EmailConfirmationLayout } from "./email-confirmation-layout"
import CouponConfirmationPage from "../molecules/coupon-confirmation-page"
import { UsageGuidePage } from "../molecules/usage-guide-page"
import { FooterNavigation } from "../molecules/footer-navigation"
import { BannerCarousel } from "../molecules/banner-carousel"
import { AreaPopup } from "../molecules/area-popup"
import { GenrePopup } from "../molecules/genre-popup"
import { HamburgerMenu } from "../molecules/hamburger-menu"
import { Logo } from "../atoms/logo"
import { UsageGuideModal } from "../molecules/usage-guide-modal"
import { useState } from "react"
import type { Store } from "../../types/store"
import type { User, Plan, UsageHistory, PaymentHistory } from "../../types/user"
import type { Notification } from "../../types/notification"
import type { Coupon } from "../../types/coupon"

interface HomeLayoutProps {
  selectedGenres: string[]
  selectedEvents: string[]
  selectedAreas: string[]
   isNearbyFilter: boolean
  isFavoritesFilter: boolean
  stores: Store[]
  activeTab: string
  currentView:
    | "home"
    | "email-confirmation"
    | "login"
    | "email-registration"
    | "signup"
    | "confirmation"
    | "subscription"
    | "mypage"
    | "password-reset"
    | "store-detail"
    | "coupon-confirmation"
    | "usage-guide"
  isAuthenticated: boolean
  isLoading?: boolean
  signupData?: any
  hasNotification?: boolean
  favoriteStores: Store[]
  historyStores: Store[]
  isHistoryOpen: boolean
  isFavoritesOpen: boolean
  notifications: Notification[]
  user?: User
  plan?: Plan
  usageHistory?: UsageHistory[]
  paymentHistory?: PaymentHistory[]
  myPageView?:
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
  isCouponListOpen: boolean
  selectedStore: Store | null
  selectedCoupon: Coupon | null
  storeCoupons: Coupon[]
  passwordResetStep: "form" | "complete"
  passwordResetEmail: string
  emailRegistrationStep?: "form" | "complete"
  emailRegistrationEmail?: string
  emailConfirmationEmail?: string
  onGenresChange: (genres: string[]) => void
  onEventsChange: (events: string[]) => void
  onAreasChange: (areas: string[]) => void
  onCurrentLocationClick: () => void
  onTabChange: (tab: string) => void
  onFavoritesClick: () => void
  onFavoritesClose: () => void
  onHistoryClick?: () => void
  onHistoryClose?: () => void
  onFavoriteToggle: (storeId: string) => void
  onCouponsClick: (storeId: string) => void
  onMyPageViewChange?: (view: string) => void
  onEditProfile?: () => void
  onChangeEmail?: () => void
  onChangePassword?: () => void
  onViewPlan?: () => void
  onChangePlan?: () => void
  onPlanChangeSubmit?: (planId: string) => void
  onViewUsageHistory?: () => void
  onViewPaymentHistory?: () => void
  onCancelSubscription?: () => void
  onWithdraw?: () => void
  onWithdrawConfirm?: () => void
  onWithdrawCancel?: () => void
  onWithdrawComplete?: () => void
  onLogout?: () => void
  onLogin: (email: string, otp: string) => void
  onSignup: () => void
  onForgotPassword: () => void
  onBackToHome: () => void
  onBackToLogin: () => void
  onEmailSubmit: (email: string) => void
  onEmailRegistrationBackToLogin: () => void
  onEmailRegistrationResend: () => void
  onSignupSubmit: (data: any) => void
  onSignupCancel: () => void
  onConfirmRegister: () => void
  onConfirmEdit: () => void
  onSubscribe: (planId: string) => void
  onPasswordResetSubmit: (email: string) => void
  onPasswordResetCancel: () => void
  onPasswordResetResend: () => void
  onNotificationClick: () => void
  onNotificationItemClick: (notificationId: string) => void
  onMarkAllNotificationsRead: () => void
  onMenuItemClick: (itemId: string) => void
  onPlanChangeBack?: () => void
  onLogoClick: () => void
  loginStep?: "email" | "otp"
  loginEmail?: string
  onResendOtp?: () => void
  onBackToEmailLogin?: () => void
  onCouponListClose: () => void
  onCouponListBack: () => void
  onUseCoupon: (couponId: string) => void
  onUseSameCoupon?: (couponId: string) => void
  onConfirmCoupon: () => void
  onCancelCoupon: () => void
  onUsageGuideClick: () => void
  onUsageGuideBack: () => void
  isSuccessModalOpen: boolean
  onSuccessModalClose?: () => void
  isLoginRequiredModalOpen?: boolean
  onLoginRequiredModalClose?: () => void
  onLoginRequiredModalLogin?: () => void
  onStoreClick: (store: Store) => void
  onProfileEditSubmit?: (data: any) => void
  onEmailChangeSubmit?: (currentPassword: string, newEmail: string) => void
  onPasswordChangeSubmit?: (currentPassword: string, newPassword: string) => void
  onBackToLogin?: () => void
  onEmailChangeResend?: () => void
  emailChangeStep?: "form" | "complete"
  passwordChangeStep?: "form" | "complete"
  newEmail?: string
  onStoreDetailClose?: () => void
  isStoreDetailOpen?: boolean
  isStoreDetailPopupOpen?: boolean
  currentUserRank?: string | null
}

export function HomeLayout({
  selectedGenres,
  selectedEvents,
  selectedAreas,
   isNearbyFilter,
  isFavoritesFilter,
  stores,
  activeTab,
  currentView,
  isAuthenticated,
  isLoading,
  signupData,
  hasNotification = false,
  favoriteStores,
  historyStores,
  isHistoryOpen,
  isFavoritesOpen,
  notifications,
  user,
  plan,
  usageHistory = [],
  paymentHistory = [],
  myPageView = "main",
  isCouponListOpen,
  selectedStore,
  selectedCoupon,
  storeCoupons,
  passwordResetStep,
  passwordResetEmail,
  emailRegistrationStep,
  emailRegistrationEmail,
  emailConfirmationEmail = "",
  onGenresChange,
  onEventsChange,
  onAreasChange,
  onCurrentLocationClick,
  onTabChange,
  onFavoritesClick,
  onFavoritesClose,
  onHistoryClick,
  onHistoryClose,
  onFavoriteToggle,
  onCouponsClick,
  onMyPageViewChange = () => {},
  onEditProfile = () => {},
  onChangeEmail = () => {},
  onChangePassword = () => {},
  onViewPlan = () => {},
  onChangePlan = () => {},
  onPlanChangeSubmit = () => {},
  onViewUsageHistory = () => {},
  onViewPaymentHistory = () => {},
  onCancelSubscription = () => {},
  onWithdraw = () => {},
  onWithdrawConfirm = () => {},
  onWithdrawCancel = () => {},
  onWithdrawComplete = () => {},
  onLogout = () => {},
  onLogin,
  onSignup,
  onForgotPassword,
  onBackToHome,
  onBackToLogin,
  onEmailSubmit,
  onEmailRegistrationBackToLogin,
  onEmailRegistrationResend,
  onSignupSubmit,
  onSignupCancel,
  onConfirmRegister,
  onConfirmEdit,
  onSubscribe,
  onPasswordResetSubmit,
  onPasswordResetCancel,
  onPasswordResetResend,
  onNotificationClick,
  onNotificationItemClick,
  onMarkAllNotificationsRead,
  onMenuItemClick,
  onPlanChangeBack = () => {},
  onLogoClick,
  onStoreClick,
  loginStep = "email",
  loginEmail = "",
  onResendOtp = () => {},
  onBackToEmailLogin = () => {},
  onCouponListClose,
  onCouponListBack,
  onUseCoupon,
  onUseSameCoupon = () => {},
  onConfirmCoupon,
  onCancelCoupon = () => {},
  onUsageGuideClick,
  onUsageGuideBack,
  isSuccessModalOpen,
  onSuccessModalClose,
  isLoginRequiredModalOpen = false,
  onLoginRequiredModalClose = () => {},
  onLoginRequiredModalLogin = () => {},
  onProfileEditSubmit = () => {},
  onEmailChangeSubmit = () => {},
  onPasswordChangeSubmit = () => {},
  onEmailChangeResend = () => {},
  emailChangeStep = "form",
  passwordChangeStep = "form",
  newEmail = "",
  onStoreDetailClose,
  isStoreDetailOpen,
  isStoreDetailPopupOpen,
  currentUserRank,
}: HomeLayoutProps) {
  const [isAreaPopupOpen, setIsAreaPopupOpen] = useState(false)
  const [isGenrePopupOpen, setIsGenrePopupOpen] = useState(false)
 const [isUsageGuideModalOpen, setIsUsageGuideModalOpen] = useState(false)

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

  const backgroundColorClass = getBackgroundColorByRank(currentUserRank, isAuthenticated)
  if (currentView === "coupon-confirmation") {
    return (
      <CouponConfirmationPage
        coupon={selectedCoupon}
        onConfirm={onConfirmCoupon}
        onCancel={onCancelCoupon}
        onUsageGuideClick={onUsageGuideClick}
        onLogoClick={onLogoClick}
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
      <EmailConfirmationLayout
        email={emailConfirmationEmail}
        onLogoClick={onLogoClick}
      />
    )
  }

  if (currentView === "password-reset") {
    return (
      <PasswordResetLayout
        currentStep={passwordResetStep}
        email={passwordResetEmail}
        onSubmit={onPasswordResetSubmit}
        onCancel={onPasswordResetCancel}
        onBackToLogin={onBackToLogin}
        onResend={onPasswordResetResend}
        onLogoClick={onLogoClick}
        isLoading={isLoading}
      />
    )
  }

  if (currentView === "mypage" && user && plan) {
    // プラン変更画面の場合
    if (myPageView === "plan-change") {
      return (
        <PlanChangeLayout
          currentPlan={plan}
          onPlanChange={onPlanChangeSubmit}
          onBack={onPlanChangeBack}
          onLogoClick={onLogoClick}
          isLoading={isLoading}
        />
      )
    }

    // プラン管理画面の場合
    if (myPageView === "plan-management") {
      return (
        <PlanManagementLayout
          plan={plan}
          onChangePlan={() => onMyPageViewChange("plan-change")}
          onCancelSubscription={onCancelSubscription}
          onBack={() => onMyPageViewChange("main")}
          onLogoClick={onLogoClick}
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
        onViewChange={onMyPageViewChange}
        onEditProfile={onEditProfile}
        onChangeEmail={onChangeEmail}
        onChangePassword={onChangePassword}
        onViewPlan={onViewPlan}
        onViewUsageHistory={onViewUsageHistory}
        onViewPaymentHistory={onViewPaymentHistory}
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
        onProfileEditSubmit={onProfileEditSubmit || (() => {})}
        onEmailChangeSubmit={onEmailChangeSubmit}
        onPasswordChangeSubmit={onPasswordChangeSubmit}
        onBackToLogin={onBackToLogin}
        onEmailChangeResend={onEmailChangeResend}
        emailChangeStep={emailChangeStep}
        passwordChangeStep={passwordChangeStep}
        newEmail={newEmail}
        currentUserRank={currentUserRank}
      />
    )
  }

  if (currentView === "subscription") {
    return <SubscriptionLayout onSubscribe={onSubscribe} onLogoClick={onLogoClick} isLoading={isLoading} />
  }


  if (currentView === "confirmation") {
    return (
      <ConfirmationLayout
        data={signupData}
        onRegister={onConfirmRegister}
        onEdit={onConfirmEdit}
        onLogoClick={onLogoClick}
        isLoading={isLoading}
      />
    )
  }

  if (currentView === "login") {
    return (
      <LoginLayout
        onLogin={onLogin}
        onSignup={onSignup}
        onForgotPassword={onForgotPassword}
        onBack={loginStep === "email" ? onBackToHome : onBackToEmailLogin}
        onLogoClick={onLogoClick}
        isLoading={isLoading}
        loginStep={loginStep}
        email={loginEmail}
        onResendOtp={onResendOtp}
      />
    )
  }

  if (currentView === "email-registration") {
    return (
      <EmailRegistrationLayout
        currentStep={emailRegistrationStep}
        email={emailRegistrationEmail}
        onSubmit={onEmailSubmit}
        onBack={onBackToHome}
        onBackToLogin={onEmailRegistrationBackToLogin}
        onResend={onEmailRegistrationResend}
        onLogoClick={onLogoClick}
        isLoading={isLoading}
      />
    )
  }

  if (currentView === "signup") {
    return (
      <SignupLayout
        initialData={signupData}
        email={signupData?.email}
        onSubmit={onSignupSubmit}
        onCancel={onSignupCancel}
        onLogoClick={onLogoClick}
        isLoading={isLoading}
      />
    )
  }

  return (
    <div className={`min-h-screen flex flex-col ${backgroundColorClass} w-full`}>
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
            {isAuthenticated ? (
              user && currentUserRank && (
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border-2 border-green-600">
                  <img
                    src={`/${currentUserRank}.png`}
                    alt={`${currentUserRank}ランク`}
                    className="w-5 h-5 object-contain"
                  />
                </div>
              )
            ) : null}
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
            className={`w-full flex items-center justify-center gap-1 px-2 py-2 border rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
              isNearbyFilter
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
            onClick={() => setIsAreaPopupOpen(true)}
            className={`w-full flex items-center justify-center gap-1 px-2 py-2 border rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
              selectedAreas.length > 0
                ? "border-green-500 bg-green-50 text-green-700"
                : "border-gray-300 bg-white text-gray-700 hover:border-green-300 hover:bg-green-50"
            }`}
          >
            <span>エリア</span>
            {selectedAreas.length > 0 && (
              <span className="bg-green-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                {selectedAreas.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setIsGenrePopupOpen(true)}
            className={`w-full flex items-center justify-center gap-1 px-2 py-2 border rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
              selectedGenres.length > 0
                ? "border-green-700 bg-green-100 text-green-800"
                : "border-gray-300 bg-white text-gray-700 hover:border-green-400 hover:bg-green-100"
            }`}
          >
            <span>ジャンル</span>
            {selectedGenres.length > 0 && (
              <span className="bg-green-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                {selectedGenres.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* エリア選択ポップアップ */}
      <AreaPopup
        isOpen={isAreaPopupOpen}
        selectedAreas={selectedAreas}
        onAreaToggle={(area) => {
          const newAreas = selectedAreas.includes(area)
            ? selectedAreas.filter((a) => a !== area)
            : [...selectedAreas, area]
          onAreasChange(newAreas)
        }}
        onClose={() => setIsAreaPopupOpen(false)}
        onClear={() => onAreasChange([])}
      />

      {/* ジャンル選択ポップアップ */}
      <GenrePopup
        isOpen={isGenrePopupOpen}
        selectedGenres={selectedGenres}
        onGenreToggle={(genre) => {
          const newGenres = selectedGenres.includes(genre)
            ? selectedGenres.filter((g) => g !== genre)
            : [...selectedGenres, genre]
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
         isNearbyFilter={isNearbyFilter}
        isFavoritesFilter={isFavoritesFilter}
        stores={stores}
        onStoreClick={onStoreClick}
        onFavoriteToggle={onFavoriteToggle}
        onCouponsClick={onCouponsClick}
          isModalOpen={isCouponListOpen || isSuccessModalOpen || isHistoryOpen || isStoreDetailPopupOpen}
        backgroundColorClass={backgroundColorClass}
        />
      </div>

      {/* お気に入り一覧ポップアップ */}
      <HistoryPopup
        isOpen={isFavoritesOpen}
        stores={favoriteStores}
        onClose={onFavoritesClose}
        onFavoriteToggle={onFavoriteToggle}
        onCouponsClick={onCouponsClick}
      />
      
      {/* 閲覧履歴ポップアップ */}
      <HistoryPopup
        isOpen={isHistoryOpen}
        stores={historyStores}
        onClose={onHistoryClose}
        onFavoriteToggle={onFavoriteToggle}
        onCouponsClick={onCouponsClick}
      />
      
      <StoreDetailPopup
        isOpen={isStoreDetailPopupOpen}
        store={selectedStore}
        onClose={() => {
          console.log("StoreDetailPopup onClose called")
          console.log("current isStoreDetailPopupOpen:", isStoreDetailPopupOpen)
          console.log("selectedStore:", selectedStore?.name)
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
        onClose={onSuccessModalClose}
      />
      
      {/* ログインが必要なモーダル */}
      <LoginRequiredModal
        isOpen={isLoginRequiredModalOpen}
        onClose={onLoginRequiredModalClose}
        onLogin={onLoginRequiredModalLogin}
      />
      
      {/* フッターナビゲーション */}
      <FooterNavigation
        activeTab={activeTab}
        onTabChange={onTabChange}
        isAuthenticated={isAuthenticated}
        onFavoritesClick={onFavoritesClick}
      />
      
    </div>
  )
}