export interface Coupon {
  id: string
  name: string
  description: string
  imageUrl: string
  storeId: string
  storeName: string
  expiresAt?: Date
}
