/**
 * ユーザー向けWebアプリ用テストデータファクトリー
 * E2Eテスト用のダミーデータを生成する
 */

// ユニークなIDを生成するカウンター
let idCounter = 0;

/**
 * ユニークなIDを生成する
 */
function generateId(prefix: string = 'test'): string {
  idCounter++;
  return `${prefix}-${Date.now()}-${idCounter}`;
}

/**
 * ランダムな文字列を生成する
 */
function randomString(length: number = 8): string {
  return Math.random().toString(36).substring(2, 2 + length);
}

/**
 * ランダムなメールアドレスを生成する
 */
export function randomEmail(): string {
  return `test-${randomString()}@example.com`;
}

/**
 * ランダムな電話番号を生成する
 */
export function randomPhoneNumber(): string {
  return `090${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`;
}

// ============================================
// ユーザー登録データ
// ============================================

export interface RegistrationInput {
  email: string;
  nickname: string;
  postalCode?: string;
  prefecture?: string;
  city?: string;
  birthDate?: string;
  gender?: 1 | 2 | 3; // 1: 男性, 2: 女性, 3: その他
}

/**
 * テスト用ユーザー登録データを生成する
 */
export function createRegistrationData(overrides?: Partial<RegistrationInput>): RegistrationInput {
  return {
    email: randomEmail(),
    nickname: `テストユーザー_${randomString(4)}`,
    postalCode: '760-0001',
    prefecture: '香川県',
    city: '高松市',
    birthDate: '1990-01-01',
    gender: 1,
    ...overrides,
  };
}

// ============================================
// 店舗データ（モック用）
// ============================================

export interface ShopMockData {
  id: string;
  name: string;
  description: string;
  address: string;
  businessHours: string;
  regularHoliday: string;
  imageUrl?: string;
  isFavorite?: boolean;
}

/**
 * テスト用店舗モックデータを生成する
 */
export function createShopMockData(overrides?: Partial<ShopMockData>): ShopMockData {
  return {
    id: generateId('shop'),
    name: `テスト店舗_${randomString(4)}`,
    description: 'E2Eテスト用の店舗です。美味しい料理を提供しています。',
    address: `香川県高松市中央町${Math.floor(Math.random() * 100) + 1}`,
    businessHours: '10:00-22:00',
    regularHoliday: '月曜日',
    imageUrl: 'https://example.com/shop-image.jpg',
    isFavorite: false,
    ...overrides,
  };
}

// ============================================
// クーポンデータ（モック用）
// ============================================

export interface CouponMockData {
  id: string;
  title: string;
  description: string;
  discountText: string;
  validFrom: string;
  validUntil: string;
  shopName: string;
  imageUrl?: string;
  isUsed?: boolean;
}

/**
 * テスト用クーポンモックデータを生成する
 */
export function createCouponMockData(overrides?: Partial<CouponMockData>): CouponMockData {
  const now = new Date();
  const validFrom = now.toISOString().split('T')[0];
  const validUntil = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return {
    id: generateId('coupon'),
    title: `テストクーポン_${randomString(4)}`,
    description: 'E2Eテスト用のお得なクーポンです。',
    discountText: '10%OFF',
    validFrom,
    validUntil,
    shopName: `テスト店舗_${randomString(4)}`,
    imageUrl: 'https://example.com/coupon-image.jpg',
    isUsed: false,
    ...overrides,
  };
}

// ============================================
// プランデータ（モック用）
// ============================================

export interface PlanMockData {
  id: string;
  name: string;
  description: string;
  price: number;
  period: 'monthly' | 'yearly';
  features: string[];
}

/**
 * テスト用プランモックデータを生成する
 */
export function createPlanMockData(overrides?: Partial<PlanMockData>): PlanMockData {
  return {
    id: generateId('plan'),
    name: 'スタンダードプラン',
    description: 'すべての基本機能が利用できるプランです',
    price: 980,
    period: 'monthly',
    features: ['全店舗のクーポン利用可能', 'お気に入り登録無制限', '会員限定特典'],
    ...overrides,
  };
}

// ============================================
// お気に入りデータ（モック用）
// ============================================

export interface FavoriteMockData {
  id: string;
  shopId: string;
  shopName: string;
  shopImageUrl?: string;
  createdAt: string;
}

/**
 * テスト用お気に入りモックデータを生成する
 */
