"use client"

import { useMemo } from "react"
import { calculateUserRank } from "@/utils/rank-calculator"

interface UseComputedValuesParams {
    stores: { isFavorite: boolean }[] | undefined
    notifications: { isRead: boolean }[] | undefined
    auth: { isAuthenticated: boolean; user?: { contractStartDate?: Date; createdAt: Date } } | undefined
    filters: { isFavoritesFilter: boolean } | undefined
}

// メモ化された計算値を分離
export const useComputedValues = ({ stores, notifications, auth, filters }: UseComputedValuesParams) => {
    const currentUserRank = useMemo(() => {
        if (auth?.isAuthenticated && auth?.user) {
            const contractStartDate = auth.user.contractStartDate || auth.user.createdAt
            return calculateUserRank(contractStartDate)
        }
        return null
    }, [auth?.isAuthenticated, auth?.user])

    const filteredStores = useMemo(() => {
        if (!stores) return []
        return stores.filter((store) => {
            if (filters?.isFavoritesFilter && !store.isFavorite) {
                return false
            }
            return true
        })
    }, [stores, filters?.isFavoritesFilter])

    const favoriteStores = useMemo(() => {
        if (!stores) return []
        return stores.filter((store) => store.isFavorite)
    }, [stores])

    const hasNotification = useMemo(() => {
        if (!notifications) return false
        return notifications.some((n) => !n.isRead)
    }, [notifications])

    return {
        currentUserRank,
        filteredStores,
        favoriteStores,
        hasNotification
    }
}
