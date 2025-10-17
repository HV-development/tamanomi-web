"use client"

import { lazy, Suspense } from "react"

// 重いコンポーネントを遅延読み込み
export const LazyUsageHistoryList = lazy(() =>
    import("../molecules/usage-history-list").then(module => ({
        default: module.UsageHistoryList
    }))
)

export const LazyPaymentHistoryList = lazy(() =>
    import("../molecules/payment-history-list").then(module => ({
        default: module.PaymentHistoryList
    }))
)

export const LazyProfileEditLayout = lazy(() =>
    import("../templates/profile-edit-layout").then(module => ({
        default: module.ProfileEditLayout
    }))
)

export const LazyEmailChangeLayout = lazy(() =>
    import("../templates/email-change-layout").then(module => ({
        default: module.EmailChangeLayout
    }))
)

export const LazyPasswordChangeLayout = lazy(() =>
    import("../templates/password-change-layout").then(module => ({
        default: module.PasswordChangeLayout
    }))
)

export const LazyWithdrawalLayout = lazy(() =>
    import("../templates/withdrawal-layout").then(module => ({
        default: module.WithdrawalLayout
    }))
)

// 遅延読み込み用のフォールバック
export const LazyFallback = ({ children }: { children: React.ReactNode }) => (
    <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-green-600 font-medium">読み込み中...</p>
            </div>
        </div>
    }>
        {children}
    </Suspense>
)
