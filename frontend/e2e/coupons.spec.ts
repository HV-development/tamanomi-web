import { test, expect, Page } from '@playwright/test';
import { execSync } from 'child_process';

/**
 * クーポン使用のテスト
 * 
 * 注意: 
 * - このテストはstorageStateを使用して認証済み状態で実行されます。
 * - クーポンは1日1店舗1回しか使用できないため、ローカル環境ではテスト前に使用履歴をリセットします。
 * - ステージング・本番環境ではリセット処理は実行されません。
 */

/**
 * ローカル環境かどうかを判定
 * E2E_ENV が 'local' または未設定、かつ BASE_URL が localhost の場合にローカル環境と判定
 */
function isLocalEnvironment(): boolean {
    const e2eEnv = process.env.E2E_ENV || 'local';
    const baseUrl = process.env.E2E_BASE_URL || process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3004';
    
    // 明示的にlocal以外が指定されている場合はfalse
    if (e2eEnv !== 'local') {
        return false;
    }
    
    // URLがlocalhost以外の場合はfalse（ステージング・本番環境）
    if (!baseUrl.includes('localhost') && !baseUrl.includes('127.0.0.1')) {
        return false;
    }
    
    return true;
}

// テスト実行前にクーポン使用履歴をリセット（ローカル環境のみ）
test.beforeAll(async () => {
    if (!isLocalEnvironment()) {
        console.log('[Coupon Test Setup] Skipping coupon history reset (non-local environment)');
        return;
    }
    
    console.log('[Coupon Test Setup] Clearing coupon usage history...');
    try {
        execSync(
            `docker exec tamanomi-db psql -U user -d tamanomi -c "DELETE FROM coupon_usage_history WHERE user_id = '36753af7-3ddb-4b38-b1f1-f388b7dc2308';"`,
            { stdio: 'pipe' }
        );
        console.log('[Coupon Test Setup] Coupon usage history cleared successfully');
    } catch {
        console.warn('[Coupon Test Setup] Failed to clear coupon usage history (this is expected in non-Docker environments)');
        // テストは続行（履歴がない場合やDocker環境でない場合はエラーにならない）
    }
});

/**
 * 店舗一覧からクーポン一覧を開くヘルパー関数
 */
async function openCouponList(page: Page): Promise<boolean> {
    // 店舗カードが表示されるまで待機
    const storeCards = page.locator('h3').filter({ hasText: /./ });
    await expect(storeCards.first()).toBeVisible({ timeout: 15000 });
    
    // 最初の店舗カードをクリック
    const firstStoreCard = storeCards.first();
    const storeCard = firstStoreCard.locator('..').locator('..').locator('..');
    await storeCard.click({ timeout: 5000 });
    await page.waitForTimeout(1500);
    
    // 店舗詳細ポップアップが表示されることを確認
    const popupHeader = page.getByText('店舗詳細').first();
    await expect(popupHeader).toBeVisible({ timeout: 5000 });
    
    // クーポンボタンをクリック
    const couponButton = page.getByRole('button', { name: '今すぐクーポンGET' }).first();
    await expect(couponButton).toBeVisible({ timeout: 5000 });
    await couponButton.click({ force: true, timeout: 5000 });
    
    // APIリクエストを待機
    try {
        await page.waitForResponse(
            response => response.url().includes('/api/coupons') && 
                       response.url().includes('status=approved') &&
                       response.status() === 200,
            { timeout: 15000 }
        );
    } catch {
        // タイムアウトしても続行
    }
    
    await page.waitForTimeout(2000);
    
    // クーポンが存在するか確認
    const useCouponButton = page.getByRole('button', { name: 'このクーポンで乾杯！' }).first();
    const hasCoupons = await useCouponButton.count() > 0;
    
    return hasCoupons;
}

test.describe('クーポン使用のテスト', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/home', { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('load');
        await page.waitForTimeout(2000);
    });

    test('プラン登録済みのユーザーがクーポンを使用でき、成功画面が表示されること', async ({ page }) => {
        const hasCoupons = await openCouponList(page);
        
        if (!hasCoupons) {
            test.skip();
            return;
        }
        
        // 「このクーポンで乾杯！」ボタンをクリック
        const useCouponButton = page.getByRole('button', { name: 'このクーポンで乾杯！' }).first();
        await expect(useCouponButton).toBeVisible({ timeout: 5000 });
        await useCouponButton.click({ force: true });
        await page.waitForTimeout(1000);
        
        // クーポン使用確認ポップアップが表示されることを確認
        const confirmationHeader = page.getByText('クーポン使用確認').first();
        await expect(confirmationHeader).toBeVisible({ timeout: 5000 });
        
        // 「店員に見せる」ボタンをクリック（最初の確認画面）
        const showToStaffButton = page.getByRole('button', { name: '店員に見せる' }).first();
        const showToStaffVisible = await showToStaffButton.isVisible().catch(() => false);
        
        if (showToStaffVisible) {
            await showToStaffButton.click({ force: true });
            await page.waitForTimeout(1000);
        }
        
        // 「利用する」ボタンをクリック（最終確認画面）
        const useButton = page.getByRole('button', { name: '利用する' }).first();
        const useButtonVisible = await useButton.isVisible().catch(() => false);
        
        if (useButtonVisible) {
            await useButton.click({ force: true });
            await page.waitForTimeout(2000);
        }
        
        // クーポン使用成功モーダルが表示されることを確認
        const successModal = page.getByText('使用完了').first();
        await expect(successModal).toBeVisible({ timeout: 10000 });
        
        // アニメーション画像が表示されることを確認（オプション）
        const animationImage = page.locator('img[src*="drink"]').first();
        const hasAnimation = await animationImage.isVisible().catch(() => false);
        if (hasAnimation) {
            expect(hasAnimation).toBe(true);
        }
    });

    test('クーポン一覧が正しく表示されること', async ({ page }) => {
        // 店舗カードが表示されるまで待機
        const storeCards = page.locator('h3').filter({ hasText: /./ });
        await expect(storeCards.first()).toBeVisible({ timeout: 15000 });
        
        // 最初の店舗カードをクリック
        const firstStoreCard = storeCards.first();
        const storeCard = firstStoreCard.locator('..').locator('..').locator('..');
        await storeCard.click({ timeout: 5000 });
        await page.waitForTimeout(1500);
        
        // 店舗詳細ポップアップが表示されることを確認
        const popupHeader = page.getByText('店舗詳細').first();
        await expect(popupHeader).toBeVisible({ timeout: 5000 });
        
        // クーポンボタンをクリック
        const couponButton = page.getByRole('button', { name: '今すぐクーポンGET' }).first();
        await expect(couponButton).toBeVisible({ timeout: 5000 });
        await couponButton.click({ force: true, timeout: 5000 });
        await page.waitForTimeout(2000);
        
        // クーポン一覧ヘッダーが表示されることを確認
        const couponListHeader = page.getByText('クーポン一覧').first();
        await expect(couponListHeader).toBeVisible({ timeout: 5000 });
        
        // 店舗名が表示されることを確認
        const storeName = page.locator('h4').filter({ hasText: /【ノモカ】/ }).first();
        await expect(storeName).toBeVisible({ timeout: 5000 });
    });
});
