"use client"

import React, { useCallback } from "react"
import type { AppAction } from '@hv-development/schemas'
import type { useAuth } from './useAuth'
import type { useNavigation } from './useNavigation'
import type { useFilters } from './useFilters'
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { getCurrentPosition } from '@/utils/location'

export const useNavigationHandlers = (
    dispatch: React.Dispatch<AppAction>,
    auth: ReturnType<typeof useAuth>,
    navigation: ReturnType<typeof useNavigation>,
    filters: ReturnType<typeof useFilters>,
    router: AppRouterInstance,
) => {
    const handleCurrentLocationClick = useCallback(async () => {
        if (filters.isNearbyFilter) {
            filters.setIsNearbyFilter(false)
            dispatch({ type: 'SET_CURRENT_LOCATION', payload: null })
            dispatch({ type: 'SET_LOCATION_ERROR', payload: null })
            return
        }

        dispatch({ type: 'SET_LOCATION_LOADING', payload: true })
        dispatch({ type: 'SET_LOCATION_ERROR', payload: null })

        try {
            const location = await getCurrentPosition()
            dispatch({ type: 'SET_CURRENT_LOCATION', payload: location })
            dispatch({ type: 'SET_LOCATION_ERROR', payload: null })
            filters.setIsNearbyFilter(true)
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '位置情報の取得に失敗しました'
            dispatch({ type: 'SET_LOCATION_ERROR', payload: errorMessage })
            dispatch({ type: 'SET_CURRENT_LOCATION', payload: null })
            filters.setIsNearbyFilter(false)
            alert(errorMessage)
        } finally {
            dispatch({ type: 'SET_LOCATION_LOADING', payload: false })
        }
    }, [filters, dispatch])

    const handleTabChange = useCallback(async (tab: string) => {
        if (tab === "mypage") {
            if (!auth.isAuthenticated) {
                dispatch({ type: 'RESET_LOGIN_STATE' })
                navigation.navigateToView("login")
            } else {
                try {
                    const response = await fetch('/api/user/me', {
                        credentials: 'include',
                        cache: 'no-store',
                    })

                    if (response.status === 401 || response.status === 403) {
                        await auth.logout()
                        dispatch({ type: 'RESET_LOGIN_STATE' })
                        navigation.navigateToView("login")
                        return
                    }

                    if (!response.ok) {
                        alert('ログイン状態を確認できませんでした。時間をおいて再度お試しください。')
                        return
                    }
                } catch (error) {
                    console.error('ログイン状態の確認に失敗しました:', error)
                    alert('ログイン状態を確認できませんでした。通信環境をご確認ください。')
                    return
                }

                navigation.navigateToView("mypage", tab)
                navigation.navigateToMyPage("main")
            }
        } else if (tab === "home") {
            if (!auth.isAuthenticated) {
                router.push('/')
            } else {
                navigation.setActiveTab(tab)
                if (navigation.currentView !== "home") {
                    navigation.navigateToView("home")
                }
            }
        } else {
            navigation.setActiveTab(tab)
            if (navigation.currentView !== "home") {
                navigation.navigateToView("home")
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [auth, dispatch, navigation, router])

    const handleShowStoreOnHome = useCallback(() => {
        navigation.navigateToView("home", "home")
        navigation.navigateToMyPage("main")
    }, [navigation])

    const handleLogoClick = useCallback(() => {
        navigation.resetNavigation()
    }, [navigation])

    return {
        handleCurrentLocationClick,
        handleTabChange,
        handleShowStoreOnHome,
        handleLogoClick,
    }
}
