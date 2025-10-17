"use client"

import { useState, useEffect, useCallback } from "react"

// データプリロード用のカスタムフック
export const useDataPreloader = () => {
    const [preloadedData, setPreloadedData] = useState<{
        user: any | null
        plan: any | null
        usageHistory: any[] | null
        paymentHistory: any[] | null
        rankInfo: any | null
    }>({
        user: null,
        plan: null,
        usageHistory: null,
        paymentHistory: null,
        rankInfo: null
    })

    const [isPreloading, setIsPreloading] = useState(false)
    const [preloadProgress, setPreloadProgress] = useState(0)

    // データを段階的にプリロード
    const preloadData = useCallback(async () => {
        if (preloadedData.user) return preloadedData // 既にプリロード済み

        setIsPreloading(true)
        setPreloadProgress(0)

        try {
            // 1. ユーザーデータをプリロード（最重要）
            setPreloadProgress(20)
            const { mockUser, mockPlan, mockUsageHistory, mockPaymentHistory } = await import("@/data/mock-user")

            setPreloadProgress(40)

            // 2. ランク計算用のデータをプリロード
            setPreloadProgress(60)
            const { RANK_INFO } = await import("@/utils/rank-calculator")

            setPreloadProgress(80)

            // 3. データを設定
            const data = {
                user: {
                    ...mockUser,
                    contractStartDate: new Date("2019-01-01")
                },
                plan: mockPlan,
                usageHistory: mockUsageHistory,
                paymentHistory: mockPaymentHistory,
                rankInfo: RANK_INFO
            }

            setPreloadedData(data)
            setPreloadProgress(100)

            return data
        } catch (error) {
            console.error('データプリロードエラー:', error)
            return null
        } finally {
            setIsPreloading(false)
        }
    }, [preloadedData.user])

    // コンポーネントマウント時にプリロード開始
    useEffect(() => {
        preloadData()
    }, [preloadData])

    return {
        preloadedData,
        isPreloading,
        preloadProgress,
        preloadData
    }
}
