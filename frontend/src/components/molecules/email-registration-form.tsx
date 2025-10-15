"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "../atoms/button"
import { Input } from "../atoms/input"
import { UserRegistrationRequestSchema, type UserRegistrationRequest } from "@hv-development/schemas"
import { ZodError } from "zod"

interface EmailRegistrationFormProps {
  initialEmail?: string
  onSubmit: (data: UserRegistrationRequest) => void
  onBack: () => void
  isLoading?: boolean
  errorMessage?: string
}

export function EmailRegistrationForm({ initialEmail = "", onSubmit, onBack, isLoading = false, errorMessage }: EmailRegistrationFormProps) {
  const [formData, setFormData] = useState<UserRegistrationRequest>({
    email: "",
    campaignCode: ""
  })
  const [errors, setErrors] = useState<Partial<Record<keyof UserRegistrationRequest, string>>>({})

  // initialEmailが変更された時にemailを更新
  useEffect(() => {
    setFormData(prev => ({ ...prev, email: initialEmail }))
  }, [initialEmail])

  const validateField = (fieldName: keyof UserRegistrationRequest, value: string) => {
    try {
      UserRegistrationRequestSchema.pick({ [fieldName]: true } as Record<string, boolean>).parse({ [fieldName]: value })
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[fieldName]
        return newErrors
      })
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessage = error.errors[0]?.message || "入力エラーです"
        setErrors(prev => ({ ...prev, [fieldName]: errorMessage }))
      }
    }
  }

  const validateForm = (): boolean => {
    try {
      UserRegistrationRequestSchema.parse(formData)
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof ZodError) {
        const newErrors: Partial<Record<keyof UserRegistrationRequest, string>> = {}
        error.errors.forEach((err) => {
          const fieldName = err.path[0] as keyof UserRegistrationRequest
          if (fieldName === 'email' || fieldName === 'campaignCode') {
            newErrors[fieldName] = err.message
          }
        })
        setErrors(newErrors)
      }
      return false
    }
  }

  // リアルタイムバリデーション（input時）
  const handleEmailChange = (value: string) => {
    setFormData(prev => ({ ...prev, email: value }))
    if (value.trim()) {
      validateField('email', value)
    } else {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.email
        return newErrors
      })
    }
  }

  const handleCampaignCodeChange = (value: string) => {
    const upperValue = value.toUpperCase()
    setFormData(prev => ({ ...prev, campaignCode: upperValue }))
    if (upperValue.trim()) {
      validateField('campaignCode', upperValue)
    } else {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.campaignCode
        return newErrors
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3">メールアドレス認証</h3>
        <div className="text-gray-600 space-y-2">
          <p>新規登録にはメールアドレスの認証が必要です。</p>
          <p>入力されたメールアドレスに認証用のリンクをお送りします。</p>
          <p className="text-sm text-amber-600 font-medium">※現在、キャンペーンコードの入力が必須です</p>
        </div>
      </div>

      {/* エラーメッセージ表示 */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      <Input
        type="email"
        label="メールアドレス"
        placeholder="example@email.com"
        value={formData.email}
        onChange={handleEmailChange}
        error={errors.email}
      />

      {/* キャンペーンコード入力 */}
      <div>
        <Input
          type="text"
          label="キャンペーンコード（必須）"
          placeholder="例: WELCOME2024"
          value={formData.campaignCode}
          onChange={handleCampaignCodeChange}
          error={errors.campaignCode}
          required={true}
        />

        {/* キャンペーンコード案内リンク */}
        <div className="text-center mt-3">
          <button
            type="button"
            onClick={() => window.open("/モニターキャンペーン.pdf", "_blank")}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium underline transition-colors"
          >
            キャンペーンコードはこちら
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
