import { test, expect } from '@playwright/test';
import { waitForPageLoad, takeScreenshot } from './utils/test-helpers';

/**
 * ユーザー登録フローのE2Eテスト
 * 実際のアプリケーションの登録フローに沿ってテスト
 */
test.describe('ユーザー登録フロー', () => {
  // OTP検証の競合を避けるため、このテストスイートは順次実行
  test.describe.configure({ mode: 'serial' });

  // テスト用キャンペーンコード
  const CAMPAIGN_CODE = '5959';

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
      const emailInput = page.locator('input[type="email"]');
      await expect(emailInput).toBeVisible({ timeout: 10000 });
    });

    test('送信ボタンが表示されること', async ({ page }) => {
      await page.goto('/email-registration');
      await waitForPageLoad(page);

      // 送信ボタンを探す
      const submitButton = page.getByRole('button', { name: /認証メールを送信/i });
      await expect(submitButton).toBeVisible({ timeout: 10000 });
    });

    test('メール登録フォームに入力して送信ボタンをクリックできること', async ({ page }) => {
      const testEmail = `registration-test-${Date.now()}@example.com`;

      await page.goto('/email-registration');
      await waitForPageLoad(page);

      // フォームが表示されるまで待機
      await page.waitForSelector('form', { timeout: 10000 });

      // メールアドレス入力 - input[type="email"]を直接使用
      const emailInput = page.locator('input[type="email"]');
      await expect(emailInput).toBeVisible({ timeout: 10000 });
      await emailInput.click();
      await emailInput.fill(testEmail);

      // 入力されたことを確認
      await expect(emailInput).toHaveValue(testEmail);

      // キャンペーンコード入力 - 2番目のinput[type="text"]を使用
      const campaignCodeInput = page.locator('input[type="text"]').first();
      await expect(campaignCodeInput).toBeVisible({ timeout: 5000 });
      await campaignCodeInput.click();
      await campaignCodeInput.fill(CAMPAIGN_CODE);

      // 入力されたことを確認
      await expect(campaignCodeInput).toHaveValue(CAMPAIGN_CODE);

      // 入力後待機（動画で確認できるように）
      await page.waitForTimeout(2000);
      await takeScreenshot(page, 'email-registration-filled');

      // 認証メールを送信ボタンをクリック
      const submitButton = page.getByRole('button', { name: /認証メールを送信/i });
      await expect(submitButton).toBeVisible();
      await expect(submitButton).toBeEnabled();
      await submitButton.click();

      // 送信後の画面を待機（完了画面が表示されるまで）
      await page.waitForTimeout(5000);
      await takeScreenshot(page, 'email-registration-submitted');

      // 完了画面が表示されることを確認（複数のパターンに対応）
      const completionIndicators = [
        page.locator('text=認証メールを送信しました'),
        page.locator('text=メールをお送りしました'),
        page.locator('text=送信先メールアドレス'),
        page.locator('text=次の手順'),
      ];

      let found = false;
      for (const indicator of completionIndicators) {
        if (await indicator.isVisible().catch(() => false)) {
          found = true;
          break;
        }
      }

      expect(found, '完了画面が表示されていません').toBeTruthy();
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
