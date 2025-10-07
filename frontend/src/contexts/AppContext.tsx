"use client"

import { createContext, useContext } from "react"
import type { AppContextType } from '@hv-development/schemas'

// Context APIで状態管理を最適化
export const AppContext = createContext<AppContextType | null>(null)

// Contextを使用するカスタムフック
export const useAppContext = () => {
    const context = useContext(AppContext)
    if (!context) {
        throw new Error('useAppContext must be used within AppContext.Provider')
    }
    return context
}
