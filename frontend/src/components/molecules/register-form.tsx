"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Input } from "../atoms/input"
import { Button } from "../atoms/button"
import { RadioButton } from "../atoms/radio-button"
import { DateInput } from "../atoms/date-input"
import { UseRregistrationCompleteSchema, type UserRegistrationComplete } from "@hv-development/schemas"

interface RegisterFormProps {
  email?: string
  initialFormData?: UserRegistrationComplete | null
  onSubmit: (data: UserRegistrationComplete) => void
  onCancel: () => void
  isLoading?: boolean
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  email,
  initialFormData,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  console.log('🟠 RegisterForm: Component rendered with props:', { email, initialFormData, isLoading })
  const [formData, setFormData] = useState<UserRegistrationComplete>({
    email: email || "",
    nickname: "",
    postalCode: "",
    address: "",
    birthDate: "",
    gender: "male",
    saitamaAppId: "",
    password: "",
    passwordConfirm: "",
  })

  const [errors, setErrors] = useState<Partial<Record<keyof UserRegistrationComplete, string>>>({})
  const [isSearchingAddress, setIsSearchingAddress] = useState(false)

  // 住所フィールドへの参照を追加
  const addressInputRef = useRef<HTMLInputElement>(null)

  // initialFormDataが変更された時にフォームデータを設定
  useEffect(() => {
    console.log('🟣 RegisterForm: useEffect triggered with initialFormData:', initialFormData, 'email:', email)
    if (initialFormData) {
      const newFormData = {
        ...initialFormData,
        email: email || "", // emailプロパティを優先
        // セキュリティのためパスワードフィールドはクリア
        password: "",
        passwordConfirm: "",
      }
      console.log('🟣 RegisterForm: Setting formData to:', newFormData)
      setFormData(newFormData)
    }
  }, [initialFormData, email])

  const genderOptions = [
    { value: "male", label: "男性" },
    { value: "female", label: "女性" },
    { value: "other", label: "その他" },
  ]

  const validateField = (fieldName: keyof UserRegistrationComplete, value: string) => {
    try {
      UseRregistrationCompleteSchema.pick({ [fieldName]: true } as any).parse({ [fieldName]: value })
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[fieldName]
        return newErrors
      })
    } catch (error: any) {
      if (error && error.errors && Array.isArray(error.errors)) {
        const errorMessage = error.errors[0]?.message || "入力エラーです"
        setErrors(prev => ({ ...prev, [fieldName]: errorMessage }))
      }
    }
  }

  const validateForm = () => {
    console.log('🟡 RegisterForm: validateForm called with formData:', formData)

    try {
      // スキーマを使用してバリデーション
      const result = UseRregistrationCompleteSchema.parse(formData)
      console.log('🟢 RegisterForm: Validation successful:', result)
      setErrors({})
      return true
    } catch (error) {
      console.log('🔴 RegisterForm: Validation failed with error:', error)

      // ZodErrorかどうかをより確実にチェック
      if (error && typeof error === 'object' && 'errors' in error && Array.isArray((error as any).errors)) {
        const zodError = error as any
        console.log('🔴 RegisterForm: ZodError details:', zodError.errors)

        const newErrors: Partial<Record<keyof UserRegistrationComplete, string>> = {}

        zodError.errors.forEach((err: any) => {
          const field = err.path?.[0] as keyof UserRegistrationComplete
          console.log(`🔴 RegisterForm: Field error - ${field}:`, err.message)
          if (field) {
            newErrors[field] = err.message
          }
        })

        console.log('🔴 RegisterForm: Setting new errors:', newErrors)
        setErrors(() => newErrors)
      }
      return false
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    console.log('🔵 RegisterForm: handleSubmit called')
    e.preventDefault()

    console.log('🔵 RegisterForm: Current formData:', formData)
    console.log('🔵 RegisterForm: Current errors:', errors)

    const isValid = validateForm()
    console.log('🔵 RegisterForm: Validation result:', isValid)

    if (isValid) {
      console.log('🔵 RegisterForm: Calling onSubmit with formData:', formData)
      onSubmit(formData)
      console.log('🔵 RegisterForm: onSubmit called successfully')
    } else {
      console.log('🔵 RegisterForm: Validation failed, onSubmit not called')
      console.log('🔵 RegisterForm: Updated errors after validation:', errors)
    }
  }


  const handleAddressSearch = async () => {
    const cleanedPostalCode = formData.postalCode.replace(/-/g, "")

    // 住所検索時は郵便番号の基本チェックのみ（エラー表示なし）
    if (!formData.postalCode || !/^\d{7}$/.test(cleanedPostalCode)) {
      // 無効な郵便番号の場合は何もしない（エラー表示もしない）
      return
    }
    setIsSearchingAddress(true)

    const apiUrl = `/api/address/search?zipcode=${cleanedPostalCode}`

    try {
      const response = await fetch(apiUrl)
      const data = await response.json()

      if (data.success && data.address) {
        // 住所が見つかった場合
        setFormData(prev => ({
          ...prev,
          address: data.address
        }))

        setErrors(prev => ({ ...prev, address: undefined }))
      } else {
        // 住所が見つからない場合も住所検索時はエラー表示しない
        // 住所フィールドは空のままにして、ユーザーが手入力できるようにする

        // 住所フィールドにフォーカスを移す
        setTimeout(() => {
          if (addressInputRef.current) {
            addressInputRef.current.focus()
          }
        }, 100)
      }

    } catch (error) {
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

  const updateFormData = (field: keyof UserRegistrationComplete, value: string): void => {
    setFormData({ ...formData, [field]: value })

    // リアルタイムバリデーション実行
    if (value.trim()) {
      validateField(field, value)
    } else {
      // 空の場合はエラーをクリア
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
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
              id="postalCode"
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

      {/* 埼玉県アプリID */}
      <Input
        type="text"
        label="埼玉県アプリID（任意）"
        placeholder="埼玉県アプリIDを入力"
        value={formData.saitamaAppId || ""}
        onChange={(value) => updateFormData("saitamaAppId", value)}
        error={errors.saitamaAppId || undefined}
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