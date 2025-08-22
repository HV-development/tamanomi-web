import type { Coupon } from "../types/coupon"

export const mockCoupons: Record<string, Coupon[]> = {
  "1": [
    {
      id: "coupon-1-1",
      name: "生ビール1杯無料",
      description: "キリン一番搾り生ビール（中ジョッキ）を1杯無料でご提供いたします。",
      imageUrl: "https://images.pexels.com/photos/1089930/pexels-photo-1089930.jpeg",
      storeId: "1",
      storeName: "さいたま酒場 大宮店",
    },
    {
      id: "coupon-1-2",
      name: "日本酒1杯無料",
      description: "季節のおすすめ日本酒を1杯無料でお楽しみいただけます。",
      imageUrl: "https://images.pexels.com/photos/1283219/pexels-photo-1283219.jpeg",
      storeId: "1",
      storeName: "さいたま酒場 大宮店",
    },
  ],
  "2": [
    {
      id: "coupon-2-1",
      name: "ハウスワイン1杯無料",
      description: "イタリア直輸入のハウスワイン（赤・白）を1杯無料でご提供いたします。",
      imageUrl: "https://images.pexels.com/photos/1407846/pexels-photo-1407846.jpeg",
      storeId: "2",
      storeName: "イタリアン・ベラヴィスタ",
    },
    {
      id: "coupon-2-2",
      name: "オレンジジュース1杯無料",
      description: "フレッシュオレンジジュースを1杯無料でお楽しみいただけます。",
      imageUrl: "https://images.pexels.com/photos/1337825/pexels-photo-1337825.jpeg",
      storeId: "2",
      storeName: "イタリアン・ベラヴィスタ",
    },
  ],
  "3": [
    {
      id: "coupon-3-1",
      name: "生ビール1杯無料",
      description: "アサヒスーパードライ生ビール（中ジョッキ）を1杯無料でご提供いたします。",
      imageUrl: "https://images.pexels.com/photos/1089930/pexels-photo-1089930.jpeg",
      storeId: "3",
      storeName: "焼肉 牛角 大宮東口店",
    },
  ],
  "4": [
    {
      id: "coupon-4-1",
      name: "日本酒1杯無料",
      description: "厳選された日本酒を1杯無料でお楽しみいただけます。",
      imageUrl: "https://images.pexels.com/photos/1283219/pexels-photo-1283219.jpeg",
      storeId: "4",
      storeName: "和食処 さくら",
    },
  ],
  "5": [
    {
      id: "coupon-5-1",
      name: "ハウスワイン1杯無料",
      description: "バーテンダー厳選のハウスワインを1杯無料でご提供いたします。",
      imageUrl: "https://images.pexels.com/photos/1407846/pexels-photo-1407846.jpeg",
      storeId: "5",
      storeName: "バー・ムーンライト",
    },
  ],
}
