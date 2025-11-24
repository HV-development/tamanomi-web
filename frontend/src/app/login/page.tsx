"use client"

import { LoginLayout } from "@/components/templates/LoginLayout"
import { Suspense, useCallback } from "react"
import { useLoginPage } from "@/hooks/useLoginPage"

function LoginPageContent() {
  const {
    isLoading,
    error,
    isCheckingAuth,
    handlePasswordLogin,
    handleSignup,
    handleForgotPassword,
  } = useLoginPage()

  // Hooksは常に同じ順序で呼ばれる必要があるため、early returnの前に定義
  const handleHomeClick = useCallback(() => {
    window.location.href = '/'
  }, [])

  // 認証チェック中またはローディング中はローディング表示
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      <LoginLayout
        onLogin={handlePasswordLogin}
        onSignup={handleSignup}
        onForgotPassword={handleForgotPassword}
        onHomeClick={handleHomeClick}
        isLoading={isLoading}
        error={error}
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
