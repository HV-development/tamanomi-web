/**
 * UI関連の共通型定義
 */

/**
 * メニューアイテムの型（アイコン付き）
 */
export interface MenuItem {
  id: string
  label: string
  icon?: React.ReactNode
  onClick?: () => void
}

/**
 * バナーの型
 */
export interface Banner {
  id: string
  title: string
  subtitle?: string
  imageUrl: string
  backgroundColor: string
  textColor: string
  link?: string
  description?: string
}

