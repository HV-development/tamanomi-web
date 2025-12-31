import { test, expect } from '@playwright/test';

/**
 * 店舗一覧・詳細のテスト
 * 
 * 注意: このテストはstorageStateを使用して認証済み状態で実行されます。
 * 認証処理はauth.setup.tsで1回だけ実行され、その状態が共有されます。
 */
test.describe('店舗一覧・詳細のテスト', () => {
    test.beforeEach(async ({ page }) => {
        // storageStateによって既に認証済み状態
        // ホームページにアクセス
        await page.goto('/home', { waitUntil: 'domcontentloaded' });
        
        // ページが読み込まれるまで待機
        await page.waitForLoadState('load');
        
        // APIリクエストが完了するまで待機（実際のDBからデータを取得）
        try {
            await page.waitForResponse(response => 
                response.url().includes('/api/shops') && response.status() === 200,
                { timeout: 15000 }
            );
        } catch {
            // タイムアウトしても続行
        }
        
        // 追加の待機時間（レンダリング完了を待つ）
        await page.waitForTimeout(2000);
    });

    test('店舗一覧が表示されることを確認', async ({ page }) => {
        // 店舗カードが表示されるまで待機
        const storeCards = page.locator('h3').filter({ hasText: /./ });
        
        // 店舗カードが少なくとも1つ表示されることを確認
        await expect(storeCards.first()).toBeVisible({ timeout: 15000 });
        
        // 店舗カードの数を取得
        const storeCount = await storeCards.count();
        expect(storeCount).toBeGreaterThan(0);
        
        // 最初の店舗名を取得してログに出力
        const firstStoreName = await storeCards.first().textContent();
        expect(firstStoreName).toBeTruthy();
    });

    test('店舗一覧から店舗詳細が表示されることを確認', async ({ page }) => {
        // 店舗カードが表示されるまで待機
        const storeCards = page.locator('h3').filter({ hasText: /./ });
        await expect(storeCards.first()).toBeVisible({ timeout: 15000 });
        
        // 最初の店舗カードの店舗名を取得
        const firstStoreCard = storeCards.first();
        const storeNameText = await firstStoreCard.textContent();
        expect(storeNameText).toBeTruthy();
        
        // 店舗カードをクリック
        const storeCard = firstStoreCard.locator('..').locator('..').locator('..');
        await storeCard.click({ timeout: 5000 });
        
        // 店舗詳細ポップアップが表示されるまで待機
        try {
            await page.getByText('店舗詳細').first().waitFor({ state: 'visible', timeout: 10000 });
        } catch {
            // 続行
        }
        await page.waitForTimeout(1000);
        
        // 店舗詳細ポップアップのヘッダーを確認
        const popupHeader = page.getByText('店舗詳細').first();
        await expect(popupHeader).toBeVisible({ timeout: 5000 });
        
        // 店舗名が表示されることを確認
        if (storeNameText) {
            const displayedStoreName = page.getByText(storeNameText.trim(), { exact: false }).first();
            await expect(displayedStoreName).toBeVisible({ timeout: 3000 });
        }
        
        // 閉じるボタンが表示されることを確認
        const popupHeaderDiv = page.locator('div.bg-green-600').first();
        const closeButton = popupHeaderDiv.locator('button').filter({ has: page.locator('svg') }).first();
        await expect(closeButton).toBeVisible({ timeout: 3000 });
        
        // 住所または電話番号が表示されることを確認
        const hasAddress = await page.getByText('住所').count() > 0;
        const hasPhone = await page.getByText('電話番号').count() > 0;
        expect(hasAddress || hasPhone).toBe(true);
        
        // ポップアップを閉じる
        await closeButton.click();
        await page.waitForTimeout(500);
        
        // ポップアップが閉じられたことを確認
        await expect(popupHeader).not.toBeVisible({ timeout: 3000 });
    });

    test('店舗詳細ポップアップの主要情報が表示されることを確認', async ({ page }) => {
        // 店舗カードが表示されるまで待機
        const storeCards = page.locator('h3').filter({ hasText: /./ });
        await expect(storeCards.first()).toBeVisible({ timeout: 15000 });
        
        // 最初の店舗カードの店舗名を取得
        const firstStoreCard = storeCards.first();
        const storeNameText = await firstStoreCard.textContent();
        expect(storeNameText).toBeTruthy();
        
        // 最初の店舗カードをクリック
        const storeCard = firstStoreCard.locator('..').locator('..').locator('..');
        await storeCard.click({ timeout: 5000 });
        await page.waitForTimeout(1500);
        
        // 店舗詳細ポップアップが表示されることを確認
        const popupHeader = page.getByText('店舗詳細').first();
        await expect(popupHeader).toBeVisible({ timeout: 5000 });
        
        // 店舗名が表示されることを確認
        if (storeNameText) {
            const displayedStoreName = page.getByText(storeNameText.trim(), { exact: false }).first();
            await expect(displayedStoreName).toBeVisible({ timeout: 3000 });
        }
        
        // 住所または電話番号が表示されることを確認
        const hasAddress = await page.getByText('住所').count() > 0;
        const hasPhone = await page.getByText('電話番号').count() > 0;
        expect(hasAddress || hasPhone).toBe(true);
        
        // 閉じるボタンでポップアップを閉じる
        const popupHeaderDiv = page.locator('div.bg-green-600').first();
        const closeButton = popupHeaderDiv.locator('button').filter({ has: page.locator('svg') }).first();
        await closeButton.click({ force: true });
        await page.waitForTimeout(500);
    });

    test('複数の店舗を順番にクリックして詳細を表示できることを確認', async ({ page }) => {
        // 店舗カードが表示されるまで待機
        const storeCards = page.locator('h3').filter({ hasText: /./ });
        await expect(storeCards.first()).toBeVisible({ timeout: 15000 });
        
        // 表示されている店舗数を取得
        const storeCount = await storeCards.count();
        const testCount = Math.min(3, storeCount);
        
        for (let i = 0; i < testCount; i++) {
            // 店舗カードを取得
            const storeCardElement = storeCards.nth(i);
            await expect(storeCardElement).toBeVisible({ timeout: 5000 });
            
            // 店舗名を取得
            const storeNameText = await storeCardElement.textContent();
            expect(storeNameText).toBeTruthy();
            
            // 店舗カードをクリック
            const storeCard = storeCardElement.locator('..').locator('..').locator('..');
            await storeCard.click({ timeout: 5000 });
            await page.waitForTimeout(1500);
            
            // 店舗詳細ポップアップが表示されることを確認
            const popupHeader = page.getByText('店舗詳細').first();
            await expect(popupHeader).toBeVisible({ timeout: 5000 });
            
            // 店舗名が表示されることを確認
            if (storeNameText) {
                const displayedStoreName = page.getByText(storeNameText.trim(), { exact: false }).first();
                await expect(displayedStoreName).toBeVisible({ timeout: 3000 });
            }
            
            // ポップアップを閉じる
            const popupHeaderDiv = page.locator('div.bg-green-600').first();
            const closeButton = popupHeaderDiv.locator('button').filter({ has: page.locator('svg') }).first();
            await closeButton.click({ force: true });
            await page.waitForTimeout(500);
            
            // ポップアップが閉じられたことを確認
            await expect(popupHeader).not.toBeVisible({ timeout: 3000 });
        }
    });
});
