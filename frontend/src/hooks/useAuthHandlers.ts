"use client"

import React, { useCallback, useState, useRef } from "react"
import type { AppAction, AppState } from '@hv-development/schemas'
import type { useAuth } from './useAuth'
import type { useNavigation } from './useNavigation'
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { toast } from 'sonner'
import { preRegister } from '@/lib/api-client'

export const useAuthHandlers = (
    dispatch: React.Dispatch<AppAction>,
    auth: ReturnType<typeof useAuth>,
    navigation: ReturnType<typeof useNavigation>,
    router: AppRouterInstance,
    state: AppState
) => {
    const [otpRequestId, setOtpRequestId] = useState<string>("")
    const emailPreRegisterInFlightRef = useRef(false)
    const latestState = useRef(state)
    React.useEffect(() => { latestState.current = state }, [state])

    const handlePasswordLogin = useCallback(async (loginData: { email: string; password: string }) => {
        auth.setIsLoading(true)
        dispatch({ type: 'SET_LOGIN_ERROR', payload: "" })

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email: loginData.email, password: loginData.password }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'パスワード認証に失敗しました')
            }

            const otpResponse = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email: loginData.email }),
            })

            if (!otpResponse.ok) {
                throw new Error('ワンタイムパスワードの送信に失敗しました')
            }

            const otpData = await otpResponse.json()

            dispatch({ type: 'SET_LOGIN_EMAIL', payload: loginData.email })
            setOtpRequestId(otpData.requestId)
            dispatch({ type: 'SET_LOGIN_STEP', payload: "otp" })
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'ログインに失敗しました'
            dispatch({ type: 'SET_LOGIN_ERROR', payload: errorMessage })
        } finally {
            auth.setIsLoading(false)
        }
    }, [auth, dispatch])

    const handleVerifyOtp = useCallback(async (otp: string) => {
        auth.setIsLoading(true)

        try {
            const response = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: state.loginEmail,
                    otp,
                    requestId: otpRequestId
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'ワンタイムパスワードの認証に失敗しました')
            }

            let hasPlan = false
            let isCancelledOnly = false
            try {
                const userResponse = await fetch('/api/user/me', {
                    credentials: 'include',
                })

                if (userResponse.ok) {
                    const userData = await userResponse.json()
                    hasPlan = userData.plan !== null && userData.plan !== undefined
                    isCancelledOnly = userData.hasOnlyCancelledPlans === true
                    auth.login(userData, userData.plan, [], [])
                }
            } catch {
                // エラー処理
            }

            if (state.isEmailChangeSuccessModalOpen) {
                dispatch({ type: 'RESET_LOGIN_STATE' })
                return
            }

            // cancelled のみのユーザーは home のバナーで再契約誘導するため、plan-registration に強制遷移しない
            let targetPath: string
            if (!hasPlan && !isCancelledOnly) {
                targetPath = '/plan-registration'
            } else {
                targetPath = '/home'
            }

            router.replace(targetPath)
            dispatch({ type: 'RESET_LOGIN_STATE' })
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'ワンタイムパスワードの認証に失敗しました'
            console.error('OTP verification error:', errorMessage)
            dispatch({ type: 'SET_LOGIN_ERROR', payload: errorMessage })
        } finally {
            auth.setIsLoading(false)
        }
    }, [auth, otpRequestId, router, dispatch, state])

    const handleSignup = useCallback(() => {
        router.push('/email-registration')
    }, [router])

    const handleForgotPassword = useCallback(() => {
        dispatch({ type: 'SET_PASSWORD_RESET_STEP', payload: "form" })
        dispatch({ type: 'SET_PASSWORD_RESET_EMAIL', payload: "" })
        navigation.navigateToView("password-reset")
    }, [navigation, dispatch])

    const handleBackToHome = useCallback(() => {
        navigation.navigateToView("home", "home")
        navigation.navigateToMyPage("main")
        dispatch({ type: 'RESET_SIGNUP_STATE' })
    }, [navigation, dispatch])

    const handleBackToLogin = useCallback(() => {
        navigation.navigateToView("login")
        dispatch({ type: 'RESET_LOGIN_STATE' })
        dispatch({ type: 'SET_PASSWORD_RESET_STEP', payload: "form" })
        dispatch({ type: 'SET_PASSWORD_RESET_EMAIL', payload: "" })
    }, [navigation, dispatch])

    const handleBackToEmailLogin = useCallback(() => {
        dispatch({ type: 'SET_LOGIN_STEP', payload: 'password' })
    }, [dispatch])

    const handleResendOtp = useCallback(async () => {
        auth.setIsLoading(true)

        try {
            const response = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: state.loginEmail }),
            })

            if (!response.ok) {
                throw new Error('ワンタイムパスワードの再送信に失敗しました')
            }

            const otpData = await response.json()
            setOtpRequestId(otpData.requestId)
        } catch {
            // TODO: エラーステートの追加
        } finally {
            auth.setIsLoading(false)
        }
    }, [auth, state.loginEmail])

    const handleEmailSubmit = useCallback(
        async (email: string, campaignCode?: string) => {
            const trimmed = email.trim()
            if (!trimmed) {
                toast.error('メールアドレスを入力してください')
                return
            }
            if (emailPreRegisterInFlightRef.current) return
            emailPreRegisterInFlightRef.current = true
            auth.setIsLoading(true)
            try {
                const code = campaignCode?.trim() ? campaignCode.trim() : undefined
                await preRegister(trimmed, code, undefined, undefined)
                dispatch({ type: 'SET_EMAIL_REGISTRATION_EMAIL', payload: trimmed })
                dispatch({ type: 'SET_EMAIL_REGISTRATION_STEP', payload: 'complete' })
                toast.success('認証メールを送信しました')
            } catch (e) {
                toast.error(e instanceof Error ? e.message : '認証メールの送信に失敗しました')
            } finally {
                emailPreRegisterInFlightRef.current = false
                auth.setIsLoading(false)
            }
        },
        [auth, dispatch]
    )

    const handleEmailRegistrationBackToLogin = useCallback(() => {
        dispatch({ type: 'RESET_LOGIN_STATE' })
        navigation.navigateToView("login")
        dispatch({ type: 'SET_EMAIL_REGISTRATION_STEP', payload: "form" })
        dispatch({ type: 'SET_EMAIL_REGISTRATION_EMAIL', payload: "" })
    }, [navigation, dispatch])

    const handleEmailRegistrationResend = useCallback(async () => {
        const regEmail = latestState.current.emailRegistrationEmail?.trim()
        if (!regEmail) {
            toast.error('メールアドレスが見つかりません')
            dispatch({ type: 'SET_EMAIL_REGISTRATION_STEP', payload: 'form' })
            return
        }
        if (emailPreRegisterInFlightRef.current) return
        emailPreRegisterInFlightRef.current = true
        auth.setIsLoading(true)
        try {
            await preRegister(regEmail, undefined, undefined, undefined)
            toast.success('認証メールを再送信しました')
        } catch (e) {
            toast.error(e instanceof Error ? e.message : '認証メールの再送信に失敗しました')
        } finally {
            emailPreRegisterInFlightRef.current = false
            auth.setIsLoading(false)
        }
    }, [auth, dispatch])

    const handleSignupSubmit = useCallback((data: Record<string, string>) => {
        const signupData = {
            nickname: data.nickname,
            postalCode: data.postalCode,
            address: data.address,
            birthDate: data.birthDate,
            gender: data.gender,
            password: data.password,
            passwordConfirm: data.passwordConfirm,
            email: state.emailRegistrationEmail || ""
        }
        dispatch({ type: 'SET_SIGNUP_DATA', payload: signupData })
        navigation.navigateToView("confirmation")
    }, [navigation, dispatch, state.emailRegistrationEmail])

    const handleSignupCancel = useCallback(() => {
        dispatch({ type: 'RESET_LOGIN_STATE' })
        navigation.navigateToView("login")
        dispatch({ type: 'RESET_SIGNUP_STATE' })
    }, [navigation, dispatch])

    const handleConfirmRegister = useCallback(async () => {
        auth.setIsLoading(true)
        setTimeout(() => {
            dispatch({ type: 'SET_EMAIL_CONFIRMATION_EMAIL', payload: state.signupData?.email || "" })
            navigation.navigateToView("email-confirmation")
            auth.setIsLoading(false)
        }, 2000)
    }, [auth, navigation, dispatch, state.signupData])

    const handleRegisterComplete = useCallback(() => {
        navigation.navigateToView("mypage", "mypage")
        navigation.navigateToMyPage("main")
    }, [navigation])

    const handleConfirmEdit = useCallback(() => {
        if (state.signupData) {
            const dataWithoutPassword = {
                ...state.signupData,
                password: "",
                confirmPassword: "",
            }
            dispatch({ type: 'SET_SIGNUP_DATA', payload: dataWithoutPassword })
        }
        navigation.navigateToView("signup")
    }, [navigation, dispatch, state.signupData])

    const handleSubscribe = useCallback(async () => {
        auth.setIsLoading(true)
        setTimeout(() => {
            auth.setIsLoading(false)
            navigation.navigateToView("home", "home")
        }, 2000)
    }, [auth, navigation])

    const handlePasswordResetSubmit = useCallback(async (email: string) => {
        auth.setIsLoading(true)
        setTimeout(() => {
            dispatch({ type: 'SET_PASSWORD_RESET_EMAIL', payload: email })
            dispatch({ type: 'SET_PASSWORD_RESET_STEP', payload: "complete" })
            auth.setIsLoading(false)
        }, 1500)
        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            })
            if (!response.ok) {
                throw new Error('パスワードリセットに失敗しました')
            }
        } catch (error) {
            console.error('パスワードリセットエラー:', error)
            toast.error(error instanceof Error ? error.message : 'パスワードリセットに失敗しました')
        }
    }, [auth, dispatch])

    const handlePasswordResetCancel = useCallback(() => {
        dispatch({ type: 'RESET_LOGIN_STATE' })
        navigation.navigateToView("login")
        dispatch({ type: 'SET_PASSWORD_RESET_STEP', payload: "form" })
        dispatch({ type: 'SET_PASSWORD_RESET_EMAIL', payload: "" })
    }, [navigation, dispatch])

    const handlePasswordResetResend = useCallback(() => {
        dispatch({ type: 'SET_PASSWORD_RESET_STEP', payload: "form" })
    }, [dispatch])

    const handleLogout = useCallback(async () => {
        await auth.logout()
        navigation.resetNavigation()

        if (typeof window !== 'undefined') {
            window.location.href = '/'
        }
    }, [auth, navigation])

    return {
        handleLogin: handlePasswordLogin,
        handleVerifyOtp,
        handleSignup,
        handleForgotPassword,
        handleBackToHome,
        handleBackToLogin,
        handleBackToEmailLogin,
        handleResendOtp,
        handleEmailSubmit,
        handleEmailRegistrationBackToLogin,
        handleEmailRegistrationResend,
        handleSignupSubmit,
        handleSignupCancel,
        handleConfirmRegister,
        handleRegisterComplete,
        handleConfirmEdit,
        handleSubscribe,
        handlePasswordResetSubmit,
        handlePasswordResetCancel,
        handlePasswordResetResend,
        handleLogout,
    }
}
