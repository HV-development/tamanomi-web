import {
  PlanListResponse,
  PlanListResponseSchema,
} from '@hv-development/schemas'
import { ApiClient } from '@/lib/api-client'

export interface UserData {
  id?: string
  email?: string
  saitamaAppLinked?: boolean
  userCards?: unknown[]
}

export interface CardRegisterResponse {
  redirectUrl: string
  params: Record<string, string>
}

export async function fetchCurrentUser(): Promise<UserData> {
  const response = await fetch('/api/user/me', {
    cache: 'no-store',
    credentials: 'include',
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    if (response.status === 401) {
      throw new Error('アクセストークンが必要です。新規登録画面からやり直してください。')
    }
    if (response.status === 404) {
      throw new Error('ユーザー情報が見つかりません。新規登録画面からやり直してください。')
    }
    throw new Error(errorData.error || 'ユーザー情報の取得に失敗しました。')
  }

  return response.json()
}

export async function fetchActivePlans(
  saitamaAppLinked: boolean | null
): Promise<PlanListResponse> {
  const queryParams = new URLSearchParams({
    status: 'active',
    limit: '50',
  })

  if (saitamaAppLinked !== null) {
    queryParams.append('saitamaAppLinked', String(saitamaAppLinked))
  }

  const response = await fetch(`/api/plans?${queryParams.toString()}`)

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
  }

  const data = await response.json()
  const parseResult = PlanListResponseSchema.safeParse(data)

  if (!parseResult.success) {
    console.error('[plan-registration] バリデーションエラー:', parseResult.error)
    return data
  }

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

  return validatedData
}

export async function registerCreditCard(params: {
  customerId: string
  userEmail: string
  planId?: string
}): Promise<CardRegisterResponse> {
  const requestBody: Record<string, string> = {
    customerId: params.customerId,
    userEmail: params.userEmail,
  }

  if (params.planId) {
    requestBody.planId = params.planId
  }

  const response = await fetch('/api/payment/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || 'カード登録の準備に失敗しました')
  }

  return response.json()
}

export { ApiClient, requestPayPayPayment, requestQrPayment } from '@/lib/api-client'
