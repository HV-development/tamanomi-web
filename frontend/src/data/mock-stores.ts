import type { Store } from "../types/store"

export const mockStores: Store[] = [
  {
    id: "1",
    name: "さいたま酒場 大宮店",
    genre: "izakaya",
    genreLabel: "居酒屋",
    address: "埼玉県さいたま市大宮区桜木町1-7-5 大宮ビル2F",
    phone: "048-123-4567",
    website: "https://example.com/saitama-sakaba",
    description:
      "地元の新鮮な食材を使った創作料理と豊富な日本酒が自慢の居酒屋です。アットホームな雰囲気で、仕事帰りの一杯から宴会まで幅広くご利用いただけます。",
    thumbnailUrl: "https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=2",
    isFavorite: true,
    visitedAt: new Date("2024-01-15"),
    businessHours: "月 〜 金 昼：11:00 〜 14:00 夜：17:00 〜 22:00",
    closedDays: "日曜日",
    budget: {
      dinner: { min: 3000, max: 5000 },
      lunch: { min: 800, max: 1500 }
    },
    smokingPolicy: "SEPARATED",
    paymentMethods: {
      cash: true,
      creditCards: ["VISA", "Master", "JCB"],
      digitalPayments: ["PayPay", "楽天Pay"]
    },
    usageScenes: ["おひとり様", "接待", "デート"]
  },
  {
    id: "2",
    name: "イタリアン・ベラヴィスタ",
    genre: "italian",
    genreLabel: "イタリアン",
    address: "埼玉県さいたま市浦和区高砂3-15-1 浦和駅前ビル1F",
    phone: "048-234-5678",
    website: "https://example.com/bella-vista",
    description:
      "本格的なイタリア料理を気軽に楽しめるレストラン。シェフ自慢の手打ちパスタと窯焼きピザが人気です。デートや記念日にもおすすめです。",
    thumbnailUrl: "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=2",
    isFavorite: false,
    visitedAt: new Date("2024-01-10"),
    businessHours: "11:30〜14:30、17:30〜22:00",
    closedDays: "火曜日",
    budget: {
      dinner: { min: 5000, max: 8000 },
      lunch: { min: 1500, max: 2500 }
    },
    smokingPolicy: "NON_SMOKING",
    paymentMethods: {
      cash: true,
      creditCards: ["VISA", "Master", "JCB", "Amex"],
      digitalPayments: ["PayPay"]
    },
    usageScenes: ["デート", "家族、子供と", "女子会"]
  },
  {
    id: "3",
    name: "焼肉 牛角 大宮東口店",
    genre: "yakiniku",
    genreLabel: "焼肉",
    address: "埼玉県さいたま市大宮区大門町2-118 大宮東口ビル3F",
    phone: "048-345-6789",
    description:
      "厳選された国産牛を使用した焼肉店。リーズナブルな価格で高品質なお肉をお楽しみいただけます。家族連れにも人気です。",
    thumbnailUrl: "https://images.pexels.com/photos/1633525/pexels-photo-1633525.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=2",
    isFavorite: true,
    visitedAt: new Date("2024-01-08"),
    businessHours: "17:00〜翌2:00",
    closedDays: "年中無休",
    budget: {
      dinner: { min: 4000, max: 6000 }
    },
    smokingPolicy: "SEPARATED",
    paymentMethods: {
      cash: true,
      creditCards: ["VISA", "Master", "JCB"],
      digitalPayments: ["PayPay", "楽天Pay", "d払い"]
    },
    usageScenes: ["家族、子供と", "合コン", "女子会"]
  },
  {
    id: "4",
    name: "和食処 さくら",
    genre: "japanese",
    genreLabel: "和食",
    address: "埼玉県さいたま市中央区本町東3-5-2 中央区役所前ビル1F",
    phone: "048-456-7890",
    website: "https://example.com/washoku-sakura",
    description:
      "季節の食材を活かした本格和食をご提供。落ち着いた和の空間で、ゆっくりとお食事をお楽しみいただけます。接待や会食にも最適です。",
    thumbnailUrl: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=2",
    isFavorite: false,
    businessHours: "11:30〜14:00、17:00〜22:00",
    closedDays: "月曜日",
    budget: {
      dinner: { min: 6000, max: 10000 },
      lunch: { min: 2000, max: 3500 }
    },
    smokingPolicy: "NON_SMOKING",
    paymentMethods: {
      cash: true,
      creditCards: ["VISA", "Master", "JCB", "Amex", "Diners"],
      digitalPayments: ["PayPay"]
    },
    usageScenes: ["接待", "デート", "おひとり様"]
  },
  {
    id: "5",
    name: "バー・ムーンライト",
    genre: "bar",
    genreLabel: "バー",
    address: "埼玉県さいたま市大宮区仲町2-25 ムーンライトビル地下1F",
    phone: "048-567-8901",
    description:
      "大人の隠れ家的なバー。マスターが作る本格カクテルと落ち着いた雰囲気が魅力。一人でも気軽に立ち寄れます。",
    thumbnailUrl: "https://images.pexels.com/photos/274192/pexels-photo-274192.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=2",
    isFavorite: true,
    visitedAt: new Date("2024-01-05"),
    businessHours: "19:00〜翌3:00",
    closedDays: "日曜日",
    budget: {
      dinner: { min: 4000, max: 7000 }
    },
    smokingPolicy: "SMOKING",
    paymentMethods: {
      cash: true,
      creditCards: ["VISA", "Master"],
      digitalPayments: ["PayPay"]
    },
    usageScenes: ["おひとり様", "デート", "接待"]
  },
]
