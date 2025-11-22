"use client"

import { LoginLayout } from "@/components/templates/LoginLayout"
import { Suspense } from "react"
import { useLoginPage } from "@/hooks/useLoginPage"

function LoginPageContent() {
  const {
    isLoading,
    error,
    loginStep,
    email,
    isCheckingAuth,
    handlePasswordLogin,
    handleOtpVerify,
    handleResendOtp,
    handleBackToPassword,
    handleSignup,
    handleForgotPassword,
  } = useLoginPage()

  // 認証チェック中またはローディング中はローディング表示
  // ワンタイムパスワード入力後のローディングも全画面表示
  if (isCheckingAuth || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-green-600 font-medium">
            {isCheckingAuth ? '認証状態を確認中...' : 'ログイン処理中...'}
          </p>
        </div>
      </div>
    )
  }

  const handleHomeClick = () => {
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      <LoginLayout
        onLogin={handlePasswordLogin}
        onVerifyOtp={handleOtpVerify}
        onSignup={handleSignup}
        onForgotPassword={handleForgotPassword}
        onResendOtp={handleResendOtp}
        onBackToPassword={handleBackToPassword}
        onHomeClick={handleHomeClick}
        isLoading={isLoading}
        error={error}
        loginStep={loginStep}
        email={email}
      />
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-green-600 font-medium">読み込み中...</p>
          </div>
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  )
}
