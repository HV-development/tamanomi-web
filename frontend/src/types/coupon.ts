export interface Coupon {
  id: string
  name: string // titleから変換
  description: string | null
  conditions: string | null
  imageUrl: string | null
  drinkType: 'alcohol' | 'soft_drink' | 'other' | null
  status?: string
  storeId: string
  storeName: string
  expiresAt?: Date
  uuid: string
  createdAt?: string
  updatedAt?: string
}

