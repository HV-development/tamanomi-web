"use client"

import React, { useMemo } from "react"
import Image from "next/image"
import { SquarePen, Crown, RefreshCw, Mail, Lock, LogOut, History, CreditCard, Share2, Copy, Check, Store } from "lucide-react"
import { User } from "lucide-react"
import { Logo } from "../atoms/Logo"
import { getNextRankInfo, getMonthsToNextRank, RANK_INFO } from "@/utils/rank-calculator"
import { WithdrawalComplete } from "@/components/molecules/WithdrawalComplete"
import type { User as UserType, Plan, UsageHistory, PaymentHistory } from "@/types/user"
import { appConfig } from '@/config/appConfig'
import { useDataPreloader } from "@/hooks/useDataPreloader"
import { SkeletonMyPage, SkeletonCard, SkeletonRankCard, SkeletonMenuButton } from "../skeletons/MypageSkeleton"
import { StaggeredContainer, FadeInComponent } from "../atoms/ProgressiveLoader"
import {
  LazyUsageHistoryList,
  LazyPaymentHistoryList,
  LazyProfileEditLayout,
  LazyEmailChangeLayout,
  LazyPasswordChangeLayout,
  LazyWithdrawalLayout,
  LazyFallback
} from "@/lib/lazy"
import type { ProfileEditFormData } from "@/types/forms"
interface MyPageContainerProps {
  user?: UserType
  plan?: Plan
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
  | "store-introduction"
  onViewChange: (view: string) => void
  onEditProfile: () => void
  onChangeEmail: () => void
  onChangePassword: () => void
  onViewPlan: () => void
  onViewUsageHistory: () => void
  onViewPaymentHistory: () => void
  onStoreIntroduction?: () => void
  hasStoreIntroduction?: boolean
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
  onEmailChangeSubmit?: (data: { currentPassword: string; newEmail: string; confirmEmail: string }) => void
  onEmailChangeResend?: () => void
  onPasswordChangeSubmit?: (currentPassword: string, newPassword: string) => void
  emailChangeStep?: "form" | "complete"
  passwordChangeStep?: "form" | "complete"
  passwordChangeError?: string | null
  newEmail?: string
  currentUserRank?: string | null
  isEmailChangeSuccessModalOpen?: boolean
}

// ランク計算用のカスタムフック
// TODO: 将来的にメンバーランク機能を再実装する可能性があるためコメントアウト
/* eslint-disable @typescript-eslint/no-unused-vars */
const useRankCalculations = (user: UserType | undefined, currentUserRank: string | null | undefined) => {
  return useMemo(() => {
    if (!user) {
      return {
        currentRankInfo: null,
        nextRankInfo: null,
        monthsToNextRank: 0,
        progressToNextRank: 0
      }
    }
    if (!currentUserRank || !(currentUserRank in RANK_INFO)) {
      return { nextRank: null, monthsToNext: null, currentRankInfo: null }
    }

    const contractStartDate = user.contractStartDate || user.createdAt
    const nextRank = getNextRankInfo(currentUserRank as keyof typeof RANK_INFO)
    const monthsToNext = getMonthsToNextRank(contractStartDate, currentUserRank as keyof typeof RANK_INFO)
    const currentRankInfo = RANK_INFO[currentUserRank as keyof typeof RANK_INFO]

    return { nextRank, monthsToNext, currentRankInfo }
  }, [user, currentUserRank])
}

// プロフィールカードコンポーネント
const ProfileCard = React.memo(({ user, onEditProfile }: { user?: UserType, onEditProfile: () => void }) => {
  if (!user) {
    return (
      <div className="bg-white rounded-2xl border border-green-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-lg font-bold text-gray-500">プロフィール</span>
          </div>
        </div>
        <div className="text-center text-gray-500">ユーザー情報を読み込み中...</div>
      </div>
    )
  }
  
  return (
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
  );
})
ProfileCard.displayName = 'ProfileCard'

