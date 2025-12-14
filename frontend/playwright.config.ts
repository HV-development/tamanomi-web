import { defineConfig, devices } from '@playwright/test';
import * as path from 'path';
import { config } from 'dotenv';

// E2Eテスト用の.envファイルを読み込む
const envPath = path.resolve(__dirname, 'e2e', '.env');
config({ path: envPath });

/**
 * Playwright設定ファイル
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  /* テストの最大実行時間 */
  timeout: 45 * 1000, // 45秒（適切なバランス）
  expect: {
    /* アサーションのタイムアウト */
    timeout: 8000, // 8秒
  },
  /* テストを並列実行しない（OTP検証の競合を避けるため） */
  fullyParallel: false,
  /* CIで失敗したテストを再実行しない */
  forbidOnly: !!process.env.CI,
  /* CIでのみ失敗したテストを再実行 */
  retries: process.env.CI ? 2 : 0,
  /* 並列実行を無効化（OTP検証の競合を避けるため） */
  workers: 1, // 順次実行
  /* レポーター設定 */
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'], // コンソールに各テストの実行状況を表示
    ['line'], // 実行進捗を1行ずつ表示
  ],
  /* 共有設定 */
  use: {
    /* ベースURL（開発サーバーのURL） */
    baseURL: process.env.E2E_BASE_URL || process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    /* アクションのタイムアウト */
    actionTimeout: 12 * 1000, // 12秒
    /* ナビゲーションのタイムアウト */
    navigationTimeout: 45 * 1000, // 45秒
    /* スクリーンショットを失敗時のみ取得 */
    screenshot: 'only-on-failure',
    /* 動画を常に録画 */
    video: 'on',
    /* トレースを失敗時のみ取得 */
    trace: 'on-first-retry',
  },

  /* プロジェクト設定 */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* 開発サーバーの設定 */
  webServer: process.env.E2E_BASE_URL || process.env.PLAYWRIGHT_BASE_URL
    ? undefined // 外部URLを使用する場合は開発サーバーを起動しない
    : {
        command: 'pnpm dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
        // サーバーが完全に起動するまで待機
        stdout: 'ignore',
        stderr: 'pipe',
      },
});

