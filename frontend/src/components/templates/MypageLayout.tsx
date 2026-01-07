import { MyPageContainer } from "../organisms/MypageContainer"
import type { User, Plan, UsageHistory, PaymentHistory } from "@/types/user"

interface MyPageLayoutProps {
  user?: User
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
  onProfileEditSubmit: (data: Record<string, string>, updatedFields: string[]) => void
  onEmailChangeSubmit?: (data: { currentPassword: string; newEmail: string; confirmEmail: string }) => void
  onPasswordChangeSubmit?: (currentPassword: string, newPassword: string) => void
  onPasswordChangeBackToLogin?: () => void
  onEmailChangeResend?: () => void
  emailChangeStep?: "form" | "complete"
  passwordChangeStep?: "form" | "complete"
  passwordChangeError?: string | null
  newEmail?: string
  currentUserRank?: string | null
  isEmailChangeSuccessModalOpen?: boolean
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
  onStoreIntroduction,
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
  onEmailChangeResend = () => { },
  emailChangeStep,
  passwordChangeStep,
  passwordChangeError,
  newEmail,
  currentUserRank,
  isEmailChangeSuccessModalOpen,
  hasStoreIntroduction,
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
      onStoreIntroduction={onStoreIntroduction}
      hasStoreIntroduction={hasStoreIntroduction}
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
      passwordChangeError={passwordChangeError}
      newEmail={newEmail}
      currentUserRank={currentUserRank}
      isEmailChangeSuccessModalOpen={isEmailChangeSuccessModalOpen}
    />
  )
}