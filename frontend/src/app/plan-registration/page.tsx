'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PlanRegistrationLayout } from '@/components/templates/plan-registration-layout'
import { 
  PlanListResponse
} from '@hv-development/schemas'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'

// Note: NEXT_PUBLIC_API_URL は .env ファイルで設定してください
// 例: NEXT_PUBLIC_API_URL=http://localhost:3002

export default function PlanRegistrationPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [plans, setPlans] = useState<PlanListResponse['plans']>([])
  const [email, setEmail] = useState<string>('')
  const [isClient, setIsClient] = useState(false)
  const [error, setError] = useState<string>('')
  const [saitamaAppLinked, setSaitamaAppLinked] = useState<boolean | null>(null)
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

  // ユーザー情報を取得してさいたま市アプリ連携状態を確認
  useEffect(() => {
    if (isClient) {
      fetchUserInfo()
    }
  }, [isClient])

  // プラン一覧を取得（連携状態が確定した後）
  useEffect(() => {
    if (isClient && saitamaAppLinked !== null) {
      fetchPlans()
    }
  }, [isClient, saitamaAppLinked])

  const fetchUserInfo = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken')
      
      if (!accessToken) {
        setSaitamaAppLinked(false)
        return
      }

      const response = await fetch('/api/user/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        cache: 'no-store',
      })

      if (response.ok) {
        const userData = await response.json()
        const newLinkedState = userData.saitamaAppLinked === true
        setSaitamaAppLinked(newLinkedState)
      } else {
        setSaitamaAppLinked(false)
      }
    } catch (error) {
      console.error('Failed to fetch user info:', error)
      setSaitamaAppLinked(false)
    }
  }

  const fetchPlans = async (explicitLinkedState?: boolean | null) => {
    try {
      setIsLoading(true)
      
      // 明示的に渡された状態を優先、なければ現在の状態を使用
      const linkedState = explicitLinkedState !== undefined ? explicitLinkedState : saitamaAppLinked
      
      // さいたま市アプリ連携状態に応じてクエリパラメータを構築
      const queryParams = new URLSearchParams({
        status: 'active',
        limit: '50',
      })
      
      if (linkedState !== null) {
        queryParams.append('saitamaAppLinked', String(linkedState))
      }
      
      const apiUrl = `/api/plans?${queryParams.toString()}`
      const response = await fetch(apiUrl)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
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
      
      console.log('Starting payment registration for plan:', planId)
      
      // メールアドレスの検証
      if (!email || email.trim() === '') {
        setError('メールアドレスが見つかりません。新規登録画面からやり直してください。')
        setIsLoading(false)
        return
      }
      
      // 選択されたプランをsessionStorageに保存（カード登録後に使用）
      sessionStorage.setItem('selectedPlanId', planId)
      sessionStorage.setItem('userEmail', email)
      
      console.log('Saved to sessionStorage:', {
        selectedPlanId: planId,
        userEmail: email
      })
      
      // カード登録APIを呼び出し
      // customerId: メールアドレスのハッシュ値を使用して25文字以内に収める
      const generateCustomerId = (email: string): string => {
        // メールアドレスのハッシュ値を生成（簡易版）
        let hash = 0
        for (let i = 0; i < email.length; i++) {
          const char = email.charCodeAt(i)
          hash = ((hash << 5) - hash) + char
          hash = hash & hash // Convert to 32bit integer
        }
        // 絶対値を取得して16進数に変換（最大8文字）
        const hashStr = Math.abs(hash).toString(16).padStart(8, '0')
        // "cust_" + ハッシュ値 = 最大13文字
        return `cust_${hashStr}`
      }
      
      const customerId = generateCustomerId(email)
      
      const response = await fetch('/api/payment/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: customerId,
          userEmail: email, // セッション管理用
          planId: planId, // セッション管理用
          // customerFamilyName, customerName, companyNameは任意項目なので省略可能
        })
      })
      
      console.log('Payment register response:', {
        status: response.status,
        ok: response.ok
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'カード登録の準備に失敗しました')
      }
      
      const data = await response.json()
      console.log('Payment register data:', data)
      
      // ペイジェントのカード登録画面にリダイレクト
      // リンクタイプ方式では、redirectUrlにGETパラメータを付与してリダイレクト
      const { redirectUrl, params } = data
      
      // フォームを作成してPOSTでリダイレクト
      const form = document.createElement('form')
      form.method = 'POST'
      form.action = redirectUrl
      
      // パラメータをhidden inputとして追加
      Object.entries(params).forEach(([key, value]) => {
        const input = document.createElement('input')
        input.type = 'hidden'
        input.name = key
        input.value = String(value)
        form.appendChild(input)
      })
      
      document.body.appendChild(form)
      console.log('Submitting form to Paygent:', redirectUrl)
      form.submit()
    } catch (err) {
      console.error('プラン登録エラー:', err)
      setError('プランの登録に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaitamaAppLinked = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken')
      
      if (!accessToken) {
        return
      }

      const response = await fetch('/api/user/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        cache: 'no-store',
      })

      if (response.ok) {
        const userData = await response.json()
        const newLinkedState = userData.saitamaAppLinked === true
        
        // 状態を更新
        setSaitamaAppLinked(newLinkedState)
        
        // 状態更新を待たずに、明示的に新しい状態でプランを再取得
        await fetchPlans(newLinkedState)
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error)
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
      saitamaAppLinked={saitamaAppLinked || false}
      onSaitamaAppLinked={handleSaitamaAppLinked}
    />
  )
}