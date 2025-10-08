import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { preRegister } from '@/services/auth'

type Step = 'form' | 'complete'

export interface UseEmailRegistrationReturn {
  currentStep: Step
  isLoading: boolean
  errorMessage: string
  successMessage: string
  email: string
  handleEmailSubmit: (email: string, campaignCode?: string) => Promise<void>
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
  
  const searchParams = useSearchParams()

  // URLパラメータからエラーメッセージを取得
  useEffect(() => {
    const error = searchParams.get('error')
    
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
  const handleEmailSubmit = async (email: string, campaignCode?: string) => {
    setIsLoading(true)
    setErrorMessage('')

    try {
      await preRegister(email, campaignCode)
      // メールアドレスを保存
      setLastEmail(email)
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
    if (!lastEmail) {
      setErrorMessage('メールアドレスが見つかりません')
      return
    }

    setIsLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      await preRegister(lastEmail)
      // 成功メッセージを表示（画面は complete のまま）
      setSuccessMessage('認証メールを再送信しました')
      console.log('認証メールを再送信しました')
      
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

