"use client"

import { HeaderLogo } from "../atoms/header-logo"
import { LoginForm } from "../molecules/login-form"
import { OtpInputForm } from "../molecules/otp-input-form"
import { adminLoginSchema, type AdminLoginInput } from "@hv-development/schemas"

interface LoginContainerProps {
  onLogin: (loginData: AdminLoginInput) => void
  onVerifyOtp: (otp: string) => void
  onSignup: () => void
  onForgotPassword: () => void
  onResendOtp: () => void
  onBack: () => void
  onLogoClick: () => void
  isLoading?: boolean
  error?: string
  loginStep?: "password" | "otp"
  email?: string
  backgroundColorClass?: string
}

export function LoginContainer({
  onLogin,
  onVerifyOtp,
  onSignup,
  onForgotPassword,
  onResendOtp,
  onBack,
  onLogoClick,
  isLoading,
  error,
  loginStep = "password",
  email = "",
  backgroundColorClass = "bg-gradient-to-br from-green-50 to-green-100",
}: LoginContainerProps) {
  return (
    <div className={`min-h-screen ${backgroundColorClass} flex flex-col`}>
      {/* ヘッダー */}
      <HeaderLogo
        onLogoClick={onLogoClick}
        showBackButton={loginStep === "otp"} // OTP画面のみ戻るボタンを表示
        onBackClick={onBack}
      />

      {/* メインコンテンツ */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {loginStep === "password" ? (
              <>
                {/* 説明文 */}
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">ログイン</h2>
                  <p className="text-gray-600">たまのみでさいたまの美味しいお店を見つけよう</p>
                </div>

                {/* ログインフォーム */}
                <LoginForm
                  onLogin={onLogin}
                  onSignup={onSignup}
                  onForgotPassword={onForgotPassword}
                  isLoading={isLoading}
                  error={error}
                />
              </>
            ) : (
              <OtpInputForm
                email={email}
                onVerifyOtp={onVerifyOtp}
                onResendOtp={onResendOtp}
                onBack={onBack}
                isLoading={isLoading}
                error={error}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
