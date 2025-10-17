"use client"

import React, { useMemo, useState, useEffect } from "react"
import Image from "next/image"
import { SquarePen, Crown, RefreshCw, Mail, Lock, History, CreditCard, LogOut } from "lucide-react"
import { User } from "lucide-react"
import { Logo } from "../atoms/logo"
import { getNextRankInfo, getMonthsToNextRank, RANK_INFO } from "../../utils/rank-calculator"
import { UsageHistoryList } from "../molecules/usage-history-list"
import { PaymentHistoryList } from "../molecules/payment-history-list"
import { WithdrawalLayout } from "../templates/withdrawal-layout"
import { WithdrawalComplete } from "../molecules/withdrawal-complete"
import type { User as UserType, Plan, UsageHistory, PaymentHistory } from "../../types/user"
import { ProfileEditLayout } from "../templates/profile-edit-layout"
import { EmailChangeLayout } from "../templates/email-change-layout"
import { PasswordChangeLayout } from "../templates/password-change-layout"
import { appConfig } from '@/config/appConfig'
import { useDataPreloader } from "../../hooks/useDataPreloader"
import { SkeletonMyPage, SkeletonCard, SkeletonRankCard, SkeletonMenuButton } from "../skeletons/mypage-skeleton"
import { StaggeredContainer, FadeInComponent } from "../animations/progressive-loader"
import {
  LazyUsageHistoryList,
  LazyPaymentHistoryList,
  LazyProfileEditLayout,
  LazyEmailChangeLayout,
  LazyPasswordChangeLayout,
  LazyWithdrawalLayout,
  LazyFallback
} from "../lazy/lazy-components"

interface ProfileEditFormData {
  nickname: string
  postalCode: string
  address: string
  birthDate: string
  gender: string
  saitamaAppId: string
}
interface MyPageContainerProps {
  user: UserType
  plan: Plan
  usageHistory: UsageHistory[]
  paymentHistory: PaymentHistory[]
  currentView:
  | "main"
  | "profile-edit"
  | "email-change"
  | "password-change"
  | "usage-history"
  | "payment-history"
  | "plan-management"
  | "withdrawal"
  | "withdrawal-complete"
  onViewChange: (view: string) => void
  onEditProfile: () => void
  onChangeEmail: () => void
  onChangePassword: () => void
  onViewPlan: () => void
  onViewUsageHistory: () => void
  onViewPaymentHistory: () => void
  onCancelSubscription: () => void
  onWithdraw: () => void
  onWithdrawConfirm: () => void
  onWithdrawCancel: () => void
  onWithdrawComplete: () => void
  onLogout: () => void
  onBack: () => void
  onShowStoreOnHome: (storeId: string) => void
  onUseSameCoupon: (couponId: string) => void
  onLogoClick: () => void
  onProfileEditSubmit: (data: ProfileEditFormData) => void
  onPasswordChangeBackToLogin?: () => void
  onEmailChangeSubmit?: (currentPassword: string, newEmail: string) => void
  onEmailChangeResend?: () => void
  onPasswordChangeSubmit?: (currentPassword: string, newPassword: string) => void
  emailChangeStep?: "form" | "complete"
  passwordChangeStep?: "form" | "complete"
  passwordChangeError?: string | null
  newEmail?: string
  currentUserRank?: string | null
}

// ランク計算用のカスタムフック
const useRankCalculations = (user: UserType, currentUserRank: string | null | undefined) => {
  return useMemo(() => {
    if (!currentUserRank || !(currentUserRank in RANK_INFO)) {
      return { nextRank: null, monthsToNext: null, currentRankInfo: null }
    }

    const contractStartDate = user.contractStartDate || user.createdAt
    const nextRank = getNextRankInfo(currentUserRank as keyof typeof RANK_INFO)
    const monthsToNext = getMonthsToNextRank(contractStartDate, currentUserRank as keyof typeof RANK_INFO)
    const currentRankInfo = RANK_INFO[currentUserRank as keyof typeof RANK_INFO]

    return { nextRank, monthsToNext, currentRankInfo }
  }, [user.contractStartDate, user.createdAt, currentUserRank])
}

