import type { LucideIcon } from "lucide-react"

/**
 * フロントエンド用のUser型
 * APIレスポンス（/api/user/me）の型定義
 */
export interface User {
  id: string
  email: string
  nickname: string
  postalCode: string
  address: string
  birthDate: string
  gender: string
  createdAt: Date
  contractStartDate?: Date // フロントエンド固有のプロパティ
  status?: string
  phone?: string
  lastLoginAt?: Date
  updatedAt?: Date
  saitamaAppLinked?: boolean
  paymentCard?: {
    paygentCustomerId: string
    paygentCustomerCardId: string
  } | null
  referrerUrl?: string | null
}

/**
 * フロントエンド用のPlan型
 * APIレスポンスのplan部分の型定義
 */
export interface Plan {
  id: string
  name: string
  price: number
  description?: string // フロントエンド固有
  isActive?: boolean // フロントエンド固有
  discountPrice?: number | null
  isSubscription?: boolean
  status?: string
  startDate: Date
  endDate?: Date | null
  nextBillingDate?: Date // フロントエンド固有
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
