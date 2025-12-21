"use client"

import { Suspense } from "react"
import { useVerifyOtpPage } from "@/hooks/useVerifyOtpPage"
import { OtpInputForm } from "@/components/organisms/OtpInputForm"
import { HeaderLogo } from "@/components/atoms/HeaderLogo"

function VerifyOtpPageContent() {
  const {
    isLoading,
    error,
    email,
    isCheckingAuth,
    handleOtpVerify,
    handleResendOtp,
    handleBackToLogin,
  } = useVerifyOtpPage()

  // 認証チェック中またはローディング中はローディング表示
  if (isCheckingAuth || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-green-600 font-medium">
            {isCheckingAuth ? '認証状態を確認中...' : '処理中...'}
          </p>
        </div>
      </div>
    )
  }

  const handleHomeClick = () => {
    window.location.href = '/'
  }

  const handleLogoClick = () => {
    // ロゴクリックは何もしない
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex flex-col">
      {/* ヘッダー */}
      <HeaderLogo
        onLogoClick={handleLogoClick}
        showBackButton={true}
        onBackClick={handleBackToLogin}
        showHomeButton={false}
        onHomeClick={handleHomeClick}
      />

      {/* メインコンテンツ */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <OtpInputForm
              email={email}
              onVerifyOtp={handleOtpVerify}
              onResendOtp={handleResendOtp}
              onBack={handleBackToLogin}
              isLoading={isLoading}
              error={error}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VerifyOtpPage() {
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
      <VerifyOtpPageContent />
    </Suspense>
  )
}

