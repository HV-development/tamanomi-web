"use client"

import { HeaderLogo } from "../atoms/HeaderLogo"
import { LoginForm } from "@/components/organisms/LoginForm"
import { type AdminLoginInput } from "@hv-development/schemas"

interface LoginContainerProps {
  onLogin: (loginData: AdminLoginInput) => void
  onSignup: () => void
  onForgotPassword: () => void
  onBack: () => void
  onLogoClick: () => void
  onHomeClick?: () => void
  isLoading?: boolean
  error?: string
  backgroundColorClass?: string
}

export function LoginContainer({
  onLogin,
  onSignup,
  onForgotPassword,
  onBack,
  onLogoClick,
  onHomeClick,
  isLoading,
  error,
  backgroundColorClass = "bg-gradient-to-br from-green-50 to-green-100",
}: LoginContainerProps) {

  return (
    <div className={`min-h-screen ${backgroundColorClass} flex flex-col`}>
      {/* ヘッダー */}
      <HeaderLogo
        onLogoClick={onLogoClick}
        showBackButton={true} // 常に戻るボタンを表示
        onBackClick={onBack}
        showHomeButton={false} // homeボタンを非表示
        onHomeClick={onHomeClick}
      />

      {/* メインコンテンツ */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
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
          </div>
        </div>
      </div>
    </div>
  )
}
