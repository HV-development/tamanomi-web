"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/atoms/Button"
import { Input } from "@/components/atoms/Input"
import {
  TamanomiUserRegistrationRequestSchema,
  type TamanomiUserRegistrationRequest,
} from "@hv-development/schemas"
import { z } from "zod"

const tamanomiEmailOnlyFallbackSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
  referrerUserId: z.string().uuid("有効な紹介者IDを入力してください").optional(),
  campaignCode: z
    .string()
    .max(128, "キャンペーンコードは128文字以内で入力してください")
    .optional(),
})

const preRegisterFormSchema =
  TamanomiUserRegistrationRequestSchema ?? tamanomiEmailOnlyFallbackSchema

const EMAIL_FORMAT_ERROR = "メールアドレスの形式が正しくありません"
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const getEmailFormatError = (value: string): string | null => {
  const trimmed = value.trim()
  if (!trimmed) return "メールアドレスを入力してください"
  return emailPattern.test(trimmed) ? null : EMAIL_FORMAT_ERROR
}

interface EmailRegistrationFormProps {
  initialEmail?: string
  onSubmit: (data: TamanomiUserRegistrationRequest) => void
  onBack: () => void
  isLoading?: boolean
  errorMessage?: string
}

export function EmailRegistrationForm({
  initialEmail = "",
  onSubmit,
  onBack,
  isLoading = false,
  errorMessage,
}: EmailRegistrationFormProps) {
  const [formData, setFormData] = useState<TamanomiUserRegistrationRequest>({
    email: "",
  })
  const [errors, setErrors] = useState<Partial<Record<keyof TamanomiUserRegistrationRequest, string>>>(
    {}
  )

  useEffect(() => {
    setFormData((prev: TamanomiUserRegistrationRequest) => ({ ...prev, email: initialEmail }))
  }, [initialEmail])

  const validateField = (fieldName: keyof TamanomiUserRegistrationRequest, value: string) => {
    if (fieldName === "email") {
      const emailError = getEmailFormatError(value)
      if (emailError) {
        setErrors((prev) => ({ ...prev, email: emailError }))
        return
      }
    }

    const shape = preRegisterFormSchema.shape[fieldName as keyof typeof preRegisterFormSchema.shape]
    if (!shape) return
    const result = shape.safeParse(fieldName === "email" ? value.trim() : value)
    if (result.success) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[fieldName]
        return next
      })
    } else {
      const msg = result.error.issues[0]?.message || "入力エラーです"
      setErrors((prev) => ({ ...prev, [fieldName]: msg }))
    }
  }

  const validateForm = (): boolean => {
    const emailError = getEmailFormatError(formData.email)
    if (emailError) {
      setErrors((prev) => ({ ...prev, email: emailError }))
      return false
    }

    const validationData = {
      ...formData,
      email: formData.email.trim(),
    }

    const result = preRegisterFormSchema.safeParse(validationData)
    if (result.success) {
      setErrors({})
      return true
    }

    const newErrors: Partial<Record<keyof TamanomiUserRegistrationRequest, string>> = {}
    for (const issue of result.error.issues) {
      const fieldName = issue.path[0] as keyof TamanomiUserRegistrationRequest | undefined
      if (fieldName === "email" || fieldName === "campaignCode" || fieldName === "referrerUserId") {
        newErrors[fieldName] = issue.message
      }
    }
    setErrors(newErrors)
    return false
  }

  const handleEmailChange = (value: string) => {
    setFormData((prev: TamanomiUserRegistrationRequest) => ({ ...prev, email: value }))
    if (value.trim()) {
      validateField("email", value)
    } else {
      setErrors((prev) => {
        const next = { ...prev }
        delete next.email
        return next
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    const payload: TamanomiUserRegistrationRequest = { email: formData.email.trim() }
    if (formData.referrerUserId?.trim()) {
      payload.referrerUserId = formData.referrerUserId.trim()
    }
    if (formData.campaignCode?.trim()) {
      payload.campaignCode = formData.campaignCode.trim()
    }
    onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3">メールアドレス認証</h3>
        <div className="text-gray-600 space-y-2">
          <p>新規登録にはメールアドレスの認証が必要です。</p>
          <p>入力されたメールアドレスに認証用のリンクをお送りします。</p>
        </div>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
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
