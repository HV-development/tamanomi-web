import { useState, useEffect, useRef } from 'react';
import type { User, Plan, UsageHistory, PaymentHistory } from '@/types/user';

export function useAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState<User | undefined>(undefined);
    const [plan, setPlan] = useState<Plan | undefined>(undefined);
    const [usageHistory, setUsageHistory] = useState<UsageHistory[]>([]);
    const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
    const hasInitialized = useRef(false);

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
                        setUsageHistory(userData.usageHistory || []);
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
    }, []);

    const login = (userData: User, planData: Plan | undefined, usage: UsageHistory[], payment: PaymentHistory[]) => {
        setIsAuthenticated(true);
        setUser(userData);
        setPlan(planData);
        setUsageHistory(usage);
        setPaymentHistory(payment);
    };

    const logout = () => {
        // セッション関連データをクリア
        if (typeof window !== 'undefined') {
            sessionStorage.clear();
        }
        
        // Cookieからトークンをクリア（APIエンドポイント経由）
        fetch('/api/auth/logout', {
            method: 'POST',
        }).catch(() => {
            // エラーは無視
        });
        
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
