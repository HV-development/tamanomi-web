import { useState, useEffect } from 'react';
import type { User, Plan, UsageHistory, PaymentHistory } from '@/types/user';

export function useAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState<User | undefined>(undefined);
    const [plan, setPlan] = useState<Plan | undefined>(undefined);
    const [usageHistory, setUsageHistory] = useState<UsageHistory[]>([]);
    const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);

    // 自動ログイン処理とトークンチェック
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const autoLogin = urlParams.get('auto-login');
            const loginEmail = urlParams.get('email');

            if (autoLogin === 'true' && loginEmail) {
                // 自動ログイン処理
                console.log('🔍 [useAuth] Auto login with email:', loginEmail);
                setIsAuthenticated(true);
                // URLパラメータをクリア
                window.history.replaceState({}, '', '/');
            } else {
                // localStorage にアクセストークンがある場合は認証済みとする
                const accessToken = localStorage.getItem('accessToken');
                console.log('🔍 [useAuth] Checking localStorage accessToken:', !!accessToken);
                if (accessToken) {
                    console.log('🔍 [useAuth] Setting isAuthenticated to true');
                    setIsAuthenticated(true);
                }
            }
        }
    }, []);

    const login = (userData: User, planData: Plan, usage: UsageHistory[], payment: PaymentHistory[]) => {
        setIsAuthenticated(true);
        setUser(userData);
        setPlan(planData);
        setUsageHistory(usage);
        setPaymentHistory(payment);
    };

    const logout = () => {
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
