import { LoginContainer } from "../organisms/login-container"

interface LoginLayoutProps {
  onLogin: (loginData: { email: string; password: string }) => void
  onVerifyOtp: (otp: string) => void
  onSignup: () => void
  onForgotPassword: () => void
  onResendOtp: () => void
  onBackToPassword: () => void
  isLoading?: boolean
  error?: string
  loginStep?: "password" | "otp"
  email?: string
  currentUserRank?: string | null
}

export function LoginLayout({
  onLogin,
  onVerifyOtp,
  onSignup,
  onForgotPassword,
  onResendOtp,
  onBackToPassword,
  isLoading,
  error,
  loginStep = "password",
  email = "",
  currentUserRank,
}: LoginLayoutProps) {
  // ランクに基づく背景色を取得
  const getBackgroundColorByRank = (rank: string | null) => {
    // 全ての背景色をブロンズ・非会員色に統一
    return "bg-gradient-to-br from-green-50 to-green-100"
  }

  const backgroundColorClass = getBackgroundColorByRank(currentUserRank ?? null)

  // ダミーのハンドラー（バック・ロゴクリックはログイン画面では不要だが、
  // ルートページで使用するため、空の関数を渡す）
  const handleBack = () => {
    // OTP画面の場合はパスワード画面に戻る
    if (loginStep === "otp") {
      onBackToPassword()
    }
    // パスワード画面の場合は何もしない
  }

  const handleLogoClick = () => {
    // ロゴクリックも何もしない（すでにトップページにいるため）
  }

  return (
    <LoginContainer
      onLogin={onLogin}
      onVerifyOtp={onVerifyOtp}
      onSignup={onSignup}
      onForgotPassword={onForgotPassword}
      onResendOtp={onResendOtp}
      onBack={handleBack}
      onLogoClick={handleLogoClick}
      isLoading={isLoading}
      error={error}
      loginStep={loginStep}
      email={email}
      backgroundColorClass={backgroundColorClass}
    />
  )
}
