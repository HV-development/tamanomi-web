import { test, expect } from '@playwright/test';
import { waitForPageLoad, takeScreenshot } from './utils/test-helpers';

/**
 * クロスアプリケーション認証テスト（tamanomi-web用）
 * 
 * 他アプリケーションのアカウントでログインできないことを確認
 * - nomoca-kagawa-webで登録したアカウントでtamanomi-webにログインできないこと
 * 
 * ※ tamanomiアカウントでnomocaにログインできないテストはnomoca-kagawa-webのE2Eテストで実行
 */
test.describe('クロスアプリ認証', () => {
  // テストは順次実行
  test.describe.configure({ mode: 'serial' });

  // nomoca-kagawa-web のテストユーザー（既存）
  const NOMOCA_USER = {
    email: 'nomoca-user@example.com',
    password: 'nomoca-user123',
  };

  // ================================================================
  // アプリケーション分離テスト
  // ================================================================
  test.describe('アプリ分離', () => {
    test('nomocaアカウントでtamanomiログイン不可', async ({ page }) => {
      // tamanomi-webのログインページに移動
      await page.goto('/login');
      await waitForPageLoad(page);

      // ログインフォームが表示されるまで待機
      await page.waitForSelector('input[type="email"], input[placeholder*="email"], input[placeholder*="メール"]', { timeout: 15000 });

      // nomoca-kagawa-webのユーザー情報でログインを試行
      const emailInput = page.getByPlaceholder('example@email.com')
        .or(page.locator('input[type="email"]'));
      const passwordInput = page.getByPlaceholder(/パスワード/i)
        .or(page.locator('input[type="password"]'));

      await emailInput.fill(NOMOCA_USER.email);
      await passwordInput.fill(NOMOCA_USER.password);

      // ログインボタンをクリック
      const loginButton = page.getByRole('button', { name: /ログイン/i });
      await loginButton.click();

      // 5秒待ってからチェック
      await page.waitForTimeout(5000);

      const currentUrl = page.url();
      
      await takeScreenshot(page, 'nomoca-user-cannot-login-tamanomi');

      // OTPページに遷移していないことを確認（アプリケーション分離が機能している証拠）
      const isOnOtpPage = currentUrl.includes('/verify-otp') || currentUrl.includes('/otp');
      expect(isOnOtpPage, 'OTPページに遷移してはいけません（アプリケーション分離が機能していません）').toBeFalsy();
      
      // ログインページに留まっているか、エラーが表示されていることを確認
      const isStillOnLogin = currentUrl.includes('/login');
      const hasError = await page.locator('text=/エラー|失敗|見つかりません|登録されていません|無効|正しくありません/i').isVisible().catch(() => false);
      
      expect(isStillOnLogin || hasError, 'ログインページに留まるか、エラーが表示されるべきです').toBeTruthy();
    });
  });
});
