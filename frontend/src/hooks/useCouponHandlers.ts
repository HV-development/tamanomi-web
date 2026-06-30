"use client"

import React, { useCallback, useRef, useEffect } from "react"
import type { AppState, Store } from '@hv-development/schemas'
import type { AppActionExt } from './useAppReducer'
import type { useAuth } from './useAuth'
import type { useNavigation } from './useNavigation'
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'

let couponFetchingStoreId: string | null = null

export const useCouponHandlers = (
    dispatch: React.Dispatch<AppActionExt>,
    auth: ReturnType<typeof useAuth>,
    navigation: ReturnType<typeof useNavigation>,
    router: AppRouterInstance,
    state: AppState
) => {
    const latestState = useRef(state)

    useEffect(() => {
        latestState.current = state
    }, [state])

    const handleCouponsClick = useCallback(async (storeId: string, storeOverride?: Store) => {
        const store = storeOverride ?? state.stores.find((s: { id: string }) => s.id === storeId)

        if (store) {
            if (couponFetchingStoreId === storeId) {
                return
            }
            couponFetchingStoreId = storeId

            try {
                if (auth.isAuthenticated) {
                    const authResponse = await fetch('/api/user/me', {
                        credentials: 'include',
                        cache: 'no-store',
                    })

                    // 401のみログアウト対象とする（リフレッシュ失敗時はauthenticatedFetchが401に正規化する。
                    // 403は権限系エラーの可能性があるためログアウトさせない）
                    if (authResponse.status === 401) {
                        await auth.logout()
                        dispatch({ type: 'RESET_LOGIN_STATE' })
                        dispatch({ type: 'SET_COUPON_LIST_OPEN', payload: false })
                        dispatch({ type: 'SET_SELECTED_STORE', payload: null })
                        alert('ログイン状態を確認できなかったため、ログアウトしました。再度ログインしてください。')
                        navigation.navigateToView("home")
                        return
                    }

                    if (!authResponse.ok) {
                        alert('ログイン状態を確認できませんでした。時間をおいて再度お試しください。')
                        return
                    }
                }

                dispatch({ type: 'SET_SELECTED_STORE', payload: store })
                dispatch({ type: 'SET_COUPON_LIST_OPEN', payload: true })

                const url = `/api/coupons?shopId=${storeId}&status=approved&isPublic=true&limit=100`

                const response = await fetch(url, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    cache: 'no-store',
                    credentials: 'include',
                })

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}))
                    console.error('❌ Failed to fetch coupons:', response.status, errorData)
                    dispatch({ type: 'SET_STORE_COUPONS', payload: [] })
                    return
                }

                const data = await response.json()

                if (data.coupons && data.coupons.length > 0) {
                    const storeCoupons = data.coupons.map((coupon: {
                        id: string;
                        title: string;
                        description?: string;
                        conditions?: string;
                        imageUrl?: string;
                        drinkType?: string;
                        status: string;
                        shopId: string;
                        shop?: { name: string };
                        createdAt?: string;
                        updatedAt?: string;
                    }) => ({
                        id: coupon.id,
                        title: coupon.title,
                        description: coupon.description || '',
                        conditions: coupon.conditions || null,
                        imageUrl: coupon.imageUrl || '',
                        drinkType: coupon.drinkType || null,
                        status: coupon.status,
                        shopId: coupon.shopId,
                        storeName: coupon.shop?.name || store.name,
                        uuid: coupon.id,
                        createdAt: coupon.createdAt,
                        updatedAt: coupon.updatedAt,
                    }))
                    dispatch({ type: 'SET_STORE_COUPONS', payload: storeCoupons })
                } else {
                    dispatch({ type: 'SET_STORE_COUPONS', payload: [] })
                }
            } catch (error) {
                console.error('❌ Error fetching coupons:', error)
                dispatch({ type: 'SET_STORE_COUPONS', payload: [] })
            } finally {
                couponFetchingStoreId = null
            }
        }
    }, [auth, navigation, state.stores, dispatch])

    const handleUseCoupon = useCallback((couponId: string) => {
        if (!auth.isAuthenticated) {
            dispatch({ type: 'SET_LOGIN_REQUIRED_MODAL_OPEN', payload: true })
            return
        }

        if (!auth.plan) {
            dispatch({ type: 'SET_PLAN_REQUIRED_MODAL_OPEN', payload: true })
            return
        }

        const coupon = state.storeCoupons.find((c) => c.id === couponId)
        if (coupon) {
            dispatch({ type: 'SET_SELECTED_COUPON', payload: coupon })
            navigation.navigateToView("coupon-confirmation")
            dispatch({ type: 'SET_COUPON_LIST_OPEN', payload: false })
        }
    }, [auth.isAuthenticated, auth.plan, state.storeCoupons, navigation, dispatch])

    const handleConfirmCoupon = useCallback(async () => {
        if (!state.selectedCoupon || !state.selectedStore) {
            return
        }

        try {
            const response = await fetch(`/api/coupons/${state.selectedCoupon.id}/use`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ shopId: state.selectedStore.id }),
                credentials: 'include',
            })

            if (!response.ok) {
                // 401のみログアウト対象（403は権限系エラーの可能性があるため通常のエラー処理に流す）
                if (response.status === 401) {
                    await auth.logout()
                    dispatch({ type: 'RESET_LOGIN_STATE' })
                    dispatch({ type: 'SET_SELECTED_COUPON', payload: null })
                    dispatch({ type: 'SET_SELECTED_STORE', payload: null })
                    alert('ログイン状態を確認できなかったため、ログアウトしました。再度ログインしてください。')
                    navigation.navigateToView("home")
                    return
                }

                let errorBody: { error?: { code?: string; message?: string } | string; message?: string } = {}
                try {
                    errorBody = await response.json()
                } catch {
                    errorBody = {}
                }

                // 支払いが一時停止中（バックエンドから直接 409 を受領した場合のフォールバック）
                if (
                    response.status === 409 &&
                    typeof errorBody.error === 'object' &&
                    errorBody.error?.code === 'SUBSCRIPTION_PAUSED'
                ) {
                    dispatch({
                        type: 'SET_SUBSCRIPTION_PAUSED_MODAL',
                        payload: { open: true, mode: 'apiError' },
                    })
                    dispatch({ type: 'SET_SELECTED_COUPON', payload: null })
                    dispatch({ type: 'SET_SELECTED_STORE', payload: null })
                    navigation.navigateToView("home")
                    return
                }

                let errorMessage = 'クーポンの使用に失敗しました'
                if (typeof errorBody.error === 'object' && errorBody.error?.message) {
                    errorMessage = errorBody.error.message
                } else if (errorBody.message) {
                    errorMessage = errorBody.message
                } else if (typeof errorBody.error === 'string') {
                    errorMessage = errorBody.error
                } else {
                    errorMessage = `クーポンの使用に失敗しました (HTTP ${response.status})`
                }
                alert(errorMessage)
                return
            }

            await response.json()
            dispatch({ type: 'SET_SUCCESS_MODAL_OPEN', payload: true })
            navigation.navigateToView("home")
        } catch (error) {
            console.error('クーポン使用エラー:', error)
            alert(error instanceof Error ? error.message : 'クーポンの使用中にエラーが発生しました')
        }
    }, [auth, navigation, dispatch, state.selectedCoupon, state.selectedStore])

    const handleCouponListClose = useCallback(() => {
        couponFetchingStoreId = null
        dispatch({ type: 'SET_COUPON_LIST_OPEN', payload: false })
        dispatch({ type: 'SET_SELECTED_STORE', payload: null })
    }, [dispatch])

    const handleCouponListBack = useCallback(() => {
        couponFetchingStoreId = null
        dispatch({ type: 'SET_COUPON_LIST_OPEN', payload: false })
        dispatch({ type: 'SET_SELECTED_STORE', payload: null })
    }, [dispatch])

    const handleSuccessModalClose = useCallback(() => {
        dispatch({ type: 'SET_SUCCESS_MODAL_OPEN', payload: false })
        dispatch({ type: 'SET_SELECTED_COUPON', payload: null })
        dispatch({ type: 'SET_SELECTED_STORE', payload: null })
    }, [dispatch])

    const handleCancelCoupon = useCallback(() => {
        navigation.navigateToView("home")
        dispatch({ type: 'SET_COUPON_LIST_OPEN', payload: true })
        dispatch({ type: 'SET_SELECTED_COUPON', payload: null })
    }, [navigation, dispatch])

    const handleUseSameCoupon = useCallback(() => {
        if (!auth.isAuthenticated) {
            dispatch({ type: 'SET_LOGIN_REQUIRED_MODAL_OPEN', payload: true })
            return
        }
    }, [auth.isAuthenticated, dispatch])

    const handleUsageGuideClick = useCallback(() => {
        navigation.navigateToView("usage-guide")
    }, [navigation])

    const handleUsageGuideBack = useCallback(() => {
        navigation.navigateToView("coupon-confirmation")
    }, [navigation])

    const handleLoginRequiredModalClose = useCallback(() => {
        dispatch({ type: 'SET_LOGIN_REQUIRED_MODAL_OPEN', payload: false })
    }, [dispatch])

    const handleLoginRequiredModalLogin = useCallback(() => {
        dispatch({ type: 'SET_LOGIN_REQUIRED_MODAL_OPEN', payload: false })
        dispatch({ type: 'RESET_LOGIN_STATE' })
        navigation.navigateToView("login")
    }, [navigation, dispatch])

    const handlePlanRequiredModalClose = useCallback(() => {
        dispatch({ type: 'SET_PLAN_REQUIRED_MODAL_OPEN', payload: false })
    }, [dispatch])

    const handlePlanRequiredModalRegister = useCallback(() => {
        dispatch({ type: 'SET_PLAN_REQUIRED_MODAL_OPEN', payload: false })
        router.push('/plan-registration')
    }, [dispatch, router])

    const handleSubscriptionPausedModalClose = useCallback(() => {
        dispatch({
            type: 'SET_SUBSCRIPTION_PAUSED_MODAL',
            payload: { open: false, mode: 'preCheck' },
        })
    }, [dispatch])

    const handleSubscriptionPausedModalChangePayment = useCallback(() => {
        dispatch({
            type: 'SET_SUBSCRIPTION_PAUSED_MODAL',
            payload: { open: false, mode: 'preCheck' },
        })
        router.push('/payment-method-change')
    }, [dispatch, router])

    return {
        handleCouponsClick,
        handleUseCoupon,
        handleConfirmCoupon,
        handleCouponListClose,
        handleCouponListBack,
        handleSuccessModalClose,
        handleCancelCoupon,
        handleUseSameCoupon,
        handleUsageGuideClick,
        handleUsageGuideBack,
        handleLoginRequiredModalClose,
        handleLoginRequiredModalLogin,
        handlePlanRequiredModalClose,
        handlePlanRequiredModalRegister,
        handleSubscriptionPausedModalClose,
        handleSubscriptionPausedModalChangePayment,
    }
}
