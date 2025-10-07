'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PlanRegistrationLayout } from '@/components/templates/plan-registration-layout'
import { 
  PlanListResponse, 
  CreateUserPlan,
  PlanListResponseSchema,
  CreateUserPlanSchema 
} from '@hv-development/schemas'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'

export default function PlanRegistrationPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [plans, setPlans] = useState<PlanListResponse['plans']>([])
  const [email, setEmail] = useState<string>('')
  const [isClient, setIsClient] = useState(false)
  const [error, setError] = useState<string>('')
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

  // プラン一覧を取得
  useEffect(() => {
    if (isClient) {
      fetchPlans()
    }
  }, [isClient])

  const fetchPlans = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_BASE_URL}/api/v1/plans?status=active&limit=50`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      // バリデーション（一時的に無効化）
      // const validatedData = PlanListResponseSchema.parse(data)
      // setPlans(validatedData.plans)
      setPlans(data.plans)
    } catch (err) {
      console.error('プラン取得エラー:', err)
      setError('プランの取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePaymentMethodRegister = async (planId: string) => {
    try {
      setIsLoading(true)
      setError('')
      
      // バリデーション
      const userPlanData: CreateUserPlan = {
        plan_id: planId,
        valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1年後
      }
      
      const validatedData = CreateUserPlanSchema.parse(userPlanData)
      
      // ユーザープラン作成API呼び出し
      const response = await fetch(`${API_BASE_URL}/api/v1/user-plans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // TODO: 認証トークンを追加
        },
        body: JSON.stringify(validatedData)
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      // 支払い方法登録完了後、自動ログインでトップページに遷移
      router.push('/?auto-login=true&email=' + encodeURIComponent(email))
    } catch (err) {
      console.error('プラン登録エラー:', err)
      setError('プランの登録に失敗しました')
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
    <PlanRegistrationLayout
      onPaymentMethodRegister={handlePaymentMethodRegister}
      onLogoClick={handleLogoClick}
      onCancel={handleCancel}
      isLoading={isLoading}
      plans={plans}
      error={error}
    />
  )
}