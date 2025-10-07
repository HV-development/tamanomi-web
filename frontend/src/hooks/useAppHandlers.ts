"use client"

import React, { useCallback } from "react"
import type { AppAction, AppState, AppHandlers } from '@hv-development/schemas'
import type { Store } from "@/types/store"
import { appConfig } from '@/config/appConfig'

// ハンドラー作成フック
export const useAppHandlers = (
    dispatch: React.Dispatch<AppAction>,
    auth: any,
    navigation: any,
    filters: any,
    router: any,
    state: AppState
): AppHandlers => {

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

    const handleLogin = useCallback(async (email: string, otp: string) => {
        auth.setIsLoading(true)

        if (otp === "") {
            // ワンタイムパスワード送信処理

            setTimeout(() => {
                dispatch({ type: 'SET_LOGIN_EMAIL', payload: email })
                dispatch({ type: 'SET_LOGIN_STEP', payload: "otp" })
                auth.setIsLoading(false)
            }, 1500)
        } else {
            setTimeout(async () => {
                try {
                    const { mockUser, mockPlan, mockUsageHistory, mockPaymentHistory } = await import("../data/mock-user")

                    auth.login({
                        ...mockUser,
                        contractStartDate: new Date("2019-01-01")
                    }, mockPlan, mockUsageHistory, mockPaymentHistory)

                    // ログイン成功後はマイページに遷移
                    navigation.navigateToView("mypage", "mypage")
                    navigation.navigateToMyPage("main")

                    dispatch({ type: 'RESET_LOGIN_STATE' })
                    auth.setIsLoading(false)
                } catch (error) {
                    auth.setIsLoading(false)
                    // エラーが発生した場合はデフォルトのユーザーデータを使用
                    const defaultUser = {
                        id: "user-1",
                        email: email,
                        nickname: "テストユーザー",
                        postalCode: "330-0854",
                        address: "埼玉県さいたま市大宮区桜木町1-7-5",
                        birthDate: "1990-05-15",
                        gender: "male",
                        createdAt: new Date("2024-01-01"),
                        contractStartDate: new Date("2019-01-01"),
                        registeredStore: "さいたま酒場 大宮店",
                    }

                    auth.login(defaultUser, null, [], [])
                    navigation.navigateToView("mypage", "mypage")
                    navigation.navigateToMyPage("main")
                    dispatch({ type: 'RESET_LOGIN_STATE' })
                }
            }, 1500)
        }
    }, [auth, navigation, dispatch])

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

    const handleResendOtp = useCallback(() => {
        auth.setIsLoading(true)
        setTimeout(() => {
            auth.setIsLoading(false)
        }, 1500)
    }, [auth])

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
        navigation.navigateToView("login")
        dispatch({ type: 'SET_EMAIL_REGISTRATION_STEP', payload: "form" })
        dispatch({ type: 'SET_EMAIL_REGISTRATION_EMAIL', payload: "" })
    }, [navigation, dispatch])

    const handleEmailRegistrationResend = useCallback(() => {
        dispatch({ type: 'SET_EMAIL_REGISTRATION_STEP', payload: "form" })
    }, [dispatch])

    const handleSignupSubmit = useCallback((data: any) => {
        dispatch({ type: 'SET_SIGNUP_DATA', payload: data })
        navigation.navigateToView("confirmation")
    }, [navigation, dispatch])

    const handleSignupCancel = useCallback(() => {
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

    const handleSubscribe = useCallback(async (planId: string) => {
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

    const handleShowStoreOnHome = useCallback((storeId: string) => {
        navigation.navigateToView("home", "home")
        navigation.navigateToMyPage("main")
    }, [navigation])

    const handleUseSameCoupon = useCallback((couponId: string) => {
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

    const handleProfileEditSubmit = useCallback(async (data: any) => {
        auth.setIsLoading(true)
        setTimeout(() => {
            // プロフィール更新処理
            auth.setIsLoading(false)
        }, 1500)
    }, [auth])

    const handleEmailChangeSubmit = useCallback(async (currentPassword: string, newEmail: string) => {
        auth.setIsLoading(true)
        setTimeout(() => {
            dispatch({ type: 'SET_NEW_EMAIL', payload: newEmail })
            dispatch({ type: 'SET_EMAIL_CHANGE_STEP', payload: "complete" })
            auth.setIsLoading(false)
        }, 1500)
    }, [auth, dispatch])

    const handleEmailChangeResend = useCallback(() => {
        dispatch({ type: 'SET_EMAIL_CHANGE_STEP', payload: "form" })
    }, [dispatch])

    const handlePasswordChangeSubmit = useCallback(async (currentPassword: string, newPassword: string) => {
        auth.setIsLoading(true)

        setTimeout(() => {
            auth.logout()
            navigation.navigateToView("login", "map")
            navigation.navigateToMyPage("main")
            dispatch({ type: 'SET_PASSWORD_CHANGE_STEP', payload: "form" })
            auth.setIsLoading(false)
        }, 1500)
    }, [auth, navigation, dispatch])

    const handlePasswordChangeComplete = useCallback(() => {
        auth.logout()
        navigation.navigateToView("login", "map")
        navigation.navigateToMyPage("main")
        dispatch({ type: 'SET_PASSWORD_CHANGE_STEP', payload: "form" })
    }, [auth, navigation, dispatch])

    return {
        handleCurrentLocationClick,
        handleTabChange,
        handleLogin,
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
