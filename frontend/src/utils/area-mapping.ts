/**
 * エリア値から市区町村名へのマッピング
 * さいたま市のエリアを定義
 */

const AREA_TO_CITY_MAP: Record<string, string> = {
  nishi: "西区",
  kita: "北区",
  omiya: "大宮区",
  minuma: "見沼区",
  chuo: "中央区",
  sakura: "桜区",
  urawa: "浦和区",
  minami: "南区",
  midori: "緑区",
  iwatsuki: "岩槻区",
}

/**
 * エリア値の配列を市区町村名の配列に変換
 * @param areaValues エリア値の配列（例: ["nishi", "kita"]）
 * @returns 市区町村名の配列（例: ["西区", "北区"]）
 */
export function mapAreasToCities(areaValues: string[]): string[] {
  return areaValues
    .map(area => AREA_TO_CITY_MAP[area])
    .filter((city): city is string => city !== undefined)
}

/**
 * 単一のエリア値を市区町村名に変換
 * @param areaValue エリア値（例: "nishi"）
 * @returns 市区町村名（例: "西区"）、存在しない場合はundefined
 */
export function mapAreaToCity(areaValue: string): string | undefined {
  return AREA_TO_CITY_MAP[areaValue]
}

/**
 * エリア値が有効かどうかをチェック
 * @param areaValue エリア値
 * @returns 有効なエリア値かどうか
 */
export function isValidArea(areaValue: string): boolean {
  return areaValue in AREA_TO_CITY_MAP
}


