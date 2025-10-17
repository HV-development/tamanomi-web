"use client"

import React, { useCallback, useState } from "react"
import type { AppAction, AppState, AppHandlers } from '@hv-development/schemas'
import type { Store } from "@/types/store"
import { appConfig } from '@/config/appConfig'
import type { useAuth } from './useAuth'
import type { useNavigation } from './useNavigation'
import type { useFilters } from './useFilters'
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'

// ハンドラー作成フック
export const useAppHandlers = (
    dispatch: React.Dispatch<AppAction>,
    auth: ReturnType<typeof useAuth>,
    navigation: ReturnType<typeof useNavigation>,
    filters: ReturnType<typeof useFilters>,
    router: AppRouterInstance,
    state: AppState
): AppHandlers => {
    // OTP requestIdを管理するローカルstate
    const [otpRequestId, setOtpRequestId] = useState<string>("")

    const handleCurrentLocationClick = useCallback(() => {
        filters.toggleNearbyFilter()
    }, [filters])

    const handleTabChange = useCallback((tab: string) => {
        if (tab === "home" && appConfig.restrictTopPageAccess && auth.isAuthenticated) {
            alert("現在、トップ画面へのアクセスは制限されています。マイページをご利用ください。")
            return
        }

        if (tab === "mypage") {
            if (!auth.isAuthenticated) {
                dispatch({ type: 'RESET_LOGIN_STATE' })
                navigation.navigateToView("login")
            } else {
                navigation.navigateToView("mypage", tab)
                navigation.navigateToMyPage("main")
            }
        } else {
            navigation.setActiveTab(tab)
            if (navigation.currentView !== "home") {
                navigation.navigateToView("home")
            }
        }
    }, [auth.isAuthenticated, navigation])

    // ステップ1: パスワード認証 + OTP送信
    const handlePasswordLogin = useCallback(async (loginData: { email: string; password: string }) => {
        auth.setIsLoading(true)

        try {
            // パスワード認証を実行
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: loginData.email, password: loginData.password }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'パスワード認証に失敗しました')
            }

            // OTP送信
            const otpResponse = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: loginData.email }),
            })

            if (!otpResponse.ok) {
                throw new Error('ワンタイムパスワードの送信に失敗しました')
            }

            const otpData = await otpResponse.json()

            // パスワード認証成功 → OTP入力画面へ
            dispatch({ type: 'SET_LOGIN_EMAIL', payload: loginData.email })
            setOtpRequestId(otpData.requestId)
            dispatch({ type: 'SET_LOGIN_STEP', payload: "otp" })
        } catch (err) {
            console.error('Login error:', err)
            // エラーはステート管理システムで処理する必要があります
            // TODO: エラーステートの追加
        } finally {
            auth.setIsLoading(false)
        }
    }, [auth, dispatch])

    // ステップ2: OTP認証
    const handleVerifyOtp = useCallback(async (otp: string) => {
        auth.setIsLoading(true)

        try {
            const response = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
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

            // ログイン成功
            // トークンをlocalStorageに保存
            if (data.accessToken) {
                localStorage.setItem('accessToken', data.accessToken)
            }
            if (data.refreshToken) {
                localStorage.setItem('refreshToken', data.refreshToken)
            }

            // ユーザー情報とプラン情報を確認
            let hasPlan = false
            try {
                const userResponse = await fetch('/api/user/me', {
                    headers: {
                        'Authorization': `Bearer ${data.accessToken}`,
                    },
                })

                if (userResponse.ok) {
                    const userData = await userResponse.json()
                    // プラン情報が存在するかチェック
                    hasPlan = userData.plan !== null && userData.plan !== undefined
                }
            } catch (error) {
                // ユーザーデータの取得に失敗した場合はプラン未登録として扱う
                console.error('Failed to fetch user data:', error)
            }

            // プラン未登録の場合はプラン登録画面に遷移
            if (!hasPlan) {
                router.push(`/plan-registration?email=${encodeURIComponent(state.loginEmail)}`)
            } else {
                // プラン登録済みの場合はマイページに遷移
                router.push('/home?view=mypage&auto-login=true')
            }

            dispatch({ type: 'RESET_LOGIN_STATE' })
        } catch (err) {
            console.error('OTP verification error:', err)
            // エラーはステート管理システムで処理する必要があります
            // TODO: エラーステートの追加
        } finally {
            auth.setIsLoading(false)
        }
    }, [auth, state.loginEmail, otpRequestId, router, dispatch])

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
        dispatch({ type: 'RESET_LOGIN_STATE' })
    }, [dispatch])

    const handleResendOtp = useCallback(async () => {
        auth.setIsLoading(true)

        try {
            const response = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: state.loginEmail }),
            })

            if (!response.ok) {
                throw new Error('ワンタイムパスワードの再送信に失敗しました')
            }

            const otpData = await response.json()
            setOtpRequestId(otpData.requestId)
        } catch (err) {
            console.error('Resend OTP error:', err)
            // TODO: エラーステートの追加
        } finally {
            auth.setIsLoading(false)
        }
    }, [auth, state.loginEmail])

    const handleEmailSubmit = useCallback((email: string, campaignCode?: string) => {
        auth.setIsLoading(true)
        setTimeout(() => {
            dispatch({ type: 'SET_EMAIL_REGISTRATION_EMAIL', payload: email })
            if (campaignCode) {
                // キャンペーンコード処理
            }
            dispatch({ type: 'SET_EMAIL_REGISTRATION_STEP', payload: "complete" })
            auth.setIsLoading(false)
        }, 1500)
    }, [auth, dispatch])

    const handleEmailRegistrationBackToLogin = useCallback(() => {
        dispatch({ type: 'RESET_LOGIN_STATE' })
        navigation.navigateToView("login")
        dispatch({ type: 'SET_EMAIL_REGISTRATION_STEP', payload: "form" })
        dispatch({ type: 'SET_EMAIL_REGISTRATION_EMAIL', payload: "" })
    }, [navigation, dispatch])

    const handleEmailRegistrationResend = useCallback(() => {
        dispatch({ type: 'SET_EMAIL_REGISTRATION_STEP', payload: "form" })
    }, [dispatch])

    const handleSignupSubmit = useCallback((data: Record<string, string>) => {
        // RegisterFormのデータ構造に合わせて変換
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
        // 登録完了後はマイページに遷移
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

    const handleMenuItemClick = useCallback((itemId: string) => {
        switch (itemId) {
            case "terms":
                break
            case "privacy":
                break
            case "commercial-law":
                break
            case "contact":
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

    const handleFavoriteToggle = useCallback((storeId: string) => {
        dispatch({ type: 'TOGGLE_FAVORITE', payload: storeId })
    }, [dispatch])

    const handleCouponsClick = useCallback((storeId: string) => {
        const store = state.stores.find((s) => s.id === storeId)
        if (store) {
            dispatch({ type: 'SET_SELECTED_STORE', payload: store })
            dispatch({ type: 'SET_COUPON_LIST_OPEN', payload: true })
        }
    }, [state.stores, dispatch])

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

    const handleViewPlan = useCallback(() => {
        navigation.navigateToMyPage("plan-management")
    }, [navigation])

    const handleChangePlan = useCallback(() => {
        navigation.navigateToMyPage("plan-change")
    }, [navigation])

    const handlePlanChangeSubmit = useCallback(async (planId: string) => {
        auth.setIsLoading(true)
        setTimeout(() => {
            const planMap: Record<string, { name: string; price: number; description: string }> = {
                "3days": {
                    name: "3daysプラン",
                    price: 300,
                    description: "短期間でTAMAYOIを体験できるお試しプラン",
                },
                monthly: {
                    name: "マンスリープラン",
                    price: 980,
                    description: "毎日お得にお酒を楽しめる定番プラン",
                },
                premium: {
                    name: "プレミアムプラン",
                    price: 1980,
                    description: "より充実したサービスを楽しめる上位プラン",
                },
            }

            const newPlanData = planMap[planId]
            if (newPlanData && auth.plan) {
                // プラン変更処理
            }

            navigation.navigateToMyPage("main")
            auth.setIsLoading(false)
        }, 1500)
    }, [auth, navigation])

    const handlePlanChangeBack = useCallback(() => {
        navigation.navigateToMyPage("main")
    }, [navigation])

    const handleViewUsageHistory = useCallback(() => {
        navigation.navigateToMyPage("usage-history")
    }, [navigation])

    const handleViewPaymentHistory = useCallback(() => {
        navigation.navigateToMyPage("payment-history")
    }, [navigation])

    const handleCancelSubscription = useCallback(() => {
        // サブスクリプションキャンセル処理
    }, [])

    const handleWithdraw = useCallback(() => {
        navigation.navigateToMyPage("withdrawal")
    }, [navigation])

    const handleWithdrawConfirm = useCallback(() => {
        navigation.navigateToMyPage("withdrawal-complete")
    }, [navigation])

    const handleWithdrawCancel = useCallback(() => {
        navigation.navigateToMyPage("profile-edit")
    }, [navigation])

    const handleWithdrawComplete = useCallback(() => {
        auth.logout()
        navigation.resetNavigation()
    }, [auth, navigation])

    const handleLogout = useCallback(() => {
        auth.logout()
        navigation.resetNavigation()
    }, [auth, navigation])

    const handleShowStoreOnHome = useCallback(() => {
        navigation.navigateToView("home", "home")
        navigation.navigateToMyPage("main")
    }, [navigation])

    const handleUseSameCoupon = useCallback(() => {
        if (!auth.isAuthenticated) {
            dispatch({ type: 'SET_LOGIN_REQUIRED_MODAL_OPEN', payload: true })
            return
        }
    }, [auth.isAuthenticated, dispatch])

    const handleLogoClick = useCallback(() => {
        navigation.resetNavigation()
    }, [navigation])

    const handleCouponListClose = useCallback(() => {
        dispatch({ type: 'SET_COUPON_LIST_OPEN', payload: false })
        dispatch({ type: 'SET_SELECTED_STORE', payload: null })
    }, [dispatch])

    const handleCouponListBack = useCallback(() => {
        dispatch({ type: 'SET_COUPON_LIST_OPEN', payload: false })
        dispatch({ type: 'SET_SELECTED_STORE', payload: null })
    }, [dispatch])

    const handleUseCoupon = useCallback((couponId: string) => {
        if (!auth.isAuthenticated) {
            dispatch({ type: 'SET_LOGIN_REQUIRED_MODAL_OPEN', payload: true })
            return
        }

        // 動的インポートでクーポンデータを取得
        import("../data/mock-coupons").then(({ mockCoupons }) => {
            const storeCoupons = state.selectedStore ? mockCoupons[state.selectedStore.id] || [] : []
            const coupon = storeCoupons.find((c) => c.id === couponId)
            if (coupon) {
                dispatch({ type: 'SET_SELECTED_COUPON', payload: coupon })
                navigation.navigateToView("coupon-confirmation")
                dispatch({ type: 'SET_COUPON_LIST_OPEN', payload: false })
            }
        })
    }, [auth.isAuthenticated, state.selectedStore, navigation, dispatch])

    const handleConfirmCoupon = useCallback(() => {
        dispatch({ type: 'SET_SUCCESS_MODAL_OPEN', payload: true })
        navigation.navigateToView("home")
    }, [navigation, dispatch])

    const handleSuccessModalClose = useCallback(() => {
        dispatch({ type: 'SET_SUCCESS_MODAL_OPEN', payload: false })
        dispatch({ type: 'SET_SELECTED_COUPON', payload: null })
        dispatch({ type: 'SET_SELECTED_STORE', payload: null })
    }, [dispatch])

    const handleLoginRequiredModalClose = useCallback(() => {
        dispatch({ type: 'SET_LOGIN_REQUIRED_MODAL_OPEN', payload: false })
    }, [dispatch])

    const handleLoginRequiredModalLogin = useCallback(() => {
        dispatch({ type: 'SET_LOGIN_REQUIRED_MODAL_OPEN', payload: false })
        dispatch({ type: 'RESET_LOGIN_STATE' })
        navigation.navigateToView("login")
    }, [navigation, dispatch])

    const handleCancelCoupon = useCallback(() => {
        navigation.navigateToView("home")
        dispatch({ type: 'SET_COUPON_LIST_OPEN', payload: true })
        dispatch({ type: 'SET_SELECTED_COUPON', payload: null })
    }, [navigation, dispatch])

    const handleUsageGuideClick = useCallback(() => {
        navigation.navigateToView("usage-guide")
    }, [navigation])

    const handleUsageGuideBack = useCallback(() => {
        navigation.navigateToView("coupon-confirmation")
    }, [navigation])

    const handleStoreClick = useCallback((store: Store) => {
        dispatch({ type: 'SET_SELECTED_STORE', payload: store })
        dispatch({ type: 'SET_STORE_DETAIL_POPUP_OPEN', payload: true })
    }, [dispatch])

    const handleStoreDetailPopupClose = useCallback(() => {
        dispatch({ type: 'SET_STORE_DETAIL_POPUP_OPEN', payload: false })
        dispatch({ type: 'SET_SELECTED_STORE', payload: null })
    }, [dispatch])

    const handleProfileEditSubmit = useCallback(async () => {
        auth.setIsLoading(true)
        setTimeout(() => {
            // プロフィール更新処理
            auth.setIsLoading(false)
        }, 1500)
    }, [auth])

    const handleEmailChangeSubmit = useCallback(async (data: { currentPassword: string; newEmail: string; confirmEmail: string }) => {
        auth.setIsLoading(true)

        try {
            // 開発環境での認証バイパス機能
            const isDevelopment = process.env.NODE_ENV === 'development';
            const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';

            let headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };

            if (isDevelopment && bypassAuth) {
                // 開発環境で認証バイパスが有効な場合、ダミートークンを使用
                headers['Authorization'] = 'Bearer dev-bypass-token';
            } else {
                // 本番環境または認証バイパスが無効な場合、通常の認証処理
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    throw new Error('認証トークンが見つかりません。再度ログインしてください。');
                }
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch('/api/auth/email/change', {
                method: 'POST',
                headers,
                body: JSON.stringify(data),
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error?.message || 'メールアドレス変更に失敗しました')
            }

            // 成功時
            dispatch({ type: 'SET_NEW_EMAIL', payload: data.newEmail })
            dispatch({ type: 'SET_EMAIL_CHANGE_STEP', payload: "complete" })
        } catch (error) {
            // エラーを表示するための状態管理が必要
            // TODO: エラー状態を管理する仕組みを追加
            const errorMessage = error instanceof Error ? error.message : 'メールアドレス変更に失敗しました'
            console.error('Email change error:', errorMessage)
        } finally {
            auth.setIsLoading(false)
        }
    }, [auth, dispatch])

    const handleEmailChangeResend = useCallback(() => {
        dispatch({ type: 'SET_EMAIL_CHANGE_STEP', payload: "form" })
    }, [dispatch])

    const handlePasswordChangeSubmit = useCallback(async (currentPassword: string, newPassword: string) => {
        auth.setIsLoading(true)
        // エラー状態をクリア
        dispatch({ type: 'SET_PASSWORD_CHANGE_ERROR', payload: null })
        try {
            // 開発環境での認証バイパス機能
            const isDevelopment = process.env.NODE_ENV === 'development';
            const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';

            let headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };

            if (isDevelopment && bypassAuth) {
                // 開発環境で認証バイパスが有効な場合、ダミートークンを使用
                headers['Authorization'] = 'Bearer dev-bypass-token';
            } else {
                // 本番環境または認証バイパスが無効な場合、通常の認証処理
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    throw new Error('認証トークンが見つかりません。再度ログインしてください。');
                }
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch('/api/auth/password/change', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    currentPassword,
                    newPassword
                }),
            })
            const result = await response.json()
            if (!response.ok) {
                throw new Error(result.error?.message || 'パスワード変更に失敗しました')
            }

            // 成功時：変更完了画面を表示
            dispatch({ type: 'SET_PASSWORD_CHANGE_STEP', payload: "complete" })
        } catch (error) {
            // エラー状態を設定
            const errorMessage = error instanceof Error ? error.message : 'パスワード変更に失敗しました'
            dispatch({ type: 'SET_PASSWORD_CHANGE_ERROR', payload: errorMessage })
        } finally {
            auth.setIsLoading(false)
        }
    }, [auth, dispatch])

    const handlePasswordChangeComplete = useCallback(() => {
        console.log("🔧 handlePasswordChangeComplete: 開始")

        // ログアウト処理
        console.log("🔧 handlePasswordChangeComplete: ログアウト処理実行")
        auth.logout()

        // パスワード変更ステップをリセット
        console.log("🔧 handlePasswordChangeComplete: パスワード変更ステップをリセット")
        dispatch({ type: 'SET_PASSWORD_CHANGE_STEP', payload: "form" })

        // ログイン状態をリセット（パスワード入力画面に戻す）
        console.log("🔧 handlePasswordChangeComplete: ログイン状態をリセット")
        dispatch({ type: 'RESET_LOGIN_STATE' })

        // ログイン画面に遷移
        console.log("🔧 handlePasswordChangeComplete: ログイン画面に遷移")
        navigation.navigateToView("login", "map")

        console.log("🔧 handlePasswordChangeComplete: 完了")
    }, [auth, navigation, dispatch])

    return {
        handleCurrentLocationClick,
        handleTabChange,
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
        handleMenuItemClick,
        handleFavoritesClick,
        handleHistoryClick,
        handleFavoritesClose,
        handleHistoryClose,
        handleNotificationClick,
        handleNotificationItemClick,
        handleMarkAllNotificationsRead,
        handleFavoriteToggle,
        handleCouponsClick,
        handleEditProfile,
        handleChangeEmail,
        handleChangePassword,
        handleViewPlan,
        handleChangePlan,
        handlePlanChangeSubmit,
        handlePlanChangeBack,
        handleViewUsageHistory,
        handleViewPaymentHistory,
        handleCancelSubscription,
        handleWithdraw,
        handleWithdrawConfirm,
        handleWithdrawCancel,
        handleWithdrawComplete,
        handleLogout,
        handleShowStoreOnHome,
        handleUseSameCoupon,
        handleLogoClick,
        handleCouponListClose,
        handleCouponListBack,
        handleUseCoupon,
        handleConfirmCoupon,
        handleSuccessModalClose,
        handleLoginRequiredModalClose,
        handleLoginRequiredModalLogin,
        handleCancelCoupon,
        handleUsageGuideClick,
        handleUsageGuideBack,
        handleStoreClick,
        handleStoreDetailPopupClose,
        handleProfileEditSubmit,
        handleEmailChangeSubmit,
        handleEmailChangeResend,
        handlePasswordChangeSubmit,
        handlePasswordChangeComplete,
    }
}
