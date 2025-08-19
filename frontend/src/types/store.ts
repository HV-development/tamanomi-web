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
}
