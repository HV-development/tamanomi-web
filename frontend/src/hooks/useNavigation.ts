import { useState } from 'react';

export type ViewType =
    | "home"
    | "login"
    | "email-registration"
    | "signup"
    | "confirmation"
    | "subscription"
    | "mypage"
    | "password-reset"
    | "email-confirmation"
    | "coupon-confirmation"
    | "usage-guide";

export type MyPageViewType =
    | "main"
    | "profile-edit"
    | "email-change"
    | "password-change"
    | "usage-history"
    | "payment-history"
    | "plan-management"
    | "plan-change"
    | "withdrawal"
    | "withdrawal-complete";

export function useNavigation() {
    const [activeTab, setActiveTab] = useState("home");
    const [currentView, setCurrentView] = useState<ViewType>("home");
    const [myPageView, setMyPageView] = useState<MyPageViewType>("main");

    const navigateToView = (view: ViewType, tab?: string) => {
        setCurrentView(view);
        if (tab) {
            setActiveTab(tab);
        }
    };

    const navigateToMyPage = (view: MyPageViewType) => {
        setMyPageView(view);
    };

    const resetNavigation = () => {
        setActiveTab("home");
        setCurrentView("home");
        setMyPageView("main");
    };

    return {
        activeTab,
        currentView,
        myPageView,
        setActiveTab,
        setCurrentView,
        setMyPageView,
        navigateToView,
        navigateToMyPage,
        resetNavigation,
    };
}
