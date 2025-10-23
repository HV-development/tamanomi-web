'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [isTokenLoaded, setIsTokenLoaded] = useState<boolean>(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
      setErrorMessage(''); // トークンが見つかった場合はエラーメッセージをクリア
      
      // トークンの有効性をチェック
      verifyToken(tokenParam);
    } else {
      // トークンが存在しない場合のみエラーメッセージを設定
      setErrorMessage('無効なリセットリンクです。');
      setIsTokenLoaded(true);
    }
  }, [searchParams]);

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch(`/api/auth/verify-token?token=${token}`);
      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || '無効なリセットトークンです。リンクの有効期限が切れている可能性があります。');
      } else {
        setErrorMessage(''); // トークンが有効な場合はエラーメッセージをクリア
      }
    } catch (error) {
      setErrorMessage('トークンの検証に失敗しました。');
    } finally {
      setIsTokenLoaded(true);
    }
  };

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return 'パスワードは8文字以上である必要があります';
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return 'パスワードは大文字、小文字、数字を含む必要があります';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    // バリデーション
    const passwordError = validatePassword(password);
    if (passwordError) {
      setErrorMessage(passwordError);
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('パスワードが一致しません');
      setIsLoading(false);
      return;
    }

    if (!token) {
      setErrorMessage('無効なリセットトークンです');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token, 
          newPassword: password 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'パスワードリセットに失敗しました');
      }

      setSuccessMessage('パスワードが正常にリセットされました。ログイン画面から新しいパスワードでログインしてください。');
      
      // 3秒後にログイン画面にリダイレクト
      setTimeout(() => {
        router.push('/');
      }, 3000);
    } catch (error) {
      console.error('Password reset error:', error);
      setErrorMessage(
        error instanceof Error 
          ? error.message 
          : 'パスワードリセットに失敗しました'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // トークンの読み込みが完了していない場合はローディング表示
  if (!isTokenLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-green-600 font-medium">読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  // トークンが存在しない場合はエラー表示
  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              パスワードリセット
            </h2>
            <p className="text-red-600">
              無効なリセットリンクです。
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            新しいパスワードを設定
          </h2>
          <p className="text-gray-600">
            新しいパスワードを入力してください
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                新しいパスワード
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  placeholder="新しいパスワード"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                8文字以上、大文字・小文字・数字を含む必要があります
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                パスワード確認
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  placeholder="パスワード確認"
                />
              </div>
            </div>

            {errorMessage && isTokenLoaded && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-700">{errorMessage}</p>
              </div>
            )}

            {successMessage && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                <p className="text-sm text-green-700">{successMessage}</p>
                <p className="text-sm text-green-600 mt-1">
                  3秒後にログイン画面にリダイレクトします...
                </p>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading || successMessage}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? '設定中...' : 'パスワードを設定'}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => router.push('/')}
                className="text-sm text-green-600 hover:text-green-500"
              >
                ログイン画面に戻る
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
