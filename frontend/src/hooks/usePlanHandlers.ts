"use client"

import React, { useCallback } from "react"
import type { AppAction } from '@hv-development/schemas'
import type { useAuth } from './useAuth'
import type { useNavigation } from './useNavigation'
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'

export const usePlanHandlers = (
    _dispatch: React.Dispatch<AppAction>,
    auth: ReturnType<typeof useAuth>,
    navigation: ReturnType<typeof useNavigation>,
    router: AppRouterInstance,
) => {
    const handleViewPlan = useCallback(() => {
        const hasPlan = auth.plan !== null && auth.plan !== undefined

        if (!hasPlan) {
            router.push('/plan-registration')
        } else {
            navigation.navigateToMyPage("plan-management")
        }
    }, [navigation, router, auth])

    const handleChangePlan = useCallback(() => {
        navigation.navigateToMyPage("plan-change")
    }, [navigation])

    const handlePlanChangeSubmit = useCallback(async (planId: string, alsoChangePaymentMethod?: boolean) => {
        try {
            auth.setIsLoading(true)

            const requestBody = {
                planId: planId,
                alsoChangePaymentMethod: alsoChangePaymentMethod || false,
            };

            const response = await fetch('/api/user-plans/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
                credentials: 'include',
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                console.error('❌ [handlePlanChangeSubmit] APIエラー:', errorData);
                throw new Error(errorData.message || 'プラン変更に失敗しました')
            }

            const responseData = await response.json();

            if (responseData.change_kind === 'single_plan_qr') {
                try {
                    const userResponse = await fetch('/api/user/me', {
                        credentials: 'include',
                        cache: 'no-store',
                    })
                    if (userResponse.ok) {
                        const updatedUserData = await userResponse.json()
                        auth.login(updatedUserData, updatedUserData.plan, updatedUserData.usageHistory || [], updatedUserData.paymentHistory || [])
                    }
                } catch (userError) {
                    console.error('❌ [handlePlanChangeSubmit] ユーザー情報取得エラー:', userError);
                }
                navigation.navigateToMyPage("main")
                return
            }

            try {
                const userResponse = await fetch('/api/user/me', {
                    credentials: 'include',
                    cache: 'no-store',
                })

                if (userResponse.ok) {
                    const updatedUserData = await userResponse.json()
                    auth.login(updatedUserData, updatedUserData.plan, updatedUserData.usageHistory || [], updatedUserData.paymentHistory || [])
                }
            } catch (userError) {
                console.error('❌ [handlePlanChangeSubmit] ユーザー情報取得エラー:', userError);
            }

            if (alsoChangePaymentMethod) {
                if (typeof window !== 'undefined') {
                    window.location.href = `/payment-method-change?from=plan-change&planId=${encodeURIComponent(planId)}`;
                } else {
                    console.warn('⚠️ [handlePlanChangeSubmit] windowが定義されていません');
                }
            } else {
                navigation.navigateToMyPage("main")
            }
        } catch (error) {
            console.error('❌ [handlePlanChangeSubmit] エラー発生:', error);
            navigation.navigateToMyPage("main")
        } finally {
            auth.setIsLoading(false)
        }
    }, [auth, navigation])

    const handlePlanChangeBack = useCallback(() => {
        navigation.navigateToMyPage("main")
    }, [navigation])

    const handleViewUsageHistory = useCallback(async () => {
        await auth.fetchUsageHistory()
        navigation.navigateToMyPage("usage-history")
    }, [auth, navigation])

    const handleViewPaymentHistory = useCallback(async () => {
        await auth.fetchPaymentHistory()
        navigation.navigateToMyPage("payment-history")
    }, [auth, navigation])

    const handleChangePaymentMethod = useCallback(() => {
        window.location.href = '/payment-method-change'
    }, [])

    const handleCancelSubscription = useCallback(() => {
        // サブスクリプションキャンセル処理
    }, [])

    return {
        handleViewPlan,
        handleChangePlan,
        handlePlanChangeSubmit,
        handlePlanChangeBack,
        handleViewUsageHistory,
        handleViewPaymentHistory,
        handleChangePaymentMethod,
        handleCancelSubscription,
    }
}
