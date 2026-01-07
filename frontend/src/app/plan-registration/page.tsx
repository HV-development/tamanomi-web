'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { PlanRegistrationContainer } from '@/components/organisms/PlanRegistrationContainer'
import {
  PlanListResponse,
  PlanListResponseSchema
} from '@hv-development/schemas'
import { isFutureExecutedDate } from '@/utils/application-date'

export default function PlanRegistrationPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [plans, setPlans] = useState<PlanListResponse['plans']>([])
  const [email, setEmail] = useState<string>('')
  const [isClient, setIsClient] = useState(false)
  const [error, setError] = useState<string>('')
  const [saitamaAppLinked, setSaitamaAppLinked] = useState<boolean | null>(null)
  const [hasPaymentMethod, setHasPaymentMethod] = useState<boolean>(false)
  const [isPaymentMethodChangeOnly, setIsPaymentMethodChangeOnly] = useState<boolean>(false)
  const router = useRouter()

  const fetchUserInfo = useCallback(async () => {
    try {
      // Cookieからトークンを取得（credentials: 'include'を使用）
      // Cookieベースの認証のみを使用（localStorageは廃止）
      const response = await fetch('/api/user/me', {
        cache: 'no-store',
        credentials: 'include', // Cookieを送信
      })

      if (response.ok) {
        const userData = await response.json()

        // メールアドレスをユーザーデータから取得（常に更新）
        if (userData.email) {
          setEmail(userData.email)
          // Cookieベースのセッション管理に変更したため、sessionStorageは使用しない
        } else {
          console.error('❌ [fetchUserInfo] No email found in user data')
          setError('メールアドレスが見つかりません。新規登録画面からやり直してください。')
        }

        const newLinkedState = userData.saitamaAppLinked === true
        setSaitamaAppLinked(newLinkedState)

        // カード登録状態を確認（userDataから取得）
        // Cookieベースのセッション管理に変更したため、sessionStorageは使用しない
        const hasCard = userData.userCards && Array.isArray(userData.userCards) && userData.userCards.length > 0
        setHasPaymentMethod(hasCard)
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ [fetchUserInfo] API error:', response.status, errorData)
        setSaitamaAppLinked(false)
        if (response.status === 401) {
          setError('アクセストークンが必要です。新規登録画面からやり直してください。')
        } else if (response.status === 404) {
          setError('ユーザー情報が見つかりません。新規登録画面からやり直してください。')
        } else {
          setError('ユーザー情報の取得に失敗しました。')
        }
      }
    } catch (error) {
      console.error('❌ [fetchUserInfo] Error:', error)
      setSaitamaAppLinked(false)
      setError('ユーザー情報の取得中にエラーが発生しました。')
    }
  }, [])

  // クライアントサイドでのみ searchParams を取得
  useEffect(() => {
    setIsClient(true)
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const saitamaAppLinkedParam = urlParams.get('saitamaAppLinked')
      const refreshParam = urlParams.get('refresh')
      const paymentMethodChangeParam = urlParams.get('payment-method-change')
      
      // Cookieベースのセッション管理に変更したため、sessionStorageは使用しない
      // メールアドレスはAPIから取得する

      // 支払い方法変更のみの場合はフラグを設定
      if (paymentMethodChangeParam === 'true') {
        setIsPaymentMethodChangeOnly(true)
      }

      // URLパラメータでsaitamaAppLinked=trueが指定されている場合（ポイント付与後）
      if (saitamaAppLinkedParam === 'true') {
        setSaitamaAppLinked(true)
      }

      // refreshパラメータがある場合、ユーザー情報を再取得（ガイドページからの戻り）
      if (refreshParam) {
        fetchUserInfo()
      } else {
        // 常にユーザー情報を取得してメールアドレスを確実に取得する
        // （sessionStorageは一時的なものなので、APIから取得した方が確実）
        fetchUserInfo()
      }
    }
  }, [fetchUserInfo])

  // ページがフォーカスされた時にユーザー情報を再取得（戻るボタンで戻ってきた時など）
  useEffect(() => {
    const handleFocus = () => {
      // メールアドレスが設定されていない場合のみ再取得
      if (!email) {
        fetchUserInfo()
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [email, fetchUserInfo])

  const fetchPlans = useCallback(async (explicitLinkedState?: boolean | null) => {
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
      // バリデーションを有効化
      const parseResult = PlanListResponseSchema.safeParse(data)
      
      if (!parseResult.success) {
        console.error('[plan-registration] バリデーションエラー:', parseResult.error)
        // バリデーションエラーの場合は、元のデータを使用（first_executed_dateを保持するため）
        const validatedData = data
        setPlans(validatedData.plans)
        return
      }
      
      // バリデーション成功後、元のデータからfirst_executed_dateを復元
      const validatedData = parseResult.data
      if (data.plans && validatedData.plans) {
        validatedData.plans = validatedData.plans.map((validatedPlan, index) => {
          const originalPlan = data.plans[index]
          if (originalPlan && 'first_executed_date' in originalPlan) {
            return {
              ...validatedPlan,
              first_executed_date: originalPlan.first_executed_date,
            }
          }
          return validatedPlan
        })
      }
      
      setPlans(validatedData.plans)
    } catch {
      setError('プランの取得に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }, [saitamaAppLinked])

  // ユーザー情報を取得してさいたま市アプリ連携状態を確認
  useEffect(() => {
    if (isClient && saitamaAppLinked === null) {
      // URLパラメータでsaitamaAppLinkedが設定されていない場合のみ取得
      fetchUserInfo()
    }
  }, [isClient, saitamaAppLinked, fetchUserInfo])

  // プラン一覧を取得（連携状態が確定した後）
  useEffect(() => {
    if (isClient && saitamaAppLinked !== null) {
      fetchPlans()
    }
  }, [isClient, saitamaAppLinked, fetchPlans])

  const handlePaymentMethodRegister = async (planId: string) => {
    // 連続押下を防ぐ
    if (isLoading) {
      return
    }

    try {
      setIsLoading(true)
      setError('')

      const isPaymentMethodChangeOnly = !planId || planId === ""

      // プラン選択時は決済金額を確認
      if (!isPaymentMethodChangeOnly) {
        const selectedPlan = plans.find(p => p.id === planId)
        if (selectedPlan) {
          // デバッグ: plansステートから取得したデータをログ出力
          console.log('[plan-registration] plansステートから取得したプラン:', {
            planId: selectedPlan.id,
            planName: selectedPlan.name,
            first_executed_date: (selectedPlan as any).first_executed_date,
            allKeys: Object.keys(selectedPlan),
          })
          
          const isLinked = saitamaAppLinked === true
          const discountPrice = selectedPlan.discount_price ?? null
          const rawAmount = isLinked && discountPrice != null
            ? discountPrice
            : selectedPlan.price
          const paymentAmount = Number(rawAmount)
          
          // first_executed_dateが未来日かどうかを判定
          const firstExecutedDate = (selectedPlan as any).first_executed_date
          const isFutureDate = isFutureExecutedDate(firstExecutedDate)
          console.log('[plan-registration] first_executed_date判定:', {
            firstExecutedDate,
            isFutureDate,
            planId: selectedPlan.id,
            planName: selectedPlan.name,
          })
          const confirmMessage = isFutureDate
            ? `カード登録を行います。よろしいですか？`
            : `カード登録と同時に初回決済を行います。よろしいですか？`
          
          const confirmed = window.confirm(
            `プラン「${selectedPlan.name}」\n` +
            `決済金額: ¥${paymentAmount.toLocaleString()}\n\n` +
            confirmMessage
          )
          if (!confirmed) {
            setIsLoading(false)
            return
          }
        }
      }

      // Cookieベースのセッション管理に変更したため、sessionStorageは使用しない
      // メールアドレスは常にAPIから取得する
      let currentEmail = email?.trim() ?? ''
      
      // メールアドレスの検証
      if (!currentEmail) {
        await fetchUserInfo()
        currentEmail = email?.trim() || ''
      }

      if (!currentEmail) {
        setError('メールアドレスが見つかりません。新規登録画面からやり直してください。')
        setIsLoading(false)
        return
      }
      
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
      
      const customerId = generateCustomerId(currentEmail)
      
      // 支払い方法変更のみの場合はplanIdを送信しない
      const requestBody: Record<string, string> = {
        customerId: customerId,
        userEmail: currentEmail, // セッション管理用
      }

      if (!isPaymentMethodChangeOnly) {
        requestBody.planId = planId // セッション管理用（これがPaymentSessionに保存される）
      }

      const response = await fetch('/api/payment/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'カード登録の準備に失敗しました')
      }

      let data
      try {
        data = await response.json()
      } catch (jsonError) {
        console.error('▲[fetch] response.json()エラー:', jsonError)
        throw jsonError
      }


      // ペイジェントのカード登録画面にリダイレクト
      // リンクタイプ方式では、redirectUrlにGETパラメータを付与してリダイレクト
      const { redirectUrl, params } = data

      // ★1 PAY-GENTに送信するパラメータをログ出力

      // Cookieベースのセッション管理に変更したため、sessionStorageは使用しない
      // モック環境の場合はGETパラメータとしてリダイレクト
      if (redirectUrl.includes('/payment-mock')) {
        const url = new URL(redirectUrl)
        Object.entries(params).forEach(([key, value]) => {
          url.searchParams.set(key, String(value))
        })
        window.location.href = url.toString()
      } else {
        // 実際のペイジェント環境ではPOSTフォームでリダイレクト
        const form = document.createElement('form')
        form.method = 'POST'
        form.action = redirectUrl

        // ★3 POSTフォームに追加されるパラメータをログ出力
        const formParams: Record<string, string> = {}
        Object.entries(params).forEach(([key, value]) => {
          const input = document.createElement('input')
          input.type = 'hidden'
          input.name = key
          input.value = String(value)
          formParams[key] = String(value)
          form.appendChild(input)
        })


        document.body.appendChild(form)
        form.submit()
      }
    } catch (error) {
      console.error('▲ERROR [handlePaymentMethodRegister] エラー発生:', error)
      console.error('▲ERROR [handlePaymentMethodRegister] エラー詳細:', {
        errorType: typeof error,
        errorName: error instanceof Error ? error.name : 'Unknown',
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : 'No stack trace'
      })
      setError(error instanceof Error ? error.message : 'プランの登録に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaitamaAppLinked = async () => {
    try {
      // Cookieベースの認証のみを使用（localStorageは廃止）
      const response = await fetch('/api/user/me', {
        cache: 'no-store',
        credentials: 'include', // Cookieを送信
      })

      if (response.ok) {
        const userData = await response.json()
        const newLinkedState = userData.saitamaAppLinked === true

        // 状態を更新
        setSaitamaAppLinked(newLinkedState)

        // 状態更新を待たずに、明示的に新しい状態でプランを再取得
        await fetchPlans(newLinkedState)
      }
    } catch {
      // エラー処理
    }
  }

  const handleCancel = () => {
    // 状態をリセット
    setEmail('')
    setError('')
    setSaitamaAppLinked(null)
    setHasPaymentMethod(false)
    setIsPaymentMethodChangeOnly(false)

    // トップページに遷移
    router.push('/')
  }
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
    <PlanRegistrationContainer
      backgroundColorClass="bg-gradient-to-br from-green-50 to-green-100"
      onPaymentMethodRegister={handlePaymentMethodRegister}
      onLogoClick={handleLogoClick}
      onCancel={handleCancel}
      isLoading={isLoading}
      plans={plans}
      error={error}
      saitamaAppLinked={saitamaAppLinked || false}
      onSaitamaAppLinked={handleSaitamaAppLinked}
      hasPaymentMethod={hasPaymentMethod}
      isPaymentMethodChangeOnly={isPaymentMethodChangeOnly}
    />
  )
}