'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { RegisterLayout } from '@/components/templates/register-layout'

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [searchParams, setSearchParams] = useState<{ email?: string; token?: string }>({})
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()

  // クライアントサイドでのみ searchParams を取得
  useEffect(() => {
    setIsClient(true)
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      setSearchParams({
        email: urlParams.get('email') || undefined,
        token: urlParams.get('token') || undefined,
      })
    }
  }, [])

  const handleRegisterSubmit = async (data: any) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          token: searchParams.token || '',
        }),
      })

      const result = await response.json()
      if (result.success) {
        // 登録完了後は登録確認画面に遷移
        router.push('/register-confirmation')
      } else {
        alert(result.message || 'エラーが発生しました')
      }
    } catch (error) {
      alert('ネットワークエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
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
    <RegisterLayout
      email={searchParams.email}
      onSubmit={handleRegisterSubmit}
      onCancel={handleCancel}
      onLogoClick={handleLogoClick}
      isLoading={isLoading}
    />
  )
}