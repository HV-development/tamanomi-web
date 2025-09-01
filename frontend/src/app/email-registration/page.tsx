'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { EmailRegistrationLayout } from '@/components/templates/email-registration-layout'

export default function EmailRegistrationPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()

  // クライアントサイドの初期化
  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleEmailSubmit = async (email: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()
      if (data.success) {
        router.push(`/signup?email=${encodeURIComponent(email)}`)
      } else {
        alert(data.message || 'エラーが発生しました')
      }
    } catch (error) {
      alert('ネットワークエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => router.push('/')
  const handleLogoClick = () => router.push('/')

  // クライアントサイドでの初期化が完了するまでローディング表示
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lime-50 to-lime-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <EmailRegistrationLayout
      onSubmit={handleEmailSubmit}
      onBack={handleBack}
      onLogoClick={handleLogoClick}
      isLoading={isLoading}
    />
  )
}