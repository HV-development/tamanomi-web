
import { test, expect } from '@playwright/test';

test.describe('基本ナビゲーションのテスト', () => {

    test('トップページの表示とログインページへの遷移', async ({ page }) => {
        await page.goto('/');

        // タイトルまたは主要な要素の確認
        // ホームページの構造に依存するが、少なくともエラーではないことを確認
        await expect(page).toHaveTitle(/./); // タイトルが存在すること

        // ログインへの導線があるか確認（URLパラメータ view=login で遷移する仕様があるため）
        // page.tsxの実装を見ると、view=loginパラメータでログイン画面へ遷移するロジックがある

        await page.goto('/?view=login');
        // LoginLayoutが表示されるはず
        await expect(page.getByRole('heading', { name: 'ログイン' })).toBeVisible();
    });

    test('存在しないページへのアクセス', async ({ page }) => {
        await page.goto('/non-existent-page');
        // 404ページまたはNot Foundの表示を確認
        // Next.jsのデフォルト404など
        await expect(page.getByText('404').or(page.getByText('Page Not Found')).or(page.getByText('ページが見つかりません'))).toBeVisible();
    });
});
