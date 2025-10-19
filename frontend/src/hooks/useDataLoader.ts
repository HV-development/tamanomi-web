"use client"

import { useState, useCallback } from "react"

// データ読み込みの最適化
export const useDataLoader = () => {
    const [dataCache, setDataCache] = useState<{
        stores: unknown[] | null;
        notifications: unknown[] | null;
    }>({ stores: null, notifications: null })

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const loadData = useCallback(async (forceReload = false) => {
        if (!forceReload && dataCache.stores && dataCache.notifications) {
            return { stores: dataCache.stores, notifications: dataCache.notifications }
        }

        setIsLoading(true)
        setError(null)

        try {
            const [storesData, notificationsData] = await Promise.all([
                import("@/data/mock-stores").then(mod => mod.mockStores).catch(() => {
                    return []
                }),
                import("@/data/mock-notifications").then(mod => mod.mockNotifications).catch(() => {
                    return []
                })
            ])

            const newData = { stores: storesData, notifications: notificationsData }
            setDataCache(newData)
            setIsLoading(false)
            return newData
        } catch {
            setError('データの読み込みに失敗しました')
            setIsLoading(false)
            return { stores: [], notifications: [] }
        }
    }, [dataCache])

    return { loadData, isLoading, error, dataCache }
}
