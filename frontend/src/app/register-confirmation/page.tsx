'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { RegisterConfirmationLayout } from '@/components/templates/register-confirmation-layout'

export default function RegisterConfirmationPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<any>(null)
  const [email, setEmail] = useState<string>('')
  const [token, setToken] = useState<string>('')
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()

  // クライアントサイドでのみ searchParams を取得
  useEffect(() => {
    setIsClient(true)
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const emailParam = urlParams.get('email') || ''
      const tokenParam = urlParams.get('token') || ''
      
      // フォームデータを取得（通常はlocalStorageやsessionStorageから）
      const storedData = sessionStorage.getItem('registerFormData')
      
      if (!storedData || !tokenParam) {
        // データがない場合は登録画面にリダイレクト
        router.push('/email-registration')
        return
      }
      
      try {
        const parsedData = JSON.parse(storedData)
        setFormData(parsedData)
        setEmail(emailParam)
        setToken(tokenParam)
      } catch (error) {
        console.error('Failed to parse form data:', error)
        router.push('/email-registration')
      }
    }
  }, [router])

  const handleRegister = async () => {
    if (!formData || !token) return
    
    setIsLoading(true)
    
    // 仮登録処理（バックエンド連携なし）
    setTimeout(() => {
      // 登録成功後はセッションストレージをクリアしてトップページに遷移
      sessionStorage.removeItem('registerFormData')
      router.push('/')
      setIsLoading(false)
    }, 1500)
  }

  const handleEdit = () => {
    // フォームデータをsessionStorageに保存してから登録画面に戻る
    if (formData) {
      sessionStorage.setItem('editFormData', JSON.stringify(formData))
    }
    router.push(`/register?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}&edit=true`)
  }

  const handleLogoClick = () => router.push('/')

  // クライアントサイドでの初期化が完了するまでローディング表示
  if (!isClient || !formData) {
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
    <RegisterConfirmationLayout
      data={formData}
      email={email}
      onRegister={handleRegister}
      onEdit={handleEdit}
      onLogoClick={handleLogoClick}
      isLoading={isLoading}
    />
  )
}