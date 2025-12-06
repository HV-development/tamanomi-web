"use client"

import React, { useCallback, useState, useRef, useEffect } from "react"
import type { AppAction, AppState, AppHandlers, Store } from '@hv-development/schemas'
import { appConfig } from '@/config/appConfig'
import type { useAuth } from './useAuth'
import type { useNavigation } from './useNavigation'
import type { useFilters } from './useFilters'
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { getCurrentPosition } from '@/utils/location'
import { toast } from 'sonner'

// ハンドラー作成フック
export const useAppHandlers = (
    dispatch: React.Dispatch<AppAction>,
    auth: ReturnType<typeof useAuth>,
    navigation: ReturnType<typeof useNavigation>,
    filters: ReturnType<typeof useFilters>,
    router: AppRouterInstance,
    state: AppState
): AppHandlers => {
    // useRefを使用して最新のstateを保持
    const latestState = useRef(state)

    // stateが変更されるたびにrefを更新
    useEffect(() => {
        latestState.current = state
    }, [state])

    // OTP requestIdを管理するローカルstate
    const [otpRequestId, setOtpRequestId] = useState<string>("")

    const handleCurrentLocationClick = useCallback(async () => {
        const newFilterState = !filters.isNearbyFilter
        filters.setIsNearbyFilter(newFilterState)

        if (newFilterState) {
            // フィルターをONにする場合、位置情報を取得
            dispatch({ type: 'SET_LOCATION_LOADING', payload: true })
            dispatch({ type: 'SET_LOCATION_ERROR', payload: null })

            try {
                const location = await getCurrentPosition()
                dispatch({ type: 'SET_CURRENT_LOCATION', payload: location })
                dispatch({ type: 'SET_LOCATION_ERROR', payload: null })
            } catch (error) {
                // 位置情報取得に失敗した場合
                const errorMessage = error instanceof Error ? error.message : '位置情報の取得に失敗しました'
                dispatch({ type: 'SET_LOCATION_ERROR', payload: errorMessage })
                dispatch({ type: 'SET_CURRENT_LOCATION', payload: null })
                // エラーをユーザーに通知（後で実装）
                alert(errorMessage)
            } finally {
                dispatch({ type: 'SET_LOCATION_LOADING', payload: false })
            }
        } else {
            // フィルターをOFFにする場合、位置情報をクリア
            dispatch({ type: 'SET_CURRENT_LOCATION', payload: null })
            dispatch({ type: 'SET_LOCATION_ERROR', payload: null })
        }
    }, [filters, dispatch])

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
        // エラーメッセージをクリア（空文字列に設定）
        dispatch({ type: 'SET_LOGIN_ERROR', payload: "" })

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
        } catch (error) {
            // エラーメッセージをステートに設定
            const errorMessage = error instanceof Error ? error.message : 'ログインに失敗しました'
            dispatch({ type: 'SET_LOGIN_ERROR', payload: errorMessage })
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

            // ログイン成功 - トークンはCookieに保存されているため、プラン登録状況を確認してauth状態を更新
            let hasPlan = false
            try {
                const userResponse = await fetch('/api/user/me')

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
            if (state.isEmailChangeSuccessModalOpen) {
                dispatch({ type: 'RESET_LOGIN_STATE' })
                return
            }

            // プラン登録状況によって遷移先を変更（router.replaceでブラウザ履歴を置き換えて、ログイン画面を経由しないようにする）
            let targetPath: string
            if (!hasPlan) {
                // プラン未登録の場合はプラン登録画面へ（独立したページ）
                targetPath = '/plan-registration'
            } else {
                // プラン登録済みの場合はhome画面へ遷移
                targetPath = '/home'
            }

            // ローディング継続フラグをセッションストレージに設定
            // 遷移先のページで完全に表示されたらクリアされる
            if (typeof window !== 'undefined') {
                sessionStorage.setItem('loginRedirecting', targetPath)
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
        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
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

    const handleFavoriteToggle = useCallback(async (storeId: string) => {
        // 現在の状態を確認（UIの状態ではなく、データの状態を確認）
        const currentStore = state.stores.find((s: { id: string; isFavorite?: boolean }) => s.id === storeId)
        const currentIsFavorite = currentStore?.isFavorite ?? false

        // 未認証の場合はセッションストレージに保存（モーダルは表示しない）
        if (!auth.isAuthenticated) {
            try {
                // セッションストレージの状態も確認
                const { isFavoriteInStorage, addFavoriteToStorage, removeFavoriteFromStorage } = await import('@/lib/favorites-storage')
                const storageIsFavorite = isFavoriteInStorage(storeId)

                // 現在の状態の逆にする（登録されている場合は削除、削除されている場合は登録）
                if (storageIsFavorite) {
                    removeFavoriteFromStorage(storeId)
                } else {
                    addFavoriteToStorage(storeId)
                }

                // UIを更新（現在の状態の逆にする）
                dispatch({ type: 'TOGGLE_FAVORITE', payload: storeId })
            } catch (error) {
                console.error('セッションストレージへの保存エラー:', error)
            }
            return
        }

        // 認証済みの場合は楽観的更新：UIを先に更新
        dispatch({ type: 'TOGGLE_FAVORITE', payload: storeId })

        // 認証済みの場合はAPI呼び出し
        try {
            // API呼び出し
            let response: Response
            let data: { isFavorite?: boolean; error?: { message?: string }; message?: string }
            try {
                response = await fetch(`/api/favorites/${storeId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({}),
                    credentials: 'include', // Cookieを送信
                })

                data = await response.json()

                if (!response.ok) {
                    // トークン期限切れの場合（401/403エラー）- セッションストレージに保存
                    if (response.status === 401 || response.status === 403) {
                        // ログアウト（Cookieはサーバーサイドでクリアされる）
                        auth.logout()

                        // セッションストレージにお気に入りを保存
                        // 楽観的更新で既にUIが反転しているが、元の状態（currentIsFavorite）の逆に保存する
                        try {
                            const { addFavoriteToStorage, removeFavoriteFromStorage } = await import('@/lib/favorites-storage')
                            // 元の状態の逆にする（登録されていた場合は削除、削除されていた場合は登録）
                            if (currentIsFavorite) {
                                removeFavoriteFromStorage(storeId)
                            } else {
                                addFavoriteToStorage(storeId)
                            }
                        } catch (storageError) {
                            console.error('セッションストレージへの保存エラー:', storageError)
                        }

                        // UIは既に楽観的更新で更新済みなので、そのまま維持
                        // 403エラーは正常処理なので、エラーとして扱わない（早期リターン）
                        return
                    }

                    // その他のエラー時はロールバック（再度トグル）
                    dispatch({ type: 'TOGGLE_FAVORITE', payload: storeId })
                    throw new Error(data.error?.message || data.message || 'お気に入りの登録/削除に失敗しました')
                }
            } catch {
                // ネットワークエラーなどの場合は、トークン期限切れの可能性があるのでセッションストレージに保存
                // ログアウト（Cookieはサーバーサイドでクリアされる）
                auth.logout()

                // セッションストレージにお気に入りを保存
                // 楽観的更新で既にUIが反転しているが、元の状態（currentIsFavorite）の逆に保存する
                try {
                    const { addFavoriteToStorage, removeFavoriteFromStorage } = await import('@/lib/favorites-storage')
                    // 元の状態の逆にする（登録されていた場合は削除、削除されていた場合は登録）
                    if (currentIsFavorite) {
                        removeFavoriteFromStorage(storeId)
                    } else {
                        addFavoriteToStorage(storeId)
                    }
                } catch (storageError) {
                    console.error('セッションストレージへの保存エラー:', storageError)
                }

                // UIは既に楽観的更新で更新済みなので、そのまま維持
                // fetchErrorは無視（早期リターン）
                return
            }

            // APIから返された状態を反映
            // 楽観的更新で既にUIをトグルしているが、APIの結果が期待と異なる場合は調整
            if (data.isFavorite !== undefined) {
                const currentStore = state.stores.find((s: { id: string; isFavorite?: boolean }) => s.id === storeId)
                const currentUIState = currentStore?.isFavorite ?? false

                // 楽観的更新後の状態（元の状態の逆）とAPIの結果を比較
                // 元の状態（currentIsFavorite）の逆が期待値
                const expectedState = !currentIsFavorite

                // APIの結果が期待値と異なる場合は調整（通常は一致するはず）
                if (data.isFavorite !== expectedState) {
                    // APIの結果が正しいので、UIをAPIの結果に合わせる
                    if (currentUIState !== data.isFavorite) {
                        dispatch({ type: 'TOGGLE_FAVORITE', payload: storeId })
                    }
                }
            }
        } catch (error) {
            // トークン期限切れエラー（403など）は既に処理済みなので、ここでは処理しない
            // その他のエラーのみ処理
            const errorMessage = error instanceof Error ? error.message : 'お気に入りの登録/削除に失敗しました'

            // 認証関連のエラーは既に処理済みなので、エラーログを出力しない
            if (errorMessage.includes('無効なトークン') || errorMessage.includes('認証')) {
                return
            }

            // その他のエラー時はロールバック（再度トグル）
            dispatch({ type: 'TOGGLE_FAVORITE', payload: storeId })
            console.error('お気に入り登録/削除エラー:', errorMessage)

            // TODO: トーストやアラートでエラーを表示
        }
    }, [auth, dispatch, state.stores])

    const handleCouponsClick = useCallback(async (storeId: string) => {
        const store = state.stores.find((s: { id: string }) => s.id === storeId)

        if (store) {
            dispatch({ type: 'SET_SELECTED_STORE', payload: store })
            dispatch({ type: 'SET_COUPON_LIST_OPEN', payload: true })
            // クーポン取得開始時にローディング状態を設定（ローカル状態として管理）
            // 注意: AppStateにisLoadingCouponsを追加する必要があるが、今回は簡易的にstoreCouponsが空の場合はローディング中と判断

            // クーポンを取得
            try {
                const url = `/api/coupons?shopId=${storeId}&status=approved&isPublic=true&limit=100`

                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    cache: 'no-store',
                    credentials: 'include', // Cookieを送信
                })


                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}))
                    console.error('❌ Failed to fetch coupons:', response.status, errorData)
                    dispatch({ type: 'SET_STORE_COUPONS', payload: [] })
                    return
                }

                const data = await response.json()

                if (data.coupons && data.coupons.length > 0) {
                    // APIからのクーポンをfrontend用の形式に変換
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
                        name: coupon.title,
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
            }
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
        // プラン有無に応じて遷移先を分岐
        const hasPlan = auth.plan !== null && auth.plan !== undefined

        if (!hasPlan) {
            // プラン未登録の場合は独立したプラン登録ページへ遷移
            router.push('/plan-registration')
        } else {
            // プラン登録済みの場合は既存のプラン管理画面へ
            navigation.navigateToMyPage("plan-management")
        }
    }, [navigation, router, auth])

    const handleChangePlan = useCallback(() => {
        navigation.navigateToMyPage("plan-change")
    }, [navigation])

    const handlePlanChangeSubmit = useCallback(async (planId: string, alsoChangePaymentMethod?: boolean) => {
        try {
            console.log('🔍 [handlePlanChangeSubmit] プラン変更開始:', {
                planId,
                alsoChangePaymentMethod,
                alsoChangePaymentMethodType: typeof alsoChangePaymentMethod,
            });

            auth.setIsLoading(true)

            const requestBody = {
                planId: planId,
                alsoChangePaymentMethod: alsoChangePaymentMethod || false,
            };
            console.log('🔍 [handlePlanChangeSubmit] APIリクエストbody:', requestBody);

            // プラン変更APIを呼び出し
            const response = await fetch('/api/user-plans/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
                credentials: 'include', // Cookieを送信
            })

            console.log('🔍 [handlePlanChangeSubmit] APIレスポンスstatus:', response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                console.error('❌ [handlePlanChangeSubmit] APIエラー:', errorData);
                throw new Error(errorData.message || 'プラン変更に失敗しました')
            }

            const responseData = await response.json();
            console.log('🔍 [handlePlanChangeSubmit] APIレスポンスdata:', responseData);

            // プラン変更後、新しいユーザー情報を取得してauth状態を更新
            try {
                const userResponse = await fetch('/api/user/me', {
                    credentials: 'include', // Cookieを送信
                })

                if (userResponse.ok) {
                    const updatedUserData = await userResponse.json()

                    // auth状態を更新
                    auth.login(updatedUserData, updatedUserData.plan, updatedUserData.usageHistory || [], updatedUserData.paymentHistory || [])
                }
            } catch (userError) {
                console.error('❌ [handlePlanChangeSubmit] ユーザー情報取得エラー:', userError);
                // プラン変更は成功しているので、エラーでも続行
            }

            // 支払い方法も変更する場合は、支払い方法変更確認画面へ遷移
            console.log('🔍 [handlePlanChangeSubmit] 遷移判定:', {
                alsoChangePaymentMethod,
                alsoChangePaymentMethodValue: alsoChangePaymentMethod,
                isTrue: alsoChangePaymentMethod === true,
                isTruthy: !!alsoChangePaymentMethod,
            });

            if (alsoChangePaymentMethod) {
                console.log('✅ [handlePlanChangeSubmit] 支払い方法変更確認画面へ遷移します');
                if (typeof window !== 'undefined') {
                    // 支払い方法変更確認画面へ遷移（カード登録APIは、確認画面で「カード情報を変更する」ボタンをクリックしたときに呼び出される）
                    // プラン変更時の新しいplanIdをURLパラメータとして渡す
                    window.location.href = `/payment-method-change?from=plan-change&planId=${encodeURIComponent(planId)}`;
                } else {
                    console.warn('⚠️ [handlePlanChangeSubmit] windowが定義されていません');
                }
            } else {
                console.log('ℹ️ [handlePlanChangeSubmit] マイページに戻ります');
                // 成功時はマイページに戻る
                navigation.navigateToMyPage("main")
            }

        } catch (error) {
            console.error('❌ [handlePlanChangeSubmit] エラー発生:', error);
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

    const handleWithdrawConfirm = useCallback(async () => {
        try {
            auth.setIsLoading(true)

            // Cookieベースの認証のみを使用（localStorageは廃止）

            // ユーザー情報とプラン情報を取得
            const user = auth.user
            const plan = auth.plan

            if (!user || !plan) {
                throw new Error('ユーザー情報が見つかりません')
            }

            // プラン情報からrunningIdとnextBillingDateを取得
            // 最新のユーザー情報を取得（planにpaygentRunningIdとnextBillingDateが含まれているか確認）
            // Cookieベースの認証のみを使用（localStorageは廃止）
            const userMeResponse = await fetch('/api/user/me', {
                credentials: 'include', // Cookieを送信
            })

            if (!userMeResponse.ok) {
                throw new Error('ユーザー情報の取得に失敗しました')
            }

            const userData = await userMeResponse.json()

            // デバッグログ

            // userPlanまたはplanからrunningIdを取得（userPlanを優先）
            const runningId = userData.userPlan?.paygentRunningId || userData.plan?.paygentRunningId
            const userPlanId = userData.userPlan?.id

            if (!runningId) {
                if (!userPlanId) {
                    console.error('❌ [handleWithdrawConfirm] userPlanId not found:', {
                        plan: userData.plan,
                        userPlan: userData.userPlan,
                    })
                    throw new Error('退会に必要な契約情報が見つかりません。サポートへお問い合わせください。')
                }

                // PAYGENT未連携（または単発決済）の場合は、ユーザープランを直接削除して退会扱いとする
                const deleteResponse = await fetch(`/api/user-plans/${userPlanId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })

                if (!deleteResponse.ok) {
                    const errorData = await deleteResponse.json().catch(() => ({}))
                    throw new Error(errorData.message || errorData.error?.message || '退会処理に失敗しました')
                }

                navigation.navigateToMyPage("withdrawal-complete")
                return
            }

            // 次回課金日を取得（userPlanまたはplanから、userPlanを優先）
            const nextBillingDate = userData.userPlan?.nextBillingDate || userData.plan?.nextBillingDate || plan.nextBillingDate

            if (!nextBillingDate) {
                throw new Error('次回課金日が見つかりません')
            }

            // 日付をYYYYMMDD形式に変換
            const formatDate = (date: Date | string): string => {
                const d = typeof date === 'string' ? new Date(date) : date
                const year = d.getFullYear()
                const month = String(d.getMonth() + 1).padStart(2, '0')
                const day = String(d.getDate()).padStart(2, '0')
                return `${year}${month}${day}`
            }

            const endScheduled = formatDate(nextBillingDate)

            // 退会処理APIを呼び出し（Paygent継続課金ありの場合）
            const response = await fetch('/api/payment/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    customerId: user.paymentCard?.paygentCustomerId,
                    customerCardId: user.paymentCard?.paygentCustomerCardId,
                    userEmail: user.email,
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

            // 成功時は退会完了画面へ
            navigation.navigateToMyPage("withdrawal-complete")
        } catch (error) {
            console.error('退会処理エラー:', error)
            // エラーメッセージを表示（必要に応じてモーダルなどで表示）
            alert(error instanceof Error ? error.message : '退会処理に失敗しました')
        } finally {
            auth.setIsLoading(false)
        }
    }, [auth, navigation])

    const handleWithdrawCancel = useCallback(() => {
        navigation.navigateToMyPage("profile-edit")
    }, [navigation])

    const handleWithdrawComplete = useCallback(async () => {
        // まず認証状態をクリア（cookieの削除も含む）
        await auth.logout()
        navigation.resetNavigation()

        // ログアウト完了後にログイン画面に遷移（home画面を表示しない）
        if (typeof window !== 'undefined') {
            window.location.href = '/'
        }
    }, [auth, navigation])

    const handleLogout = useCallback(async () => {
        // まず認証状態をクリア（cookieの削除も含む）
        await auth.logout()
        navigation.resetNavigation()

        // ログアウト完了後にログイン画面に遷移（home画面を表示しない）
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

        // プラン未契約チェック
        if (!auth.plan) {
            dispatch({ type: 'SET_PLAN_REQUIRED_MODAL_OPEN', payload: true })
            return
        }

        // storeCouponsからクーポンを取得
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
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    shopId: state.selectedStore.id
                }),
                credentials: 'include', // Cookieを送信
            })

            if (!response.ok) {
                let errorMessage = 'クーポンの使用に失敗しました'
                try {
                    const error = await response.json()

                    // エラーレスポンスの構造に応じてメッセージを取得
                    if (error.error?.message) {
                        errorMessage = error.error.message
                    } else if (error.message) {
                        errorMessage = error.message
                    } else if (error.error) {
                        errorMessage = error.error
                    }
                } catch {
                    errorMessage = `クーポンの使用に失敗しました (HTTP ${response.status})`
                }

                alert(errorMessage)
                return
            }

            await response.json()

            // 成功時
            dispatch({ type: 'SET_SUCCESS_MODAL_OPEN', payload: true })
            navigation.navigateToView("home")
        } catch (error) {
            console.error('クーポン使用エラー:', error)
            alert(error instanceof Error ? error.message : 'クーポンの使用中にエラーが発生しました')
        }
    }, [navigation, dispatch, state.selectedCoupon, state.selectedStore])

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

    const handlePlanRequiredModalClose = useCallback(() => {
        dispatch({ type: 'SET_PLAN_REQUIRED_MODAL_OPEN', payload: false })
    }, [dispatch])

    const handlePlanRequiredModalRegister = useCallback(() => {
        dispatch({ type: 'SET_PLAN_REQUIRED_MODAL_OPEN', payload: false })
        router.push('/plan-registration')
    }, [dispatch, router])

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
            }
            // Cookieは自動的に送信されるため、ヘッダーは不要

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
                const userResponse = await fetch('/api/user/me', {
                    cache: 'no-store',
                })

                if (userResponse.ok) {
                    const userData = await userResponse.json()
                    // authの状態を更新
                    auth.login(userData, userData.plan, [], [])
                }
            } catch {
                // エラー処理
            }

            // トースターで成功メッセージを表示
            toast.success('プロフィールを更新しました')

            // マイページに戻る
            navigation.navigateToView("mypage", "mypage")
            navigation.navigateToMyPage("main")

            auth.setIsLoading(false)
        } catch (error) {
            auth.setIsLoading(false)
            // エラー表示（必要に応じてトーストやモーダルで通知）
            toast.error(error instanceof Error ? error.message : 'プロフィールの更新に失敗しました')
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
            }
            // Cookieは自動的に送信されるため、本番環境ではヘッダーは不要

            const response = await fetch('/api/auth/email/change', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    currentPassword: data.currentPassword,
                    newEmail: data.newEmail,
                    confirmEmail: data.confirmEmail,
                }),
                credentials: 'include', // Cookieを送信
            })

            const result = await response.json()

            if (!response.ok) {
                // トークン期限切れの場合（403エラー）
                if (response.status === 403) {
                    // トークンをクリア
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
        dispatch({ type: 'SET_EMAIL_CHANGE_SUCCESS_MODAL_OPEN', payload: false })

        // ログイン状態をリセット
        dispatch({ type: 'RESET_LOGIN_STATE' })

        // authのログアウトも実行（Cookieはサーバーサイドでクリアされる）
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
            const response = await fetch('/api/auth/password/change', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword
                }),
                credentials: 'include', // Cookieを送信
            })
            const result = await response.json()
            if (!response.ok) {
                // トークン期限切れの場合（403エラー）
                if (response.status === 403) {
                    // トークンをクリア
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

    // 店舗紹介画面に遷移
    const handleStoreIntroduction = useCallback(() => {
        navigation.navigateToMyPage("store-introduction")
    }, [navigation])

    // 店舗紹介登録
    const handleStoreIntroductionSubmit = useCallback(async (data: {
        storeName1: string
        recommendedMenu1: string
        storeName2: string
        recommendedMenu2: string
        storeName3: string
        recommendedMenu3: string
    }) => {
        try {
            const response = await fetch('/api/store-introductions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Cookieを含める
                body: JSON.stringify(data),
            })

            const result = await response.json()

            if (!response.ok) {
                toast.error(result.error?.message || '店舗紹介の登録に失敗しました')
                return
            }

            toast.success('店舗紹介を登録しました')
            // マイページのメイン画面に戻る（状態はHomeLayoutのuseEffectで自動更新される）
            navigation.navigateToMyPage("main")
        } catch (error) {
            console.error('店舗紹介登録エラー:', error)
            toast.error('店舗紹介の登録に失敗しました')
        }
    }, [navigation])

    const handlePasswordChangeComplete = useCallback(() => {
        // ログアウト処理
        auth.logout()

        // パスワード変更ステップをリセット
        dispatch({ type: 'SET_PASSWORD_CHANGE_STEP', payload: "form" })

        // ログイン状態をリセット（パスワード入力画面に戻す）
        dispatch({ type: 'RESET_LOGIN_STATE' })

        // ログイン画面に遷移（ビューを切り替える）
        navigation.navigateToView("login")
    }, [auth, dispatch, navigation])

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
        handlePlanRequiredModalClose,
        handlePlanRequiredModalRegister,
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
        handleStoreIntroduction,
        handleStoreIntroductionSubmit,
    } as AppHandlers & { handleEmailChangeSuccessModalClose: () => void; handleStoreIntroduction: () => void; handleStoreIntroductionSubmit: (data: any) => Promise<void> }
}
