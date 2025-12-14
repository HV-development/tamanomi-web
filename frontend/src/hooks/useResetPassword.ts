'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { confirmPasswordReset } from '@/lib/api-client';

export function useResetPassword(token: string | null) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const handleSubmit = useCallback(
    async (currentPassword: string, newPassword: string) => {
      // 連続押下を防ぐ
      if (isLoading) {
        return;
      }

      // トークンがない場合はエラー
      if (!token) {
        setErrorMessage('リセットトークンが見つかりません。メール内のリンクから再度アクセスしてください。');
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      try {
        await confirmPasswordReset(token, newPassword);

        // 成功時は完了状態にする（リダイレクトしない）
        setIsComplete(true);
      } catch (error) {
        // エラーメッセージを設定
        const message = error instanceof Error ? error.message : 'パスワードリセットに失敗しました';
        setErrorMessage(message);
      } finally {
        setIsLoading(false);
      }
    },
    [token, isLoading]
  );

  const handleCancel = useCallback(() => {
    router.push('/?view=login');
  }, [router]);

  const handleBackToLogin = useCallback(() => {
    router.push('/?view=login');
  }, [router]);

  return {
    isLoading,
    errorMessage,
    isComplete,
    handleSubmit,
    handleCancel,
    handleBackToLogin,
  };
}
