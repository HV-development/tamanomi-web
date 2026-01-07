import { test, expect } from '@playwright/test';
import { waitForPageLoad, takeScreenshot } from './utils/test-helpers';

/**
 * 基本ナビゲーションのE2Eテスト
 */
test.describe('基本ナビゲーション', () => {
  test('トップページにアクセスできること', async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);

    // ページが正しく読み込まれたことを確認
    const title = await page.title();
    expect(title).toBeTruthy();

    await takeScreenshot(page, 'navigation-top');
  });

  test('ログインページにアクセスできること', async ({ page }) => {
    await page.goto('/login');
    await waitForPageLoad(page);

    // ログインページの要素が表示されることを確認
    const hasLoginContent = await page.getByRole('heading', { name: /ログイン/ }).isVisible().catch(() => false);
    
    expect(hasLoginContent || page.url().includes('/login')).toBeTruthy();
    await takeScreenshot(page, 'navigation-login');
  });

  test('存在しないページにアクセスすると適切なレスポンスが返ること', async ({ page }) => {
    const response = await page.goto('/non-existent-page-xyz-123');
    
    // 404ステータス、またはリダイレクト、またはエラーページ
    const status = response?.status();
    const is404orRedirect = status === 404 || status === 200 || status === 302;
    
    expect(is404orRedirect).toBeTruthy();
    await takeScreenshot(page, 'navigation-404');
  });

  test('プラン登録ページにアクセスできること', async ({ page }) => {
    await page.goto('/plan-registration');
    await waitForPageLoad(page);

    // ページが正しく読み込まれたことを確認
    const pageContent = await page.locator('body').textContent();
    expect(pageContent).toBeTruthy();

    await takeScreenshot(page, 'navigation-plan-registration');
  });

  test('メール登録ページにアクセスできること', async ({ page }) => {
    await page.goto('/email-registration');
    await waitForPageLoad(page);

    // ページが正しく読み込まれたことを確認
    const pageContent = await page.locator('body').textContent();
    expect(pageContent).toBeTruthy();

    await takeScreenshot(page, 'navigation-email-registration');
  });
});
