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
                // localStorage にアクセストークンがある場合は認証済みとする
                const accessToken = localStorage.getItem('accessToken');
                
                if (accessToken) {
                    // トークンがある場合は、ユーザー情報を取得
                    setIsLoading(true);
                    fetch('/api/user/me', {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                        },
                    })
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
                            // トークンが無効な場合はクリア
                            localStorage.removeItem('accessToken');
                            localStorage.removeItem('refreshToken');
                            setIsAuthenticated(false);
                        })
                        .finally(() => {
                            setIsLoading(false);
                        });
                } else {
                    setIsAuthenticated(false);
                }
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
        // localStorageからトークンをクリア
        if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            // その他のセッション関連データもクリア
            sessionStorage.clear();
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
