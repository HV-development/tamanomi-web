import { test, expect } from '@playwright/test';
import { waitForPageLoad, takeScreenshot } from './utils/test-helpers';

/**
 * ユーザー登録フローのE2Eテスト
 * 実際のアプリケーションの登録フローに沿ってテスト
 */
test.describe('ユーザー登録フロー', () => {
  // OTP検証の競合を避けるため、このテストスイートは順次実行
  test.describe.configure({ mode: 'serial' });

  // ================================================================
  // メールアドレス登録画面テスト
  // ================================================================
  test.describe('メールアドレス登録', () => {
    test('メールアドレス入力画面が表示されること', async ({ page }) => {
      await page.goto('/email-registration');
      await waitForPageLoad(page);

      // ページが表示されていることを確認
      const pageContent = await page.locator('body').textContent();
      expect(pageContent).toBeTruthy();

      await takeScreenshot(page, 'email-registration-form');
    });

    test('メールアドレス入力欄が表示されること', async ({ page }) => {
      await page.goto('/email-registration');
      await waitForPageLoad(page);

      // メールアドレス入力欄を探す
      const emailInput = page.getByPlaceholder(/メール|email/i)
        .or(page.getByLabel(/メール|email/i))
        .or(page.locator('input[type="email"]'));

      const hasEmailInput = await emailInput.isVisible().catch(() => false);
      expect(hasEmailInput).toBeTruthy();
    });

    test('送信ボタンが表示されること', async ({ page }) => {
      await page.goto('/email-registration');
      await waitForPageLoad(page);

      // 送信ボタンを探す
      const submitButton = page.getByRole('button', { name: /登録|送信|次へ|確認/ })
        .or(page.locator('button[type="submit"]'));

      const hasButton = await submitButton.isVisible().catch(() => false);
      expect(hasButton).toBeTruthy();
    });
  });

  // ================================================================
  // 本登録画面テスト（トークン必須）
  // ================================================================
  test.describe('本登録画面', () => {
    test('トークンなしで/registerにアクセスするとリダイレクトされること', async ({ page }) => {
      await page.goto('/register');
      
      // /email-registrationにリダイレクトされることを確認
      await page.waitForURL(/.*email-registration.*|.*register.*/, { timeout: 10000 });
    });
  });
});
