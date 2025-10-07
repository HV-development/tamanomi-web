export interface Store {
  id: string
  name: string
  genre: string
  genreLabel: string
  address: string
  phone: string
  website?: string
  description: string
  thumbnailUrl?: string
  isFavorite: boolean
  visitedAt?: Date
  businessHours?: string
  closedDays?: string
  budget?: {
    dinner?: { min: number; max: number }
    lunch?: { min: number; max: number }
  }
  smokingPolicy?: 'NON_SMOKING' | 'SMOKING' | 'SEPARATED' | 'HEATED_TOBACCO' | 'UNKNOWN' | 'UNSPECIFIED'
  paymentMethods?: {
    cash: boolean
    creditCards: string[]
    digitalPayments: string[]
  }
  usageScenes?: string[]
  // 追加のプロパティ
  status: "active" | "inactive" | "suspended"
  merchantId: string
  email: string
  paymentSaicoin: boolean
  paymentTamapon: boolean
  paymentCash: boolean
  scenes?: string
  createdAt: string
  updatedAt: string
  merchant?: any
}
