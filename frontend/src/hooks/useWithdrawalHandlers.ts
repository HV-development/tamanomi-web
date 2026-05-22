"use client"

import React, { useCallback } from "react"
import type { AppAction } from '@hv-development/schemas'
import type { useAuth } from './useAuth'
import type { useNavigation } from './useNavigation'

export const useWithdrawalHandlers = (
    _dispatch: React.Dispatch<AppAction>,
    auth: ReturnType<typeof useAuth>,
    navigation: ReturnType<typeof useNavigation>,
) => {
    const handleWithdraw = useCallback(() => {
        navigation.navigateToMyPage("withdrawal")
    }, [navigation])

    const handleWithdrawConfirm = useCallback(async () => {
        try {
            auth.setIsLoading(true)

            const user = auth.user

            if (!user) {
                throw new Error('ユーザー情報が見つかりません')
            }

            const userMeResponse = await fetch('/api/user/me', {
                credentials: 'include',
            })

            if (!userMeResponse.ok) {
                throw new Error('ユーザー情報の取得に失敗しました')
            }

            const userData = await userMeResponse.json()

            const runningId = userData.userPlan?.paygentRunningId || userData.plan?.paygentRunningId
            const userPlanId = userData.userPlan?.id

            if (!runningId) {
                if (!userPlanId) {
                    const withdrawResponse = await fetch('/api/user/withdraw', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({}),
                        credentials: 'include',
                    })

                    if (!withdrawResponse.ok) {
                        const errorData = await withdrawResponse.json().catch(() => ({}))
                        throw new Error(errorData.error?.message || errorData.message || '退会処理に失敗しました')
                    }

                    await auth.refreshUser()
                    navigation.navigateToMyPage("withdrawal-complete")
                    return
                }

                const deleteResponse = await fetch(`/api/user-plans/${userPlanId}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                })

                if (!deleteResponse.ok) {
                    const errorData = await deleteResponse.json().catch(() => ({}))
                    throw new Error(errorData.message || errorData.error?.message || '退会処理に失敗しました')
                }

                await auth.refreshUser()
                navigation.navigateToMyPage("withdrawal-complete")
                return
            }

            const nextBillingDate = userData.userPlan?.nextBillingDate || userData.plan?.nextBillingDate

            if (!nextBillingDate) {
                throw new Error('次回課金日が見つかりません')
            }

            const formatDate = (date: Date | string): string => {
                const d = typeof date === 'string' ? new Date(date) : date
                const year = d.getFullYear()
                const month = String(d.getMonth() + 1).padStart(2, '0')
                const day = String(d.getDate()).padStart(2, '0')
                return `${year}${month}${day}`
            }

            const endScheduled = formatDate(nextBillingDate)

            if (!userPlanId) {
                throw new Error(
                    'ユーザープラン情報を取得できませんでした。マイページを再読み込みしてから再度お試しください。'
                )
            }

            const response = await fetch('/api/payment/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userPlanId,
                    customerId: user.paymentCard?.paygentCustomerId,
                    customerCardId: user.paymentCard?.paygentCustomerCardId,
                    runningId: runningId,
                    endScheduled: endScheduled,
                    description: '退会処理',
                }),
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.error || errorData.message || '退会処理に失敗しました')
            }

            await response.json()
            await auth.refreshUser()
            navigation.navigateToMyPage("withdrawal-complete")
        } catch (error) {
            console.error('退会処理エラー:', error)
            alert(error instanceof Error ? error.message : '退会処理に失敗しました')
        } finally {
            auth.setIsLoading(false)
        }
    }, [auth, navigation])

    const handleWithdrawCancel = useCallback(() => {
        navigation.navigateToMyPage("profile-edit")
    }, [navigation])

    const handleWithdrawComplete = useCallback(async () => {
        const user = auth.user
        if (user?.accountStatus === 'withdrawing') {
            navigation.navigateToMyPage("main")
            return
        }

        await auth.logout()
        navigation.resetNavigation()

        if (typeof window !== 'undefined') {
            window.location.href = '/'
        }
    }, [auth, navigation])

    return {
        handleWithdraw,
        handleWithdrawConfirm,
        handleWithdrawCancel,
        handleWithdrawComplete,
    }
}
