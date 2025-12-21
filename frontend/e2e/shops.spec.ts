import { test, expect, Page, APIRequestContext } from '@playwright/test';
import { getLatestOtp as getLatestOtpFromMailHog } from './utils/mailhog';

// 環境変数からテスト用の認証情報を取得
const TEST_EMAIL = process.env.E2E_TEST_EMAIL || 'users@example.com';
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD || 'users123';

/**
 * 実際のログインを実行して認証済み状態をセットアップするヘルパー関数
 */
async function setupAuthenticatedState(page: Page, request: APIRequestContext) {
    // ログインページにアクセス
    await page.goto('/login');
    
    // ログイン情報を入力
    await page.getByPlaceholder('example@email.com').fill(TEST_EMAIL);
    await page.getByPlaceholder('パスワードを入力').fill(TEST_PASSWORD);
    await page.getByRole('button', { name: 'ログイン', exact: true }).click();
    
    // OTP入力画面へのリダイレクトを待機
    await page.waitForURL(/.*\/verify-otp\?requestId=/, { timeout: 15000 });
    
    // OTP送信後に少し待機してからOTPを取得（MailHogから取得）
    await page.waitForTimeout(1500); // さらに短縮
    
    // MailHogからOTPを取得（リトライロジック付き）
    let otp: string | null = null;
    let retryCount = 0;
    const maxOtpRetries = 2; // 2回
    
    while (!otp && retryCount < maxOtpRetries) {
        try {
            otp = await getLatestOtpFromMailHog(request, TEST_EMAIL);
            if (otp && otp.match(/^\d{6}$/)) {
                break;
            }
        } catch (error) {
            retryCount++;
            if (retryCount < maxOtpRetries) {
                await page.waitForTimeout(1000); // リトライ前に待機（短縮）
            }
        }
    }
    
    expect(otp).toBeTruthy();
    expect(otp).toMatch(/^\d{6}$/);
    
    // URLからrequestIdを取得
    const url = new URL(page.url());
    const requestId = url.searchParams.get('requestId');
    expect(requestId).toBeTruthy();
    
    // ベースURLを取得
    const baseUrl = page.url().split('/login')[0];
    const apiUrl = `${baseUrl}/api/auth/verify-otp`;
    
    // OTP検証を実行（リトライは最小限に）
    const verifyResponse = await page.evaluate(async (params: { url: string; email: string; otp: string; requestId: string }) => {
        const response = await fetch(params.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: params.email,
                otp: params.otp,
                requestId: params.requestId,
            }),
            credentials: 'include',
        });
        const data = await response.json();
        return {
            ok: response.ok,
            status: response.status,
            data: data,
        };
    }, { url: apiUrl, email: TEST_EMAIL, otp: otp!, requestId: requestId! });
    
    
    if (!verifyResponse.ok || verifyResponse.data.error) {
        throw new Error(`OTP検証が失敗しました: ${JSON.stringify(verifyResponse.data)}`);
    }
    
    // 認証Cookieが設定されていることを確認
    await page.waitForTimeout(1000); // Cookieの設定を待つ
    const cookies = await page.context().cookies();
    const accessTokenCookie = cookies.find(c => c.name === 'accessToken' || c.name === '__Host-accessToken');
    expect(accessTokenCookie).toBeTruthy();
    expect(accessTokenCookie?.value).toBeTruthy();
    
    // ホームページまたはプラン登録ページに遷移
    await page.goto(`${baseUrl}/home`, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForLoadState('load', { timeout: 20000 }).catch(() => {
        // loadがタイムアウトしても続行
    });
    await page.waitForTimeout(1500);
    
}

