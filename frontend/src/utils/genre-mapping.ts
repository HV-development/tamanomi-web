/**
 * ジャンル値からジャンルIDへのマッピング
 * ジャンル一覧APIから取得したデータを使用してマッピングを構築
 */

export interface Genre {
  id: string
  name: string
  sortOrder?: number
}

/**
 * ジャンル値（GenrePopupで使用）からジャンル名へのマッピング
 */
const GENRE_VALUE_TO_NAME_MAP: Record<string, string> = {
  japanese: "和食",
  western: "洋食",
  chinese: "中華",
  italian: "イタリア料理",
  korean: "韓国料理",
  french: "フランス料理",
  ethnic: "エスニック",
  sushi: "寿司",
  curry: "カレー",
  yakiniku: "焼肉",
  nabe: "鍋",
  izakaya: "居酒屋",
  ramen: "ラーメン",
  bar: "バー",
  cafe: "カフェ",
  shokudo: "食堂",
  event: "イベント出店",
}

/**
 * ジャンル名からジャンルIDへのマッピングキャッシュ
 */
let genreNameToIdCache: Map<string, string> | null = null

/**
 * ジャンル一覧APIからジャンル情報を取得してマッピングを構築
 * @returns ジャンル名からジャンルIDへのマッピング
 */
async function buildGenreMapping(): Promise<Map<string, string>> {
  if (genreNameToIdCache) {
    return genreNameToIdCache
  }

  try {
    // クライアントサイドではNext.jsのAPIルート経由で取得
    const apiUrl = typeof window !== 'undefined'
      ? '/api/genres'
      : `${process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || 'http://localhost:3002'}/api/v1/public/genres`


    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })


    if (!response.ok) {
      console.warn('[genre-mapping] Failed to fetch genres:', response.status)
      return new Map()
    }

    const data = await response.json()

    const genres: Genre[] = data.genres || []

    const mapping = new Map<string, string>()
    for (const genre of genres) {
      mapping.set(genre.name, genre.id)
    }

    genreNameToIdCache = mapping
    return mapping
  } catch (error) {
    console.error('[genre-mapping] Error fetching genres:', error)
    return new Map()
  }
}

/**
 * ジャンル値の配列をジャンルIDの配列に変換
 * @param genreValues ジャンル値の配列（例: ["izakaya", "japanese"]）
 * @returns ジャンルIDの配列（例: ["uuid1", "uuid2"]）
 */
export async function mapGenresToIds(genreValues: string[]): Promise<string[]> {
  const genreNameToId = await buildGenreMapping()
  const genreIds: string[] = []

  for (const genreValue of genreValues) {
    const genreName = GENRE_VALUE_TO_NAME_MAP[genreValue]
    if (!genreName) {
      console.warn(`[genre-mapping] Unknown genre value: ${genreValue}`)
      continue
    }

    const genreId = genreNameToId.get(genreName)
    if (genreId) {
      genreIds.push(genreId)
    } else {
      console.warn(`[genre-mapping] Genre ID not found for: ${genreName}`)
    }
  }

  return genreIds
}

/**
 * 単一のジャンル値をジャンルIDに変換
 * @param genreValue ジャンル値（例: "izakaya"）
 * @returns ジャンルID（例: "uuid1"）、存在しない場合はundefined
 */
export async function mapGenreToId(genreValue: string): Promise<string | undefined> {
  const genreIds = await mapGenresToIds([genreValue])
  return genreIds[0]
}

/**
 * ジャンル値が有効かどうかをチェック
 * @param genreValue ジャンル値
 * @returns 有効なジャンル値かどうか
 */
export function isValidGenre(genreValue: string): boolean {
  return genreValue in GENRE_VALUE_TO_NAME_MAP
}

/**
 * マッピングキャッシュをクリア（テスト用など）
 */
export function clearGenreMappingCache(): void {
  genreNameToIdCache = null
}

