import { LoginContainer } from "../organisms/LoginContainer"

interface LoginLayoutProps {
  onLogin: (loginData: { email: string; password: string }) => void
  onVerifyOtp: (otp: string) => void
  onSignup: () => void
  onForgotPassword: () => void
  onResendOtp: () => void
  onBackToPassword: () => void
  onHomeClick?: () => void
  isLoading?: boolean
  error?: string
  loginStep?: "password" | "otp"
  email?: string
}

export function LoginLayout({
  onLogin,
  onVerifyOtp,
  onSignup,
  onForgotPassword,
  onResendOtp,
  onBackToPassword,
  onHomeClick,
  isLoading,
  error,
  loginStep = "password",
  email = "",
}: LoginLayoutProps) {

  // ランクに基づく背景色を取得
  const backgroundColorClass = "bg-gradient-to-br from-green-50 to-green-100"

  // ダミーのハンドラー（バック・ロゴクリックはログイン画面では不要だが、
  // ルートページで使用するため、空の関数を渡す）
  const handleBack = () => {
    // OTP画面の場合はパスワード画面に戻る
    if (loginStep === "otp") {
      onBackToPassword()
    } else {
      // パスワード画面の場合はhome画面に遷移
      if (onHomeClick) {
        onHomeClick()
      } else {
        window.location.href = "/"
      }
    }
  }

  const handleLogoClick = () => {
    // ロゴクリックも何もしない（すでにトップページにいるため）
  }

  const handleHomeClick = () => {
    if (onHomeClick) {
      onHomeClick()
    } else {
      // デフォルトの動作：home画面に遷移
      window.location.href = "/"
    }
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
      onHomeClick={handleHomeClick}
      isLoading={isLoading}
      error={error}
      loginStep={loginStep}
      email={email}
      backgroundColorClass={backgroundColorClass}
    />
  )
}
