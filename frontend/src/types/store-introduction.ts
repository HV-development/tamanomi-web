/**
 * 店舗紹介データの型定義
 */
export interface StoreIntroduction {
  id: string;
  storeName1: string;
  recommendedMenu1: string;
  storeName2: string;
  recommendedMenu2: string;
  storeName3: string;
  recommendedMenu3: string;
  createdAt: string;
}

/**
 * 店舗紹介登録リクエスト
 */
export interface CreateStoreIntroductionRequest {
  storeName1: string;
  recommendedMenu1: string;
  storeName2: string;
  recommendedMenu2: string;
  storeName3: string;
  recommendedMenu3: string;
}

/**
 * 店舗紹介登録レスポンス
 */
export interface CreateStoreIntroductionResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    createdAt: string;
  };
}

