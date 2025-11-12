/**
 * お気に入り情報のセッションストレージ管理
 * 未認証ユーザー向けに一時的なお気に入り情報を保存
 */

const FAVORITES_STORAGE_KEY = 'tamanomi_favorites'

/**
 * セッションストレージからお気に入り一覧を取得
 */
export function getFavoritesFromStorage(): string[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const stored = sessionStorage.getItem(FAVORITES_STORAGE_KEY)
    if (!stored) {
      return []
    }
    const favorites = JSON.parse(stored) as string[]
    return Array.isArray(favorites) ? favorites : []
  } catch (error) {
    console.error('お気に入り情報の取得エラー:', error)
    return []
  }
}

/**
 * セッションストレージにお気に入り一覧を保存
 */
export function saveFavoritesToStorage(shopIds: string[]): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    sessionStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(shopIds))
  } catch (error) {
    console.error('お気に入り情報の保存エラー:', error)
  }
}

/**
 * セッションストレージにお気に入りを追加
 */
export function addFavoriteToStorage(shopId: string): void {
  const favorites = getFavoritesFromStorage()
  if (!favorites.includes(shopId)) {
    favorites.push(shopId)
    saveFavoritesToStorage(favorites)
  }
}

/**
 * セッションストレージからお気に入りを削除
 */
export function removeFavoriteFromStorage(shopId: string): void {
  const favorites = getFavoritesFromStorage()
  const filtered = favorites.filter(id => id !== shopId)
  saveFavoritesToStorage(filtered)
}

/**
 * セッションストレージのお気に入りをトグル
 */
export function toggleFavoriteInStorage(shopId: string): boolean {
  const favorites = getFavoritesFromStorage()
  const isFavorite = favorites.includes(shopId)
  
  if (isFavorite) {
    removeFavoriteFromStorage(shopId)
    return false
  } else {
    addFavoriteToStorage(shopId)
    return true
  }
}

/**
 * セッションストレージのお気に入りをクリア
 */
export function clearFavoritesFromStorage(): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    sessionStorage.removeItem(FAVORITES_STORAGE_KEY)
  } catch (error) {
    console.error('お気に入り情報のクリアエラー:', error)
  }
}

/**
 * 店舗IDがお気に入りかどうかを確認
 */
export function isFavoriteInStorage(shopId: string): boolean {
  const favorites = getFavoritesFromStorage()
  return favorites.includes(shopId)
}