export function createFavoriteMockData(overrides?: Partial<FavoriteMockData>): FavoriteMockData {
  return {
    id: generateId('favorite'),
    shopId: generateId('shop'),
    shopName: `テスト店舗_${randomString(4)}`,
    shopImageUrl: 'https://example.com/shop-image.jpg',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

// ============================================
// 利用履歴データ（モック用）
// ============================================

export interface UsageHistoryMockData {
  id: string;
  couponId: string;
  couponTitle: string;
  shopName: string;
  usedAt: string;
  discountAmount: number;
}

/**
 * テスト用利用履歴モックデータを生成する
 */
export function createUsageHistoryMockData(overrides?: Partial<UsageHistoryMockData>): UsageHistoryMockData {
  return {
    id: generateId('usage'),
    couponId: generateId('coupon'),
    couponTitle: `テストクーポン_${randomString(4)}`,
    shopName: `テスト店舗_${randomString(4)}`,
    usedAt: new Date().toISOString(),
    discountAmount: Math.floor(Math.random() * 500) + 100,
    ...overrides,
  };
}

// ============================================
// モックレスポンスデータ
// ============================================

/**
 * ページネーション付きレスポンスを生成する
 */
export function createPaginatedResponse<T>(
  items: T[],
  page: number = 1,
  limit: number = 10,
  total?: number
): {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
} {
  const actualTotal = total ?? items.length;
  return {
    items,
    pagination: {
      page,
      limit,
      total: actualTotal,
      totalPages: Math.ceil(actualTotal / limit),
    },
  };
}

/**
 * 店舗一覧のモックレスポンスを生成する
 */
export function createShopListResponse(count: number = 5) {
  const shops = Array.from({ length: count }, () => createShopMockData());
  return createPaginatedResponse(shops);
}

/**
 * クーポン一覧のモックレスポンスを生成する
 */
export function createCouponListResponse(count: number = 5) {
  const coupons = Array.from({ length: count }, () => createCouponMockData());
  return createPaginatedResponse(coupons);
}

/**
 * お気に入り一覧のモックレスポンスを生成する
 */
export function createFavoriteListResponse(count: number = 3) {
  const favorites = Array.from({ length: count }, () => createFavoriteMockData());
  return createPaginatedResponse(favorites);
}

/**
 * 利用履歴一覧のモックレスポンスを生成する
 */
export function createUsageHistoryListResponse(count: number = 5) {
  const history = Array.from({ length: count }, () => createUsageHistoryMockData());
  return createPaginatedResponse(history);
}

/**
 * プラン一覧のモックレスポンスを生成する
 */
export function createPlanListResponse(): PlanMockData[] {
  return [
    createPlanMockData({
      id: 'plan-free',
      name: 'フリープラン',
      description: '基本機能が無料で利用できます',
      price: 0,
      period: 'monthly',
      features: ['一部店舗のクーポン利用', 'お気に入り5件まで'],
    }),
    createPlanMockData({
      id: 'plan-standard',
      name: 'スタンダードプラン',
      description: 'すべての機能が利用できます',
      price: 980,
      period: 'monthly',
      features: ['全店舗のクーポン利用', 'お気に入り無制限', '会員限定特典'],
    }),
    createPlanMockData({
      id: 'plan-premium',
      name: 'プレミアムプラン',
      description: 'プレミアム特典付きプラン',
      price: 1980,
      period: 'monthly',
      features: ['全機能利用可能', '優先サポート', 'プレミアム特典', '先行クーポン配信'],
    }),
  ];
}

// ============================================
// バリデーションエラーメッセージ
// ============================================

/**
 * バリデーションエラーメッセージ定義
 */
export const ValidationMessages = {
  email: {
    required: 'メールアドレスを入力してください',
    invalid: 'メールアドレスの形式が正しくありません',
    duplicate: 'このメールアドレスは既に登録されています',
  },
  nickname: {
    required: 'ニックネームを入力してください',
    tooShort: 'ニックネームは2文字以上で入力してください',
    tooLong: 'ニックネームは20文字以内で入力してください',
  },
  postalCode: {
    required: '郵便番号を入力してください',
    invalid: '郵便番号の形式が正しくありません',
  },
  otp: {
    required: '認証コードを入力してください',
    invalid: '認証コードが正しくありません',
    expired: '認証コードの有効期限が切れています',
  },
  password: {
    required: 'パスワードを入力してください',
    tooShort: 'パスワードは8文字以上で入力してください',
    weak: 'パスワードには英字と数字を含めてください',
    mismatch: 'パスワードが一致しません',
  },
} as const;




