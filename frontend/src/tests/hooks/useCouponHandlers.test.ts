import { createElement, type Dispatch } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { AppState } from '@hv-development/schemas'
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { useCouponHandlers } from '@/hooks/useCouponHandlers'
import type { AppActionExt } from '@/hooks/useAppReducer'
import type { useAuth } from '@/hooks/useAuth'
import type { useNavigation } from '@/hooks/useNavigation'

type Handlers = ReturnType<typeof useCouponHandlers>

// jsdom 未導入のため、サーバー描画で Hook を一度実行して handler を取り出す
const renderHandlers = (dispatch: Dispatch<AppActionExt>): Handlers => {
  const auth = { logout: vi.fn() } as unknown as ReturnType<typeof useAuth>
  const navigation = { navigateToView: vi.fn() } as unknown as ReturnType<typeof useNavigation>
  const router = {} as AppRouterInstance
  const state = {
    stores: [],
    storeCoupons: [],
    selectedCoupon: { id: 'coupon-1' },
    selectedStore: { id: 'shop-1' },
  } as unknown as AppState

  let handlers: Handlers | undefined
  const Harness = () => {
    handlers = useCouponHandlers(dispatch, auth, navigation, router, state)
    return null
  }
  renderToStaticMarkup(createElement(Harness))
  return handlers as Handlers
}

const jsonResponse = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

describe('handleConfirmCoupon', () => {
  const fetchMock = vi.fn()
  const alertMock = vi.fn()
  const dispatch = vi.fn<Dispatch<AppActionExt>>()

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
    vi.stubGlobal('alert', alertMock)
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    fetchMock.mockReset()
    alertMock.mockReset()
    dispatch.mockReset()
  })

  it('送信中に続けて呼んでも POST は 1 回だけで、成功の表示だけが出る', async () => {
    let resolveFetch: (response: Response) => void = () => {}
    fetchMock.mockReturnValueOnce(new Promise<Response>((resolve) => { resolveFetch = resolve }))
    const { handleConfirmCoupon } = renderHandlers(dispatch)

    const first = handleConfirmCoupon()
    const second = handleConfirmCoupon()
    resolveFetch(jsonResponse(200, { success: true }))
    await Promise.all([first, second])

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith('/api/coupons/coupon-1/use', expect.objectContaining({ method: 'POST' }))
    expect(alertMock).not.toHaveBeenCalled()
    expect(dispatch).toHaveBeenCalledWith({ type: 'SET_SUCCESS_MODAL_OPEN', payload: true })
  })

  it('エラー応答のあとはもう一度送れる', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(500, { error: { message: '失敗しました' } }))
      .mockResolvedValueOnce(jsonResponse(200, { success: true }))
    const { handleConfirmCoupon } = renderHandlers(dispatch)

    await handleConfirmCoupon()
    expect(alertMock).toHaveBeenCalledWith('失敗しました')

    await handleConfirmCoupon()
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(dispatch).toHaveBeenCalledWith({ type: 'SET_SUCCESS_MODAL_OPEN', payload: true })
  })

  it('通信エラーのあとはもう一度送れる', async () => {
    fetchMock
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce(jsonResponse(200, { success: true }))
    const { handleConfirmCoupon } = renderHandlers(dispatch)

    await handleConfirmCoupon()
    expect(alertMock).toHaveBeenCalledWith('Failed to fetch')

    await handleConfirmCoupon()
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('成功のあとも次の送信は止めない', async () => {
    fetchMock.mockImplementation(async () => jsonResponse(200, { success: true }))
    const { handleConfirmCoupon } = renderHandlers(dispatch)

    await handleConfirmCoupon()
    await handleConfirmCoupon()

    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
