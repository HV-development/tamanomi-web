"use client"

import React, { useCallback } from "react"
import type { AppAction, AppState, Store } from '@hv-development/schemas'
import type { useAuth } from './useAuth'
import type { useNavigation } from './useNavigation'
import { toast } from 'sonner'
import type { CreateStoreIntroductionRequest } from '@/types/store-introduction'

export const useMyPageHandlers = (
    dispatch: React.Dispatch<AppAction>,
    auth: ReturnType<typeof useAuth>,
    navigation: ReturnType<typeof useNavigation>,
    state: AppState
) => {
    const handleMenuItemClick = useCallback((itemId: string) => {
        if (typeof window === "undefined") return

        switch (itemId) {
            case "terms":
                window.location.href = "/lp/terms"
                break
            case "privacy":
                window.open("/プライバシーポリシー.pdf", "_blank")
                break
            case "commercial-law":
                window.location.href = "/lp/commercial-law"
                break
            case "contact":
                window.location.href = "/lp/contact"
                break
            case "login":
                navigation.navigateToView("login", "map")
                break
            case "logout":
                auth.logout()
                navigation.resetNavigation()
                break
            default:
                break
        }
    }, [navigation, auth])

    const handleFavoritesClick = useCallback(() => {
        dispatch({ type: 'SET_FAVORITES_OPEN', payload: true })
    }, [dispatch])

    const handleSearchClick = useCallback(() => {
        dispatch({ type: 'SET_SEARCH_POPUP_OPEN', payload: !state.isSearchPopupOpen })
    }, [dispatch, state.isSearchPopupOpen])

    const handleSearchClose = useCallback(() => {
        dispatch({ type: 'SET_SEARCH_POPUP_OPEN', payload: false })
    }, [dispatch])

    const handleHistoryClick = useCallback(() => {
        // 履歴クリック処理
    }, [])

    const handleFavoritesClose = useCallback(() => {
        dispatch({ type: 'SET_FAVORITES_OPEN', payload: false })
    }, [dispatch])

    const handleHistoryClose = useCallback(() => {
        // 履歴クローズ処理
    }, [])

    const handleNotificationClick = useCallback(() => {
        // 通知パネルを開く処理
    }, [])

    const handleNotificationItemClick = useCallback((notificationId: string) => {
        dispatch({ type: 'MARK_NOTIFICATION_READ', payload: notificationId })
    }, [dispatch])

    const handleMarkAllNotificationsRead = useCallback(() => {
        dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' })
    }, [dispatch])

    const handleFavoriteToggle = useCallback(async (storeId: string) => {
        const hasCookie = typeof document !== 'undefined' && document.cookie.includes('accessToken')
        const currentStore = state.stores.find((s: { id: string; isFavorite?: boolean }) => s.id === storeId)
        const currentIsFavorite = currentStore?.isFavorite ?? false

        if (!auth.isAuthenticated && !hasCookie) {
            try {
                const { isFavoriteInStorage, addFavoriteToStorage, removeFavoriteFromStorage } = await import('@/lib/favorites-storage')
                const storageIsFavorite = isFavoriteInStorage(storeId)

                if (storageIsFavorite) {
                    removeFavoriteFromStorage(storeId)
                } else {
                    addFavoriteToStorage(storeId)
                }

                dispatch({ type: 'TOGGLE_FAVORITE', payload: storeId })
            } catch (error) {
                console.error('セッションストレージへの保存エラー:', error)
            }
            return
        }

        dispatch({ type: 'TOGGLE_FAVORITE', payload: storeId })

        try {
            let response: Response
            let data: { isFavorite?: boolean; error?: { message?: string }; message?: string }
            try {
                response = await fetch(`/api/favorites/${storeId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({}),
                    credentials: 'include',
                })

                data = await response.json()

                if (!response.ok) {
                    if (response.status === 401 || response.status === 403) {
                        auth.logout()

                        try {
                            const { addFavoriteToStorage, removeFavoriteFromStorage } = await import('@/lib/favorites-storage')
                            if (currentIsFavorite) {
                                removeFavoriteFromStorage(storeId)
                            } else {
                                addFavoriteToStorage(storeId)
                            }
                        } catch (storageError) {
                            console.error('セッションストレージへの保存エラー:', storageError)
                        }
                        return
                    }

                    dispatch({ type: 'TOGGLE_FAVORITE', payload: storeId })
                    throw new Error(data.error?.message || data.message || 'お気に入りの登録/削除に失敗しました')
                }
            } catch {
                auth.logout()

                try {
                    const { addFavoriteToStorage, removeFavoriteFromStorage } = await import('@/lib/favorites-storage')
                    if (currentIsFavorite) {
                        removeFavoriteFromStorage(storeId)
                    } else {
                        addFavoriteToStorage(storeId)
                    }
                } catch (storageError) {
                    console.error('セッションストレージへの保存エラー:', storageError)
                }
                return
            }

            if (data.isFavorite !== undefined) {
                const currentStore = state.stores.find((s: { id: string; isFavorite?: boolean }) => s.id === storeId)
                const currentUIState = currentStore?.isFavorite ?? false
                const expectedState = !currentIsFavorite

                if (data.isFavorite !== expectedState) {
                    if (currentUIState !== data.isFavorite) {
                        dispatch({ type: 'TOGGLE_FAVORITE', payload: storeId })
                    }
                }
            }

            try {
                const syncResponse = await fetch('/api/favorites', {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    cache: 'no-store',
                    credentials: 'include',
                })

                if (syncResponse.ok) {
                    const syncData = await syncResponse.json()
                    const favoriteShopIds = (syncData.shops || []).map((shop: { id: string }) => shop.id) as string[]

                    dispatch({
                        type: 'SYNC_FAVORITES',
                        payload: favoriteShopIds
                    })
                }
            } catch (syncError) {
                console.error('お気に入り一覧の同期エラー:', syncError)
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'お気に入りの登録/削除に失敗しました'

            if (errorMessage.includes('無効なトークン') || errorMessage.includes('認証')) {
                return
            }

            dispatch({ type: 'TOGGLE_FAVORITE', payload: storeId })
            console.error('お気に入り登録/削除エラー:', errorMessage)
        }
    }, [auth, dispatch, state.stores])

    const handleStoreClick = useCallback((store: Store) => {
        dispatch({ type: 'SET_SELECTED_STORE', payload: store })
        dispatch({ type: 'SET_STORE_DETAIL_POPUP_OPEN', payload: true })
    }, [dispatch])

    const handleStoreDetailPopupClose = useCallback(() => {
        dispatch({ type: 'SET_STORE_DETAIL_POPUP_OPEN', payload: false })
        dispatch({ type: 'SET_SELECTED_STORE', payload: null })
    }, [dispatch])

    const handleStoreIntroduction = useCallback(() => {
        navigation.navigateToMyPage("store-introduction")
    }, [navigation])

    const handleStoreIntroductionSubmit = useCallback(async (data: CreateStoreIntroductionRequest) => {
        try {
            const response = await fetch('/api/store-introductions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(data),
            })

            const result = await response.json()

            if (!response.ok) {
                toast.error(result.error?.message || '店舗紹介の登録に失敗しました')
                return
            }

            toast.success('店舗紹介を登録しました')
            navigation.navigateToMyPage("main")
        } catch (error) {
            console.error('店舗紹介登録エラー:', error)
            toast.error('店舗紹介の登録に失敗しました')
        }
    }, [navigation])

    return {
        handleMenuItemClick,
        handleFavoritesClick,
        handleSearchClick,
        handleSearchClose,
        handleHistoryClick,
        handleFavoritesClose,
        handleHistoryClose,
        handleNotificationClick,
        handleNotificationItemClick,
        handleMarkAllNotificationsRead,
        handleFavoriteToggle,
        handleStoreClick,
        handleStoreDetailPopupClose,
        handleStoreIntroduction,
        handleStoreIntroductionSubmit,
    }
}
