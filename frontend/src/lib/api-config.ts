/**
 * API設定の一元管理
 * 
 * 環境変数:
 * - API_BASE_URL: バックエンドAPIのベースURL（バージョンなし）
 *   例: https://tamanomi-api-develop.up.railway.app
 */

const API_BASE_URL = process.env.API_BASE_URL;
const API_VERSION = '/api/v1';

if (!API_BASE_URL) {
  throw new Error('API_BASE_URL environment variable is not set');
}

/**
 * フルAPIのベースURL（バージョン含む）
 * 例: https://tamanomi-api-develop.up.railway.app/api/v1
 */
export const FULL_API_URL = `${API_BASE_URL}${API_VERSION}`;

/**
 * API URLを構築するヘルパー関数
 * @param endpoint - エンドポイントパス（先頭のスラッシュあり）
 * @returns フルURL
 * @example buildApiUrl('/plans/user-plans') // => 'https://.../api/v1/plans/user-plans'
 */
export function buildApiUrl(endpoint: string): string {
  return `${FULL_API_URL}${endpoint}`;
}

/**
 * 環境情報
 */
export const API_CONFIG = {
  baseUrl: API_BASE_URL,
  version: API_VERSION,
  fullUrl: FULL_API_URL,
} as const;

