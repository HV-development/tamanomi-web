/**
 * API設定の一元管理
 * 
 * 環境変数:
 * - API_BASE_URL: バックエンドAPIのベースURL（バージョンなし）
 *   例: https://tamanomi-api-develop.up.railway.app
 */

// ビルド時はダミー値を使用し、ランタイムで実際の値を使用
// Dockerコンテナ内で実行されている場合は`api`ホスト名を使用、ホストマシンで実行されている場合は`localhost`を使用
// Dockerコンテナ内で実行されているかどうかは、環境変数`DOCKER_ENV`で判定
// 注意: `CI=true`はCI環境でも設定される可能性があるため、`DOCKER_ENV`を優先
const isDockerEnv = process.env.DOCKER_ENV === 'true';
const rawApiBaseUrl = process.env.API_BASE_URL || 'http://localhost:3002';

// Docker環境でない場合、`http://api:`を`http://localhost:`に変換
// Docker環境の場合はそのまま使用（`http://api:3002`のまま）
const API_BASE_URL = isDockerEnv 
  ? rawApiBaseUrl 
  : rawApiBaseUrl.replace('http://api:', 'http://localhost:');
const API_VERSION = '/api/v1';

// ランタイムで環境変数が未設定の場合のみ警告
if (typeof window !== 'undefined' && !process.env.API_BASE_URL) {
  // API_BASE_URL環境変数が未設定の場合、デフォルト値を使用
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

/**
 * 変換済みのAPI_BASE_URLをエクスポート
 * Dockerネットワーク内の`api`ホスト名を`localhost`に変換済み
 */
export { API_BASE_URL };

