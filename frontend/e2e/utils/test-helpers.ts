import { Page, expect, APIRequestContext } from '@playwright/test';
import { getLatestOtp } from './otp-retriever';

/**
 * ユーザー向けWebアプリ用テストヘルパー関数
 */

/**
 * スクリーンショットを取得する
 * @param page Playwrightのページオブジェクト
 * @param name スクリーンショットの名前（拡張子なし）
 */
export async function takeScreenshot(page: Page, name: string): Promise<void> {
  await page.screenshot({
    path: `test-results/screenshots/${name}.png`,
    fullPage: true,
  });
}

/**
 * OTP認証を含むログインフローを実行する
 * @param page Playwrightのページオブジェクト
 * @param request PlaywrightのAPIリクエストコンテキスト
 * @param email メールアドレス
 */
export async function performLoginWithOtp(
  page: Page,
  request: APIRequestContext,
  email: string
): Promise<void> {
  // ログインページにアクセス
  await page.goto('/login');

  // メールアドレス入力
  await page.getByLabel('メールアドレス').fill(email);
  await page.getByRole('button', { name: '認証コードを送信' }).click();

  // OTP入力画面が表示されるまで待機
  await page.waitForSelector('input[placeholder*="認証コード"]', { timeout: 10000 });

  // OTPを取得（MailHogまたはGmail APIから）
  const otp = await getLatestOtp(request, email);

  // OTPを入力
  await page.getByPlaceholder('認証コード').fill(otp);
  await page.getByRole('button', { name: '確認' }).click();

  // ログイン完了を確認
  await page.waitForURL('**/', { timeout: 15000 });
}

/**
 * モック認証状態を設定する（APIモック使用）
 * @param page Playwrightのページオブジェクト
 * @param userData ユーザーデータ
 */
export async function mockAuthenticatedUser(
  page: Page,
  userData?: {
    id?: string;
    email?: string;
    nickname?: string;
    rank?: number;
    plan?: { id: string } | null;
  }
): Promise<void> {
  const defaultUser = {
    id: 'user-test-001',
    email: 'test@example.com',
    nickname: 'テストユーザー',
    rank: 1,
    plan: { id: 'test-plan-id' }, // プランがあることを示す
    createdAt: new Date().toISOString(), // 作成日時を追加（ISO文字列形式）
  };

  const mockData = { ...defaultUser, ...userData };

  // /api/user/me エンドポイントをモック（実際のアプリケーションのエンドポイントに合わせる）
  await page.route('**/api/user/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockData),
    });
  });

  // /api/me エンドポイントもモック（後方互換性のため）
  await page.route('**/api/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockData),
    });
  });

  // アクセストークンのCookieを設定
  await page.context().addCookies([
    {
      name: 'accessToken',
      value: 'mock_user_token',
      domain: 'localhost',
      path: '/',
      httpOnly: false, // Playwrightで設定可能にする
      sameSite: 'Lax',
      secure: false,
    },
  ]);
  // 認証ミドルウェアがチェックするCookieを設定
  await page.context().addCookies([
    {
      name: 'accessToken',
      value: 'test-access-token',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
    },
  ]);
}

/**
 * APIレスポンスをモックする
 * @param page Playwrightのページオブジェクト
 * @param urlPattern URLパターン（ワイルドカード使用可能）
 * @param response レスポンスデータ
 * @param status HTTPステータスコード（デフォルト: 200）
 */
export async function mockApiResponse(
  page: Page,
  urlPattern: string,
  response: object,
  status: number = 200
): Promise<void> {
  await page.route(urlPattern, async (route) => {
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(response),
    });
  });
}

/**
 * APIエラーレスポンスをモックする
 * @param page Playwrightのページオブジェクト
 * @param urlPattern URLパターン
 * @param status HTTPステータスコード
 * @param message エラーメッセージ
 */
export async function mockApiError(
  page: Page,
  urlPattern: string,
  status: number,
  message: string
): Promise<void> {
  await page.route(urlPattern, async (route) => {
    // 500系エラーの場合は、実際のAPIルートと同じ形式で返す
    if (status >= 500) {
      await route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify({
          error: {
            message: 'システムエラーが発生しました。しばらくしてから再度お試しください。',
          },
        }),
      });
    } else {
      // 4xxエラーなどの場合は、エラーメッセージをそのまま返す
      await route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify({
          error: {
            message: message,
          },
        }),
      });
    }
  });
}

/**
 * ネットワークエラーをモックする
 * @param page Playwrightのページオブジェクト
 * @param urlPattern URLパターン
 */
