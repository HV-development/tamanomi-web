"use client"

import React, { useCallback, useState } from "react"
import type { AppAction, AppState, AppHandlers, Store } from '@hv-development/schemas'
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
        // dispatch is intentionally omitted as it's a stable function from useReducer
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
        } catch {
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

            // プラン登録状況を確認してauth状態を更新
            let hasPlan = false
            try {
                const userResponse = await fetch('/api/user/me', {
                    headers: {
                        'Authorization': `Bearer ${data.accessToken}`,
                    },
                })

                if (userResponse.ok) {
                    const userData = await userResponse.json()
                    hasPlan = userData.plan !== null && userData.plan !== undefined
                    
                    // auth状態を更新
                    auth.login(userData, userData.plan, [], [])
                }
            } catch {
                // エラー処理
            }

        // メールアドレス変更成功モーダルが表示されている場合は遷移を停止
        // @ts-expect-error - isEmailChangeSuccessModalOpen is not yet in the type definition
        if (state.isEmailChangeSuccessModalOpen) {
            dispatch({ type: 'RESET_LOGIN_STATE' })
            return
        }

            // プラン登録状況によって遷移先を変更
            if (!hasPlan) {
                // プラン未登録の場合はプラン登録画面へ（独立したページ）
                router.push('/plan-registration')
            } else {
                // プラン登録済みの場合はマイページへ直接遷移
                navigation.navigateToView("mypage", "mypage")
                navigation.navigateToMyPage("main")
            }

            dispatch({ type: 'RESET_LOGIN_STATE' })
        } catch {
            // エラーはステート管理システムで処理する必要があります
            // TODO: エラーステートの追加
        } finally {
            auth.setIsLoading(false)
        }
    }, [auth, otpRequestId, router, dispatch, navigation, state])

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
        // OTP画面からパスワード入力画面に戻る
        dispatch({ type: 'SET_LOGIN_STEP', payload: 'password' })
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
        } catch {
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

    const handlePlanChangeSubmit = useCallback(async (planId: string, alsoChangePaymentMethod?: boolean) => {
        try {
            auth.setIsLoading(true)
            
            // アクセストークンを取得
            const accessToken = localStorage.getItem('accessToken')
            if (!accessToken) {
                throw new Error('認証情報が見つかりません。ログインしてください。')
            }

            // プラン変更APIを呼び出し
            const response = await fetch('/api/user-plans/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    planId: planId,
                }),
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.message || 'プラン変更に失敗しました')
            }

            await response.json()

            // プラン変更後、新しいユーザー情報を取得してauth状態を更新
            try {
                const userResponse = await fetch('/api/user/me', {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                    },
                })

                if (userResponse.ok) {
                    const updatedUserData = await userResponse.json()
                    
                    // auth状態を更新
                    auth.login(updatedUserData, updatedUserData.plan, updatedUserData.usageHistory || [], updatedUserData.paymentHistory || [])
                }
            } catch {
                // プラン変更は成功しているので、エラーでも続行
            }

            // 支払い方法も変更する場合は、支払い方法変更画面へ遷移
            if (alsoChangePaymentMethod) {
                if (typeof window !== 'undefined') {
                    window.location.href = '/payment-method-change?from=plan-change'
                }
            } else {
                // 成功時はマイページに戻る
                navigation.navigateToMyPage("main")
            }
            
        } catch {
            // エラー時もマイページに戻る（エラーメッセージは別途表示）
            navigation.navigateToMyPage("main")
        } finally {
            auth.setIsLoading(false)
        }
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
        // まず認証状態をクリア
        auth.logout()
        navigation.resetNavigation()
        
        // 即座にログイン画面に遷移（home画面を表示しない）
        if (typeof window !== 'undefined') {
            window.location.href = '/'
        }
    }, [auth, navigation])

    const handleLogout = useCallback(() => {
        // まず認証状態をクリア
        auth.logout()
        navigation.resetNavigation()
        
        // 即座にログイン画面に遷移（home画面を表示しない）
        if (typeof window !== 'undefined') {
            window.location.href = '/'
        }
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

    const handleProfileEditSubmit = useCallback(async (data: Record<string, string>) => {
        auth.setIsLoading(true)
        
        try {
            // 開発環境での認証バイパス機能
            const isDevelopment = process.env.NODE_ENV === 'development'
            const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true'

            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            }

            if (isDevelopment && bypassAuth) {
                headers['Authorization'] = 'Bearer dev-bypass-token'
            } else {
                const token = localStorage.getItem('accessToken')
                if (!token) {
                    throw new Error('認証トークンが見つかりません。再度ログインしてください。')
                }
                headers['Authorization'] = `Bearer ${token}`
            }

            // saitamaAppIdは別テーブル管理のため、更新データから除外
            // 日付フォーマットをISO形式に変換 (yyyy/MM/dd → yyyy-MM-dd)
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
                // トークン期限切れの場合（401エラー）
                if (response.status === 401 || response.status === 403) {
                    dispatch({ type: 'SET_LOGIN_REQUIRED_MODAL_OPEN', payload: true })
                    auth.setIsLoading(false)
                    return
                }

                throw new Error(result.message || 'プロフィールの更新に失敗しました')
            }
            
            // 成功時はユーザー情報を再取得
            try {
                const token = localStorage.getItem('accessToken')
                if (token) {
                    const userResponse = await fetch('/api/user/me', {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                        cache: 'no-store',
                    })
                    
                    if (userResponse.ok) {
                        const userData = await userResponse.json()
                        // authの状態を更新
                        auth.login(userData, userData.plan, [], [])
                    }
                }
            } catch {
                // エラー処理
            }
            
            // マイページに戻る
            navigation.navigateToView("mypage", "mypage")
            navigation.navigateToMyPage("main")
            
            auth.setIsLoading(false)
        } catch (error) {
            auth.setIsLoading(false)
            // エラー表示（必要に応じてトーストやモーダルで通知）
            alert(error instanceof Error ? error.message : 'プロフィールの更新に失敗しました')
        }
    }, [auth, dispatch, navigation])

    const handleEmailChangeSubmit = useCallback(async (data: { currentPassword: string; newEmail: string; confirmEmail: string }) => {
        auth.setIsLoading(true)

        try {
            // 開発環境での認証バイパス機能
            const isDevelopment = process.env.NODE_ENV === 'development';
            const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';

            const headers: Record<string, string> = {
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
                body: JSON.stringify({
                    currentPassword: data.currentPassword,
                    newEmail: data.newEmail,
                    confirmEmail: data.confirmEmail,
                }),
            })

            const result = await response.json()

            if (!response.ok) {
                // トークン期限切れの場合（403エラー）
                if (response.status === 403) {
                    // トークンをクリア
                    localStorage.removeItem('accessToken')
                    localStorage.removeItem('refreshToken')
                    // ログアウト
                    auth.logout()
                    // ルートURL（ログイン画面）に遷移
                    router.push('/')
                    throw new Error('セッションの有効期限が切れました。再度ログインしてください。')
                }
                throw new Error(result.error?.message || 'メールアドレス変更に失敗しました')
            }

            // 成功時
            // まず成功状態を設定（モーダル表示用）
            dispatch({ type: 'SET_NEW_EMAIL', payload: data.newEmail })
            dispatch({ type: 'SET_EMAIL_CHANGE_STEP', payload: "complete" })
            // @ts-expect-error - SET_EMAIL_CHANGE_SUCCESS_MODAL_OPEN is not yet in the type definition
            dispatch({ type: 'SET_EMAIL_CHANGE_SUCCESS_MODAL_OPEN', payload: true })
            
            // 少し待ってからログアウト処理を実行（モーダルが表示されるまで待つ）
            setTimeout(() => {
                auth.logout()
            }, 100)
        } catch (error) {
            // エラーを表示するための状態管理が必要
            // TODO: エラー状態を管理する仕組みを追加
            const errorMessage = error instanceof Error ? error.message : 'メールアドレス変更に失敗しました'
            // エラーメッセージをユーザーに表示する（TODO: UI実装）
            alert(errorMessage)
        } finally {
            auth.setIsLoading(false)
        }
    }, [auth, dispatch, router])

    const handleEmailChangeResend = useCallback(() => {
        dispatch({ type: 'SET_EMAIL_CHANGE_STEP', payload: "form" })
    }, [dispatch])

    const handleEmailChangeSuccessModalClose = useCallback(() => {
        // @ts-expect-error - SET_EMAIL_CHANGE_SUCCESS_MODAL_OPEN is not yet in the type definition
        dispatch({ type: 'SET_EMAIL_CHANGE_SUCCESS_MODAL_OPEN', payload: false })
        
        // 確実にトークンを削除
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        sessionStorage.clear()
        
        // ログイン状態をリセット
        dispatch({ type: 'RESET_LOGIN_STATE' })
        
        // authのログアウトも実行
        auth.logout()
        
        // ブラウザのタブを閉じる
        window.close()
        
        // window.close()が失敗する場合（ユーザーが開いたタブでない場合）は、ログイン画面に遷移
        // タブが閉じられた場合、以下のコードは実行されない
        setTimeout(() => {
            router.push('/?skip-auth-check=true')
        }, 100)
    }, [dispatch, router, auth])

    const handlePasswordChangeSubmit = useCallback(async (currentPassword: string, newPassword: string) => {
        auth.setIsLoading(true)
        // エラー状態をクリア
        dispatch({ type: 'SET_PASSWORD_CHANGE_ERROR', payload: null })
        try {
            // 開発環境での認証バイパス機能
            const isDevelopment = process.env.NODE_ENV === 'development';
            const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';

            const headers: Record<string, string> = {
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
                // トークン期限切れの場合（403エラー）
                if (response.status === 403) {
                    // トークンをクリア
                    localStorage.removeItem('accessToken')
                    localStorage.removeItem('refreshToken')
                    // ログアウト
                    auth.logout()
                    // ルートURL（ログイン画面）に遷移
                    router.push('/')
                    throw new Error('セッションの有効期限が切れました。再度ログインしてください。')
                }
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
    }, [auth, dispatch, router])

    const handlePasswordChangeComplete = useCallback(() => {
        // ログアウト処理
        auth.logout()

        // パスワード変更ステップをリセット
        dispatch({ type: 'SET_PASSWORD_CHANGE_STEP', payload: "form" })

        // ログイン状態をリセット（パスワード入力画面に戻す）
        dispatch({ type: 'RESET_LOGIN_STATE' })

        // ルートURL（ログイン画面）に遷移
        router.push('/')
    }, [auth, dispatch, router])

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
        handleProfileEditSubmit: handleProfileEditSubmit as AppHandlers['handleProfileEditSubmit'],
        handleEmailChangeSubmit,
        handleEmailChangeResend,
        handleEmailChangeSuccessModalClose,
        handlePasswordChangeSubmit,
        handlePasswordChangeComplete,
    } as AppHandlers & { handleEmailChangeSuccessModalClose: () => void }
}
