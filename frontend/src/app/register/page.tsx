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
    console.log('🔍 Register submit started with data:', data)
    console.log('🔍 Search params:', searchParams)
    
    try {
      const requestBody = {
        ...data,
        token: searchParams.token || '',
      }
      console.log('🔍 Request body:', requestBody)
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      console.log('🔍 Response status:', response.status)
      console.log('🔍 Response ok:', response.ok)
      
      const result = await response.json()
      console.log('🔍 Response result:', result)
      
      if (result.success) {
        // 登録完了後は登録確認画面に遷移
        console.log('✅ Registration successful, redirecting to confirmation')
        router.push('/register-confirmation')
      } else {
        console.error('❌ Registration failed:', result.message)
        alert(result.message || 'エラーが発生しました')
      }
    } catch (error) {
      console.error('❌ Network error during registration:', error)
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