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
  onResendOtp
}: LoginLayoutProps) {
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
    />
  )
}
