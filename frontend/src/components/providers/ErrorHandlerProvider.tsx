'use client'

import { useEffect } from 'react'

/**
 * グローバルエラーハンドラー
 * ブラウザ拡張機能やサードパーティスクリプトによるエラーを無視
 */
export function ErrorHandlerProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // window.ethereum関連のエラーを無視（MetaMaskなどの拡張機能によるエラー）
    const handleError = (event: ErrorEvent) => {
      if (
        event.error?.message?.includes('window.ethereum') ||
        event.error?.message?.includes('ethereum') ||
        event.message?.includes('window.ethereum') ||
        event.message?.includes('ethereum')
      ) {
        // ブラウザ拡張機能によるエラーは無視
        event.preventDefault()
        console.warn('ブラウザ拡張機能によるエラーを無視しました:', event.message)
        return false
      }
    }

    // Promise rejectionのエラーもハンドリング
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (
        event.reason?.message?.includes('window.ethereum') ||
        event.reason?.message?.includes('ethereum') ||
        String(event.reason)?.includes('window.ethereum') ||
        String(event.reason)?.includes('ethereum')
      ) {
        // ブラウザ拡張機能によるエラーは無視
        event.preventDefault()
        console.warn('ブラウザ拡張機能によるPromise rejectionを無視しました:', event.reason)
        return false
      }
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  return <>{children}</>
}


