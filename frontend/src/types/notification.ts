export type NotificationType = "info" | "warning" | "success" | "promotion"

export interface Notification {
  id: string
  title: string
  message: string
  type: NotificationType
  isRead: boolean
  createdAt: Date
  imageUrl?: string | null
}
