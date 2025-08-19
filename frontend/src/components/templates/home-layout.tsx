"use client"

import { FilterControls } from "../molecules/filter-controls"
import { NavigationBar } from "../molecules/navigation-bar"
import { HomeContainer } from "../organisms/home-container"
import { MapPin, Phone, Globe, Ticket } from "lucide-react"
import { LoginLayout } from "./login-layout"
import { EmailRegistrationLayout } from "./email-registration-layout"
import { SignupLayout } from "./signup-layout"
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
import { StoreDetailPopup } from "../molecules/store-detail-popup"
import { EmailConfirmationLayout } from "./email-confirmation-layout"
import type { Store } from "../../types/store"
import type { User, Plan, UsageHistory, PaymentHistory } from "../../types/user"
import type { Notification } from "../../types/notification"
import type { Coupon } from "../../types/coupon"

interface HomeLayoutProps {
  selectedGenres: string[]
  selectedArea: string
  isFavoritesFilter: boolean
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
  isAuthenticated: boolean
  isLoading?: boolean
  signupData?: any
  hasNotification?: boolean
  favoriteStores: Store[]
  historyStores: Store[]
  isHistoryOpen: boolean
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
  isConfirmationOpen: boolean
  selectedStore: Store | null
  selectedCoupon: Coupon | null
  storeCoupons: Coupon[]
  passwordResetStep: "form" | "complete"
  passwordResetEmail: string
  emailRegistrationStep?: "form" | "complete"
  emailRegistrationEmail?: string
  emailConfirmationEmail?: string
  onGenresChange: (genres: string[]) => void
  onAreaChange: (area: string) => void
  onCurrentLocationClick: () => void
  onTabChange: (tab: string) => void
  onFavoritesClick: () => void
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
  onConfirmCoupon: () => void
  onCancelCoupon: () => void
  isSuccessModalOpen: boolean
  onSuccessModalClose?: () => void
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
}

export function HomeLayout({
  selectedGenres,
  selectedArea,
  isFavoritesFilter,
  activeTab,
  currentView,
  isAuthenticated,
  isLoading,
  signupData,
  hasNotification = false,
  favoriteStores,
  historyStores,
  isHistoryOpen,
  notifications,
  user,
  plan,
  usageHistory = [],
  paymentHistory = [],
  myPageView = "main",
  isCouponListOpen,
  isConfirmationOpen,
  selectedStore,
  selectedCoupon,
  storeCoupons,
  passwordResetStep,
  passwordResetEmail,
  emailRegistrationStep,
  emailRegistrationEmail,
  emailConfirmationEmail = "",
  onGenresChange,
  onAreaChange,
  onCurrentLocationClick,
  onTabChange,
  onFavoritesClick,
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
  onConfirmCoupon,
  onCancelCoupon = () => {},
  isSuccessModalOpen,
  onSuccessModalClose,
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
}: HomeLayoutProps) {
  console.log("HomeLayout render - currentView:", currentView, "selectedStore:", selectedStore?.name)
  
  if (currentView === "email-confirmation") {
    return (
      <EmailConfirmationLayout
        email={emailConfirmationEmail}
        onBackToLogin={onBackToLogin}
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
        onUseSameCoupon={() => {}}
        onLogoClick={onLogoClick}
        onProfileEditSubmit={onProfileEditSubmit || (() => {})}
        onEmailChangeSubmit={onEmailChangeSubmit}
        onPasswordChangeSubmit={onPasswordChangeSubmit}
        onBackToLogin={onBackToLogin}
        onEmailChangeResend={onEmailChangeResend}
        emailChangeStep={emailChangeStep}
        passwordChangeStep={passwordChangeStep}
        newEmail={newEmail}
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 to-green-100 w-full">
      <FilterControls
        selectedGenres={selectedGenres}
        selectedArea={selectedArea}
        isFavoritesFilter={isFavoritesFilter}
        notifications={notifications}
        isAuthenticated={isAuthenticated}
        onGenresChange={onGenresChange}
        onAreaChange={onAreaChange}
        onCurrentLocationClick={() => {
          // 全て表示（フィルターをクリア）
          onGenresChange([])
          onAreaChange("")
        }}
        onFavoritesClick={onFavoritesClick}
        onMenuItemClick={onMenuItemClick}
        onLogoClick={onLogoClick}
        onTabChange={onTabChange}
        favoriteCount={favoriteStores.length}
      />
      <HomeContainer
        selectedGenres={selectedGenres}
        isFavoritesFilter={isFavoritesFilter}
        onStoreClick={onStoreClick}
        onCouponsClick={onCouponsClick}
        isModalOpen={isCouponListOpen || isConfirmationOpen || isSuccessModalOpen || isHistoryOpen || isStoreDetailPopupOpen}
      />


      <HistoryPopup
        isOpen={isHistoryOpen}
        stores={historyStores}
        onClose={onHistoryClose}
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
      />
      {console.log("CouponConfirmationPopup render check:", {
        isConfirmationOpen,
        selectedCoupon: selectedCoupon?.name,
        timestamp: new Date().toISOString()
      })}
      <CouponConfirmationPopup
        isOpen={isConfirmationOpen}
        coupon={selectedCoupon}
        onConfirm={onConfirmCoupon}
        onCancel={() => {
          console.log("Cancel coupon called - closing confirmation and returning to store detail")
          console.log("CouponConfirmationPopup onCancel triggered")
          onCancelCoupon()
        }}
      />
      
      {/* クーポン使用成功モーダル */}
      <CouponUsedSuccessModal
        isOpen={isSuccessModalOpen}
        coupon={selectedCoupon}
        onClose={onSuccessModalClose}
      />
      
    </div>
  )
}