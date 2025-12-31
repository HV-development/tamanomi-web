import { test as setup, expect } from '@playwright/test';
import { getLatestOtp as getLatestOtpFromMailHog } from './utils/mailhog';

// 環境変数からテスト用の認証情報を取得
const TEST_EMAIL = process.env.E2E_TEST_EMAIL || 'tamanomi-user@example.com';
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD || 'tamanomi-user123';

// 認証状態を保存するファイルパス
const authFile = '.auth/user.json';

/**
 * 認証セットアップ
 * OTP認証を1回だけ実行し、認証状態をstorageStateとして保存する
 */
setup('authenticate', async ({ page, request }) => {
    console.log('[Auth Setup] Starting authentication...');
    
    // ログインページにアクセス
    await page.goto('/login');
    
    // ページの読み込みを待機
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('input[placeholder="example@email.com"]', { timeout: 30000 });
    
    // ログイン情報を入力
    await page.getByPlaceholder('example@email.com').fill(TEST_EMAIL);
    await page.getByPlaceholder('パスワードを入力').fill(TEST_PASSWORD);
    await page.getByRole('button', { name: 'ログイン', exact: true }).click();
    
    console.log('[Auth Setup] Waiting for OTP page...');
    
    // OTP入力画面へのリダイレクトを待機
    await page.waitForURL(/.*\/verify-otp\?requestId=/, { timeout: 30000 });
    
    // OTP送信後に少し待機してからOTPを取得
    await page.waitForTimeout(2000);
    
    console.log('[Auth Setup] Retrieving OTP from MailHog...');
    
    // MailHogからOTPを取得（リトライロジック付き）
    let otp: string | null = null;
    let retryCount = 0;
    const maxOtpRetries = 5;
    
    while (!otp && retryCount < maxOtpRetries) {
        try {
            otp = await getLatestOtpFromMailHog(request, TEST_EMAIL);
            if (otp && otp.match(/^\d{6}$/)) {
                console.log('[Auth Setup] OTP retrieved successfully');
                break;
            }
            otp = null;
        } catch {
            console.log(`[Auth Setup] OTP retrieval attempt ${retryCount + 1} failed`);
        }
        retryCount++;
        if (retryCount < maxOtpRetries) {
            await page.waitForTimeout(1500);
        }
    }
    
    expect(otp, 'OTPを取得できませんでした').toBeTruthy();
    expect(otp).toMatch(/^\d{6}$/);
    
    // URLからrequestIdを取得
    const url = new URL(page.url());
    const requestId = url.searchParams.get('requestId');
    expect(requestId, 'requestIdが取得できませんでした').toBeTruthy();
    
    // ベースURLを取得
    const baseUrl = page.url().split('/login')[0];
    const apiUrl = `${baseUrl}/api/auth/verify-otp`;
    
    console.log('[Auth Setup] Verifying OTP...');
    
    // OTP検証を実行
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
    
    console.log('[Auth Setup] OTP verified successfully');
    
    // 認証Cookieが設定されていることを確認
    await page.waitForTimeout(1500);
    const cookies = await page.context().cookies();
    const accessTokenCookie = cookies.find(c => c.name === 'accessToken' || c.name === '__Host-accessToken');
    expect(accessTokenCookie, '認証Cookieが設定されていません').toBeTruthy();
    
    // ホームページに遷移して認証状態を確定
    await page.goto('/home', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForLoadState('load', { timeout: 20000 }).catch(() => {
        // loadがタイムアウトしても続行
    });
    
    console.log('[Auth Setup] Saving authentication state...');
    
    // 認証状態を保存
    await page.context().storageState({ path: authFile });
    
    console.log('[Auth Setup] Authentication complete!');
});
