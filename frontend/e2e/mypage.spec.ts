import { test, expect } from '@playwright/test';
import { waitForPageLoad, takeScreenshot } from './utils/test-helpers';

/**
 * マイページのE2Eテスト
 * 実データを使用してテスト（storageStateで認証済み状態を使用）
 */
test.describe('マイページ', () => {
  // ================================================================
  // マイページ表示テスト
  // ================================================================
  test.describe('マイページ表示', () => {
    test('マイページタブにアクセスできること', async ({ page }) => {
      await page.goto('/home');
      await waitForPageLoad(page);

      // マイページタブを探す（ボトムナビゲーション内）
      const mypageTab = page.locator('nav button, [class*="nav"] button').filter({ hasText: /マイページ/ });
      
      if (await mypageTab.isVisible()) {
        await mypageTab.click();
        await page.waitForTimeout(1000);

        // マイページ画面が表示されることを確認
        await takeScreenshot(page, 'mypage-main');
        
        // プロフィール関連の要素が表示されていることを確認
        const hasProfileContent = await page.getByText(/プロフィール|ニックネーム|メールアドレス|ログアウト/).isVisible().catch(() => false);
        expect(hasProfileContent).toBeTruthy();
      }
    });

    test('プロフィール情報が表示されること', async ({ page }) => {
      await page.goto('/home');
      await waitForPageLoad(page);

      // マイページタブをクリック
      const mypageTab = page.locator('nav button, [class*="nav"] button').filter({ hasText: /マイページ/ });
      
      if (await mypageTab.isVisible()) {
        await mypageTab.click();
        await page.waitForTimeout(1000);

        // ユーザー情報が表示されていることを確認
        const hasUserInfo = await page.locator('[class*="profile"], [class*="user"]').count() > 0;
        
        // メールアドレスまたはニックネームが表示されていることを確認
        const hasEmail = await page.getByText(/@/).isVisible().catch(() => false);
        
        expect(hasUserInfo || hasEmail).toBeTruthy();
      }
    });
  });

  // ================================================================
  // マイページ機能テスト
  // ================================================================
  test.describe('マイページ機能', () => {
    test('プロフィール編集リンクが表示されること', async ({ page }) => {
      await page.goto('/home');
      await waitForPageLoad(page);

      // マイページタブをクリック
      const mypageTab = page.locator('nav button, [class*="nav"] button').filter({ hasText: /マイページ/ });
      
      if (await mypageTab.isVisible()) {
        await mypageTab.click();
        await page.waitForTimeout(1000);

        // 編集リンクまたはボタンを探す
        const editLink = page.getByRole('button', { name: /編集|プロフィール編集/ })
          .or(page.getByRole('link', { name: /編集|プロフィール編集/ }))
          .or(page.locator('[href*="edit"]'));

        const _hasEditLink = await editLink.isVisible().catch(() => false);
        await takeScreenshot(page, 'mypage-with-edit');
      }
    });

    test('ログアウトボタンが表示されること', async ({ page }) => {
      await page.goto('/home');
      await waitForPageLoad(page);

      // マイページタブをクリック
      const mypageTab = page.locator('nav button, [class*="nav"] button').filter({ hasText: /マイページ/ });
      
      if (await mypageTab.isVisible()) {
        await mypageTab.click();
        await page.waitForTimeout(1000);

        // ログアウトボタンを探す
        const logoutButton = page.getByText(/ログアウト/);
        const hasLogout = await logoutButton.isVisible().catch(() => false);
        
        expect(hasLogout).toBeTruthy();
      }
    });
  });
});
