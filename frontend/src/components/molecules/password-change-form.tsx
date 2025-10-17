"use client"

import React, { useState, useEffect } from "react"
import {
  passwordChangeSchema,
  type PasswordChangeInput,
  validatePasswordRealtime,
  validatePasswordConfirmRealtime,
} from "@hv-development/schemas"
import { z } from "zod"

interface PasswordChangeFormProps {
  onSubmit: (currentPassword: string, newPassword: string) => void
  onCancel: () => void
  isLoading?: boolean
  errorMessage?: string | null
}

export function PasswordChangeForm({ onSubmit, onCancel, isLoading = false, errorMessage = null }: PasswordChangeFormProps) {
  const [formData, setFormData] = useState<PasswordChangeInput>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<Partial<PasswordChangeInput>>({})

  // サーバーエラーメッセージをフィールドエラーにマッピング
  useEffect(() => {
    if (errorMessage) {
      if (errorMessage.includes('現在のパスワードが正しくありません')) {
        setErrors(prev => ({ ...prev, currentPassword: errorMessage }))
      } else if (errorMessage.includes('現在のパスワードと同じパスワードは使用できません')) {
        setErrors(prev => ({ ...prev, newPassword: errorMessage }))
      } else if (errorMessage.includes('パスワードが弱すぎます')) {
        setErrors(prev => ({ ...prev, newPassword: errorMessage }))
      }
    } else {
      // エラーメッセージがクリアされた場合は、サーバーエラー由来のフィールドエラーもクリア
      setErrors(prev => {
        const newErrors = { ...prev }
        if (prev.currentPassword && prev.currentPassword.includes('現在のパスワードが正しくありません')) {
          delete newErrors.currentPassword
        }
        if (prev.newPassword && (prev.newPassword.includes('現在のパスワードと同じパスワードは使用できません') || prev.newPassword.includes('パスワードが弱すぎます'))) {
          delete newErrors.newPassword
        }
        return newErrors
      })
    }
  }, [errorMessage])

  const validateForm = () => {
    try {
      // tamanomi-schemasのスキーマを使用してバリデーション
      passwordChangeSchema.parse(formData)

      // 追加のビジネスロジックバリデーション
      if (formData.newPassword === formData.currentPassword) {
        setErrors({ newPassword: "現在のパスワードと同じパスワードは使用できません。" })
        return false
      }

      setErrors({})
      return true
    } catch (error) {
      // ZodErrorかどうかをより確実にチェック
      if (error && typeof error === 'object' && 'errors' in error) {
        const zodError = error as { errors: Array<{ path?: (string | number)[]; message: string }> };
        const newErrors: Partial<PasswordChangeInput> = {}
        zodError.errors.forEach((err) => {
          const field = err.path?.[0] as keyof PasswordChangeInput
          if (field) {
            newErrors[field] = err.message
          }
        })
        setErrors(newErrors)
      }
      return false
    }
  }

  // リアルタイムバリデーション（input時）
  const validateFieldOnInput = (field: keyof PasswordChangeInput, value: string) => {
    const newErrors = { ...errors }

    if (field === 'currentPassword') {
      if (value) {
        delete newErrors.currentPassword
      }
    }

    if (field === 'newPassword') {
      // tamanomi-schemasのバリデーション関数を使用
      const passwordValidation = validatePasswordRealtime(value)
      if (passwordValidation.isValid && value !== formData.currentPassword) {
        delete newErrors.newPassword
      } else if (!passwordValidation.isValid && passwordValidation.errors.length > 0) {
        newErrors.newPassword = passwordValidation.errors[0]
      } else if (value === formData.currentPassword) {
        newErrors.newPassword = "現在のパスワードと同じパスワードは使用できません。"
      }
    }

    if (field === 'confirmPassword') {
      // tamanomi-schemasのバリデーション関数を使用
      const confirmValidation = validatePasswordConfirmRealtime(formData.newPassword, value)
      if (confirmValidation.isValid) {
        delete newErrors.confirmPassword
      } else if (confirmValidation.errors && confirmValidation.errors.length > 0) {
        newErrors.confirmPassword = confirmValidation.errors[0]
      }
    }

    setErrors(newErrors)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData.currentPassword, formData.newPassword)
    }
  }

  const updateField = (field: keyof PasswordChangeInput, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    validateFieldOnInput(field, value)
  }

  return (
    <div className="space-y-6">
      {/* ページタイトル */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">パスワードの変更</h2>
      </div>

      {/* メインカード */}
      <div className="bg-white border-2 border-green-300 rounded-2xl p-6 space-y-6">
        {/* サーバーエラーメッセージ（フィールドエラーにマッピングされていない場合のみ表示） */}
        {errorMessage && !errorMessage.includes('現在のパスワードが正しくありません') && !errorMessage.includes('現在のパスワードと同じパスワードは使用できません') && !errorMessage.includes('パスワードが弱すぎます') && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex">
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

        <form onSubmit={handleSubmit} className="space-y-6">
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

          {/* 新しいパスワード */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              新しいパスワード
            </label>
            <input
              type="password"
              placeholder=""
              value={formData.newPassword}
              onChange={(e) => updateField("newPassword", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
            />
            {errors.newPassword && <p className="mt-1 text-sm text-red-500">{errors.newPassword}</p>}
          </div>

          {/* パスワード確認 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              パスワード確認
            </label>
            <input
              type="password"
              placeholder=""
              value={formData.confirmPassword}
              onChange={(e) => updateField("confirmPassword", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
            />
            {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
          </div>

          {/* 使用方法について */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h4 className="text-sm font-bold text-blue-900 mb-3">使用方法について</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 8文字以上255文字以下で入力してください</li>
              <li>• 英数字混在で入力してください</li>
              <li>• 現在のパスワードとは異なるものを設定してください</li>
            </ul>
          </div>

          {/* 重要な注意事項 */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <h4 className="text-sm font-bold text-red-900 mb-3">重要な注意事項</h4>
            <ul className="text-sm text-red-800 space-y-1">
              <li>• パスワード変更後は新しいパスワードでログインしてください</li>
              <li>• 他のデバイスでログインしている場合は再ログインが必要です</li>
              <li>• 確認メール内のリンクをクリックするまで変更は行われません</li>
              <li>• 現在のメールアドレスでログインしてください</li>
              <li>• 確認メールが届かない場合は、迷惑メールフォルダもご確認ください</li>
            </ul>
          </div>

          {/* 変更ボタン */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-4 px-4 rounded-xl font-bold text-lg transition-colors disabled:bg-gray-400"
          >
            {isLoading ? "変更中..." : "変更する"}
          </button>
        </form>

        {/* 戻るリンク */}
        <div className="text-center">
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-600 hover:text-gray-800 underline text-sm"
          >
            戻る
          </button>
        </div>
      </div>
    </div>
  )
}