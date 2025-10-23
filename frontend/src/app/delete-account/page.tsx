'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function DeleteAccountPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [confirmText, setConfirmText] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { logout } = useAuth();
  const router = useRouter();

  const requiredConfirmText = 'DELETE';

  const handleDeleteAccount = async () => {
    if (confirmText !== requiredConfirmText) {
      setErrorMessage('確認のため「DELETE」と入力してください');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      // 認証トークンを取得
      const token = localStorage.getItem('accessToken');
      console.log('🔍 [DeleteAccount] Token found:', !!token);
      if (!token) {
        throw new Error('認証トークンが見つかりません');
      }

      console.log('🔍 [DeleteAccount] Sending request to /api/user/delete-account');
      const response = await fetch('/api/user/delete-account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('🔍 [DeleteAccount] Response status:', response.status);
      const data = await response.json();
      console.log('🔍 [DeleteAccount] Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'アカウント削除に失敗しました');
      }

      // ローカルストレージをクリア
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      // ログアウト処理
      await logout();
      
      // ホームページにリダイレクト
      router.push('/?message=account-deleted');
    } catch (error) {
      console.error('Account deletion error:', error);
      setErrorMessage(
        error instanceof Error 
          ? error.message 
          : 'アカウント削除に失敗しました'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowConfirmDialog = () => {
    setShowConfirmDialog(true);
    setErrorMessage('');
    setConfirmText('');
  };

  const handleCancelDelete = () => {
    setShowConfirmDialog(false);
    setConfirmText('');
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            アカウント退会
          </h1>
          <p className="text-gray-600">
            アカウントを削除すると、すべてのデータが失われます
          </p>
        </div>

        {!showConfirmDialog ? (
          <div className="space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                退会について
              </h3>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• アカウント情報が完全に削除されます</li>
                <li>• 登録済みのプランが解約されます</li>
                <li>• 保存されたカード情報が削除されます</li>
                <li>• さいたま市アプリとの連携が解除されます</li>
                <li>• この操作は取り消すことができません</li>
              </ul>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleShowConfirmDialog}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
              >
                アカウントを削除する
              </button>
              
              <button
                onClick={() => router.back()}
                className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                最終確認
              </h3>
              <p className="text-sm text-red-700 mb-4">
                本当にアカウントを削除しますか？この操作は取り消すことができません。
              </p>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  確認のため「DELETE」と入力してください
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            {errorMessage && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700">{errorMessage}</p>
              </div>
            )}

            <div className="space-y-4">
              <button
                onClick={handleDeleteAccount}
                disabled={isLoading || confirmText !== requiredConfirmText}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? '削除中...' : 'アカウントを削除する'}
              </button>
              
              <button
                onClick={handleCancelDelete}
                disabled={isLoading}
                className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors disabled:bg-gray-100"
              >
                キャンセル
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
