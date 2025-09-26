"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Input } from "../atoms/input"
import { Button } from "../atoms/button"
import { RadioButton } from "../atoms/radio-button"
import { DateInput } from "../atoms/date-input"
import { validatePassword, validatePasswordRealtime, validatePasswordConfirm, validatePasswordConfirmRealtime } from "../../utils/validation"

interface RegisterFormData {
  nickname: string
  postalCode: string
  address: string
  birthDate: string
  gender: string
  password: string
  passwordConfirm: string
}

interface RegisterFormProps {
  email?: string
  onSubmit: (data: RegisterFormData) => void
  onCancel: () => void
  isLoading?: boolean
}

export function RegisterForm({ email, onSubmit, onCancel, isLoading = false }: RegisterFormProps) {
  const [formData, setFormData] = useState<RegisterFormData>({
    nickname: "",
    postalCode: "",
    address: "",
    birthDate: "",
    gender: "",
    password: "",
    passwordConfirm: "",
  })

  const [errors, setErrors] = useState<Partial<RegisterFormData>>({})
  const [isSearchingAddress, setIsSearchingAddress] = useState(false)
  
  // 住所フィールドへの参照を追加
  const addressInputRef = useRef<HTMLInputElement>(null)

  const genderOptions = [
    { value: "male", label: "男性" },
    { value: "female", label: "女性" },
    { value: "other", label: "その他" },
  ]

  const validateForm = () => {
    const newErrors: Partial<RegisterFormData> = {}

    // ニックネーム - 必須チェック
    if (!formData.nickname.trim()) {
      newErrors.nickname = "ニックネームを入力してください。"
    }

    // 郵便番号 - 必須チェック、桁数チェック
    if (!formData.postalCode) {
      newErrors.postalCode = "郵便番号を入力してください。"
    } else if (!/^\d{7}$/.test(formData.postalCode.replace(/-/g, ""))) {
      newErrors.postalCode = "郵便番号は7桁の数字で入力してください。"
    }

    // 住所 - 必須チェック
    if (!formData.address.trim()) {
      newErrors.address = "住所を入力してください。"
    }

    // 生年月日 - 必須チェック、日付形式チェック
    if (!formData.birthDate) {
      newErrors.birthDate = "生年月日を入力してください。"
    } else {
      const birthDate = new Date(formData.birthDate)
      const today = new Date()
      if (isNaN(birthDate.getTime())) {
        newErrors.birthDate = "正しい日付形式で入力してください。"
      } else if (birthDate >= today) {
        newErrors.birthDate = "生年月日は今日より前の日付を入力してください。"
      } else if (today.getFullYear() - birthDate.getFullYear() > 120) {
        newErrors.birthDate = "正しい生年月日を入力してください。"
      }
    }

    // 性別 - 選択チェック
    if (!formData.gender) {
      newErrors.gender = "性別を選択してください。"
    }

    // パスワードバリデーション
    const passwordValidation = validatePassword(formData.password)
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.errors[0]
    }

    // パスワード確認バリデーション
    const passwordConfirmValidation = validatePasswordConfirm(formData.password, formData.passwordConfirm)
    if (!passwordConfirmValidation.isValid) {
      newErrors.passwordConfirm = passwordConfirmValidation.error
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const handleAddressSearch = async () => {
    const cleanedPostalCode = formData.postalCode.replace(/-/g, "")
    
    // 郵便番号の基本バリデーション
    if (!formData.postalCode) {
      setErrors({ ...errors, postalCode: "郵便番号を入力してください" })
      return
    }
    
    if (!/^\d{7}$/.test(cleanedPostalCode)) {
      setErrors({ ...errors, postalCode: "郵便番号は7桁の数字で入力してください" })
      return
    }

    // 郵便番号が正しい場合はエラーをクリア
    setErrors(prev => ({ ...prev, postalCode: undefined }))

    setIsSearchingAddress(true)
    
    const apiUrl = `/api/address/search?zipcode=${cleanedPostalCode}`
    
    try {
      const response = await fetch(apiUrl)
      const data = await response.json()
      
      if (data.success && data.address) {
        setFormData(prev => ({ 
          ...prev, 
          address: data.address 
        }))
        setErrors(prev => ({ ...prev, address: undefined }))
      } else {
        setErrors(prev => ({
          ...prev,
          address: data.message || "該当する住所が見つかりませんでした。手入力で住所を入力してください。"
        }))
        
        // 住所フィールドにフォーカスを移す
        setTimeout(() => {
          if (addressInputRef.current) {
            addressInputRef.current.focus()
          }
        }, 100)
      }
      
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        address: "住所検索サービスに接続できませんでした。ネットワーク接続を確認するか、手入力で住所を入力してください。"
      }))
      
      // エラー時も住所フィールドにフォーカス
      setTimeout(() => {
        if (addressInputRef.current) {
          addressInputRef.current.focus()
        }
      }, 100)
    } finally {
      setIsSearchingAddress(false)
    }
  }

  const updateFormData = (field: keyof RegisterFormData, value: string) => {
    setFormData({ ...formData, [field]: value })
    
    // リアルタイムバリデーション
    const newErrors = { ...errors }
    
    switch (field) {
      case 'nickname':
        if (value.trim()) {
          delete newErrors.nickname
        }
        break
      case 'postalCode':
        const cleanedValue = value.replace(/-/g, "")
        if (value && /^\d{7}$/.test(cleanedValue)) {
          delete newErrors.postalCode
        }
        break
      case 'address':
        if (value.trim()) {
          delete newErrors.address
        }
        break
      case 'birthDate':
        if (value) {
          const birthDate = new Date(value)
          const today = new Date()
          if (!isNaN(birthDate.getTime()) && birthDate < today && today.getFullYear() - birthDate.getFullYear() <= 120) {
            delete newErrors.birthDate
          }
        }
        break
      case 'gender':
        if (value) {
          delete newErrors.gender
        }
        break
      case 'password':
        // パスワードリアルタイムバリデーション
        const passwordValidation = validatePasswordRealtime(value)
        if (passwordValidation.isValid) {
          delete newErrors.password
        } else if (passwordValidation.errors.length > 0) {
          newErrors.password = passwordValidation.errors[0]
        }
        // パスワードが変更されたらパスワード確認もチェック
        if (formData.passwordConfirm) {
          const confirmValidation = validatePasswordConfirmRealtime(value, formData.passwordConfirm)
          if (confirmValidation.isValid) {
            delete newErrors.passwordConfirm
          } else if (confirmValidation.error) {
            newErrors.passwordConfirm = confirmValidation.error
          }
        }
        break
      case 'passwordConfirm':
        // パスワード確認リアルタイムバリデーション
        const confirmValidation = validatePasswordConfirmRealtime(formData.password, value)
        if (confirmValidation.isValid) {
          delete newErrors.passwordConfirm
        } else if (confirmValidation.error) {
          newErrors.passwordConfirm = confirmValidation.error
        }
        break
    }
    
    setErrors(newErrors)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* メールアドレス表示 */}
      {email && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            メールアドレス
          </label>
          <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
            {email}
          </div>
          <p className="mt-1 text-xs text-gray-500">※認証済みのメールアドレスです</p>
        </div>
      )}

      {/* ニックネーム */}
      <Input
        type="text"
        label="ニックネーム"
        placeholder="ニックネームを入力"
        value={formData.nickname}
        onChange={(value) => updateFormData("nickname", value)}
        error={errors.nickname}
      />

      {/* 郵便番号と住所検索ボタンを横並び */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          郵便番号
        </label>
        <div className="flex gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="123-4567 または 1234567"
              value={formData.postalCode}
              onChange={(e) => updateFormData("postalCode", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
            />
          </div>
          <Button
            type="button"
            onClick={handleAddressSearch}
            disabled={isSearchingAddress}
            variant="secondary"
            className="px-6 py-3 whitespace-nowrap"
          >
            {isSearchingAddress ? "検索中..." : "住所検索"}
          </Button>
        </div>
        {errors.postalCode && <p className="mt-1 text-sm text-red-500">{errors.postalCode}</p>}
      </div>

      {/* 住所入力 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          住所
        </label>
        <input
          ref={addressInputRef}
          type="text"
          placeholder="住所を入力するか、上記の住所検索ボタンをご利用ください"
          value={formData.address}
          onChange={(e) => updateFormData("address", e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
        />
        {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address}</p>}
      </div>

      {/* 生年月日 */}
      <DateInput
        label="生年月日"
        value={formData.birthDate}
        onChange={(value) => updateFormData("birthDate", value)}
        error={errors.birthDate}
      />

      {/* 性別 */}
      <RadioButton
        name="gender"
        label="性別"
        options={genderOptions}
        value={formData.gender}
        onChange={(value) => updateFormData("gender", value)}
        error={errors.gender}
      />

      {/* パスワード */}
      <Input
        type="password"
        label="パスワード"
        placeholder="8文字以上の英数字"
        value={formData.password}
        onChange={(value) => updateFormData("password", value)}
        error={errors.password}
      />

      {/* パスワード確認 */}
      <Input
        type="password"
        label="パスワード確認"
        placeholder="パスワードを再入力"
        value={formData.passwordConfirm}
        onChange={(value) => updateFormData("passwordConfirm", value)}
        error={errors.passwordConfirm}
      />

      {/* ボタン */}
      <div className="space-y-3">
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-base font-medium"
        >
          {isLoading ? "登録中..." : "登録する"}
        </Button>

        <Button type="button" onClick={onCancel} variant="secondary" className="w-full py-3 text-base font-medium">
          キャンセル
        </Button>
      </div>
    </form>
  )
}