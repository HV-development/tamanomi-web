import type { AppState, AppAction } from '@hv-development/schemas'

// 初期状態
export const initialState: AppState = {
    stores: [],
    notifications: [],
    isDataLoaded: true,
    isCouponListOpen: false,
    selectedStore: null,
    selectedCoupon: null,
    isSuccessModalOpen: false,
    isLoginRequiredModalOpen: false,
    isStoreDetailPopupOpen: false,
    isFavoritesOpen: false,
    loginStep: "password",
    loginEmail: "",
    signupData: null,
    emailChangeStep: "form",
    newEmail: "",
    passwordChangeStep: "form",
    passwordChangeError: null,
    passwordResetStep: "form",
    passwordResetEmail: "",
    emailRegistrationStep: "form",
    emailRegistrationEmail: "",
    emailConfirmationEmail: "",
    historyStores: [],
    isHistoryOpen: false,
}

// リデューサー（簡略化）
export function appReducer(state: AppState, action: AppAction): AppState {
    switch (action.type) {
        case 'SET_STORES':
            return { ...state, stores: action.payload }
        case 'SET_NOTIFICATIONS':
            return { ...state, notifications: action.payload }
        case 'SET_DATA_LOADED':
            return { ...state, isDataLoaded: action.payload }
        case 'SET_COUPON_LIST_OPEN':
            return { ...state, isCouponListOpen: action.payload }
        case 'SET_SELECTED_STORE':
            return { ...state, selectedStore: action.payload }
        case 'SET_SELECTED_COUPON':
            return { ...state, selectedCoupon: action.payload }
        case 'SET_SUCCESS_MODAL_OPEN':
            return { ...state, isSuccessModalOpen: action.payload }
        case 'SET_LOGIN_REQUIRED_MODAL_OPEN':
            return { ...state, isLoginRequiredModalOpen: action.payload }
        case 'SET_STORE_DETAIL_POPUP_OPEN':
            return { ...state, isStoreDetailPopupOpen: action.payload }
        case 'SET_FAVORITES_OPEN':
            return { ...state, isFavoritesOpen: action.payload }
        case 'TOGGLE_FAVORITE':
            return {
                ...state,
                stores: state.stores.map(store =>
                    store.id === action.payload ? { ...store, isFavorite: !store.isFavorite } : store
                ),
                selectedStore: state.selectedStore?.id === action.payload
                    ? { ...state.selectedStore, isFavorite: !state.selectedStore.isFavorite }
                    : state.selectedStore
            }
        case 'MARK_NOTIFICATION_READ':
            return {
                ...state,
                notifications: state.notifications.map(n =>
                    n.id === action.payload ? { ...n, isRead: true } : n
                )
            }
        case 'MARK_ALL_NOTIFICATIONS_READ':
            return {
                ...state,
                notifications: state.notifications.map(n => ({ ...n, isRead: true }))
            }
        case 'RESET_LOGIN_STATE':
            console.log("🔧 RESET_LOGIN_STATE: loginStepを'password'にリセット")
            return { ...state, loginStep: "password", loginEmail: "" }
        case 'RESET_SIGNUP_STATE':
            return { ...state, signupData: null }
        case 'RESET_COUPON_STATE':
            return {
                ...state,
                isCouponListOpen: false,
                selectedStore: null,
                selectedCoupon: null,
                isSuccessModalOpen: false,
                isLoginRequiredModalOpen: false
            }
        case 'SET_LOGIN_STEP':
            console.log("🔧 SET_LOGIN_STEP: loginStepを変更", { from: state.loginStep, to: action.payload })
            return { ...state, loginStep: action.payload }
        case 'SET_LOGIN_EMAIL':
            return { ...state, loginEmail: action.payload }
        case 'SET_SIGNUP_DATA':
            return { ...state, signupData: action.payload }
        case 'SET_EMAIL_CHANGE_STEP':
            return { ...state, emailChangeStep: action.payload }
        case 'SET_NEW_EMAIL':
            return { ...state, newEmail: action.payload }
        case 'SET_PASSWORD_CHANGE_STEP':
            return { ...state, passwordChangeStep: action.payload }
        case 'SET_PASSWORD_CHANGE_ERROR':
            return { ...state, passwordChangeError: action.payload }
        case 'SET_PASSWORD_RESET_STEP':
            return { ...state, passwordResetStep: action.payload }
        case 'SET_PASSWORD_RESET_EMAIL':
            return { ...state, passwordResetEmail: action.payload }
        case 'SET_EMAIL_REGISTRATION_STEP':
            return { ...state, emailRegistrationStep: action.payload }
        case 'SET_EMAIL_REGISTRATION_EMAIL':
            return { ...state, emailRegistrationEmail: action.payload }
        case 'SET_EMAIL_CONFIRMATION_EMAIL':
            return { ...state, emailConfirmationEmail: action.payload }
        case 'SET_HISTORY_STORES':
            return { ...state, historyStores: action.payload }
        case 'SET_HISTORY_OPEN':
            return { ...state, isHistoryOpen: action.payload }
        default:
            return state
    }
}
