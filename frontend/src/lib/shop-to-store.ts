/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Store } from '@/types/store'
import type { ShopData } from '@hv-development/schemas'
import { isFavoriteInStorage } from '@/lib/favorites-storage'

const normalizeSmokingPolicy = (smokingType: unknown, smokingPolicy: unknown): Store['smokingPolicy'] => {
  const raw = [smokingPolicy, smokingType].find(
    (value) => typeof value === 'string' && value.trim().length > 0,
  ) as string | undefined

  if (!raw) return undefined

  const value = raw.trim()
  const lower = value.toLowerCase()

  const mapping: Record<string, Store['smokingPolicy']> = {
    non_smoking: 'NON_SMOKING',
    'non-smoking': 'NON_SMOKING',
    separated: 'SEPARATED',
    smoking_allowed: 'SMOKING',
    'smoking-allowed': 'SMOKING',
    smoking: 'SMOKING',
    electronic_only: 'HEATED_TOBACCO',
    'electronic-only': 'HEATED_TOBACCO',
    heated_tobacco: 'HEATED_TOBACCO',
    'heated-tobacco': 'HEATED_TOBACCO',
    unknown: 'UNKNOWN',
    unspecified: 'UNSPECIFIED',
  }

  return mapping[lower] ?? value.toUpperCase()
}

