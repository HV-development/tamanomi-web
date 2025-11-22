import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PlanRegistrationForm } from '@/components/organisms/PlanRegistrationForm'
import type { PlanListResponse } from '@hv-development/schemas'

const createPlans = (): PlanListResponse['plans'] => ([
  {
    id: 'one-time-plan',
    name: '単発プラン',
    price: 1000,
    is_subscription: false,
    status: 'active',
    description: '単発利用プラン',
    plan_content: { features: [] },
  } as any,
])

describe('PlanRegistrationForm - 支払い方法選択', () => {
  it('クレジットカード / イオンペイ / PayPay のラジオボタンが表示される', () => {
    const plans = createPlans()

    render(
      <PlanRegistrationForm
        onPaymentMethodRegister={() => {}}
        onCancel={() => {}}
        isLoading={false}
        plans={plans}
        saitamaAppLinked={false}
        hasPaymentMethod={false}
        isPaymentMethodChangeOnly={false}
      />,
    )

    expect(screen.getByText('クレジットカード')).toBeInTheDocument()
    expect(screen.getByText('イオンペイ')).toBeInTheDocument()
    expect(screen.getByText('PayPay')).toBeInTheDocument()
  })

  it('PayPayを選択して支払いボタンを押すと、PayPayが指定されてコールバックが呼ばれる', () => {
    const plans = createPlans()
    const callback = vi.fn()

    render(
      <PlanRegistrationForm
        onPaymentMethodRegister={callback}
        onCancel={() => {}}
        isLoading={false}
        plans={plans}
        saitamaAppLinked={false}
        hasPaymentMethod={false}
        isPaymentMethodChangeOnly={false}
      />,
    )

    fireEvent.click(screen.getByText('PayPay'))
    fireEvent.click(screen.getByText('支払い方法を登録する'))

    expect(callback).toHaveBeenCalledWith('one-time-plan', 'PayPay')
  })
})



