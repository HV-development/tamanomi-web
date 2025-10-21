"use client"

import { lazy, Suspense } from "react"

// 重いコンポーネントを遅延読み込み
export const LazyUsageHistoryList = lazy(() =>
    import("@/components/organisms/UsageHistoryList").then(module => ({
        default: module.UsageHistoryList
    }))
)

export const LazyPaymentHistoryList = lazy(() =>
    import("@/components/organisms/PaymentHistoryList").then(module => ({
        default: module.PaymentHistoryList
    }))
)

export const LazyProfileEditLayout = lazy(() =>
    import("@/components/organisms/ProfileEditContainer").then(module => ({
        default: module.ProfileEditContainer
    }))
)

export const LazyEmailChangeLayout = lazy(() =>
    import("@/components/organisms/EmailChangeContainer").then(module => ({
        default: module.EmailChangeContainer
    }))
)

export const LazyPasswordChangeLayout = lazy(() =>
    import("@/components/organisms/PasswordChangeContainer").then(module => ({
        default: module.PasswordChangeContainer
    }))
)

export const LazyWithdrawalLayout = lazy(() =>
    import("@/components/organisms/WithdrawalContainer").then(module => ({
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
