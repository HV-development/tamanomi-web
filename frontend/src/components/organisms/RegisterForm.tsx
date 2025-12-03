"use client"

import type React from "react"
import { useState, useRef, useEffect, useMemo } from "react"
import { Input } from "@/components/atoms/Input"
import { Button } from "@/components/atoms/Button"
import { RadioButton } from "@/components/atoms/RadioButton"
import { DateSelect } from "@/components/atoms/DateSelect"
import { UseRregistrationCompleteSchema, type UserRegistrationComplete } from "@hv-development/schemas"
import { calculateAge } from "@/utils/age-calculator"

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
  const [formData, setFormData] = useState<UserRegistrationComplete>({
    email: email || "",
    nickname: "",
    postalCode: "",
    address: "",
    birthDate: "",
    gender: "male",
    phone: "",
    saitamaAppId: "",
    password: "",
    passwordConfirm: "",
  })

  const [errors, setErrors] = useState<Partial<Record<keyof UserRegistrationComplete, string>>>({})
  const [isSearchingAddress, setIsSearchingAddress] = useState(false)
  const [touchedFields, setTouchedFields] = useState<Set<keyof UserRegistrationComplete>>(new Set())
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [termsError, setTermsError] = useState("")
  const [agreedToAlcoholRestriction, setAgreedToAlcoholRestriction] = useState(false)
  const [alcoholRestrictionError, setAlcoholRestrictionError] = useState("")

  // 住所フィールドへの参照を追加
  const addressInputRef = useRef<HTMLInputElement>(null)

  // 生年月日から年齢を計算し、20歳未満かどうかを判定
  const isUnder20 = useMemo(() => {
    if (!formData.birthDate) return false
    try {
      const age = calculateAge(formData.birthDate)
      return age < 20
    } catch {
      return false
    }
  }, [formData.birthDate])

  // 生年月日が変更されて20歳以上になった場合、チェックボックスの状態をリセット
  useEffect(() => {
    if (!isUnder20) {
      setAgreedToAlcoholRestriction(false)
      setAlcoholRestrictionError("")
    }
  }, [isUnder20])

  // initialFormDataが変更された時にフォームデータを設定
  useEffect(() => {
    if (initialFormData) {
      const newFormData = {
        ...initialFormData,
        email: email || "", // emailプロパティを優先
        // セキュリティのためパスワードフィールドはクリア
        password: "",
        passwordConfirm: "",
      }
      setFormData(newFormData)
    }
  }, [initialFormData, email])

  const genderOptions = [
    { value: "male", label: "男性" },
    { value: "female", label: "女性" },
    { value: "other", label: "その他" },
  ]

  const validateField = (fieldName: keyof UserRegistrationComplete, value: string) => {
    // タッチされていないフィールドはバリデーションしない（入力中のリアルタイムバリデーションのみ）
    if (!touchedFields.has(fieldName)) {
      return
    }

    try {
      // 個別フィールドのバリデーション（フォーム全体をパースして該当フィールドのエラーのみを抽出）
      const testData = { ...formData, [fieldName]: value }
      UseRregistrationCompleteSchema.parse(testData)

      // バリデーション成功時はエラーをクリア
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[fieldName]
        return newErrors
      })
    } catch (error) {
      if (error && typeof error === 'object' && 'errors' in error) {
        const zodError = error as { errors: Array<{ path?: (string | number)[]; message: string }> }
        // 該当フィールドのエラーのみを抽出
        const fieldError = zodError.errors.find(err => err.path?.[0] === fieldName)
        if (fieldError) {
          setErrors(prev => ({ ...prev, [fieldName]: fieldError.message }))
        } else {
          // 該当フィールドにエラーがない場合はエラーをクリア
          setErrors(prev => {
            const newErrors = { ...prev }
            delete newErrors[fieldName]
            return newErrors
          })
        }
      }
    }
  }

  const validateForm = () => {
    try {
      // スキーマを使用してバリデーション
      UseRregistrationCompleteSchema.parse(formData)
      setErrors({})
      return true
    } catch (error) {
      // ZodErrorかどうかをより確実にチェック
      if (error && typeof error === 'object' && 'errors' in error) {
        const zodError = error as { errors: Array<{ path?: (string | number)[]; message: string }> }

        const newErrors: Partial<Record<keyof UserRegistrationComplete, string>> = {}

        zodError.errors.forEach((err) => {
          const field = err.path?.[0] as keyof UserRegistrationComplete
          if (field) {
            newErrors[field] = err.message
          }
        })

        setErrors(() => newErrors)
      }
      return false
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // 利用規約の同意チェック
    if (!agreedToTerms) {
      setTermsError("利用規約とプライバシーポリシーに同意してください")
      return
    }
    setTermsError("")

    // 20歳未満の場合のアルコール制限チェック
    if (isUnder20 && !agreedToAlcoholRestriction) {
      setAlcoholRestrictionError("20歳未満の方はアルコールは飲めませんに同意してください")
      return
    }
    setAlcoholRestrictionError("")

    const isValid = validateForm()

    if (isValid) {
      onSubmit(formData)
    }
  }


  const handleAddressSearch = async () => {
    const cleanedPostalCode = formData.postalCode.replace(/-/g, "")

    // 郵便番号の形式チェック
    if (!formData.postalCode) {
      setErrors(prev => ({
        ...prev,
        postalCode: '郵便番号を入力してください。'
      }))
      return
    }

    if (!/^\d{7}$/.test(cleanedPostalCode)) {
      setErrors(prev => ({
        ...prev,
        postalCode: '郵便番号は7桁の数字で入力してください。'
      }))
      return
    }

    setIsSearchingAddress(true)

    const apiUrl = `/api/address/search?zipcode=${cleanedPostalCode}`

    try {
      const response = await fetch(apiUrl)
      
      // レスポンスのステータスコードをチェック
      if (!response.ok) {
        // エラーレスポンスの場合
        let errorMessage = '住所検索中にエラーが発生しました。しばらくしてから再度お試しください。'
        try {
          const errorData = await response.json()
          if (errorData.message) {
            errorMessage = errorData.message
          }
        } catch {
          // JSONパースに失敗した場合はデフォルトメッセージを使用
        }
        
        setErrors(prev => ({
          ...prev,
          postalCode: errorMessage
        }))
        
        // 住所フィールドにフォーカス
        setTimeout(() => {
          if (addressInputRef.current) {
            addressInputRef.current.focus()
          }
        }, 100)
        return
      }

      const data = await response.json()

      if (data.success && data.address) {
        // 住所が見つかった場合
        setFormData(prev => ({
          ...prev,
          address: data.address
        }))

        // 住所が見つかった場合は郵便番号と住所のエラーをクリア
        setErrors(prev => ({
          ...prev,
          postalCode: undefined,
          address: undefined
        }))
      } else {
        // 住所が見つからない場合はエラーメッセージを表示
        const errorMessage = data.message || '該当する住所が見つかりませんでした。郵便番号を確認するか、住所を直接入力してください。'
        setErrors(prev => ({
          ...prev,
          postalCode: errorMessage
        }))

        // 住所フィールドにフォーカスを移す
        setTimeout(() => {
          if (addressInputRef.current) {
            addressInputRef.current.focus()
          }
        }, 100)
      }

    } catch (error) {
      // ネットワークエラーやJSONパースエラーなどの場合
      console.error('住所検索エラー:', error)
      setErrors(prev => ({
        ...prev,
        postalCode: '住所検索中にエラーが発生しました。しばらくしてから再度お試しください。'
      }))

      // 住所フィールドにフォーカス
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

    // フィールドをタッチ済みとしてマーク
    setTouchedFields(prev => new Set(prev).add(field))

    // リアルタイムバリデーション実行（タッチ済みフィールドのみ）
    validateField(field, value)
  }

  // フィールドのblurイベント時のバリデーション
  const handleFieldBlur = (field: keyof UserRegistrationComplete) => {
    setTouchedFields(prev => new Set(prev).add(field))
    const value = formData[field] as string
    validateField(field, value)
  }


  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ニックネーム */}
      <Input
        type="text"
        label="ニックネーム"
        placeholder="ニックネームを入力"
        value={formData.nickname}
        onChange={(value) => updateFormData("nickname", value)}
        onBlur={() => handleFieldBlur("nickname")}
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
              placeholder="ハイフンなし"
              value={formData.postalCode}
              onChange={(e) => updateFormData("postalCode", e.target.value)}
              onBlur={() => handleFieldBlur("postalCode")}
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
          placeholder="住所を入力してください"
          value={formData.address}
          onChange={(e) => updateFormData("address", e.target.value)}
          onBlur={() => handleFieldBlur("address")}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
        />
        {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address}</p>}
      </div>

      {/* 生年月日 */}
      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          生年月日
          <span className="ml-2 text-xs text-gray-500 font-normal">※登録後の変更はできません</span>
        </label>
        <DateSelect
          value={formData.birthDate}
          onChange={(value) => updateFormData("birthDate", value)}
          error={errors.birthDate}
        />
      </div>

      {/* 20歳未満の場合のアルコール制限チェックボックス */}
      {isUnder20 && (
        <div className="space-y-2">
          <div className="flex items-start">
            <input
              type="checkbox"
              id="alcoholRestriction"
              checked={agreedToAlcoholRestriction}
              onChange={(e) => {
                setAgreedToAlcoholRestriction(e.target.checked)
                if (e.target.checked) {
                  setAlcoholRestrictionError("")
                }
              }}
              className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded cursor-pointer"
            />
            <label htmlFor="alcoholRestriction" className="ml-2 text-sm text-gray-700 cursor-pointer">
              20歳未満の方はアルコールは飲めません
              <span className="text-red-500 ml-1">*</span>
            </label>
          </div>
          {alcoholRestrictionError && (
            <p className="text-sm text-red-600 ml-6">{alcoholRestrictionError}</p>
          )}
        </div>
      )}

      {/* 電話番号 */}
      <Input
        type="tel"
        label="電話番号"
        placeholder="09012345678（ハイフンなし）"
        value={formData.phone || ""}
        onChange={(value) => updateFormData("phone", value)}
        onBlur={() => handleFieldBlur("phone")}
        error={errors.phone || undefined}
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

      {/* さいたま市みんなのアプリID */}
      <Input
        type="text"
        label="さいたま市みんなのアプリ（任意）"
        placeholder="さいたま市みんなのアプリIDを入力"
        value={formData.saitamaAppId || ""}
        onChange={(value) => updateFormData("saitamaAppId", value)}
        onBlur={() => handleFieldBlur("saitamaAppId")}
        error={errors.saitamaAppId || undefined}
      />

      {/* パスワード */}
      <Input
        type="password"
        label="パスワード"
        placeholder="8文字以上の英数字"
        value={formData.password}
        onChange={(value) => updateFormData("password", value)}
        onBlur={() => handleFieldBlur("password")}
        error={errors.password}
      />

      {/* パスワード確認 */}
      <Input
        type="password"
        label="パスワード確認"
        placeholder="パスワードを再入力"
        value={formData.passwordConfirm}
        onChange={(value) => updateFormData("passwordConfirm", value)}
        onBlur={() => handleFieldBlur("passwordConfirm")}
        error={errors.passwordConfirm}
      />

      {/* 利用規約とプライバシーポリシーの同意 */}
      <div className="space-y-2">
        <div className="flex items-start">
          <input
            type="checkbox"
            id="terms"
            checked={agreedToTerms}
            onChange={(e) => {
              setAgreedToTerms(e.target.checked)
              if (e.target.checked) {
                setTermsError("")
              }
            }}
            className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded cursor-pointer"
          />
          <label htmlFor="terms" className="ml-2 text-sm text-gray-700 cursor-pointer">
            <a
              href="/たまのみサービス利用規約.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 hover:text-green-700 underline font-medium"
              onClick={(e) => e.stopPropagation()}
            >
              利用規約
            </a>
            と
            <a
              href="/プライバシーポリシー.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 hover:text-green-700 underline font-medium"
              onClick={(e) => e.stopPropagation()}
            >
              プライバシーポリシー
            </a>
            に同意する
          </label>
        </div>
        {termsError && (
          <p className="text-sm text-red-600 ml-6">{termsError}</p>
        )}
      </div>

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