// 紹介用URLカードコンポーネント
const ReferrerUrlCard = React.memo(({ user }: { user?: UserType }) => {
  const [copied, setCopied] = React.useState(false)
  
  if (!user) {
    return null
  }

  // 紹介用URLを生成（APIから取得できない場合はフロントエンドで生成）
  const referrerUrl = user.referrerUrl || (typeof window !== 'undefined' 
    ? `${window.location.origin}/email-registration?ref=${user.id}` 
    : null)

  const handleCopy = async () => {
    if (!referrerUrl) return

    try {
      await navigator.clipboard.writeText(referrerUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('コピーに失敗しました:', error)
    }
  }

  if (!referrerUrl) {
    return null
  }

  return (
    <div className="bg-white rounded-2xl border border-green-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
          <Share2 className="w-5 h-5 text-green-600" />
        </div>
        <span className="text-lg font-bold text-gray-500">友達紹介</span>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-sm text-gray-600 mb-2 block">紹介用URL</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={referrerUrl}
              className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center"
              title={copied ? 'コピーしました' : 'クリップボードにコピー'}
            >
              {copied ? (
                <Check className="w-5 h-5" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-500">
          このURLを友達に共有すると、友達が登録した際に紹介として記録されます。
        </p>
      </div>
    </div>
  );
})
ReferrerUrlCard.displayName = 'ReferrerUrlCard'

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
RankImage.displayName = 'RankImage'

// ランクカードコンポーネント
// TODO: 将来的にメンバーランク機能を再実装する可能性があるためコメントアウト
/* eslint-disable @typescript-eslint/no-unused-vars */
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
/* eslint-enable @typescript-eslint/no-unused-vars */
RankCard.displayName = 'RankCard'

// メニューボタンコンポーネント
const MenuButton = React.memo(({
  onClick,
  icon: Icon,
  label,
  isRed = false,
  disabled = false
}: {
  onClick?: () => void,
  icon: React.ComponentType<{ className?: string }>,
  label: string,
  isRed?: boolean,
  disabled?: boolean
}) => (
  <button
    onClick={disabled ? undefined : onClick}
    disabled={disabled}
    className={`w-full bg-white rounded-2xl border p-4 flex items-center justify-between transition-colors ${
      disabled 
        ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60' 
        : isRed 
          ? 'border-red-200 hover:bg-red-50' 
          : 'border-green-200 hover:bg-green-50'
    }`}
  >
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 ${disabled ? 'bg-gray-100' : isRed ? 'bg-red-100' : 'bg-green-100'} rounded-lg flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${disabled ? 'text-gray-400' : isRed ? 'text-red-600' : 'text-green-600'}`} />
      </div>
      <span className={`text-lg font-medium ${disabled ? 'text-gray-400' : 'text-gray-500'}`}>{label}</span>
    </div>
    <div className={disabled ? 'text-gray-300' : 'text-gray-400'}>›</div>
  </button>
))
MenuButton.displayName = 'MenuButton'

// メニューボタン群コンポーネント
const MenuButtons = React.memo(({
  onEditProfile,
  onViewPlan,
  onChangeEmail,
  onChangePassword,
  onViewUsageHistory,
  onViewPaymentHistory,
  onStoreIntroduction,
  onLogout,
  plan,
  hasStoreIntroduction
}: {
  onEditProfile: () => void
  onViewPlan: () => void
  onChangeEmail: () => void
  onChangePassword: () => void
  onViewUsageHistory: () => void
  onViewPaymentHistory: () => void
  onStoreIntroduction?: () => void
  onLogout: () => void
  plan?: Plan
  hasStoreIntroduction?: boolean
}) => {
  // プラン有無に応じてラベルを決定
  const planMenuLabel = plan ? "プランの変更" : "プラン登録"
  
  return (
    <div className="space-y-3">
      {onStoreIntroduction && (
        <MenuButton 
          onClick={hasStoreIntroduction ? undefined : onStoreIntroduction} 
          icon={Store} 
          label={hasStoreIntroduction ? "店舗紹介（紹介済み）" : "店舗紹介"} 
          disabled={hasStoreIntroduction}
        />
      )}
      {appConfig.myPageSettings.showProfile && (
        <MenuButton onClick={onEditProfile} icon={SquarePen} label="プロフィール編集" />
      )}
      {appConfig.myPageSettings.showPlanManagement && (
        <MenuButton onClick={onViewPlan} icon={RefreshCw} label={planMenuLabel} />
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
  )
})
MenuButtons.displayName = 'MenuButtons'

export const MyPageContainer = React.memo(function MyPageContainer({
  user,
  plan: _plan, // eslint-disable-line @typescript-eslint/no-unused-vars
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
  onStoreIntroduction,
  hasStoreIntroduction,
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
  isEmailChangeSuccessModalOpen = false,
}: MyPageContainerProps) {
  // データプリローダーを使用
  const { isPreloading, preloadProgress } = useDataPreloader()

  // 背景色をメモ化
  const backgroundColorClass = useMemo(() =>
    "bg-gradient-to-br from-green-50 to-green-100", []
  )

  // ランク計算をメモ化（プリロードデータを使用）
  // TODO: 将来的にメンバーランク機能を再実装する可能性があるためコメントアウト
  // const rankCalculations = useRankCalculations(user, currentUserRank)

  // 防御的チェック：userが存在しない場合はスケルトンを表示
  // プラン情報はnullの場合もあるため、チェックしない
  // ただし、メールアドレス変更成功モーダルが表示されている場合は無視
  if (!user && !isEmailChangeSuccessModalOpen) {
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

  // ランク情報がない場合でもマイページを表示できるようにする
  // （ランク情報はオプショナルなため、チェックを削除）

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

          <FadeInComponent delay={250}>
            <ReferrerUrlCard user={user} />
          </FadeInComponent>

          {/* TODO: 将来的にメンバーランク機能を再実装する可能性があるためコメントアウト */}
          {/* <FadeInComponent delay={300}>
            <RankCard rankCalculations={rankCalculations} />
          </FadeInComponent> */}

          <FadeInComponent delay={400}>
            <MenuButtons
              onEditProfile={onEditProfile}
              onViewPlan={onViewPlan}
              onChangeEmail={onChangeEmail}
              onChangePassword={onChangePassword}
              onViewUsageHistory={onViewUsageHistory}
              onViewPaymentHistory={onViewPaymentHistory}
              onStoreIntroduction={onStoreIntroduction}
              onLogout={onLogout}
              plan={_plan}
              hasStoreIntroduction={hasStoreIntroduction}
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
  onEmailChangeSubmit: (data: { currentPassword: string; newEmail: string; confirmEmail: string }) => void
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
            backgroundColorClass="bg-gradient-to-br from-green-50 to-green-100"
          />
        </LazyFallback>
      )
    case "email-change":
      return (
        <LazyFallback>
          <LazyEmailChangeLayout
            currentStep={emailChangeStep}
            currentEmail={user?.email || ''}
            newEmail={newEmail}
            onSubmit={onEmailChangeSubmit}
            onCancel={() => onViewChange("main")}
            onBackToMyPage={() => onViewChange("main")}
            onResend={onEmailChangeResend}
            onLogoClick={onLogoClick}
            isLoading={false}
            backgroundColorClass="bg-gradient-to-br from-green-50 to-green-100"
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
            backgroundColorClass="bg-gradient-to-br from-green-50 to-green-100"
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
            backgroundColorClass="bg-gradient-to-br from-green-50 to-green-100"
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
MyPageSubView.displayName = 'MyPageSubView'