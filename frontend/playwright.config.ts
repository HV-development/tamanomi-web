import { defineConfig, devices } from '@playwright/test';
import * as path from 'path';
import { config } from 'dotenv';

// E2Eテスト用の.envファイルを読み込む
const envPath = path.resolve(__dirname, 'e2e', '.env');
config({ path: envPath });

// 認証状態ファイルのパス
const authFile = '.auth/user.json';

/**
 * Playwright設定ファイル
 * 
 * テストプロジェクトの分類:
 * 1. setup - 認証セットアップ（OTP認証を1回実行してstorageStateを保存）
 * 2. authenticated - storageStateを使用する全テスト（実データ使用）
 * 3. auth-flow - 認証フローのテスト（シリアル実行、認証状態を使用しない）
 * 
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  /* テストの最大実行時間 */
  timeout: 60 * 1000,
  expect: {
    /* アサーションのタイムアウト */
    timeout: 10000,
  },
  /* テストを並列実行 */
  fullyParallel: true,
  /* CIで失敗したテストを再実行しない */
  forbidOnly: !!process.env.CI,
  /* CIでのみ失敗したテストを再実行 */
  retries: process.env.CI ? 2 : 0,
  /* 並列実行数を設定 */
  workers: process.env.CI ? 2 : 4,
  /* レポーター設定 */
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
    ['line'],
  ],
  /* 共有設定 */
  use: {
    /* ベースURL */
    baseURL: process.env.E2E_BASE_URL || process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    /* アクションのタイムアウト */
    actionTimeout: 15 * 1000,
    /* ナビゲーションのタイムアウト */
    navigationTimeout: 30 * 1000,
    /* スクリーンショット設定 */
    screenshot: {
      mode: 'on',
      fullPage: true,
    },
    /* 動画設定 - 全テストで録画 */
    video: {
      mode: 'on',
      size: { width: 1280, height: 720 },
    },
    /* トレース - 全テストで記録 */
    trace: 'on',
    /* ブラウザ操作を遅延させて動画に操作が映るようにする */
    launchOptions: {
      slowMo: 500, // 各操作間に500msの遅延を追加
    },
  },

  /* プロジェクト設定 */
  projects: [
    // セットアップ: 認証状態を作成（OTP認証を1回だけ実行）
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    // 認証済みテスト: storageStateを使用して認証を再利用（実データ使用）
    {
      name: 'authenticated',
      dependencies: ['setup'],
      testMatch: [
        'shops.spec.ts',
        'coupons.spec.ts',
        'favorites.spec.ts',
        'mypage.spec.ts',
        'plans.spec.ts',
        'headers.spec.ts',
      ],
      use: {
        ...devices['Desktop Chrome'],
        storageState: authFile,
      },
    },
    // 認証フローテスト: ログイン・登録フロー自体をテスト（シリアル実行で競合を避ける）
    {
      name: 'auth-flow',
      testMatch: [
        'auth.spec.ts',
        'registration.spec.ts',
        'cross-app-auth.spec.ts',
      ],
      use: { ...devices['Desktop Chrome'] },
      fullyParallel: false,
    },
    // エラーハンドリングテスト
    {
      name: 'error-handling',
      testMatch: 'error-handling.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
    // ナビゲーションテスト
    {
      name: 'navigation',
      testMatch: 'navigation.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },

  ],

  /* 開発サーバーの設定 */
  webServer: process.env.E2E_BASE_URL || process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: 'pnpm dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
        stdout: 'ignore',
        stderr: 'pipe',
      },
});
