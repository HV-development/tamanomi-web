"use client"

import { useState } from "react"
import { HeaderLogo } from "../atoms/header-logo"
import { LoginForm } from "../molecules/login-form"
import { OtpInputForm } from "../molecules/otp-input-form"

interface LoginContainerProps {
  onLogin: (email: string, otp: string) => void
  onSignup: () => void
  onForgotPassword: () => void
  onBack: () => void
  onLogoClick: () => void
  isLoading?: boolean
  loginStep?: "email" | "otp"
  email?: string
  onResendOtp?: () => void
  backgroundColorClass?: string
}

export function LoginContainer({
  onLogin,
  onSignup,
  onForgotPassword,
  onBack,
  onLogoClick,
  isLoading,
  loginStep = "email",
  email = "",
  onResendOtp = () => {},
  backgroundColorClass = "bg-gradient-to-br from-green-50 to-green-100",
}: LoginContainerProps) {
  const handleBackToEmail = () => {
    // メールアドレス入力画面に戻る処理は親コンポーネントで処理
    onBack()
  }

  return (
    <div className={`min-h-screen ${backgroundColorClass} flex flex-col`}>
      {/* ヘッダー */}
      <HeaderLogo 
        onLogoClick={onLogoClick} 
        showBackButton={true} 
        onBackClick={loginStep === "email" ? onBack : handleBackToEmail} 
      />

      {/* メインコンテンツ */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {loginStep === "email" ? (
              <>
                {/* 説明文 */}
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">ログイン</h2>
                  <p className="text-gray-600">TAMAYOIでさいたまの美味しいお店を見つけよう</p>
                </div>

                {/* ログインフォーム */}
                <LoginForm
                  onLogin={onLogin}
                  onSignup={onSignup}
                  onForgotPassword={onForgotPassword}
                  isLoading={isLoading}
                />
              </>
            ) : (
              <OtpInputForm
                email={email}
                onVerifyOtp={(otp) => onLogin(email, otp)}
                onResendOtp={onResendOtp}
                onBack={handleBackToEmail}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
