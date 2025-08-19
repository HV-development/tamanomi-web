"use client"

import type React from "react"
import { useState } from "react"
import { Settings } from "lucide-react"

interface EmailChangeFormProps {
  currentEmail: string
  initialNewEmail?: string
  onSubmit: (currentPassword: string, newEmail: string) => void
  onCancel: () => void
  isLoading?: boolean
}

export function EmailChangeForm({ currentEmail, initialNewEmail = "", onSubmit, onCancel, isLoading = false }: EmailChangeFormProps) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newEmail, setNewEmail] = useState(initialNewEmail)
  const [confirmEmail, setConfirmEmail] = useState("")
  const [errors, setErrors] = useState<{
    currentPassword?: string
    newEmail?: string
    confirmEmail?: string
  }>({})

  const validateForm = () => {
    const newErrors: typeof errors = {}

    // 現在のパスワード
    if (!currentPassword) {
      newErrors.currentPassword = "現在のパスワードを入力してください。"
    }

    // 新しいメールアドレス
    if (!newEmail) {
      newErrors.newEmail = "新しいメールアドレスを入力してください。"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      newErrors.newEmail = "正しいメールアドレスを入力してください。"
    } else if (newEmail === currentEmail) {
      newErrors.newEmail = "現在のメールアドレスと同じです。"
    }

    // メールアドレス確認
    if (!confirmEmail) {
      newErrors.confirmEmail = "メールアドレス確認を入力してください。"
    } else if (newEmail !== confirmEmail) {
      newErrors.confirmEmail = "メールアドレスが一致しません。"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateFieldOnInput = (field: keyof typeof errors, value: string) => {
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
        newErrors.newEmail = "正しいメールアドレスを入力してください。"
      } else if (value === currentEmail) {
        newErrors.newEmail = "現在のメールアドレスと同じです。"
      } else {
        delete newErrors.newEmail
      }
    }
    
    if (field === 'confirmEmail') {
      if (value && newEmail !== value) {
        newErrors.confirmEmail = "メールアドレスが一致しません。"
      } else if (value && newEmail === value) {
        delete newErrors.confirmEmail
      }
    }
    
    setErrors(newErrors)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(currentPassword, newEmail)
    }
  }

  const updateField = (field: keyof typeof errors, value: string) => {
    if (field === "currentPassword") setCurrentPassword(value)
    if (field === "newEmail") setNewEmail(value)
    if (field === "confirmEmail") setConfirmEmail(value)

    if (field === 'currentPassword' || field === 'newEmail' || field === 'confirmEmail') {
      validateFieldOnInput(field, value)
    }
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
              value={currentPassword}
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
              value={newEmail}
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
              value={confirmEmail}
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