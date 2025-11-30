import { LoginContainer } from "../organisms/LoginContainer"

interface LoginLayoutProps {
  onLogin: (loginData: { email: string; password: string }) => void
  onSignup: () => void
  onForgotPassword: () => void
  onHomeClick?: () => void
  isLoading?: boolean
  error?: string
}

export function LoginLayout({
  onLogin,
  onSignup,
  onForgotPassword,
  onHomeClick,
  isLoading,
  error,
}: LoginLayoutProps) {

  // ランクに基づく背景色を取得
  const backgroundColorClass = "bg-gradient-to-br from-green-50 to-green-100"

  // バックボタンのハンドラー
  const handleBack = () => {
    // パスワード画面の場合はhome画面に遷移
    if (onHomeClick) {
      onHomeClick()
    } else {
      window.location.href = "/"
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
      onSignup={onSignup}
      onForgotPassword={onForgotPassword}
      onBack={handleBack}
      onLogoClick={handleLogoClick}
      onHomeClick={handleHomeClick}
      isLoading={isLoading}
      error={error}
      backgroundColorClass={backgroundColorClass}
    />
  )
}
