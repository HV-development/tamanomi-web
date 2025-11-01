export interface StoreBudgetRange {
  min: number
  max: number
}

export interface StoreBudget {
  dinner?: StoreBudgetRange
  lunch?: StoreBudgetRange
}

export interface StorePaymentMethods {
  cash?: boolean
  creditCards: string[]
  digitalPayments: string[]
}

export interface Store {
  id: string
  name: string
  genre: string
  genreLabel: string
  address: string
  phone: string
  description: string
  thumbnailUrl?: string
  isFavorite: boolean

  // 詳細情報（任意）
  website?: string
  businessHours?: string
  closedDays?: string
  budget?: StoreBudget
  smokingPolicy?: 'NON_SMOKING' | 'SMOKING' | 'SEPARATED' | 'HEATED_TOBACCO' | 'UNKNOWN' | 'UNSPECIFIED' | string
  paymentMethods?: StorePaymentMethods
  usageScenes?: string[]

  // メタ情報（任意）
  status?: string
  merchantId?: string
  email?: string
  paymentSaicoin?: boolean
  paymentTamapon?: boolean
  paymentCash?: boolean
  createdAt?: string
  updatedAt?: string
}