test.describe('店舗一覧・詳細のテスト', () => {
    test.beforeEach(async ({ page, request }) => {
        // 実際のログインを実行して認証済み状態をセットアップ
        await setupAuthenticatedState(page, request);
        
        // ホームページにアクセス（既にログイン後のリダイレクトで/homeにいる可能性がある）
        const currentUrl = page.url();
        if (!currentUrl.includes('/home')) {
            await page.goto('/home', { waitUntil: 'domcontentloaded' });
        }
        
        // ページが読み込まれるまで待機
        await page.waitForLoadState('load');
        
        // APIリクエストが完了するまで待機（実際のDBからデータを取得）
        try {
            await page.waitForResponse(response => 
                response.url().includes('/api/shops') && response.status() === 200,
                { timeout: 15000 }
            );
        } catch {
        }
        
        // 追加の待機時間（レンダリング完了を待つ）
        await page.waitForTimeout(2000);
    });

    test('店舗一覧が表示されることを確認', async ({ page }) => {
        // 店舗カードが表示されるまで待機
        // StoreCardコンポーネントは店舗名を含むh3要素を持つ
        // 実際のDBから取得した店舗データが表示されることを確認
        const storeCards = page.locator('h3').filter({ hasText: /./ });
        
        // 店舗カードが少なくとも1つ表示されることを確認（タイムアウトを長めに設定）
        await expect(storeCards.first()).toBeVisible({ timeout: 15000 });
        
        // 店舗カードの数を取得
        const storeCount = await storeCards.count();
        expect(storeCount).toBeGreaterThan(0);
        
        // 最初の店舗名を取得してログに出力
        const firstStoreName = await storeCards.first().textContent();
    });

    test('店舗一覧から店舗詳細が表示されることを確認', async ({ page }) => {
        // 店舗カードが表示されるまで待機
        const storeCards = page.locator('h3').filter({ hasText: /./ });
        await expect(storeCards.first()).toBeVisible({ timeout: 15000 });
        
        // 最初の店舗カードの店舗名を取得（後で詳細ポップアップで確認するため）
        const firstStoreCard = storeCards.first();
        const storeNameText = await firstStoreCard.textContent();
        expect(storeNameText).toBeTruthy();
        
        // 店舗名を含む親要素（StoreCard）をクリック
        // StoreCardコンポーネントはonClickで店舗詳細を表示する
        // 店舗名の親要素をクリック（StoreCardのルート要素）
        const storeCard = firstStoreCard.locator('..').locator('..').locator('..');
        await storeCard.click({ timeout: 5000 });
        
        // 店舗詳細ポップアップが表示されるまで待機
        try {
            await page.getByText('店舗詳細').first().waitFor({ state: 'visible', timeout: 10000 });
        } catch {
        }
        await page.waitForTimeout(1000);
        
        // 店舗詳細ポップアップのヘッダーを確認
        const popupHeader = page.getByText('店舗詳細').first();
        await expect(popupHeader).toBeVisible({ timeout: 5000 });
        
        // 店舗名が表示されることを確認（ポップアップ内のh4要素）
        if (storeNameText) {
            const displayedStoreName = page.getByText(storeNameText.trim(), { exact: false }).first();
            await expect(displayedStoreName).toBeVisible({ timeout: 3000 });
        }
        
        // 閉じるボタン（Xボタン）が表示されることを確認
        // ポップアップヘッダー内のXアイコンを含むボタンを探す
        const popupHeaderDiv = page.locator('div.bg-green-600').first();
        const closeButton = popupHeaderDiv.locator('button').filter({ has: page.locator('svg') }).first();
        await expect(closeButton).toBeVisible({ timeout: 3000 });
        
        // 店舗詳細ポップアップの主要な要素が表示されることを確認
        // 住所、電話番号などの情報が表示される可能性がある
        const hasAddress = await page.getByText('住所').count() > 0;
        const hasPhone = await page.getByText('電話番号').count() > 0;
        
        // 少なくともどちらかが表示されていればOK
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
        
        // 店舗名が表示されることを確認（ポップアップ内のh4要素）
        if (storeNameText) {
            const displayedStoreName = page.getByText(storeNameText.trim(), { exact: false }).first();
            await expect(displayedStoreName).toBeVisible({ timeout: 3000 });
        }
        
        // ポップアップのコンテンツエリアが表示されることを確認
        // 住所、電話番号などの情報が表示される可能性がある
        const hasAddress = await page.getByText('住所').count() > 0;
        const hasPhone = await page.getByText('電話番号').count() > 0;
        
        // 少なくともどちらかが表示されていればOK
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
        const testCount = Math.min(3, storeCount); // 最大3店舗をテスト
        
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

