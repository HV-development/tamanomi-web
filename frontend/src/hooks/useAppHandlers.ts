"use client"

import React from "react"
import type { AppState, AppHandlers } from '@hv-development/schemas'
import type { AppActionExt } from './useAppReducer'
import type { AppHandlersExt } from '@/types/app-context'
import type { useAuth } from './useAuth'
import type { useNavigation } from './useNavigation'
import type { useFilters } from './useFilters'
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { useAuthHandlers } from './useAuthHandlers'
import { useWithdrawalHandlers } from './useWithdrawalHandlers'
import { useCouponHandlers } from './useCouponHandlers'
import { useProfileHandlers } from './useProfileHandlers'
import { usePlanHandlers } from './usePlanHandlers'
import { useMyPageHandlers } from './useMyPageHandlers'
import { useNavigationHandlers } from './useNavigationHandlers'

export const useAppHandlers = (
    dispatch: React.Dispatch<AppActionExt>,
    auth: ReturnType<typeof useAuth>,
    navigation: ReturnType<typeof useNavigation>,
    filters: ReturnType<typeof useFilters>,
    router: AppRouterInstance,
    state: AppState
): AppHandlersExt => {

    const authHandlers = useAuthHandlers(dispatch, auth, navigation, router, state)
    const withdrawalHandlers = useWithdrawalHandlers(dispatch, auth, navigation)
    const couponHandlers = useCouponHandlers(dispatch, auth, navigation, router, state)
    const profileHandlers = useProfileHandlers(dispatch, auth, navigation, router)
    const planHandlers = usePlanHandlers(dispatch, auth, navigation, router)
    const myPageHandlers = useMyPageHandlers(dispatch, auth, navigation, state)
    const navigationHandlers = useNavigationHandlers(dispatch, auth, navigation, filters, router)

    return {
        ...navigationHandlers,
        ...authHandlers,
        ...myPageHandlers,
        ...couponHandlers,
        ...profileHandlers,
        ...planHandlers,
        ...withdrawalHandlers,
        handleProfileEditSubmit: profileHandlers.handleProfileEditSubmit as AppHandlers['handleProfileEditSubmit'],
    } as AppHandlersExt
}