export async function mockNetworkError(
  page: Page,
  urlPattern: string
): Promise<void> {
  await page.route(urlPattern, async (route) => {
    await route.abort('failed');
  });
}

/**
 * 全てのAPIモックをクリアする
 * @param page Playwrightのページオブジェクト
 */
export async function clearAllMocks(page: Page): Promise<void> {
  await page.unrouteAll();
}

/**
 * ページのローディングが完了するまで待機する
 * @param page Playwrightのページオブジェクト
 */
export async function waitForPageLoad(page: Page): Promise<void> {
  try {
    await page.waitForLoadState('networkidle', { timeout: 5000 });
  } catch {
    // networkidleでタイムアウトした場合、domcontentloadedで待機
    await page.waitForLoadState('domcontentloaded');
  }
}

/**
 * 指定した要素が表示されるまで待機する
 * @param page Playwrightのページオブジェクト
 * @param selector セレクター
 * @param timeout タイムアウト（ミリ秒）
 */
export async function waitForElement(
  page: Page,
  selector: string,
  timeout: number = 10000
): Promise<void> {
  await page.waitForSelector(selector, { timeout });
}

/**
 * トーストメッセージを確認する
 * @param page Playwrightのページオブジェクト
 * @param message 期待するメッセージ（部分一致）
 */
export async function expectToastMessage(
  page: Page,
  message: string
): Promise<void> {
  // shadcn/uiのToastコンポーネントを想定
  const toast = page.locator('[data-sonner-toast]').filter({ hasText: message });
  await expect(toast).toBeVisible({ timeout: 5000 });
}

/**
 * 店舗をお気に入りに追加する
 * @param page Playwrightのページオブジェクト
 * @param shopId 店舗ID
 */
export async function addToFavorites(page: Page, shopId: string): Promise<void> {
  await page.goto(`/shops/${shopId}`);
  const favoriteButton = page.getByRole('button', { name: /お気に入り/ });
  await favoriteButton.click();
  await waitForPageLoad(page);
}

/**
 * 店舗をお気に入りから削除する
 * @param page Playwrightのページオブジェクト
 * @param shopId 店舗ID
 */
export async function removeFromFavorites(page: Page, shopId: string): Promise<void> {
  await page.goto(`/shops/${shopId}`);
  const favoriteButton = page.getByRole('button', { name: /お気に入り解除|お気に入り済み/ });
  await favoriteButton.click();
  await waitForPageLoad(page);
}

/**
 * マイページに移動する
 * @param page Playwrightのページオブジェクト
 */
export async function goToMypage(page: Page): Promise<void> {
  await page.goto('/mypage');
  await waitForPageLoad(page);
}

/**
 * 店舗一覧ページに移動する
 * @param page Playwrightのページオブジェクト
 */
export async function goToShopList(page: Page): Promise<void> {
  await page.goto('/shops');
  await waitForPageLoad(page);
}

/**
 * クーポン一覧ページに移動する
 * @param page Playwrightのページオブジェクト
 */
export async function goToCouponList(page: Page): Promise<void> {
  await page.goto('/coupons');
  await waitForPageLoad(page);
}

/**
 * フォームの入力値をクリアする
 * @param page Playwrightのページオブジェクト
 * @param selector 入力フィールドのセレクター
 */
export async function clearInput(page: Page, selector: string): Promise<void> {
  await page.locator(selector).clear();
}

/**
 * バリデーションエラーメッセージを確認する
 * @param page Playwrightのページオブジェクト
 * @param fieldId フィールドID
 * @param expectedMessage 期待するエラーメッセージ（完全一致）
 */
export async function expectValidationError(
  page: Page,
  fieldId: string,
  expectedMessage: string
): Promise<void> {
  const errorElement = page.locator(`#${fieldId} + p.text-red-500, #${fieldId} ~ p.text-red-500`);
  await expect(errorElement).toHaveText(expectedMessage);
}

/**
 * バリデーションエラーが表示されていることを確認する（メッセージ不問）
 * @param page Playwrightのページオブジェクト
 * @param fieldId フィールドID
 */
export async function expectValidationErrorExists(
  page: Page,
  fieldId: string
): Promise<void> {
  const errorElement = page.locator(`#${fieldId} + p.text-red-500, #${fieldId} ~ p.text-red-500`);
  await expect(errorElement).toBeVisible();
}

/**
 * ログアウトを実行する
 * @param page Playwrightのページオブジェクト
 */
export async function performLogout(page: Page): Promise<void> {
  await page.goto('/logout');
  await page.waitForURL('**/login', { timeout: 10000 });
}




