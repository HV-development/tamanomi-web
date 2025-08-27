"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "../atoms/button"
import { validatePassword, validatePasswordRealtime, validatePasswordConfirm, validatePasswordConfirmRealtime } from "../../utils/validation"

interface PasswordChangeFormProps {
  onSubmit: (currentPassword: string, newPassword: string) => void
  onCancel: () => void
  isLoading?: boolean
}

export function PasswordChangeForm({ onSubmit, onCancel, isLoading = false }: PasswordChangeFormProps) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errors, setErrors] = useState<{
    currentPassword?: string
    newPassword?: string
    confirmPassword?: string
  }>({})

  const validateForm = () => {
    const newErrors: typeof errors = {}

    // 現在のパスワードバリデーション
    const currentPasswordValidation = validatePassword(currentPassword)
    if (!currentPasswordValidation.isValid) {
      newErrors.currentPassword = currentPasswordValidation.errors[0]
    }

    // 新しいパスワードバリデーション
    const newPasswordValidation = validatePassword(newPassword)
    if (!newPasswordValidation.isValid) {
      newErrors.newPassword = newPasswordValidation.errors[0]
    } else if (newPassword === currentPassword) {
      newErrors.newPassword = "現在のパスワードと同じパスワードは使用できません。"
    }

    // パスワード確認バリデーション
    const passwordConfirmValidation = validatePasswordConfirm(newPassword, confirmPassword)
    if (!passwordConfirmValidation.isValid) {
      newErrors.confirmPassword = passwordConfirmValidation.error
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // リアルタイムバリデーション（input時）
  const validateFieldOnInput = (field: keyof typeof errors, value: string) => {
    const newErrors = { ...errors }
    
    if (field === 'currentPassword') {
      // 現在のパスワードリアルタイムバリデーション
      const passwordValidation = validatePasswordRealtime(value)
      if (passwordValidation.isValid) {
        delete newErrors.currentPassword
      } else if (passwordValidation.errors.length > 0) {
        newErrors.currentPassword = passwordValidation.errors[0]
      }
    }
    
    if (field === 'newPassword') {
      // 新しいパスワードリアルタイムバリデーション
      const passwordValidation = validatePasswordRealtime(value)
      if (passwordValidation.isValid && value !== currentPassword) {
        delete newErrors.newPassword
      } else if (!passwordValidation.isValid && passwordValidation.errors.length > 0) {
        newErrors.newPassword = passwordValidation.errors[0]
      } else if (value === currentPassword) {
        newErrors.newPassword = "現在のパスワードと同じパスワードは使用できません。"
      }
    }
    
    if (field === 'confirmPassword') {
      // パスワード確認リアルタイムバリデーション
      const confirmValidation = validatePasswordConfirmRealtime(newPassword, value)
      if (confirmValidation.isValid) {
        delete newErrors.confirmPassword
      } else if (confirmValidation.error) {
        newErrors.confirmPassword = confirmValidation.error
      }
    }
    
    setErrors(newErrors)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(currentPassword, newPassword)
    } else {
    }
  }

  const updateField = (field: keyof typeof errors, value: string) => {
    if (field === "currentPassword") setCurrentPassword(value)
    if (field === "newPassword") setNewPassword(value)
    if (field === "confirmPassword") setConfirmPassword(value)

    // リアルタイムバリデーション
    if (field === 'currentPassword' || field === 'newPassword' || field === 'confirmPassword') {
      validateFieldOnInput(field, value)
    }
  }

  return (
    <div className="space-y-6">
      {/* ページタイトル */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">パスワードの変更</h2>
      </div>

      {/* メインカード */}
      <div className="bg-white border-2 border-green-300 rounded-2xl p-6 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 現在のパスワード */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              現在のパスワード
            </label>
            <input
              type="password"
              placeholder=""
              value={currentPassword}
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
              value={newPassword}
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
              value={confirmPassword}
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