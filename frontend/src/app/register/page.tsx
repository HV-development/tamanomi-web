'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { RegisterLayout } from '@/components/templates/register-layout'

interface RegisterFormData {
  nickname: string
  postalCode: string
  address: string
  birthDate: string
  gender: string
  password: string
  passwordConfirm: string
}

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [searchParams, setSearchParams] = useState<{ email?: string; token?: string }>({})
  const [isClient, setIsClient] = useState(false)
  const [initialFormData, setInitialFormData] = useState<RegisterFormData | null>(null)
  const router = useRouter()

  // クライアントサイドでのみ searchParams を取得
  useEffect(() => {
    setIsClient(true)
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const email = urlParams.get('email') || undefined
      const token = urlParams.get('token') || undefined
      const isEdit = urlParams.get('edit') === 'true'
      
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

      // 編集モードの場合、保存されたフォームデータを取得
      if (isEdit) {
        const savedData = sessionStorage.getItem('registerFormData')
        if (savedData) {
          try {
            const parsedData = JSON.parse(savedData)
            setInitialFormData(parsedData)
            sessionStorage.removeItem('registerFormData')
          } catch (error) {
            console.error('Failed to parse saved form data:', error)
          }
        }
      }
    }
  }, [router])

  const handleRegisterSubmit = async (data: any) => {
    setIsLoading(true)
    
    // フォームデータをセッションストレージに保存
    sessionStorage.setItem('registerFormData', JSON.stringify(data))
    
    // 確認画面に遷移
    router.push(`/register-confirmation?email=${encodeURIComponent(searchParams.email || '')}&token=${encodeURIComponent(searchParams.token || '')}`)
    setIsLoading(false)
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
      initialFormData={initialFormData}
      onSubmit={handleRegisterSubmit}
      onCancel={handleCancel}
      onLogoClick={handleLogoClick}
      isLoading={isLoading}
    />
  )
}