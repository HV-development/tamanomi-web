import { LoginContainer } from "../organisms/login-container"

interface LoginLayoutProps {
  onLogin: (email: string, otp: string) => void
  onSignup: () => void
  onForgotPassword: () => void
  onBack: () => void
  onLogoClick: () => void
  isLoading?: boolean
  loginStep?: "email" | "otp"
  email?: string
  onResendOtp?: () => void
  currentUserRank?: string | null
}

export function LoginLayout({
  onLogin,
  onSignup,
  onForgotPassword,
  onBack,
  onLogoClick,
  isLoading,
  loginStep = "email",
  email = "",
  onResendOtp = () => {},
  currentUserRank,
}: LoginLayoutProps) {
  // ランクに基づく背景色を取得
  const getBackgroundColorByRank = (rank: string | null) => {
    // 全ての背景色をブロンズ・非会員色に統一
    return "bg-gradient-to-br from-green-50 to-green-100"
  }

  const backgroundColorClass = getBackgroundColorByRank(currentUserRank)

  return (
    <LoginContainer
      onLogin={onLogin}
      onSignup={onSignup}
      onForgotPassword={onForgotPassword}
      onBack={onBack}
      onLogoClick={onLogoClick}
      isLoading={isLoading}
      loginStep={loginStep}
      email={email}
      onResendOtp={onResendOtp}
      backgroundColorClass={backgroundColorClass}
    />
  )
}