// プロフィールカードコンポーネント
const ProfileCard = React.memo(({ user, onEditProfile }: { user: UserType, onEditProfile: () => void }) => (
  <div className="bg-white rounded-2xl border border-green-200 p-6">
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
          <User className="w-5 h-5 text-green-600" />
        </div>
        <span className="text-lg font-bold text-gray-500">プロフィール</span>
      </div>
      <button
        onClick={onEditProfile}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <SquarePen className="w-5 h-5 text-gray-600" />
      </button>
    </div>

    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">ニックネーム</span>
        <span className="text-sm font-medium text-gray-900">{user.nickname}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">メールアドレス</span>
        <span className="text-sm font-medium text-gray-900">{user.email}</span>
      </div>
    </div>
  </div>
))

// ランク画像コンポーネント
const RankImage = React.memo(({ rank, alt, className }: { rank: string, alt: string, className: string }) => (
  <div className="relative w-8 h-8">
    <Image
      src={`/${rank}.svg`}
      alt={alt}
      fill
      className={className}
      priority={true}
      sizes="32px"
    />
  </div>
))

// ランクカードコンポーネント
const RankCard = React.memo(({ rankCalculations }: { rankCalculations: ReturnType<typeof useRankCalculations> }) => {
  const { nextRank, monthsToNext, currentRankInfo } = rankCalculations

  if (!currentRankInfo) return null

  return (
    <div className="bg-white rounded-2xl border border-green-200 p-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
          <Crown className="w-5 h-5 text-green-600" />
        </div>
        <span className="text-lg font-bold text-gray-900">メンバーランク</span>
      </div>

      <div className="space-y-4">
        {/* 現在のメンバーランク - 横並び */}
        <div className="flex items-center justify-center gap-4">
          <span className="text-base font-medium text-gray-700">現在のメンバーランク</span>
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border-2 border-gray-300 shadow-sm">
            <RankImage rank={currentRankInfo.rank} alt={`${currentRankInfo.rank}ランク`} className="object-contain" />
          </div>
        </div>

        {/* 次のランクアップまで - 緑のバー */}
        {nextRank && monthsToNext !== null ? (
          <div className="space-y-3">
            <div className="bg-green-600 text-white rounded-full py-2 px-6 text-center mx-auto">
              <span className="text-base font-bold">次のランクアップまで</span>
            </div>

            {/* ランクアップ情報 */}
            <div className="flex items-center justify-center gap-4">
              <div className="flex-1">
                <div className="text-base text-gray-700">あと{monthsToNext}ヶ月で</div>
                <div className="text-base font-bold text-gray-900">{nextRank.label}にランクアップ！</div>
              </div>
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border-2 border-yellow-300 shadow-sm">
                <RankImage rank={nextRank.rank} alt={`${nextRank.label}ランク`} className="object-contain" />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="bg-green-600 text-white rounded-full py-2 px-6 text-center mx-auto">
              <span className="text-base font-bold">次のランクアップまで</span>
            </div>

            <div className="flex items-center justify-center gap-4">
              <span className="text-base font-medium text-gray-700">あと10ヶ月でゴールドにランクアップ！</span>
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border-2 border-yellow-300 shadow-sm">
                <RankImage rank="gold" alt="ゴールドランク" className="object-contain" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
})

// メニューボタンコンポーネント
const MenuButton = React.memo(({
  onClick,
  icon: Icon,
  label,
  isRed = false
}: {
  onClick: () => void,
  icon: React.ComponentType<{ className?: string }>,
  label: string,
  isRed?: boolean
}) => (
  <button
    onClick={onClick}
    className={`w-full bg-white rounded-2xl border ${isRed ? 'border-red-200 hover:bg-red-50' : 'border-green-200 hover:bg-green-50'} p-4 flex items-center justify-between transition-colors`}
  >
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 ${isRed ? 'bg-red-100' : 'bg-green-100'} rounded-lg flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${isRed ? 'text-red-600' : 'text-green-600'}`} />
      </div>
      <span className="text-lg font-medium text-gray-500">{label}</span>
    </div>
    <div className="text-gray-400">›</div>
  </button>
))

// メニューボタン群コンポーネント
const MenuButtons = React.memo(({
  onEditProfile,
  onViewPlan,
  onChangeEmail,
  onChangePassword,
  onViewUsageHistory,
  onViewPaymentHistory,
  onLogout
}: {
  onEditProfile: () => void
  onViewPlan: () => void
  onChangeEmail: () => void
  onChangePassword: () => void
  onViewUsageHistory: () => void
  onViewPaymentHistory: () => void
  onLogout: () => void
}) => (
  <div className="space-y-3">
    {appConfig.myPageSettings.showProfile && (
      <MenuButton onClick={onEditProfile} icon={SquarePen} label="プロフィール編集" />
    )}
    {appConfig.myPageSettings.showPlanManagement && (
      <MenuButton onClick={onViewPlan} icon={RefreshCw} label="プランの変更" />
    )}
    {appConfig.myPageSettings.showEmailChange && (
      <MenuButton onClick={onChangeEmail} icon={Mail} label="メールアドレスの変更" />
    )}
    {appConfig.myPageSettings.showPasswordChange && (
      <MenuButton onClick={onChangePassword} icon={Lock} label="パスワードの変更" />
    )}
    {appConfig.myPageSettings.showUsageHistory && (
      <MenuButton onClick={onViewUsageHistory} icon={History} label="利用履歴" />
    )}
    {appConfig.myPageSettings.showPaymentHistory && (
      <MenuButton onClick={onViewPaymentHistory} icon={CreditCard} label="決済履歴" />
    )}
    <MenuButton onClick={onLogout} icon={LogOut} label="ログアウト" isRed />
  </div>
))

export const MyPageContainer = React.memo(function MyPageContainer({
  user,
  plan,
  usageHistory,
  paymentHistory,
  currentView,
  onViewChange,
  onEditProfile,
  onChangeEmail,
  onChangePassword,
  onViewPlan,
  onViewUsageHistory,
  onViewPaymentHistory,
  onWithdraw,
  onWithdrawConfirm,
  onWithdrawCancel,
  onWithdrawComplete,
  onLogout,
  onBack,
  onLogoClick,
  onProfileEditSubmit,
  onPasswordChangeBackToLogin = () => { },
  onEmailChangeSubmit = () => { },
  onEmailChangeResend = () => { },
  onPasswordChangeSubmit = () => { },
  emailChangeStep = "form",
  passwordChangeStep = "form",
  passwordChangeError = null,
  newEmail = "",
  currentUserRank,
}: MyPageContainerProps) {
  // データプリローダーを使用
  const { preloadedData, isPreloading, preloadProgress } = useDataPreloader()

  // 背景色をメモ化
  const backgroundColorClass = useMemo(() =>
    "bg-gradient-to-br from-green-50 to-green-100", []
  )

  // ランク計算をメモ化（プリロードデータを使用）
  const rankCalculations = useRankCalculations(user, currentUserRank)

  // 防御的チェック：userとplanが存在しない場合はスケルトンを表示
  if (!user || !plan) {
    return <SkeletonMyPage />
  }

  // データがプリロード中の場合、段階的に表示
  if (isPreloading && preloadProgress < 100) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
        {/* ヘッダー */}
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="flex items-center justify-between">
            <button onClick={onBack} className="text-green-600 hover:text-green-700 transition-colors">
              ← 戻る
            </button>
            <Logo size="lg" onClick={onLogoClick} />
            <div className="w-12"></div>
          </div>
        </div>

        <div className="p-4 space-y-4 max-w-md mx-auto">
          {/* プログレッシブ表示 */}
          <StaggeredContainer staggerDelay={150}>
            <SkeletonCard />
            <SkeletonRankCard />
            <SkeletonMenuButton />
            <SkeletonMenuButton />
            <SkeletonMenuButton />
            <SkeletonMenuButton />
            <SkeletonMenuButton />
            <SkeletonMenuButton />
            <SkeletonMenuButton />
          </StaggeredContainer>

          {/* プログレスバー */}
          <div className="mt-8">
            <div className="bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${preloadProgress}%` }}
              ></div>
            </div>
            <p className="text-center text-sm text-gray-600 mt-2">
              読み込み中... {preloadProgress}%
            </p>
          </div>
        </div>
      </div>
    )
  }

  // 早期リターンでレンダリングを最適化
  if (currentView !== "main") {
    return <MyPageSubView
      currentView={currentView}
      user={user}
      usageHistory={usageHistory}
      paymentHistory={paymentHistory}
      onViewChange={onViewChange}
      onBack={onBack}
      onLogoClick={onLogoClick}
      onProfileEditSubmit={onProfileEditSubmit}
      onWithdraw={onWithdraw}
      onWithdrawConfirm={onWithdrawConfirm}
      onWithdrawCancel={onWithdrawCancel}
      onWithdrawComplete={onWithdrawComplete}
      onPasswordChangeBackToLogin={onPasswordChangeBackToLogin}
      onEmailChangeSubmit={onEmailChangeSubmit}
      onEmailChangeResend={onEmailChangeResend}
      onPasswordChangeSubmit={onPasswordChangeSubmit}
      emailChangeStep={emailChangeStep}
      passwordChangeStep={passwordChangeStep}
      passwordChangeError={passwordChangeError}
      newEmail={newEmail}
      currentUserRank={currentUserRank}
    />
  }

  // ランクが計算されていない場合はローディング表示
  if (!rankCalculations.currentRankInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="flex items-center justify-between">
            <button onClick={onBack} className="text-green-600 hover:text-green-700 transition-colors">
              ← 戻る
            </button>
            <Logo size="lg" onClick={onLogoClick} />
            <div className="w-12"></div>
          </div>
        </div>
        <div className="p-4 flex items-center justify-center">
          <div className="text-gray-500">読み込み中...</div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${backgroundColorClass}`}>
      {/* ヘッダー */}
      <FadeInComponent delay={0}>
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="flex items-center justify-between">
            <button onClick={onBack} className="text-green-600 hover:text-green-700 transition-colors">
              ← 戻る
            </button>
            <Logo size="lg" onClick={onLogoClick} />
            <div className="w-12"></div>
          </div>
        </div>
      </FadeInComponent>

      <div className="p-4 space-y-4 max-w-md mx-auto">
        {/* プログレッシブ表示でコンテンツを段階的に表示 */}
        <StaggeredContainer staggerDelay={100}>
          <FadeInComponent delay={200}>
            <ProfileCard user={user} onEditProfile={onEditProfile} />
          </FadeInComponent>

          <FadeInComponent delay={300}>
            <RankCard rankCalculations={rankCalculations} />
          </FadeInComponent>

          <FadeInComponent delay={400}>
            <MenuButtons
              onEditProfile={onEditProfile}
              onViewPlan={onViewPlan}
              onChangeEmail={onChangeEmail}
              onChangePassword={onChangePassword}
              onViewUsageHistory={onViewUsageHistory}
              onViewPaymentHistory={onViewPaymentHistory}
              onLogout={onLogout}
            />
          </FadeInComponent>
        </StaggeredContainer>
      </div>
    </div>
  )
})

// サブビューコンポーネント（早期リターン用）
const MyPageSubView = React.memo(({
  currentView,
  user,
  usageHistory,
  paymentHistory,
  onViewChange,
  onBack,
  onLogoClick,
  onProfileEditSubmit,
  onWithdraw,
  onWithdrawConfirm,
  onWithdrawCancel,
  onWithdrawComplete,
  onPasswordChangeBackToLogin,
  onEmailChangeSubmit,
  onEmailChangeResend,
  onPasswordChangeSubmit,
  emailChangeStep,
  passwordChangeStep,
  passwordChangeError,
  newEmail,
  currentUserRank
}: {
  currentView: string
  user: UserType
  usageHistory: UsageHistory[]
  paymentHistory: PaymentHistory[]
  onViewChange: (view: string) => void
  onBack: () => void
  onLogoClick: () => void
  onProfileEditSubmit: (data: ProfileEditFormData) => void
  onWithdraw: () => void
  onWithdrawConfirm: () => void
  onWithdrawCancel: () => void
  onWithdrawComplete: () => void
  onPasswordChangeBackToLogin: () => void
  onEmailChangeSubmit: (currentPassword: string, newEmail: string) => void
  onEmailChangeResend: () => void
  onPasswordChangeSubmit: (currentPassword: string, newPassword: string) => void
  emailChangeStep: "form" | "complete"
  passwordChangeStep: "form" | "complete"
  passwordChangeError: string | null
  newEmail: string
  currentUserRank: string | null | undefined
}) => {
  switch (currentView) {
    case "profile-edit":
      return (
        <LazyFallback>
          <LazyProfileEditLayout
            user={user}
            onSubmit={onProfileEditSubmit}
            onCancel={() => onViewChange("main")}
            onWithdraw={onWithdraw}
            onLogoClick={onLogoClick}
          />
        </LazyFallback>
      )
    case "email-change":
      return (
        <LazyFallback>
          <LazyEmailChangeLayout
            currentStep={emailChangeStep}
            currentEmail={user.email}
            newEmail={newEmail}
            onSubmit={onEmailChangeSubmit}
            onCancel={() => onViewChange("main")}
            onBackToMyPage={() => onViewChange("main")}
            onResend={onEmailChangeResend}
            onLogoClick={onLogoClick}
            isLoading={false}
          />
        </LazyFallback>
      )
    case "password-change":
      return (
        <LazyFallback>
          <LazyPasswordChangeLayout
            currentStep={passwordChangeStep}
            onSubmit={onPasswordChangeSubmit}
            onCancel={() => onViewChange("main")}
            onBackToLogin={onPasswordChangeBackToLogin}
            onLogoClick={onLogoClick}
            isLoading={false}
            errorMessage={passwordChangeError}
            currentUserRank={currentUserRank}
          />
        </LazyFallback>
      )
    case "usage-history":
      return (
        <LazyFallback>
          <LazyUsageHistoryList
            history={usageHistory}
            onBackToMyPage={() => onViewChange("main")}
            onBackToTop={onBack}
          />
        </LazyFallback>
      )
    case "payment-history":
      return (
        <LazyFallback>
          <LazyPaymentHistoryList
            history={paymentHistory}
            onBackToMyPage={() => onViewChange("main")}
            onBackToTop={onBack}
          />
        </LazyFallback>
      )
    case "withdrawal":
      return (
        <LazyFallback>
          <LazyWithdrawalLayout
            onWithdraw={onWithdrawConfirm}
            onCancel={() => onViewChange("main")}
            onWithdrawCancel={onWithdrawCancel}
            onLogoClick={onLogoClick}
            isLoading={false}
          />
        </LazyFallback>
      )
    case "withdrawal-complete":
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <div className="bg-white border-b border-gray-200 px-4 py-4">
            <div className="flex items-center justify-center">
              <Logo size="lg" onClick={onLogoClick} />
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
              <WithdrawalComplete onBackToTop={onWithdrawComplete} />
            </div>
          </div>
        </div>
      )
    default:
      return null
  }
})