// 店舗一覧（GET /public/shops）の1件を画面の Store にする。お気に入りの一覧（GET /users/favorites）も同じ形で返る
export function mapShopToStore(shop: ShopData): Store {
  // paymentCreditとpaymentCodeの構造を解析
  const parsePaymentCredit = (paymentCredit: string | { brands?: string[]; other?: string } | undefined): string[] => {
    if (!paymentCredit) return []
    let brands: string[] = []
    let other: string | undefined

    if (typeof paymentCredit === 'string') {
      try {
        const parsed = JSON.parse(paymentCredit)
        brands = Array.isArray(parsed.brands) ? parsed.brands : []
        other = parsed.other
      } catch {
        return []
      }
    } else if (typeof paymentCredit === 'object') {
      brands = Array.isArray(paymentCredit.brands) ? paymentCredit.brands : []
      other = paymentCredit.other
    }

    // otherがある場合は配列に追加
    if (other && other.trim()) {
      return [...brands, other]
    }
    return brands
  }

  const parsePaymentCode = (paymentCode: string | { services?: string[]; other?: string } | undefined): string[] => {
    if (!paymentCode) return []
    let services: string[] = []
    let other: string | undefined

    if (typeof paymentCode === 'string') {
      try {
        const parsed = JSON.parse(paymentCode)
        services = Array.isArray(parsed.services) ? parsed.services : []
        other = parsed.other
      } catch {
        return []
      }
    } else if (typeof paymentCode === 'object') {
      services = Array.isArray(paymentCode.services) ? paymentCode.services : []
      other = paymentCode.other
    }

    // otherがある場合は配列に追加
    if (other && other.trim()) {
      return [...services, other]
    }
    return services
  }

  const parseServices = (services: unknown): string[] => {
    if (!services) return []

    if (Array.isArray(services)) {
      return services
        .map((service) => (typeof service === 'string' ? service.trim() : String(service ?? '').trim()))
        .filter((service) => service.length > 0)
    }

    if (typeof services === 'string') {
      try {
        const parsed = JSON.parse(services)
        return parseServices(parsed)
      } catch {
        return services.split(',').map((service) => service.trim()).filter((service) => service.length > 0)
      }
    }

    if (typeof services === 'object') {
      return Object.entries(services as Record<string, unknown>)
        .filter(([, value]) => Boolean(value))
        .map(([key]) => key)
    }

    return []
  }

  // paymentMethodsを構築
  const creditCards = parsePaymentCredit(shop.paymentCredit)
  const digitalPayments = parsePaymentCode(shop.paymentCode)
  // paymentAppsから値を取得（後方互換性のためpaymentSaicoin/paymentTamaponも参照）
  const paymentAppsData = shop.paymentApps as Record<string, boolean> | undefined
  const hasSaicoin = paymentAppsData?.saicoin ?? !!shop.paymentSaicoin
  const hasTamapon = paymentAppsData?.tamapon ?? !!shop.paymentTamapon
  const hasPaymentMethods = hasSaicoin || hasTamapon || !!shop.paymentCash || creditCards.length > 0 || digitalPayments.length > 0

  // セッションストレージからお気に入り状態を確認（APIから取得できない場合のフォールバック）
  let isFavorite = shop.isFavorite || false
  if (!isFavorite && typeof window !== 'undefined') {
    try {
      isFavorite = isFavoriteInStorage(shop.id as string)
    } catch {
      // セッションストレージのチェックに失敗した場合はAPIの値をそのまま使用
    }
  }

  // genreの型を安全に取得
  const genre = shop.genre as { id?: string; name?: string } | undefined

  // 型安全にプロパティを取得
  const fulladdress = shop.fulladdress as string | undefined
  const prefecture = shop.prefecture as string | undefined
  const city = shop.city as string | undefined
  const area = (shop as any).area as string | undefined
  const address1 = shop.address1 as string | undefined
  const address2 = shop.address2 as string | undefined
  const phone = shop.phone as string | undefined
  const description = shop.description as string | undefined
  const rawImages = shop.images as unknown
  const imageList = Array.isArray(rawImages)
    ? (rawImages as unknown[]).map((img) => (typeof img === 'string' ? img.trim() : String(img ?? '').trim())).filter((img) => img.length > 0)
    : rawImages
      ? (() => {
        const imgStr = String(rawImages).trim()
        return imgStr ? [imgStr] : []
      })()
      : []
  const scenes = shop.scenes as (string | { name?: string })[] | undefined
  const sceneIds = shop.sceneIds as (string | { name?: string })[] | undefined
  const customSceneText = shop.customSceneText as string | undefined
  const status = shop.status as string | undefined
  const merchantId = shop.merchantId as string | undefined
  const merchant = shop.merchant as { account?: { email?: string } } | undefined
  const accountEmail = shop.accountEmail as string | undefined
  const createdAt = shop.createdAt as string | undefined
  const updatedAt = shop.updatedAt as string | undefined
  const services = parseServices((shop as { services?: unknown }).services)

  return {
    id: shop.id as string,
    name: shop.name as string,
    genre: genre?.id || '',
    genreLabel: genre?.name || '',
    address:
      fulladdress ||
      [prefecture, city, address1, address2].filter(Boolean).join(' '),
    prefecture: prefecture || undefined,
    city: city || undefined,
    area: area || undefined,
    phone: phone || '',
    description: description || '',
    thumbnailUrl: imageList[0] || '',
    images: imageList.length > 0 ? imageList : undefined,
    isFavorite,
    latitude: shop.latitude ? Number(shop.latitude) : undefined,
    longitude: shop.longitude ? Number(shop.longitude) : undefined,
    couponUsageStart: shop.couponUsageStart || undefined,
    couponUsageEnd: shop.couponUsageEnd || undefined,
    couponUsageDays: shop.couponUsageDays || undefined,
    homepageUrl: shop.homepageUrl || undefined,
    details: shop.details || undefined,
    businessHours: shop.businessHours || undefined,
    closedDays: shop.holidays || shop.closedDays || undefined,
    holidays: shop.holidays || undefined,
    smokingPolicy: normalizeSmokingPolicy(shop.smokingType, shop.smokingPolicy),
    usageScenes: (() => {
      // 利用シーンの配列を構築（「その他」は除外）
      const sceneArray: string[] = (scenes || sceneIds || [])
        .map((s: string | { name?: string } | undefined) => (typeof s === 'string' ? s : s?.name))
        .filter(Boolean) as string[]

      return sceneArray
    })(),
    customSceneText: customSceneText && typeof customSceneText === 'string' && customSceneText.trim()
      ? customSceneText.trim()
      : undefined,
    services: services.length > 0 ? services : undefined,
    paymentMethods: hasPaymentMethods ? {
      saicoin: hasSaicoin,
      tamapon: hasTamapon,
      cash: !!shop.paymentCash,
      creditCards,
      digitalPayments,
    } : undefined,
    status: status || 'active',
    merchantId: merchantId,
    email: merchant?.account?.email || accountEmail || '',
    paymentSaicoin: hasSaicoin,
    paymentTamapon: hasTamapon,
    paymentCash: !!shop.paymentCash,
    paymentApps: paymentAppsData,
    createdAt: createdAt,
    updatedAt: updatedAt,
  }
}
