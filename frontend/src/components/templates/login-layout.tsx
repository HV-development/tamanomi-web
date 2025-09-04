"use client"

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
}

export function LoginLayout({ 
  onLogin, 
  onSignup, 
  onForgotPassword, 
  onBack, 
  onLogoClick, 
  isLoading,
  loginStep,
  email,
  onResendOtp,
  currentUserRank
}: LoginLayoutProps) {
  // ランクに基づく背景色を取得
  const getBackgroundColorByRank = (rank: string | null) => {
    if (!rank) {
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
