"use client"

import { ArrowLeft, SquarePen, Crown, RefreshCw, Mail, Lock, History, CreditCard, LogOut } from "lucide-react"
import { User } from "lucide-react"
import { Logo } from "../atoms/logo"
import { RankBadge } from "../atoms/rank-badge"
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
  onProfileEditSubmit: (data: any) => void
  onPasswordChangeBackToLogin?: () => void
  onEmailChangeSubmit?: (currentPassword: string, newEmail: string) => void
  onEmailChangeResend?: () => void
  onPasswordChangeSubmit?: (currentPassword: string, newPassword: string) => void
  emailChangeStep?: "form" | "complete"
  passwordChangeStep?: "form" | "complete"
  newEmail?: string
  currentUserRank?: string | null
}

export function MyPageContainer({
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
  onCancelSubscription,
  onWithdraw,
  onWithdrawConfirm,
  onWithdrawCancel,
  onWithdrawComplete,
  onLogout,
  onBack,
  onShowStoreOnHome,
  onUseSameCoupon,
  onLogoClick,
  onProfileEditSubmit,
  onPasswordChangeBackToLogin = () => { },
  onEmailChangeSubmit = () => { },
  onEmailChangeResend = () => { },
  onPasswordChangeSubmit = () => { },
  emailChangeStep = "form",
  passwordChangeStep = "form",
  newEmail = "",
  currentUserRank,
}: MyPageContainerProps) {
  // ランクに基づく背景色を取得
  const getBackgroundColorByRank = (rank: string | null | undefined) => {
    // 全ての背景色をブロンズ・非会員色に統一
    return "bg-gradient-to-br from-green-50 to-green-100"
  }

  const backgroundColorClass = "bg-gradient-to-br from-green-50 to-green-100"

  // 防御的チェック：userとplanが存在しない場合はnullを返す
  if (!user || !plan) {
    return null
  }

  if (currentView === "profile-edit") {
    return (
      <ProfileEditLayout
        user={user}
        onSubmit={onProfileEditSubmit}
        onCancel={() => onViewChange("main")}
        onWithdraw={onWithdraw}
        onLogoClick={onLogoClick}
      />
    )
  }

  if (currentView === "email-change") {
    return (
      <EmailChangeLayout
        currentStep={emailChangeStep}
        currentEmail={user.email}
        newEmail={newEmail}
        onSubmit={onEmailChangeSubmit}
        onCancel={() => onViewChange("main")}
        onBackToMyPage={() => onViewChange("main")}
        onResend={onEmailChangeResend}
        onLogoClick={onLogoClick}
        isLoading={false}
        currentUserRank={currentUserRank}
      />
    )
  }

  if (currentView === "password-change") {
    return (
      <PasswordChangeLayout
        currentStep={passwordChangeStep}
        onSubmit={onPasswordChangeSubmit}
        onCancel={() => onViewChange("main")}
        onBackToLogin={onPasswordChangeBackToLogin}
        onLogoClick={onLogoClick}
        isLoading={false}
        currentUserRank={currentUserRank}
      />
    )
  }

  if (currentView === "usage-history") {
    return (
      <UsageHistoryList
        history={usageHistory}
        onBackToMyPage={() => onViewChange("main")}
        onBackToTop={onBack}
      />
    )
  }

  if (currentView === "payment-history") {
    return (
      <PaymentHistoryList
        history={paymentHistory}
        onBackToMyPage={() => onViewChange("main")}
        onBackToTop={onBack}
      />
    )
  }

  if (currentView === "withdrawal") {
    return (
      <WithdrawalLayout
        onWithdraw={onWithdrawConfirm}
        onCancel={() => onViewChange("main")}
        onWithdrawCancel={onWithdrawCancel}
        onLogoClick={onLogoClick}
        isLoading={false}
        currentUserRank={currentUserRank}
      />
    )
  }

  if (currentView === "withdrawal-complete") {
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
  }

  // ランク計算
  const contractStartDate = user.contractStartDate || user.createdAt
  const nextRank = currentUserRank && currentUserRank in RANK_INFO ? getNextRankInfo(currentUserRank as keyof typeof RANK_INFO) : null
  const monthsToNext = currentUserRank && currentUserRank in RANK_INFO ? getMonthsToNextRank(contractStartDate, currentUserRank as keyof typeof RANK_INFO) : null
  const currentRankInfo = currentUserRank && currentUserRank in RANK_INFO ? RANK_INFO[currentUserRank as keyof typeof RANK_INFO] : null

  // ランクが計算されていない場合は何も表示しない
  if (!currentUserRank || !currentRankInfo) {
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
        {/* プロフィールカード */}
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

        {/* メンバーランクカード */}
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
                <img
                  src={`/${currentUserRank}.png`}
                  alt={`${currentUserRank}ランク`}
                  className="w-8 h-8 object-contain"
                />
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
                    <img
                      src={`/${nextRank.rank}.png`}
                      alt={`${nextRank.label}ランク`}
                      className="w-8 h-8 object-contain"
                    />
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
                    <img
                      src="/gold.png"
                      alt="ゴールドランク"
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* メニューボタン群 */}
        <div className="space-y-3">
          {/* プロフィール編集 */}
          {appConfig.myPageSettings.showProfile && (
            <button
              onClick={onEditProfile}
              className="w-full bg-white rounded-2xl border border-green-200 p-4 flex items-center justify-between hover:bg-green-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <SquarePen className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-lg font-medium text-gray-500">プロフィール編集</span>
              </div>
              <div className="text-gray-400">›</div>
            </button>
          )}

          {/* プランの変更 */}
          {appConfig.myPageSettings.showPlanManagement && (
            <button
              onClick={onViewPlan}
              className="w-full bg-white rounded-2xl border border-green-200 p-4 flex items-center justify-between hover:bg-green-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-lg font-medium text-gray-500">プランの変更</span>
              </div>
              <div className="text-gray-400">›</div>
            </button>
          )}

          {/* メールアドレスの変更 */}
          {appConfig.myPageSettings.showEmailChange && (
            <button
              onClick={onChangeEmail}
              className="w-full bg-white rounded-2xl border border-green-200 p-4 flex items-center justify-between hover:bg-green-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-lg font-medium text-gray-500">メールアドレスの変更</span>
              </div>
              <div className="text-gray-400">›</div>
            </button>
          )}

          {/* パスワードの変更 */}
          {appConfig.myPageSettings.showPasswordChange && (
            <button
              onClick={onChangePassword}
              className="w-full bg-white rounded-2xl border border-green-200 p-4 flex items-center justify-between hover:bg-green-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Lock className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-lg font-medium text-gray-500">パスワードの変更</span>
              </div>
              <div className="text-gray-400">›</div>
            </button>
          )}

          {/* 利用履歴 */}
          {appConfig.myPageSettings.showUsageHistory && (
            <button
              onClick={onViewUsageHistory}
              className="w-full bg-white rounded-2xl border border-green-200 p-4 flex items-center justify-between hover:bg-green-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <History className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-lg font-medium text-gray-500">利用履歴</span>
              </div>
              <div className="text-gray-400">›</div>
            </button>
          )}

          {/* 決済履歴 */}
          {appConfig.myPageSettings.showPaymentHistory && (
            <button
              onClick={onViewPaymentHistory}
              className="w-full bg-white rounded-2xl border border-green-200 p-4 flex items-center justify-between hover:bg-green-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-lg font-medium text-gray-500">決済履歴</span>
              </div>
              <div className="text-gray-400">›</div>
            </button>
          )}

          {/* 退会 */}
          {appConfig.myPageSettings.showWithdrawal && (
            <button
              onClick={onWithdraw}
              className="w-full bg-white rounded-2xl border border-red-200 p-4 flex items-center justify-between hover:bg-red-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-red-600" />
                </div>
                <span className="text-lg font-medium text-gray-500">退会</span>
              </div>
              <div className="text-gray-400">›</div>
            </button>
          )}

          {/* ログアウト */}
          <button
            onClick={onLogout}
            className="w-full bg-white rounded-2xl border border-red-200 p-4 flex items-center justify-between hover:bg-red-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <LogOut className="w-5 h-5 text-red-600" />
              </div>
              <span className="text-lg font-medium text-gray-500">ログアウト</span>
            </div>
            <div className="text-gray-400">›</div>
          </button>
        </div>
      </div>
    </div>
  )
}