'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PlanRegistrationLayout } from '@/components/templates/plan-registration-layout'

export default function PlanRegistrationPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState<string>('')
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()

  // クライアントサイドでのみ searchParams を取得
  useEffect(() => {
    setIsClient(true)
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const emailParam = urlParams.get('email') || ''
      setEmail(emailParam)
    }
  }, [])

  const handlePaymentMethodRegister = async () => {
    setIsLoading(true)
    
    // 仮の支払い方法登録処理（イオンレジGUI表示予定）
    setTimeout(() => {
      // 支払い方法登録完了後、自動ログインでトップページに遷移
      router.push('/?auto-login=true&email=' + encodeURIComponent(email))
      setIsLoading(false)
    }, 2000)
  }

  const handleCancel = () => router.push('/')
  const handleLogoClick = () => router.push('/')

  // クライアントサイドでの初期化が完了するまでローディング表示
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <PlanRegistrationLayout
      onPaymentMethodRegister={handlePaymentMethodRegister}
      onCancel={handleCancel}
      onLogoClick={handleLogoClick}
      isLoading={isLoading}
    />
  )
}