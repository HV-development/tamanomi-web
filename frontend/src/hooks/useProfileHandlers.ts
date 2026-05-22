"use client"

import React, { useCallback } from "react"
import type { AppAction } from '@hv-development/schemas'
import type { useAuth } from './useAuth'
import type { useNavigation } from './useNavigation'
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { toast } from 'sonner'

export const useProfileHandlers = (
    dispatch: React.Dispatch<AppAction>,
    auth: ReturnType<typeof useAuth>,
    navigation: ReturnType<typeof useNavigation>,
    router: AppRouterInstance,
) => {
    const handleEditProfile = useCallback(() => {
        navigation.navigateToMyPage("profile-edit")
    }, [navigation])

    const handleChangeEmail = useCallback(() => {
        dispatch({ type: 'SET_EMAIL_CHANGE_STEP', payload: "form" })
        dispatch({ type: 'SET_NEW_EMAIL', payload: "" })
        navigation.navigateToMyPage("email-change")
    }, [navigation, dispatch])

    const handleChangePassword = useCallback(() => {
        dispatch({ type: 'SET_PASSWORD_CHANGE_STEP', payload: "form" })
        navigation.navigateToMyPage("password-change")
    }, [navigation, dispatch])

    const handleProfileEditSubmit = useCallback(async (data: Record<string, string>) => {
        auth.setIsLoading(true)

        try {
            const isDevelopment = process.env.NODE_ENV === 'development'
            const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true'

            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            }

            if (isDevelopment && bypassAuth) {
                headers['Authorization'] = 'Bearer dev-bypass-token'
            }

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { saitamaAppId, ...restData } = data
            const updateData = {
                ...restData,
                birthDate: restData.birthDate ? restData.birthDate.replace(/\//g, '-') : restData.birthDate
            }

            const response = await fetch('/api/user/update', {
                method: 'PUT',
                headers,
                body: JSON.stringify(updateData),
            })

            const result = await response.json()

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    dispatch({ type: 'SET_LOGIN_REQUIRED_MODAL_OPEN', payload: true })
                    auth.setIsLoading(false)
                    return
                }
                throw new Error(result.message || 'プロフィールの更新に失敗しました')
            }

            try {
                const userResponse = await fetch('/api/user/me', {
                    cache: 'no-store',
                })

                if (userResponse.ok) {
                    const userData = await userResponse.json()
                    auth.login(userData, userData.plan, [], [])
                }
            } catch {
                // エラー処理
            }

            toast.success('プロフィールを更新しました')
            navigation.navigateToView("mypage", "mypage")
            navigation.navigateToMyPage("main")
            auth.setIsLoading(false)
        } catch (error) {
            auth.setIsLoading(false)
            toast.error(error instanceof Error ? error.message : 'プロフィールの更新に失敗しました')
        }
    }, [auth, dispatch, navigation])

    const handleEmailChangeSubmit = useCallback(async (data: { currentPassword: string; newEmail: string; confirmEmail: string }) => {
        auth.setIsLoading(true)

        try {
            const isDevelopment = process.env.NODE_ENV === 'development';
            const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';

            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };

            if (isDevelopment && bypassAuth) {
                headers['Authorization'] = 'Bearer dev-bypass-token';
            }

            const response = await fetch('/api/auth/email/change', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    currentPassword: data.currentPassword,
                    newEmail: data.newEmail,
                    confirmEmail: data.confirmEmail,
                }),
                credentials: 'include',
            })

            const result = await response.json()

            if (!response.ok) {
                if (response.status === 403) {
                    auth.logout()
                    router.push('/')
                    throw new Error('セッションの有効期限が切れました。再度ログインしてください。')
                }
                throw new Error(result.error?.message || 'メールアドレス変更に失敗しました')
            }

            dispatch({ type: 'SET_NEW_EMAIL', payload: data.newEmail })
            dispatch({ type: 'SET_EMAIL_CHANGE_STEP', payload: "complete" })
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'メールアドレス変更に失敗しました'
            alert(errorMessage)
        } finally {
            auth.setIsLoading(false)
        }
    }, [auth, dispatch, router])

    const handleEmailChangeResend = useCallback(() => {
        dispatch({ type: 'SET_EMAIL_CHANGE_STEP', payload: "form" })
    }, [dispatch])

    const handleEmailChangeSuccessModalClose = useCallback(() => {
        dispatch({ type: 'SET_EMAIL_CHANGE_SUCCESS_MODAL_OPEN', payload: false })
        dispatch({ type: 'RESET_LOGIN_STATE' })
        auth.logout()
        window.close()

        setTimeout(() => {
            router.push('/?skip-auth-check=true')
        }, 100)
    }, [dispatch, router, auth])

    const handlePasswordChangeSubmit = useCallback(async (currentPassword: string, newPassword: string) => {
        auth.setIsLoading(true)
        dispatch({ type: 'SET_PASSWORD_CHANGE_ERROR', payload: null })
        try {
            const response = await fetch('/api/auth/password/change', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword }),
                credentials: 'include',
            })
            const result = await response.json()
            if (!response.ok) {
                if (response.status === 403) {
                    auth.logout()
                    router.push('/')
                    throw new Error('セッションの有効期限が切れました。再度ログインしてください。')
                }
                throw new Error(result.error?.message || 'パスワード変更に失敗しました')
            }

            dispatch({ type: 'SET_PASSWORD_CHANGE_STEP', payload: "complete" })
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'パスワード変更に失敗しました'
            dispatch({ type: 'SET_PASSWORD_CHANGE_ERROR', payload: errorMessage })
        } finally {
            auth.setIsLoading(false)
        }
    }, [auth, dispatch, router])

    const handlePasswordChangeComplete = useCallback(() => {
        auth.logout()
        dispatch({ type: 'SET_PASSWORD_CHANGE_STEP', payload: "form" })
        dispatch({ type: 'RESET_LOGIN_STATE' })
        navigation.navigateToView("login")
    }, [auth, dispatch, navigation])

    return {
        handleEditProfile,
        handleChangeEmail,
        handleChangePassword,
        handleProfileEditSubmit,
        handleEmailChangeSubmit,
        handleEmailChangeResend,
        handleEmailChangeSuccessModalClose,
        handlePasswordChangeSubmit,
        handlePasswordChangeComplete,
    }
}
