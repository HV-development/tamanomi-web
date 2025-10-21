"use client"

import { lazy, Suspense } from "react"

// 重いコンポーネントを遅延読み込み
export const LazyUsageHistoryList = lazy(() =>
    import("@/components/molecules/usage-history-list").then(module => ({
        default: module.UsageHistoryList
    }))
)

export const LazyPaymentHistoryList = lazy(() =>
    import("@/components/molecules/payment-history-list").then(module => ({
        default: module.PaymentHistoryList
    }))
)

export const LazyProfileEditLayout = lazy(() =>
    import("@/components/organisms/profile-edit-container").then(module => ({
        default: module.ProfileEditContainer
    }))
)

export const LazyEmailChangeLayout = lazy(() =>
    import("@/components/organisms/email-change-container").then(module => ({
        default: module.EmailChangeContainer
    }))
)

export const LazyPasswordChangeLayout = lazy(() =>
    import("@/components/organisms/password-change-container").then(module => ({
        default: module.PasswordChangeContainer
    }))
)

export const LazyWithdrawalLayout = lazy(() =>
    import("@/components/organisms/withdrawal-container").then(module => ({
        default: module.WithdrawalContainer
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
