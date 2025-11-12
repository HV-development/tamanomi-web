'use client';

import React from 'react';
import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { HeaderLogo } from '@/components/atoms/HeaderLogo';
import { PasswordChangeForm } from '@/components/organisms/PasswordChangeForm';
import { PasswordChangeComplete } from '@/components/molecules/PasswordChangeComplete';
import { useResetPassword } from '@/hooks/useResetPassword';

function ResetPasswordPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { isLoading, errorMessage, isComplete, handleSubmit, handleCancel, handleBackToLogin } = useResetPassword(token);

  const handleLogoClick = () => {
    router.push('/');
  };

  const handleBackClick = () => {
    router.push('/?view=login');
  };

  // トークンがない場合のエラー表示
  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex flex-col">
        {/* ヘッダー */}
        <HeaderLogo onLogoClick={handleLogoClick} showBackButton={true} onBackClick={handleBackClick} />

        {/* メインコンテンツ */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center">
              <div className="mb-6">
                <svg className="w-16 h-16 text-red-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">リセットトークンが見つかりません</h1>
              <p className="text-gray-600 mb-8">メール内のリンクから再度アクセスしてください。</p>
              <button
                onClick={handleCancel}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                ログイン画面へ
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex flex-col">
      {/* ヘッダー */}
      <HeaderLogo onLogoClick={handleLogoClick} showBackButton={false} onBackClick={handleBackClick} />

      {/* メインコンテンツ */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {isComplete ? (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <PasswordChangeComplete onBackToLogin={handleBackToLogin} />
            </div>
          ) : (
            <>
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">パスワードの再設定</h2>
                  <p className="text-gray-600">新しいパスワードを設定してください</p>
                </div>
                <PasswordChangeForm
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                  isLoading={isLoading}
                  errorMessage={errorMessage}
                  mode="reset"
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center">
              <Loader2 className="w-16 h-16 text-green-600 animate-spin mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">読み込み中...</h1>
            </div>
          </div>
        </div>
      }
    >
      <ResetPasswordPageContent />
    </Suspense>
  );
}
