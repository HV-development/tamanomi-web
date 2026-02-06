import { useState, useEffect, useRef, useCallback } from 'react';
import type { User, Plan, UsageHistory, PaymentHistory } from '@/types/user';

export function useAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState<User | undefined>(undefined);
    const [plan, setPlan] = useState<Plan | undefined>(undefined);
    const [usageHistory, setUsageHistory] = useState<UsageHistory[]>([]);
    const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
    const hasInitialized = useRef(false);

    // 利用履歴を取得する関数
    const fetchUsageHistory = useCallback(async () => {
        try {
            const response = await fetch('/api/user/usage-history', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                cache: 'no-store',
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                setUsageHistory(data.history || []);
            } else {
                console.error('利用履歴の取得に失敗しました:', response.status);
                setUsageHistory([]);
            }
        } catch (error) {
            console.error('利用履歴の取得中にエラーが発生しました:', error);
            setUsageHistory([]);
        }
    }, []);

    // リフレッシュトークンでアクセストークンを更新する
    const tryRefresh = useCallback(async (): Promise<boolean> => {
        try {
            const res = await fetch('/api/auth/refresh', {
                method: 'POST',
                credentials: 'include',
            });
            return res.ok;
        } catch (error) {
            console.error('トークンリフレッシュに失敗しました:', error);
            return false;
        }
    }, []);

    // ユーザー情報を取得する
    const fetchUserMe = useCallback(async (): Promise<{ status: number; data: User | null }> => {
        try {
            const response = await fetch('/api/user/me', {
                credentials: 'include',
            });
            if (!response.ok) {
                return { status: response.status, data: null };
            }
            const data = await response.json();
            return { status: response.status, data };
        } catch (error) {
            console.error('ユーザー情報の取得に失敗しました:', error);
            return { status: 0, data: null };
        }
    }, []);

    // 自動ログイン処理とトークンチェック
    useEffect(() => {
        if (typeof window !== 'undefined' && !hasInitialized.current) {
            hasInitialized.current = true;
            const urlParams = new URLSearchParams(window.location.search);
            const autoLogin = urlParams.get('auto-login');
            const loginEmail = urlParams.get('email');

            if (autoLogin === 'true' && loginEmail) {
                // 自動ログイン処理
                setIsAuthenticated(true);
                // URLパラメータをクリア
                window.history.replaceState({}, '', '/');
            } else {
                // Cookieにアクセストークンがある場合は認証済みとする
                // Cookieは自動的に送信されるため、Authorizationヘッダーは不要
                setIsLoading(true);
                
                const initAuth = async () => {
                    try {
                        let result = await fetchUserMe();
                        
                        // 401/403エラーの場合はリフレッシュを試みる
                        if (result.status === 401 || result.status === 403) {
                            console.log('🔄 アクセストークン期限切れ、リフレッシュを試行中...');
                            const refreshed = await tryRefresh();
                            if (refreshed) {
                                console.log('✅ トークンリフレッシュ成功、ユーザー情報を再取得中...');
                                result = await fetchUserMe();
                            } else {
                                console.log('❌ トークンリフレッシュ失敗');
                            }
                        }
                        
                        if (result.data) {
                            setIsAuthenticated(true);
                            setUser(result.data);
                            setPlan(result.data.plan);
                            // 利用履歴は別途APIから取得
                            fetchUsageHistory();
                            setPaymentHistory(result.data.paymentHistory || []);
                        } else {
                            // トークンが無効な場合は未認証とする
                            setIsAuthenticated(false);
                        }
                    } catch (error) {
                        console.error('認証初期化に失敗しました:', error);
                        setIsAuthenticated(false);
                    } finally {
                        setIsLoading(false);
                    }
                };
                
                initAuth();
            }
        }
    }, [fetchUsageHistory, fetchUserMe, tryRefresh]);

    const login = (userData: User, planData: Plan | undefined, usage: UsageHistory[], payment: PaymentHistory[]) => {
        setIsAuthenticated(true);
        setUser(userData);
        setPlan(planData);
        setUsageHistory(usage);
        setPaymentHistory(payment);
    };

    const logout = async () => {
        // Cookieベースの認証のみを使用（sessionStorageは使用しない）
        
        // Cookieからトークンをクリア（APIエンドポイント経由）
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include', // Cookieを送信
            });
        } catch (error) {
            console.error('ログアウトAPIエラー:', error);
            // エラーが発生してもローカル状態はクリアする
        }
        
        setIsAuthenticated(false);
        setUser(undefined);
        setPlan(undefined);
        setUsageHistory([]);
        setPaymentHistory([]);
    };

    return {
        isAuthenticated,
        isLoading,
        user,
        plan,
        usageHistory,
        paymentHistory,
        setIsLoading,
        login,
        logout,
    };
}
