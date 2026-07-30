"use client"

import React, { useCallback, useRef } from "react"
import type { AppAction } from '@hv-development/schemas'
import type { useAuth } from './useAuth'
import type { useNavigation } from './useNavigation'

export const useWithdrawalHandlers = (
    _dispatch: React.Dispatch<AppAction>,
    auth: ReturnType<typeof useAuth>,
    navigation: ReturnType<typeof useNavigation>,
) => {
    const isSubmittingRef = useRef(false)

    const handleWithdraw = useCallback(() => {
        navigation.navigateToMyPage("withdrawal")
    }, [navigation])

    const handleWithdrawConfirm = useCallback(async () => {
        if (isSubmittingRef.current) return
        isSubmittingRef.current = true

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

            if (!userPlanId) {
                // データ不整合防御: Paygent 継続課金が生きているのに UserPlan が取れないケース。
                // このまま /api/user/withdraw に落とすと Paygent 側の課金が止まらず、
                // 退会後も課金され続ける最悪状態になるため、ユーザーに再読み込みを促す。
                if (runningId) {
                    throw new Error(
                        'ユーザープラン情報を取得できませんでした。マイページを再読み込みしてから再度お試しください。'
                    )
                }

                // Paygent 未登録 & UserPlan なし → アカウント全体の退会
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

            // userPlan あり: バックエンド deleteUserPlan で Paygent 電文283 送信 + DB 更新
            // paygentRunningId 有無に関わらず一本化（バックエンドが Paygent 未登録は自動スキップ）
            // 当日退会でも P050 が発生しない（電文283 は end_scheduled パラメータなし）
            const deleteResponse = await fetch(`/api/user-plans/${userPlanId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            })

            if (!deleteResponse.ok) {
                const errorData: { error?: { message?: string } | string; message?: string } =
                    await deleteResponse.json().catch(() => ({}))
                const errorMessage =
                    (typeof errorData.error === 'object' ? errorData.error?.message : errorData.error) ||
                    errorData.message ||
                    '退会処理に失敗しました'
                throw new Error(errorMessage)
            }

            await auth.refreshUser()
            navigation.navigateToMyPage("withdrawal-complete")
        } catch (error) {
            console.error('退会処理エラー:', error)
            alert(error instanceof Error ? error.message : '退会処理に失敗しました')
        } finally {
            auth.setIsLoading(false)
            isSubmittingRef.current = false
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
