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
                fetch('/api/user/me')
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Failed to fetch user data');
                        }
                        return response.json();
                    })
                    .then(userData => {
                        setIsAuthenticated(true);
                        setUser(userData);
                        setPlan(userData.plan);
                        // 利用履歴は別途APIから取得
                        fetchUsageHistory();
                        setPaymentHistory(userData.paymentHistory || []);
                    })
                    .catch(() => {
                        // トークンが無効な場合は未認証とする
                        setIsAuthenticated(false);
                    })
                    .finally(() => {
                        setIsLoading(false);
                    });
            }
        }
    }, [fetchUsageHistory]);

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
