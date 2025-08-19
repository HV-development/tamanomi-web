export interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "warning" | "success" | "promotion"
  isRead: boolean
  createdAt: Date
  imageUrl?: string
}
