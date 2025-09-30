'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SignupLayout } from '@/components/templates/signup-layout'

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [searchParams, setSearchParams] = useState<{ email?: string; token?: string }>({})
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()

  // クライアントサイドでのみ searchParams を取得
  useEffect(() => {
    setIsClient(true)
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const email = urlParams.get('email') || undefined
      const token = urlParams.get('token') || undefined
      
      // トークンが存在しない場合はメール登録画面にリダイレクト
      if (!token || token.trim() === '') {
        console.log('❌ Token is missing or empty, redirecting to email registration')
        router.push('/email-registration')
        return
      }
      
      setSearchParams({
        email,
        token,
      })
    }
  }, [router])

  const handleSignupSubmit = async (data: any) => {
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
        // 登録完了後は確認画面に遷移
        router.push('/?view=confirmation')
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
    <SignupLayout
      initialData={{ email: searchParams.email }}
      email={searchParams.email}
      onSubmit={handleSignupSubmit}
      onCancel={handleCancel}
      onLogoClick={handleLogoClick}
      isLoading={isLoading}
    />
  )
}