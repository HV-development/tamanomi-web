"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "../atoms/input"
import { Button } from "../atoms/button"
import { Gift } from "lucide-react"

interface EmailRegistrationFormProps {
  initialEmail?: string
  onSubmit: (email: string, campaignCode?: string) => void
  onBack: () => void
  isLoading?: boolean
}

export function EmailRegistrationForm({ initialEmail = "", onSubmit, onBack, isLoading = false }: EmailRegistrationFormProps) {
  const [email, setEmail] = useState(initialEmail)
  const [campaignCode, setCampaignCode] = useState("")
  const [error, setError] = useState("")
  const [campaignCodeError, setCampaignCodeError] = useState("")

  // initialEmailが変更された時にemailを更新
  useEffect(() => {
    setEmail(initialEmail)
  }, [initialEmail])

  const validateEmail = (email: string) => {
    // メールアドレス - 必須チェック
    if (!email) {
      return "メールアドレスを入力してください。"
    }
    // メールアドレス - メールフォーマットチェック
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "正しいメールアドレスを入力してください。"
    }
    return ""
  }

  // リアルタイムバリデーション（input時）
  const handleEmailChange = (value: string) => {
    setEmail(value)
    // エラーをクリア（リアルタイムでエラー表示しない）
    if (error) {
      setError("")
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const emailError = validateEmail(email)
    if (emailError) {
      setError(emailError)
      return
    }
    setError("")
    onSubmit(email, campaignCode)
  }

  const validateCampaignCode = (code: string) => {
    if (!code) return "" // 任意項目なのでエラーなし
    
    // 英数字のみ許可
    if (!/^[A-Za-z0-9]+$/.test(code)) {
      return "キャンペーンコードは英数字のみ入力可能です"
    }
    
    // 長さチェック（4-20文字）
    if (code.length < 4 || code.length > 20) {
      return "キャンペーンコードは4文字以上20文字以下で入力してください"
    }
    
    return ""
  }

  const handleCampaignCodeChange = (value: string) => {
    setCampaignCode(value)
    // リアルタイムバリデーション
    const error = validateCampaignCode(value)
    setCampaignCodeError(error)
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3">メールアドレス認証</h3>
        <div className="text-gray-600 space-y-2">
          <p>新規登録にはメールアドレスの認証が必要です。</p>
          <p>入力されたメールアドレスに認証用のリンクをお送りします。</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          メールアドレス
        </label>
        <input
          type="email"
          placeholder="example@email.com"
          value={email}
          onChange={(e) => handleEmailChange(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>

      {/* キャンペーンコード入力 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          キャンペーンコード（任意）
        </label>
        
        <div className="space-y-3">
          <input
            type="text"
            placeholder="例: WELCOME2024"
            value={campaignCode}
            onChange={(e) => handleCampaignCodeChange(e.target.value.toUpperCase())}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
          />
          {campaignCodeError && <p className="text-sm text-red-500">{campaignCodeError}</p>}
          
          {/* キャンペーンコードの説明 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Gift className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <div className="font-medium mb-1">キャンペーンコードについて</div>
                <ul className="text-xs space-y-1">
                  <li>• 特別なキャンペーンや紹介コードをお持ちの方はご入力ください</li>
                  <li>• 入力は任意です。お持ちでない場合は空欄のままで構いません</li>
                  <li>• 有効なコードの場合、登録後に特典が適用されます</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-base font-medium"
        >
          {isLoading ? "送信中..." : "認証メールを送信"}
        </Button>

        <Button type="button" onClick={onBack} variant="secondary" className="w-full py-3 text-base font-medium">
          戻る
        </Button>
      </div>
    </form>
  )
}
