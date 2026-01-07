'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CreateMerchantSchema, type CreateMerchant, MerchantFormSchema } from '@hv-development/schemas'
import { z } from 'zod'

// accountEmail用のバリデーションスキーマ
const accountEmailSchema = z.string().min(1, 'メールアドレスは必須です').email('有効なメールアドレスを入力してください')

// 都道府県リスト
const prefectures = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
]

interface FormErrors {
  [key: string]: string
}

type MerchantApplyFormData = Omit<CreateMerchant, 'applications' | 'issueAccount' | 'businessType' | 'businessDescription'>

export default function MerchantApplyPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<MerchantApplyFormData>({
    accountEmail: '',
    name: '',
    nameKana: '',
    representativeNameLast: '',
    representativeNameFirst: '',
    representativeNameLastKana: '',
    representativeNameFirstKana: '',
    representativePhone: '',
    postalCode: '',
    prefecture: '',
    city: '',
    address1: '',
    address2: '',
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSearchingAddress, setIsSearchingAddress] = useState(false)
  const [serverError, setServerError] = useState<string>('')
  const [isSuccess, setIsSuccess] = useState(false)

  const handleInputChange = (field: keyof MerchantApplyFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    
    // リアルタイムバリデーション
    validateField(field, value)
  }

  const handleBlur = (field: keyof MerchantApplyFormData) => {
    const value = formData[field] || ''
    validateField(field, value)
  }

  const validateField = (field: keyof MerchantApplyFormData, value: string) => {
    try {
      if (field === 'accountEmail') {
        // accountEmailは独自のスキーマでバリデーション
        accountEmailSchema.parse(value)
      } else if (field === 'address2') {
        // address2は任意項目なので、バリデーション不要
        setErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors[field]
          return newErrors
        })
        return
      } else {
        // その他のフィールドはMerchantFormSchemaでバリデーション
        const fieldSchema = MerchantFormSchema.shape[field as keyof typeof MerchantFormSchema.shape]
        if (fieldSchema) {
          fieldSchema.parse(value)
        }
      }
      
      // バリデーション成功 - エラーをクリア
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        // エラーメッセージを設定
        const errorMessage = error.errors[0]?.message || '入力エラーです'
        setErrors((prev) => ({ ...prev, [field]: errorMessage }))
      }
    }
  }

  const handleAddressSearch = async () => {
    const cleanedPostalCode = formData.postalCode.replace(/-/g, '')
    
    // スキーマベースのバリデーションを使用
    try {
      const postalCodeSchema = MerchantFormSchema.shape.postalCode
      postalCodeSchema.parse(cleanedPostalCode)
      
      // バリデーション成功 - エラーをクリア
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.postalCode
        return newErrors
      })
    } catch (error) {
      // バリデーションエラーが発生した場合
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors[0]?.message || '郵便番号の形式が正しくありません'
        setErrors(prev => ({
          ...prev,
          postalCode: errorMessage
        }))
      }
      return
    }

    setIsSearchingAddress(true)

    const apiUrl = `/api/address/search?zipcode=${cleanedPostalCode}`

    try {
      const response = await fetch(apiUrl)
      const data = await response.json()

      if (data.success && data.data) {
        const result = data.data
        setFormData(prev => ({
          ...prev,
          prefecture: result.address1,
          city: result.address2,
          address1: result.address3
        }))
        setErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors.prefecture
          delete newErrors.city
          delete newErrors.address1
          return newErrors
        })
      } else {
        setErrors(prev => ({
          ...prev,
          postalCode: '該当する住所が見つかりませんでした。郵便番号を確認するか、住所を直接入力してください。'
        }))
      }
    } catch {
      setErrors(prev => ({
        ...prev,
        postalCode: '住所検索に失敗しました'
      }))
    } finally {
      setIsSearchingAddress(false)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    try {
      // CreateMerchantSchemaを使用してバリデーション
      CreateMerchantSchema.parse({
        ...formData,
        applications: ['たまのみ'] // デフォルト値
      })
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        // zodのエラーをFormErrorsに変換
        error.errors.forEach((err) => {
          const field = err.path[0]
          if (field && typeof field === 'string') {
            newErrors[field] = err.message
          }
        })
      }
      setErrors(newErrors)
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      // 最初のエラーフィールドにスクロール
      const firstErrorField = Object.keys(errors)[0]
      const element = document.getElementById(firstErrorField)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return
    }

    setIsSubmitting(true)
    setServerError('')

    try {
      const response = await fetch(`/api/merchants/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSuccess(true)
        // 3秒後にLPトップに戻る
        setTimeout(() => {
          router.push('/lp/merchant')
        }, 5000)
      } else {
        setServerError(data.error?.message || '申し込みに失敗しました')
      }
    } catch (error) {
      console.error('申し込みエラー:', error)
      setServerError('申し込み処理に失敗しました。しばらくしてから再度お試しください。')
    } finally {
      setIsSubmitting(false)
    }
  }

  return isSuccess ? (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8 md:p-12 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-green-700 mb-4">
            お申し込みありがとうございます
          </h1>
        </div>
        <div className="space-y-4 text-gray-700">
          <p className="text-lg">
            ご登録のメールアドレスにパスワード設定用のメールを送信しました。
          </p>
          <p>
            メール内のリンクからパスワードを設定し、ログインしてください。
          </p>
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ※ メールが届かない場合は、迷惑メールフォルダをご確認ください。<br />
              ※ 数分経ってもメールが届かない場合は、お問い合わせください。
            </p>
          </div>
        </div>
        <div className="mt-8">
          <Link 
            href="/lp/merchant"
            className="inline-block bg-green-600 text-white px-8 py-3 rounded-full font-bold hover:bg-green-700 transition-colors"
          >
            戻る
          </Link>
        </div>
      </div>
    </div>
  ) : (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/lp/merchant" className="inline-flex items-center">
            <Image
              src="/lp/images/logo.png"
              alt="たまのみ"
              width={160}
              height={160}
              className="h-10 w-auto"
            />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-10">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-green-700 mb-2">
              掲載店お申し込み
            </h1>
            <p className="text-gray-600">
              下記のフォームに必要事項をご入力ください
            </p>
          </div>

          {/* Server Error */}
          {serverError && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-800">{serverError}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6" suppressHydrationWarning autoComplete="off">
            {/* 基本情報 */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-6">基本情報</h3>

            {/* 事業者名 */}
            <div>
              <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-2">
                事業者名 <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                onBlur={() => handleBlur('name')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="株式会社たまのみ"
              />
              <div className="mt-1">
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name}</p>
                )}
              </div>
            </div>

            {/* 事業者名（カナ） */}
            <div>
              <label htmlFor="nameKana" className="block text-sm font-bold text-gray-700 mb-2">
                事業者名（カナ） <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                id="nameKana"
                value={formData.nameKana}
                onChange={(e) => handleInputChange('nameKana', e.target.value)}
                onBlur={() => handleBlur('nameKana')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.nameKana ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="カブシキガイシャタマノミ"
              />
              <div className="mt-1">
                {errors.nameKana && (
                  <p className="text-sm text-red-600">{errors.nameKana}</p>
                )}
              </div>
            </div>

            {/* 代表者名（姓・名） */}
            <div className="flex gap-4">
              <div className="w-50">
                <label htmlFor="representativeNameLast" className="block text-sm font-bold text-gray-700 mb-2">
                  代表者名（姓） <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  id="representativeNameLast"
                  value={formData.representativeNameLast}
                  onChange={(e) => handleInputChange('representativeNameLast', e.target.value)}
                  onBlur={() => handleBlur('representativeNameLast')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.representativeNameLast ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="たまのみ"
                  maxLength={25}
                />
                <div className="mt-1">
                  {errors.representativeNameLast && (
                    <p className="text-sm text-red-600">{errors.representativeNameLast}</p>
                  )}
                </div>
              </div>

              <div className="w-50">
                <label htmlFor="representativeNameFirst" className="block text-sm font-bold text-gray-700 mb-2">
                  代表者名（名） <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  id="representativeNameFirst"
                  value={formData.representativeNameFirst}
                  onChange={(e) => handleInputChange('representativeNameFirst', e.target.value)}
                  onBlur={() => handleBlur('representativeNameFirst')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.representativeNameFirst ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="太郎"
                  maxLength={25}
                />
                <div className="mt-1">
                  {errors.representativeNameFirst && (
                    <p className="text-sm text-red-600">{errors.representativeNameFirst}</p>
                  )}
                </div>
              </div>
            </div>

            {/* 代表者名（姓・名 / カナ） */}
            <div className="flex gap-4">
              <div className="w-50">
                <label htmlFor="representativeNameLastKana" className="block text-sm font-bold text-gray-700 mb-2">
                  代表者名（姓 / カナ） <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  id="representativeNameLastKana"
                  value={formData.representativeNameLastKana}
                  onChange={(e) => handleInputChange('representativeNameLastKana', e.target.value)}
                  onBlur={() => handleBlur('representativeNameLastKana')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.representativeNameLastKana ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="タマノミ"
                  maxLength={50}
                />
                <div className="mt-1">
                  {errors.representativeNameLastKana && (
                    <p className="text-sm text-red-600">{errors.representativeNameLastKana}</p>
                  )}
                </div>
              </div>

              <div className="w-50">
                <label htmlFor="representativeNameFirstKana" className="block text-sm font-bold text-gray-700 mb-2">
                  代表者名（名 / カナ） <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  id="representativeNameFirstKana"
                  value={formData.representativeNameFirstKana}
                  onChange={(e) => handleInputChange('representativeNameFirstKana', e.target.value)}
                  onBlur={() => handleBlur('representativeNameFirstKana')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.representativeNameFirstKana ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="タロウ"
                  maxLength={50}
                />
                <div className="mt-1">
                  {errors.representativeNameFirstKana && (
                    <p className="text-sm text-red-600">{errors.representativeNameFirstKana}</p>
                  )}
                </div>
              </div>
            </div>

            {/* 電話番号 */}
            <div className="w-100">
              <label htmlFor="representativePhone" className="block text-sm font-bold text-gray-700 mb-2">
                代表者電話番号 <span className="text-red-600">*</span>
              </label>
              <input
                type="tel"
                id="representativePhone"
                value={formData.representativePhone}
                onChange={(e) => handleInputChange('representativePhone', e.target.value.replace(/\D/g, ''))}
                onBlur={() => handleBlur('representativePhone')}
                className={`w-100 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.representativePhone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0312345678"
              />
              <div className="mt-1">
                {errors.representativePhone && (
                  <p className="text-sm text-red-600">{errors.representativePhone}</p>
                )}
              </div>
            </div>

            {/* メールアドレス */}
            <div className="w-full md:w-[640px]">
              <label htmlFor="accountEmail" className="block text-sm font-bold text-gray-700 mb-2">
                メールアドレス <span className="text-red-600">*</span>
              </label>
              <input
                type="email"
                id="accountEmail"
                value={formData.accountEmail}
                onChange={(e) => handleInputChange('accountEmail', e.target.value)}
                onBlur={() => handleBlur('accountEmail')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.accountEmail ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="example@example.com"
              />
              <div className="mt-1">
                {errors.accountEmail && (
                  <p className="text-sm text-red-600">{errors.accountEmail}</p>
                )}
              </div>
            </div>

            </div>

            {/* 住所情報 */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-6">住所情報</h3>
              {/* 郵便番号 */}
            <div>
              <label htmlFor="postalCode" className="block text-sm font-bold text-gray-700 mb-2">
                郵便番号 <span className="text-red-600">*</span>
              </label>
              <div className="flex gap-4">
                <div className="w-40">
                  <input
                    type="text"
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value.replace(/\D/g, ''))}
                    onBlur={() => handleBlur('postalCode')}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                      errors.postalCode ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="1234567"
                    maxLength={7}
                  />
                  <div className="mt-1">
                    {errors.postalCode && (
                      <p className="text-sm text-red-600">{errors.postalCode}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleAddressSearch}
                    disabled={isSearchingAddress || formData.postalCode.length !== 7}
                    className="w-32 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:bg-gray-200 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSearchingAddress ? '検索中...' : '住所検索'}
                  </button>
                </div>
              </div>
            </div>

            {/* 都道府県 */}
            <div className="w-60">
              <label htmlFor="prefecture" className="block text-sm font-bold text-gray-700 mb-2">
                都道府県 <span className="text-red-600">*</span>
              </label>
              <select
                id="prefecture"
                value={formData.prefecture}
                onChange={(e) => handleInputChange('prefecture', e.target.value)}
                onBlur={() => handleBlur('prefecture')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.prefecture ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">選択してください</option>
                {prefectures.map((pref) => (
                  <option key={pref} value={pref}>
                    {pref}
                  </option>
                ))}
              </select>
              <div className="mt-1">
                {errors.prefecture && (
                  <p className="text-sm text-red-600">{errors.prefecture}</p>
                )}
              </div>
            </div>

            {/* 市区町村 */}
            <div>
              <label htmlFor="city" className="block text-sm font-bold text-gray-700 mb-2">
                市区町村 <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                onBlur={() => handleBlur('city')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.city ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="さいたま市桜区"
              />
              <div className="mt-1">
                {errors.city && (
                  <p className="text-sm text-red-600">{errors.city}</p>
                )}
              </div>
            </div>

            {/* 住所1 */}
            <div>
              <label htmlFor="address1" className="block text-sm font-bold text-gray-700 mb-2">
                町名・番地 <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                id="address1"
                value={formData.address1}
                onChange={(e) => handleInputChange('address1', e.target.value)}
                onBlur={() => handleBlur('address1')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.address1 ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="西堀1-2-3"
              />
              <div className="mt-1">
                {errors.address1 && (
                  <p className="text-sm text-red-600">{errors.address1}</p>
                )}
              </div>
            </div>

            {/* 住所2 */}
            <div>
              <label htmlFor="address2" className="block text-sm font-bold text-gray-700 mb-2">
                建物名・部屋番号
              </label>
              <input
                type="text"
                id="address2"
                value={formData.address2 || ''}
                onChange={(e) => handleInputChange('address2', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="〇〇ビル 3F"
              />
            </div>

            </div>

            {/* 注意事項 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <span className="font-bold">ご注意：</span><br />
                お申し込み後、ご登録のメールアドレスにパスワード設定用のメールを送信いたします。<br />
                メール内のリンクからパスワードを設定し、管理画面にログインしてください。
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 justify-center items-center">
              <button
                type="button"
                onClick={() => router.push('/lp/merchant')}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? '送信中...' : '申し込む'}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-600">
            <p>&copy; 2025 TAMANOMI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

