import { test, expect } from '@playwright/test';

/**
 * キャッシュ無効化ヘッダーとセキュリティヘッダーのE2Eテスト
 * 実データを使用してテスト（storageStateで認証済み状態を使用）
 */
test.describe('HTTPヘッダーの検証', () => {
  // ================================================================
  // キャッシュ無効化ヘッダーの検証
  // ================================================================
  test.describe('キャッシュ無効化ヘッダー', () => {
    // Cache-Controlヘッダーを検証するヘルパー関数
    function validateCacheHeaders(
      cacheControl: string | undefined,
      pragma: string | undefined,
      path: string,
      testInfo?: { attach: (name: string, options: { body: string; contentType: string }) => void }
    ) {
      const headers = {
        path,
        'Cache-Control': cacheControl || '(未設定)',
        'Pragma': pragma || '(未設定)',
      };

      if (testInfo) {
        testInfo.attach('response-headers', {
          body: JSON.stringify(headers, null, 2),
          contentType: 'application/json',
        });
      }

      // Cache-Controlが設定されていることを確認
      expect(cacheControl, `${path}のCache-Controlヘッダーが設定されていません`).toBeTruthy();

      // no-storeが含まれていることを確認
      expect(cacheControl, `${path}のCache-Controlヘッダーにno-storeが含まれていません`).toContain('no-store');
    }

    test('ルートパス（/）でヘッダーが正しく設定されている', async ({ page }, testInfo) => {
      const response = await page.goto('/', { waitUntil: 'load' });
      expect(response).toBeTruthy();

      const cacheControl = response?.headers()['cache-control'];
      const pragma = response?.headers()['pragma'];

      validateCacheHeaders(cacheControl, pragma, '/', testInfo);
    });

    test('ログインページでヘッダーが正しく設定されている', async ({ page }, testInfo) => {
      const response = await page.goto('/login', { waitUntil: 'load' });
      expect(response).toBeTruthy();

      const cacheControl = response?.headers()['cache-control'];
      const pragma = response?.headers()['pragma'];

      validateCacheHeaders(cacheControl, pragma, '/login', testInfo);
    });

    test('保護されたページ（/home）でヘッダーが正しく設定されている', async ({ page }, testInfo) => {
      const response = await page.goto('/home', { waitUntil: 'domcontentloaded' });
      expect(response).toBeTruthy();

      const cacheControl = response?.headers()['cache-control'];
      const pragma = response?.headers()['pragma'];

      validateCacheHeaders(cacheControl, pragma, '/home', testInfo);
    });

    test('存在しないページ（404）でもヘッダーが正しく設定されている', async ({ page }, testInfo) => {
      const response = await page.goto('/non-existent-page-12345', { waitUntil: 'load' });
      expect(response).toBeTruthy();

      const cacheControl = response?.headers()['cache-control'];
      const pragma = response?.headers()['pragma'];

      validateCacheHeaders(cacheControl, pragma, '/non-existent-page', testInfo);
    });
  });

  // ================================================================
  // Strict-Transport-Securityヘッダーの検証
  // ================================================================
  test.describe('Strict-Transport-Securityヘッダー', () => {
    const expectedHSTS = 'max-age=31536000; includeSubDomains; preload';

    function validateHSTSHeader(
      hsts: string | undefined,
      path: string,
      testInfo?: { attach: (name: string, options: { body: string; contentType: string }) => void }
    ) {
      const headers = {
        path,
        'Strict-Transport-Security': hsts || '(未設定)',
        expected: expectedHSTS,
      };

      if (testInfo) {
        testInfo.attach('hsts-headers', {
          body: JSON.stringify(headers, null, 2),
          contentType: 'application/json',
        });
      }

      expect(hsts, `${path}のStrict-Transport-Securityヘッダーが設定されていません`).toBeTruthy();
      expect(hsts, `${path}のStrict-Transport-Securityヘッダーが期待値と異なります`).toBe(expectedHSTS);
    }

    test('ルートパス（/）でStrict-Transport-Securityヘッダーが正しく設定されている', async ({ page }, testInfo) => {
      const response = await page.goto('/', { waitUntil: 'load' });
      expect(response).toBeTruthy();

      const hsts = response?.headers()['strict-transport-security'];
      validateHSTSHeader(hsts, '/', testInfo);
    });

    test('ログインページでStrict-Transport-Securityヘッダーが正しく設定されている', async ({ page }, testInfo) => {
      const response = await page.goto('/login', { waitUntil: 'load' });
      expect(response).toBeTruthy();

      const hsts = response?.headers()['strict-transport-security'];
      validateHSTSHeader(hsts, '/login', testInfo);
    });

    test('保護されたページ（/home）でStrict-Transport-Securityヘッダーが正しく設定されている', async ({ page }, testInfo) => {
      const response = await page.goto('/home', { waitUntil: 'domcontentloaded' });
      expect(response).toBeTruthy();

      const hsts = response?.headers()['strict-transport-security'];
      validateHSTSHeader(hsts, '/home', testInfo);
    });

    test('存在しないページ（404）でもStrict-Transport-Securityヘッダーが正しく設定されている', async ({ page }, testInfo) => {
      const response = await page.goto('/non-existent-page-12345', { waitUntil: 'load' });
      expect(response).toBeTruthy();

      const hsts = response?.headers()['strict-transport-security'];
      validateHSTSHeader(hsts, '/non-existent-page', testInfo);
    });
  });

  // ================================================================
  // 複数ページの一貫性テスト
  // ================================================================
  test.describe('複数ページでの一貫性', () => {
    test('複数のページで一貫してヘッダーが設定されている', async ({ page }, testInfo) => {
      const pages = ['/', '/login', '/register', '/plan-registration'];
      const allHeaders: Record<string, { 'Cache-Control': string; 'HSTS': string }> = {};

      for (const path of pages) {
        const response = await page.goto(path, { waitUntil: 'load' });
        if (response) {
          allHeaders[path] = {
            'Cache-Control': response.headers()['cache-control'] || '(未設定)',
            'HSTS': response.headers()['strict-transport-security'] || '(未設定)',
          };
        }
      }

      testInfo.attach('all-pages-headers', {
        body: JSON.stringify(allHeaders, null, 2),
        contentType: 'application/json',
      });

      // 全ページでCache-Controlが設定されていることを確認
      for (const [path, headers] of Object.entries(allHeaders)) {
        expect(headers['Cache-Control'], `${path}のCache-Controlが未設定`).not.toBe('(未設定)');
      }
    });
  });
});
