import { MyPageContainer } from "../organisms/mypage-container"
import type { User, Plan, UsageHistory, PaymentHistory } from "../../types/user"

interface MyPageLayoutProps {
  user: User
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
  onProfileEditSubmit: (data: Record<string, string>, updatedFields: string[]) => void
  onEmailChangeSubmit?: (currentPassword: string, newEmail: string) => void
  onPasswordChangeSubmit?: (currentPassword: string, newPassword: string) => void
  onPasswordChangeBackToLogin?: () => void
  onEmailChangeResend?: () => void
  emailChangeStep?: "form" | "complete"
  passwordChangeStep?: "form" | "complete"
  newEmail?: string
  currentUserRank?: string | null
}

export function MyPageLayout({
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
  onLogout,
  onBack,
  onShowStoreOnHome,
  onUseSameCoupon,
  onWithdraw,
  onWithdrawConfirm,
  onWithdrawCancel,
  onWithdrawComplete,
  onLogoClick,
  onProfileEditSubmit,
  onEmailChangeSubmit,
  onPasswordChangeSubmit,
  onPasswordChangeBackToLogin,
  onEmailChangeResend = () => {},
  emailChangeStep,
  passwordChangeStep,
  newEmail,
  currentUserRank,
}: MyPageLayoutProps) {
  return (
    <MyPageContainer
      user={user}
      plan={plan}
      usageHistory={usageHistory}
      paymentHistory={paymentHistory}
      currentView={currentView}
      onViewChange={onViewChange}
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
      onBack={onBack}
              onShowStoreOnHome={onShowStoreOnHome}
      onUseSameCoupon={onUseSameCoupon}
      onLogoClick={onLogoClick}
      onProfileEditSubmit={onProfileEditSubmit}
      onEmailChangeSubmit={onEmailChangeSubmit}
      onPasswordChangeSubmit={onPasswordChangeSubmit}
      onPasswordChangeBackToLogin={onPasswordChangeBackToLogin}
      onEmailChangeResend={onEmailChangeResend}
      emailChangeStep={emailChangeStep}
      passwordChangeStep={passwordChangeStep}
      newEmail={newEmail}
      currentUserRank={currentUserRank}
    />
  )
}