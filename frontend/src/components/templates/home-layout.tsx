"use client"

import { useState } from "react"
import Image from "next/image"
import { HomeContainer } from "../organisms/home-container"
import { LoginLayout } from "./login-layout"
import { EmailRegistrationLayout } from "./email-registration-layout"
import { RegisterLayout } from "./register-layout"
import { ConfirmationLayout } from "./confirmation-layout"
import { SubscriptionLayout } from "./subscription-layout"
import { PasswordResetLayout } from "./password-reset-layout"

import { HistoryPopup } from "../molecules/history-popup"
import { MyPageLayout } from "./mypage-layout"
import { PlanManagementLayout } from "./plan-management-layout"
import { PlanChangeLayout } from "./plan-change-layout"
import { CouponListPopup } from "../molecules/coupon-list-popup"
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
import { useAppContext } from "../../contexts/AppContext"
import type { Store } from "../../types/store"


export function HomeLayout() {
  // Context から必要な値を取得
  const { state, handlers, auth, navigation, filters, computedValues } = useAppContext()
  
  // エリアポップアップの状態管理
  const [isAreaPopupOpen, setIsAreaPopupOpen] = useState(false)
  const [isGenrePopupOpen, setIsGenrePopupOpen] = useState(false)

  // 必要な値をローカル変数として定義
  const selectedGenres = filters.selectedGenres
  const selectedEvents = filters.selectedEvents
  const selectedAreas = filters.selectedAreas
  const isNearbyFilter = filters.isNearbyFilter
  const isFavoritesFilter = filters.isFavoritesFilter
  const stores = state.stores
  const currentView = navigation.currentView
  const isAuthenticated = auth.isAuthenticated
  const isLoading = auth.isLoading
  const signupData = state.signupData
  const favoriteStores = computedValues.favoriteStores
  const historyStores: Store[] = [] // TODO: 履歴データの実装
  const isHistoryOpen = state.isHistoryOpen
  const isFavoritesOpen = state.isFavoritesOpen
  const user = auth.user
  const plan = auth.plan
  const usageHistory = auth.usageHistory || []
  const paymentHistory = auth.paymentHistory || []
  const myPageView = navigation.myPageView
  const isCouponListOpen = state.isCouponListOpen
  const selectedStore = state.selectedStore
  const selectedCoupon = state.selectedCoupon
  const storeCoupons = state.storeCoupons || []
  const passwordResetStep = state.passwordResetStep
  const passwordResetEmail = state.passwordResetEmail
  const emailRegistrationStep = state.emailRegistrationStep
  const emailRegistrationEmail = state.emailRegistrationEmail
  const emailConfirmationEmail = state.emailConfirmationEmail || ""

  // イベントハンドラーを Context から取得
  const onGenresChange = filters.setSelectedGenres
  const onEventsChange = filters.setSelectedEvents
  const onAreasChange = filters.setSelectedAreas
  const onCurrentLocationClick = handlers.handleCurrentLocationClick
  const onFavoritesClose = handlers.handleFavoritesClose
  const onHistoryClose = handlers.handleHistoryClose
  const onFavoriteToggle = handlers.handleFavoriteToggle
  const onCouponsClick = handlers.handleCouponsClick
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
  const onStoreClick = handlers.handleStoreClick
  const loginStep = state.loginStep
  const loginEmail = state.loginEmail
  const onResendOtp = handlers.handleResendOtp
  const onBackToEmailLogin = handlers.handleBackToEmailLogin
  const onCouponListClose = handlers.handleCouponListClose
  const onCouponListBack = handlers.handleCouponListBack
  const onUseCoupon = handlers.handleUseCoupon
  const onConfirmCoupon = handlers.handleConfirmCoupon
  const onCancelCoupon = handlers.handleCancelCoupon
  const onUseSameCoupon = handlers.handleUseSameCoupon
  const onUsageGuideClick = handlers.handleUsageGuideClick
  const onUsageGuideBack = handlers.handleUsageGuideBack
  const isSuccessModalOpen = state.isSuccessModalOpen
  const onSuccessModalClose = handlers.handleSuccessModalClose
  const isLoginRequiredModalOpen = state.isLoginRequiredModalOpen
  const onLoginRequiredModalClose = handlers.handleLoginRequiredModalClose
  const onLoginRequiredModalLogin = handlers.handleLoginRequiredModalLogin
  const onProfileEditSubmit = handlers.handleProfileEditSubmit
  const onEmailChangeSubmit = handlers.handleEmailChangeSubmit
  const onPasswordChangeSubmit = handlers.handlePasswordChangeSubmit
  const onEmailChangeResend = handlers.handleEmailChangeResend
  const emailChangeStep = state.emailChangeStep
  const passwordChangeStep = state.passwordChangeStep
  const newEmail = state.newEmail
  const onStoreDetailClose = handlers.handleStoreDetailPopupClose
  const isStoreDetailPopupOpen = state.isStoreDetailPopupOpen
  const currentUserRank = computedValues.currentUserRank

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
        onUsageGuideClick={onUsageGuideClick}
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
        onProfileEditSubmit={onProfileEditSubmit || (() => { })}
        onEmailChangeSubmit={onEmailChangeSubmit}
        onPasswordChangeSubmit={onPasswordChangeSubmit}
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
        onVerifyOtp={onLogin}
        onSignup={onSignup}
        onForgotPassword={onForgotPassword}
        onResendOtp={onResendOtp}
        onBackToPassword={loginStep === "email" ? onBackToHome : onBackToEmailLogin}
        isLoading={isLoading}
        loginStep={loginStep}
        email={loginEmail}
      />
    )
  }

  if (currentView === "email-registration") {
    return (
      <EmailRegistrationLayout
        currentStep={emailRegistrationStep ?? "form"}
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
      <RegisterLayout
        email={signupData?.email}
        initialFormData={signupData ? {
          nickname: signupData.nickname || "",
          postalCode: signupData.postalCode || "",
          address: signupData.address || "",
          birthDate: signupData.birthDate || "",
          gender: signupData.gender || "",
          password: "",
          passwordConfirm: "",
        } : null}
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
            onClick={() => setIsAreaPopupOpen(true)}
            className={`w-full flex items-center justify-center gap-1 px-2 py-2 border rounded-full text-xs font-medium transition-colors whitespace-nowrap ${(selectedAreas?.length ?? 0) > 0
              ? "border-green-500 bg-green-50 text-green-700"
              : "border-gray-300 bg-white text-gray-700 hover:border-green-300 hover:bg-green-50"
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
            onClick={() => setIsGenrePopupOpen(true)}
            className={`w-full flex items-center justify-center gap-1 px-2 py-2 border rounded-full text-xs font-medium transition-colors whitespace-nowrap ${(selectedGenres?.length ?? 0) > 0
              ? "border-green-700 bg-green-100 text-green-800"
              : "border-gray-300 bg-white text-gray-700 hover:border-green-400 hover:bg-green-100"
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
      </div>

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
        onClose={onHistoryClose ?? (() => { })}
        onFavoriteToggle={onFavoriteToggle}
        onCouponsClick={onCouponsClick}
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

      {/* フッターナビゲーション */}
      <FooterNavigation />

    </div>
  )
}