// アプリケーション設定を環境変数から読み込み
// 
// 環境変数設定例:
// NEXT_PUBLIC_RESTRICT_TOP_PAGE_ACCESS=true
// NEXT_PUBLIC_MYPAGE_SHOW_PROFILE=true
// NEXT_PUBLIC_MYPAGE_SHOW_EMAIL_CHANGE=true
// NEXT_PUBLIC_MYPAGE_SHOW_PASSWORD_CHANGE=true
// NEXT_PUBLIC_MYPAGE_SHOW_USAGE_HISTORY=true
// NEXT_PUBLIC_MYPAGE_SHOW_PAYMENT_HISTORY=true
// NEXT_PUBLIC_MYPAGE_SHOW_PLAN_MANAGEMENT=true
// NEXT_PUBLIC_MYPAGE_SHOW_WITHDRAWAL=true
//
export const appConfig = {
    // マイページ項目の表示設定
    myPageSettings: {
        showProfile: process.env.NEXT_PUBLIC_MYPAGE_SHOW_PROFILE !== 'false',
        showEmailChange: process.env.NEXT_PUBLIC_MYPAGE_SHOW_EMAIL_CHANGE !== 'false',
        showPasswordChange: process.env.NEXT_PUBLIC_MYPAGE_SHOW_PASSWORD_CHANGE !== 'false',
        showUsageHistory: process.env.NEXT_PUBLIC_MYPAGE_SHOW_USAGE_HISTORY !== 'false',
        showPaymentHistory: process.env.NEXT_PUBLIC_MYPAGE_SHOW_PAYMENT_HISTORY !== 'false',
        showPlanManagement: process.env.NEXT_PUBLIC_MYPAGE_SHOW_PLAN_MANAGEMENT !== 'false',
        showWithdrawal: process.env.NEXT_PUBLIC_MYPAGE_SHOW_WITHDRAWAL !== 'false',
    },

    // トップ画面へのアクセス制限
    restrictTopPageAccess: process.env.NEXT_PUBLIC_RESTRICT_TOP_PAGE_ACCESS === 'true',
} as const

export type AppConfig = typeof appConfig
