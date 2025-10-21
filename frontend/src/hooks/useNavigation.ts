import { useState } from 'react';
import type { ViewType, MyPageViewType } from '@/types/navigation';

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
