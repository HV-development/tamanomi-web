'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  userContactFormSchema,
  merchantContactFormSchema,
  type UserContactFormData,
  type MerchantContactFormData,
} from '@hv-development/schemas'
type ContactFormData = UserContactFormData | MerchantContactFormData

function ContactFormContent() {
  const searchParams = useSearchParams()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    message: '',
    inquiryType: 'user',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string>('')
  const [agreedToPrivacyPolicy, setAgreedToPrivacyPolicy] = useState(false)
  const [privacyPolicyError, setPrivacyPolicyError] = useState<string>('')

  // 問い合わせ種別の自動判別（初期値のみ）
  useEffect(() => {
    const typeParam = searchParams.get('type')
    const referrer = document.referrer

    let detectedType: 'user' | 'merchant' = 'user'

    if (typeParam === 'merchant') {
      detectedType = 'merchant'
    } else if (referrer.includes('/lp/merchant')) {
      detectedType = 'merchant'
    }

    setFormData(prev => ({ ...prev, inquiryType: detectedType }))
  }, [searchParams])

  // バリデーション
  const validateForm = (): boolean => {
    try {
      const schema = formData.inquiryType === 'merchant' ? merchantContactFormSchema : userContactFormSchema

      schema.parse(formData)
      setErrors({})
      return true
    } catch (error: unknown) {
      console.error('❌ バリデーション失敗:', error)
      if (error && typeof error === 'object' && 'errors' in error) {
        const zodError = error as { errors: Array<{ path?: (string | number)[]; message: string }> }
        const newErrors: Partial<Record<keyof ContactFormData, string>> = {}
        zodError.errors.forEach((err) => {
          const fieldName = err.path?.[0] as keyof ContactFormData
          if (fieldName) {
            newErrors[fieldName] = err.message
          }
        })
        setErrors(newErrors)
      }
      return false
    }
  }

  // フォーム送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 個人情報の取扱についての同意チェック
    if (!agreedToPrivacyPolicy) {
      setPrivacyPolicyError('個人情報の取扱について同意してください')
      return
    }
    setPrivacyPolicyError('')

    if (!validateForm()) {
      // エラーをアラートで表示（デバッグ用）
      const errorMessages = Object.entries(errors).map(([key, value]) => `${key}: ${value}`).join('\n')
      if (errorMessages) {
        alert(`バリデーションエラー:\n\n${errorMessages}`)
      }
      return
    }

    setIsSubmitting(true)
    setSubmitError('')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSubmitSuccess(true)
        setFormData({
          name: '',
          email: '',
          message: '',
          inquiryType: formData.inquiryType,
        })
        setAgreedToPrivacyPolicy(false)
      } else {
        setSubmitError(data.message || 'お問い合わせの送信に失敗しました')
      }
    } catch (error: unknown) {
      console.error('❌ お問い合わせ送信エラー:', error)
      setSubmitError('お問い合わせの送信中にエラーが発生しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  const nameLabel = formData.inquiryType === 'merchant' ? '掲載店名' : '氏名'
  const namePlaceholder = formData.inquiryType === 'merchant' ? '例：居酒屋たまのみ' : '例：山田 太郎'

  return (
    <div className="w-full overflow-x-hidden">
      {/* Header */}
      <header className="relative w-full bg-white border-b" style={{ zIndex: 100 }}>
        <div className="w-full px-4 py-4 md:px-8 md:py-6">
          <div className="flex items-center w-full max-w-6xl mx-auto">
            <Link href="/lp" className="flex items-center">
              <Image
                src="/lp/images/logo.png"
                alt="たまのみ"
                width={328}
                height={329}
                className="w-20 h-20 md:w-24 md:h-24"
              />
            </Link>
            <div style={{ flex: 1 }}></div>
            <div className="flex items-center gap-4 md:gap-8">
              <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
                <Link href="/lp#about" className="text-gray-700 hover:text-blue-600 transition-colors">たまのみとは</Link>
                <Link href="/lp#features" className="text-gray-700 hover:text-blue-600 transition-colors">魅力</Link>
                <Link href="/lp#howto" className="text-gray-700 hover:text-blue-600 transition-colors">使い方</Link>
                <Link href="/lp#pricing" className="text-gray-700 hover:text-blue-600 transition-colors">利用料金</Link>
              </nav>

              <Link
                href="/lp/merchant"
                className="text-white font-bold hover:opacity-90 transition-opacity text-xs md:text-sm px-4 py-2 md:px-6 md:py-3 rounded-full"
                style={{
                  background: 'var(--main, #6FC8E5)'
                }}
              >
                お店の方はこちら
              </Link>

              <button
                className="md:hidden flex flex-col justify-center items-center cursor-pointer"
                style={{ gap: '6px' }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="メニュー"
              >
                <div style={{ width: '24px', height: '2px', background: '#333' }}></div>
                <div style={{ width: '24px', height: '2px', background: '#333' }}></div>
                <div style={{ width: '24px', height: '2px', background: '#333' }}></div>
              </button>
            </div>
          </div>
        </div>

        {/* モバイルメニュー */}
        {isMobileMenuOpen && (
          <div
            className="md:hidden fixed inset-0 w-full h-full bg-white"
            style={{
              display: 'flex',
              paddingBottom: '184px',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: '32px',
              zIndex: 9999
            }}
          >
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity"
              aria-label="メニューを閉じる"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="#007D4F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <nav className="flex flex-col items-center gap-8 py-8">
              <Link
                href="/lp#about"
                className="text-gray-800 hover:text-blue-600 transition-colors text-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                たまのみとは
              </Link>
              <Link
                href="/lp#features"
                className="text-gray-800 hover:text-blue-600 transition-colors text-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                魅力
              </Link>
              <Link
                href="/lp#howto"
                className="text-gray-800 hover:text-blue-600 transition-colors text-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                使い方
              </Link>
              <Link
                href="/lp#pricing"
                className="text-gray-800 hover:text-blue-600 transition-colors text-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                利用料金
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <div className="w-full bg-white py-12 md:py-20">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          {/* Title */}
          <div className="text-center mb-8 md:mb-12">
            <h1
              className="text-3xl md:text-4xl lg:text-5xl mb-4"
              style={{
                color: '#007D4F',
                fontFamily: '"Zen Kaku Gothic New"',
                fontWeight: '700',
              }}
            >
              お問い合わせ
            </h1>
            <p
              className="text-base md:text-lg"
              style={{
                color: '#666',
                fontFamily: '"Zen Kaku Gothic New"',
              }}
            >
              ご質問やご不明点がございましたら、お気軽にお問い合わせください
            </p>
          </div>

          {/* Success Message */}
          {submitSuccess && (
            <div
              className="mb-8 p-6 rounded-lg border-2"
              style={{
                backgroundColor: '#f0fdf4',
                borderColor: '#22c55e',
              }}
            >
              <p
                className="text-center text-lg"
                style={{
                  color: '#16a34a',
                  fontFamily: '"Zen Kaku Gothic New"',
                  fontWeight: '700',
                }}
              >
                お問い合わせを受け付けました。<br />
                担当者より折り返しご連絡させていただきます。
              </p>
            </div>
          )}

          {/* Error Message */}
          {submitError && (
            <div
              className="mb-8 p-6 rounded-lg border-2"
              style={{
                backgroundColor: '#fef2f2',
                borderColor: '#ef4444',
              }}
            >
              <p
                className="text-center text-base"
                style={{
                  color: '#dc2626',
                  fontFamily: '"Zen Kaku Gothic New"',
                }}
              >
                {submitError}
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Inquiry Type Radio Buttons */}
            <div>
              <label
                className="block mb-3 text-sm md:text-base"
                style={{
                  color: '#333',
                  fontFamily: '"Zen Kaku Gothic New"',
                  fontWeight: '700',
                }}
              >
                お問い合わせ種別 <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="inquiryType"
                    value="user"
                    checked={formData.inquiryType === 'user'}
                    onChange={(e) => setFormData(prev => ({ ...prev, inquiryType: e.target.value as 'user' | 'merchant' }))}
                    className="w-4 h-4 text-blue-600 cursor-pointer"
                  />
                  <span
                    className="text-sm md:text-base"
                    style={{
                      color: '#333',
                      fontFamily: '"Zen Kaku Gothic New"',
                    }}
                  >
                    利用者
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="inquiryType"
                    value="merchant"
                    checked={formData.inquiryType === 'merchant'}
                    onChange={(e) => setFormData(prev => ({ ...prev, inquiryType: e.target.value as 'user' | 'merchant' }))}
                    className="w-4 h-4 text-blue-600 cursor-pointer"
                  />
                  <span
                    className="text-sm md:text-base"
                    style={{
                      color: '#333',
                      fontFamily: '"Zen Kaku Gothic New"',
                    }}
                  >
                    掲載店
                  </span>
                </label>
              </div>
            </div>

            {/* Name Field */}
            <div>
              <label
                htmlFor="name"
                className="block mb-2 text-sm md:text-base"
                style={{
                  color: '#333',
                  fontFamily: '"Zen Kaku Gothic New"',
                  fontWeight: '700',
                }}
              >
                {nameLabel} <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder={namePlaceholder}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{
                  borderColor: errors.name ? '#ef4444' : '#d1d5db',
                  fontFamily: '"Zen Kaku Gothic New"',
                }}
              />
              {errors.name && (
                <p className="mt-1 text-sm" style={{ color: '#ef4444' }}>{errors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block mb-2 text-sm md:text-base"
                style={{
                  color: '#333',
                  fontFamily: '"Zen Kaku Gothic New"',
                  fontWeight: '700',
                }}
              >
                メールアドレス <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="例：example@tamanomi.com"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{
                  borderColor: errors.email ? '#ef4444' : '#d1d5db',
                  fontFamily: '"Zen Kaku Gothic New"',
                }}
              />
              {errors.email && (
                <p className="mt-1 text-sm" style={{ color: '#ef4444' }}>{errors.email}</p>
              )}
            </div>

            {/* Message Field */}
            <div>
              <label
                htmlFor="message"
                className="block mb-2 text-sm md:text-base"
                style={{
                  color: '#333',
                  fontFamily: '"Zen Kaku Gothic New"',
                  fontWeight: '700',
                }}
              >
                お問い合わせ内容 <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="お問い合わせ内容をご記入ください"
                rows={8}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                style={{
                  borderColor: errors.message ? '#ef4444' : '#d1d5db',
                  fontFamily: '"Zen Kaku Gothic New"',
                }}
              />
              {errors.message && (
                <p className="mt-1 text-sm" style={{ color: '#ef4444' }}>{errors.message}</p>
              )}
            </div>

            {/* 個人情報の取扱について */}
            <div className="space-y-4">
              <label
                className="block text-sm md:text-base"
                style={{
                  color: '#333',
                  fontFamily: '"Zen Kaku Gothic New"',
                  fontWeight: '700',
                }}
              >
                個人情報の取扱について <span style={{ color: '#ef4444' }}>*</span>
              </label>

              <p
                className="text-sm md:text-base mb-4"
                style={{
                  color: '#666',
                  fontFamily: '"Zen Kaku Gothic New"',
                }}
              >
                下記の個人情報の取扱いに関する事項についてご確認いただき、同意される方は「同意する」をチェックしてください。
              </p>

              {/* 個人情報の取扱についての詳細（スクロール可能） */}
              <div
                className="border rounded-lg p-4 md:p-6 mb-4"
                style={{
                  borderColor: '#d1d5db',
                  backgroundColor: '#f9fafb',
                  maxHeight: '400px',
                  overflowY: 'auto',
                }}
              >
                <div
                  className="space-y-4 text-sm md:text-base"
                  style={{
                    color: '#333',
                    fontFamily: '"Zen Kaku Gothic New"',
                    lineHeight: '1.8',
                  }}
                >
                  <div>
                    <p className="font-bold mb-2">・事業者の名称</p>
                    <p className="ml-4">株式会社つなぐ</p>
                  </div>

                  <div>
                    <p className="font-bold mb-2">・個人情報保護管理者</p>
                    <p className="ml-4">管理者名：個人情報保護管理責任者</p>
                    <p className="ml-4">所属部署：株式会社つなぐ　管理部長</p>
                    <p className="ml-4">連絡先メールアドレス：personal-info@saitama-tsunagu.com</p>
                  </div>

                  <div>
                    <p className="font-bold mb-2">・個人情報の利用目的</p>
                    <p className="ml-4">お預かりした個人情報は、当社の運営するサービスに関するお問合せへの対応に利用します。</p>
                  </div>

                  <div>
                    <p className="font-bold mb-2">・お預かりする個人情報の項目</p>
                    <p className="ml-4">本手続きでは、以下の項目をフォームに入力いただきます。</p>
                    <p className="ml-4">氏名（漢字）、メールアドレス、連絡先、生年月日、性別、住所</p>
                  </div>

                  <div>
                    <p className="font-bold mb-2">・個人情報の第三者提供について</p>
                    <p className="ml-4">ご本人の同意がある場合または法令に基づく場合を除き、今回ご入力いただく個人情報は第三者に提供しません。</p>
                  </div>

                  <div>
                    <p className="font-bold mb-2">・個人情報の委託について</p>
                    <p className="ml-4">個人情報の取扱いを外部に委託する場合は、当社が規定する個人情報管理基準を満たす企業を選定して委託を行い、適切な取扱いが行われるように監督します。</p>
                  </div>

                  <div>
                    <p className="font-bold mb-2">・取得した個人情報の開示等に応じる問合せ窓口</p>
                    <p className="ml-4">本人からの請求等により、当社が本件により取得した個人情報の利用目的の通知・開示・内容の訂正・追加または削除・利用の停止・消去または第三者への提供の停止、第三者提供記録の開示（「開示等」といいます。）に応じます。</p>
                    <p className="ml-4">開示等に応じる窓口は、株式会社つなぐ　個人情報問合せ窓口になります。</p>
                    <p className="ml-4">メールアドレス：personal-info@saitama-tsunagu.com</p>
                    <p className="ml-4">受付時間　平日9:30～12:00、13:00～16:30</p>
                    <p className="ml-4">（土・日曜日、祝日、年末年始は翌営業日以降の対応とさせていただきます。）</p>
                  </div>

                  <div>
                    <p className="font-bold mb-2">・個人情報を与えることの任意性及び当該情報を与えなかった場合に生じる結果</p>
                    <p className="ml-4">個人情報を取得する項目は、すべてご本人によってご提供いただくものです。ただし、必要な項目をいただけない場合、利用目的に記載の諸手続きまたは処理に支障が生じる可能性があります。</p>
                  </div>

                  <div>
                    <p className="font-bold mb-2">・本人が容易に知覚できない方法による個人情報の取得</p>
                    <p className="ml-4">本フォームではCookieで個人情報を取得していませんが、セッション管理のためにだけCookieを使用しています。</p>
                  </div>
                </div>
              </div>

              {/* 同意チェックボックス */}
              <div className="space-y-2">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="privacyPolicy"
                    checked={agreedToPrivacyPolicy}
                    onChange={(e) => {
                      setAgreedToPrivacyPolicy(e.target.checked)
                      if (e.target.checked) {
                        setPrivacyPolicyError('')
                      }
                    }}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                  />
                  <label
                    htmlFor="privacyPolicy"
                    className="ml-2 text-sm md:text-base cursor-pointer"
                    style={{
                      color: '#333',
                      fontFamily: '"Zen Kaku Gothic New"',
                    }}
                  >
                    同意する
                  </label>
                </div>
                {privacyPolicyError && (
                  <p className="text-sm ml-6" style={{ color: '#ef4444' }}>{privacyPolicyError}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="relative flex w-full md:w-auto px-12 py-4 justify-center items-center gap-2 rounded-full border-none cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: '#6FC8E5',
                  fontFamily: '"Zen Kaku Gothic New"',
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#FFF',
                }}
              >
                {isSubmitting ? '送信中...' : '送信する'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full bg-white border-t">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="flex flex-col justify-center items-center gap-8 md:gap-10 pt-8 md:pt-12">
            {/* Logo */}
            <div className="mb-4 md:mb-8">
              <Image
                src="/lp/images/logo.png"
                alt="TAMANOMI"
                width={328}
                height={329}
                className="w-48 h-auto md:w-64 lg:w-[328px]"
              />
            </div>

            {/* Footer Links */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 lg:gap-8 mb-4 md:mb-8">
              <Link
                href="/lp/faq"
                className="text-gray-700 hover:text-gray-900 transition-colors text-sm md:text-base"
                style={{ fontFamily: '"Zen Kaku Gothic New"' }}
              >
                よくあるご質問
              </Link>
              <Link
                href="/lp/contact"
                className="text-gray-700 hover:text-gray-900 transition-colors text-sm md:text-base"
                style={{ fontFamily: '"Zen Kaku Gothic New"' }}
              >
                お問い合わせ
              </Link>
              <a
                href="#"
                className="text-gray-700 hover:text-gray-900 transition-colors text-sm md:text-base"
                style={{ fontFamily: '"Zen Kaku Gothic New"' }}
              >
                プライバシーポリシー
              </a>
              <a
                href="#"
                className="text-gray-700 hover:text-gray-900 transition-colors text-sm md:text-base"
                style={{ fontFamily: '"Zen Kaku Gothic New"' }}
              >
                特定商取引法に基づく表記
              </a>
              <a
                href="#"
                className="text-gray-700 hover:text-gray-900 transition-colors text-sm md:text-base"
                style={{ fontFamily: '"Zen Kaku Gothic New"' }}
              >
                ご利用規約
              </a>
              <a
                href="#"
                className="text-gray-700 hover:text-gray-900 transition-colors text-sm md:text-base"
                style={{ fontFamily: '"Zen Kaku Gothic New"' }}
              >
                運営会社
              </a>
            </div>

            {/* Copyright */}
            <div className="pb-6 md:pb-8">
              <p
                className="text-sm md:text-base"
                style={{
                  color: '#000',
                  textAlign: 'center',
                  fontFamily: 'Rubik',
                }}
              >
                ©2025 TAMANOMI
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ContactPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    }>
      <ContactFormContent />
    </Suspense>
  )
}

