import type { LucideIcon } from "lucide-react"

export interface User {
  id: string
  email: string
  nickname: string
  postalCode: string
  address: string
  birthDate: string
  gender: string
  saitamaAppId?: string
  registeredStore?: string
  createdAt: Date
  contractStartDate?: Date
}

export interface Plan {
  id: string
  name: string
  price: number
  description: string
  isActive: boolean
  nextBillingDate?: Date
  startDate: Date
}

export interface UsageHistory {
  id: string
  usageId: string // 利用ID
  storeId: string
  storeName: string
  storeAddress: string
  usedAt: Date
  couponId: string
  couponName: string
  couponType: string
  couponDescription?: string
  isAvailable: boolean // 同じクーポンが再利用可能かどうか
}

export interface PaymentHistory {
  id: string
  paymentId: string // 決済ID
  amount: number
  planName: string
  paidAt: Date
  status: "completed" | "pending" | "failed"
  paymentMethod?: string // 決済方法
}

export type UserRank = "bronze" | "silver" | "gold" | "diamond"

export interface RankInfo {
  rank: UserRank
  label: string
  color: string
  bgColor: string
  icon: LucideIcon
  description: string
  monthsRequired: number
}
