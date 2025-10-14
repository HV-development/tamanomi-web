"use client"

import type React from "react"
import { useState } from "react"
import { Settings } from "lucide-react"
import { emailChangeSchema, type EmailChangeInput } from "@hv-development/schemas"
import { z } from "zod"

interface EmailChangeFormProps {
  currentEmail: string
  initialNewEmail?: string
  onSubmit: (data: EmailChangeInput) => void
  onCancel: () => void
  isLoading?: boolean
}

export function EmailChangeForm({ currentEmail, initialNewEmail = "", onSubmit, onCancel, isLoading = false }: EmailChangeFormProps) {
  const [formData, setFormData] = useState<EmailChangeInput>({
    currentPassword: "",
    newEmail: initialNewEmail,
    confirmEmail: "",
  })
  const [errors, setErrors] = useState<Partial<EmailChangeInput>>({})

  const validateForm = () => {
    try {
      // tamanomi-schemasのスキーマを使用してバリデーション
      emailChangeSchema.parse(formData)

      // 追加のビジネスロジックバリデーション
      if (formData.newEmail === currentEmail) {
        setErrors({ newEmail: "現在のメールアドレスと同じです。" })
        return false
      }

      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<EmailChangeInput> = {}
        error.errors.forEach((err) => {
          const field = err.path[0] as keyof EmailChangeInput
          if (field) {
            newErrors[field] = err.message
          }
        })
        setErrors(newErrors)
      }
      return false
    }
  }

  const validateFieldOnInput = (field: keyof EmailChangeInput, value: string) => {
    const newErrors = { ...errors }

    if (field === 'currentPassword') {
      if (value) {
        delete newErrors.currentPassword
      }
    }

    if (field === 'newEmail') {
      if (!value) {
        // 入力中は必須エラーを表示しない
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        newErrors.newEmail = "正しい有効なメールアドレスを入力してください。"
      } else if (value === currentEmail) {
        newErrors.newEmail = "現在のメールアドレスと同じです。"
      } else {
        delete newErrors.newEmail
      }
    }

    if (field === 'confirmEmail') {
      if (value && formData.newEmail !== value) {
        newErrors.confirmEmail = "メールアドレスが一致しません。"
      } else if (value && formData.newEmail === value) {
        delete newErrors.confirmEmail
      }
    }

    setErrors(newErrors)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const updateField = (field: keyof EmailChangeInput, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    validateFieldOnInput(field, value)
  }

  return (
    <div className="space-y-6">
      {/* 現在のメールアドレスセクション */}
      <div className="bg-white border-2 border-green-300 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">現在のメールアドレス</h3>
        <div className="text-center">
          <div className="text-green-600 font-medium text-lg">{currentEmail}</div>
        </div>
      </div>

      {/* メールアドレス変更セクション */}
      <div className="bg-white border-2 border-green-300 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-bold text-gray-900">メールアドレスの変更</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 現在のパスワード */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              現在のパスワード
            </label>
            <input
              type="password"
              placeholder=""
              value={formData.currentPassword}
              onChange={(e) => updateField("currentPassword", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
            />
            {errors.currentPassword && <p className="mt-1 text-sm text-red-500">{errors.currentPassword}</p>}
          </div>

          {/* 新しいメールアドレス */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              新しいメールアドレス
            </label>
            <input
              type="email"
              placeholder=""
              value={formData.newEmail}
              onChange={(e) => updateField("newEmail", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
            />
            {errors.newEmail && <p className="mt-1 text-sm text-red-500">{errors.newEmail}</p>}
          </div>

          {/* メールアドレス確認 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              メールアドレス確認
            </label>
            <input
              type="email"
              placeholder=""
              value={formData.confirmEmail}
              onChange={(e) => updateField("confirmEmail", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
            />
            {errors.confirmEmail && <p className="mt-1 text-sm text-red-500">{errors.confirmEmail}</p>}
          </div>

          {/* 重要な注意事項 */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <h4 className="text-sm font-bold text-red-900 mb-3">重要な注意事項</h4>
            <ul className="text-sm text-red-800 space-y-1">
              <li>• 新しいメールアドレスに確認メールを送信します</li>
              <li>• 確認メール内のリンクをクリックするまで変更は完了しません</li>
              <li>• 確認が完了するまでは現在のメールアドレスでログインしてください</li>
              <li>• 確認メールが届かない場合は、迷惑メールフォルダもご確認ください</li>
            </ul>
          </div>

          {/* 確認メール送信ボタン */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-4 px-4 rounded-xl font-medium transition-colors disabled:bg-gray-400"
          >
            {isLoading ? "送信中..." : "確認メール送信"}
          </button>

          {/* 戻るボタン */}
          <button
            type="button"
            onClick={onCancel}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium transition-colors border border-gray-300"
          >
            戻る
          </button>
        </form>
      </div>
    </div>
  )
}