import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { preRegister } from '@/lib/api-client'
import type { TamanomiUserRegistrationRequest } from "@hv-development/schemas"

type Step = 'form' | 'complete'

export interface UseEmailRegistrationReturn {
  currentStep: Step
  isLoading: boolean
  errorMessage: string
  successMessage: string
  email: string
  handleEmailSubmit: (data: TamanomiUserRegistrationRequest) => Promise<void>
  handleResend: () => Promise<void>
  clearError: () => void
}

/**
 * メール登録画面のビジネスロジックを管理するカスタムフック
 */
export function useEmailRegistration(): UseEmailRegistrationReturn {
  const [currentStep, setCurrentStep] = useState<Step>('form')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [successMessage, setSuccessMessage] = useState<string>('')
  const [lastEmail, setLastEmail] = useState<string>('')
  const [shopId, setShopId] = useState<string | undefined>(undefined)
  const hasCleanedSession = useRef(false)

  const searchParams = useSearchParams()

  // 新規登録フロー開始時に既存のセッション（Cookie）をクリア
  // これにより、ログアウトせずに新規登録画面にアクセスした場合でも
  // 古いアカウントの情報が表示されることを防ぐ
  useEffect(() => {
    const cleanupExistingSession = async () => {
      // 既にクリーンアップ済みの場合はスキップ
      if (hasCleanedSession.current) return
      hasCleanedSession.current = true

      try {
        // ログアウトAPIを呼び出して既存のCookieをクリア
        await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
        })
      } catch {
        // ログアウトに失敗してもエラーを表示しない（新規登録は続行可能）
        console.warn('既存セッションのクリアに失敗しましたが、新規登録は続行可能です')
      }
    }

    cleanupExistingSession()
  }, [])

  // URLパラメータからエラーメッセージとshopIdを取得
  useEffect(() => {
    const error = searchParams.get('error')
    const shop_id = searchParams.get('shop_id')

    // shopIdを状態に保存
    if (shop_id) {
      setShopId(shop_id)
    }

    if (error) {
      const errorMessages: Record<string, string> = {
        invalid_token: '無効な確認リンクです。再度メール登録を行ってください。',
        token_expired: '確認リンクの有効期限が切れています。再度メール登録を行ってください。',
        verification_failed: '確認処理に失敗しました。再度メール登録を行ってください。',
      }

      setErrorMessage(
        errorMessages[error] || 'エラーが発生しました。再度メール登録を行ってください。'
      )
    }
  }, [searchParams])

  /**
   * メールアドレス送信処理
   */
  const handleEmailSubmit = async (data: TamanomiUserRegistrationRequest) => {
    // 連続押下を防ぐ
    if (isLoading) {
      return
    }

    setIsLoading(true)
    setErrorMessage('')

    try {
      // Cookieベースのセッション管理に変更したため、sessionStorageは使用しない
      // referrerUserIdはURLパラメータから取得するか、Cookieから取得する
      const referrerUserId = null; // 必要に応じてCookieから取得する実装を追加

      // 紹介者IDを含めてpreRegisterを呼び出し
      const code = data.campaignCode?.trim() ? data.campaignCode.trim() : undefined

      await preRegister(data.email.trim(), code, referrerUserId || undefined, shopId)
      setLastEmail(data.email.trim())
      // 送信完了画面に遷移
      setCurrentStep('complete')
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : '認証メールの送信に失敗しました'
      setErrorMessage(message)
      // エラー時はフォーム画面に留まる
      setCurrentStep('form')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * 再送信処理（画面遷移せずにメールを再送信）
   */
  const handleResend = async () => {
    // 連続押下を防ぐ
    if (isLoading) {
      return
    }

    if (!lastEmail) {
      setErrorMessage('メールアドレスが見つかりません')
      return
    }

    setIsLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      // Cookieベースのセッション管理に変更したため、sessionStorageは使用しない
      // referrerUserIdはURLパラメータから取得するか、Cookieから取得する
      const referrerUserId = null; // 必要に応じてCookieから取得する実装を追加

      await preRegister(lastEmail, undefined, referrerUserId || undefined, shopId)
      // 成功メッセージを表示（画面は complete のまま）
      setSuccessMessage('認証メールを再送信しました')

      // 5秒後に成功メッセージを消す
      setTimeout(() => {
        setSuccessMessage('')
      }, 5000)
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : '認証メールの再送信に失敗しました'
      setErrorMessage(message)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * エラーメッセージをクリア
   */
  const clearError = () => {
    setErrorMessage('')
  }

  return {
    currentStep,
    isLoading,
    errorMessage,
    successMessage,
    email: lastEmail,
    handleEmailSubmit,
    handleResend,
    clearError,
  }
}

