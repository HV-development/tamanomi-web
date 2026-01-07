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
        // モック/フォールバック廃止に伴い、ここでは空データを返す
        if (!forceReload && dataCache.stores && dataCache.notifications) {
            return { stores: dataCache.stores, notifications: dataCache.notifications }
        }
        setIsLoading(true)
        setError(null)
        const newData = { stores: [], notifications: [] }
        setDataCache(newData)
        setIsLoading(false)
        return newData
    }, [dataCache])

    return { loadData, isLoading, error, dataCache }
}
