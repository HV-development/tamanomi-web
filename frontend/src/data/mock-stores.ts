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
  {
    id: "6",
    name: "創作ダイニング アート",
    genre: "creative",
    genreLabel: "創作料理",
    address: "埼玉県さいたま市浦和区仲町1-12-3 アートビル2F",
    phone: "048-678-9012",
    description:
      "シェフの独創性あふれる創作料理が楽しめるダイニング。季節の食材を使った斬新な料理で新しい味覚体験をお届けします。",
    thumbnailUrl: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=2",
    isFavorite: false,
    businessHours: "18:00〜24:00",
    closedDays: "水曜日",
    budget: {
      dinner: { min: 5000, max: 8000 }
    },
    smokingPolicy: "NON_SMOKING",
    paymentMethods: {
      cash: true,
      creditCards: ["VISA", "Master", "JCB"],
      digitalPayments: ["PayPay", "楽天Pay"]
    },
    usageScenes: ["デート", "接待", "女子会"]
  },
  {
    id: "7",
    name: "洋食レストラン グランド",
    genre: "western",
    genreLabel: "洋食",
    address: "埼玉県さいたま市大宮区錦町2-8-15 グランドビル1F",
    phone: "048-789-0123",
    description:
      "老舗の洋食レストラン。昔ながらのオムライスやハンバーグなど、懐かしい味を現代風にアレンジした料理が人気です。",
    thumbnailUrl: "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=2",
    isFavorite: false,
    businessHours: "11:00〜15:00、17:00〜21:00",
    closedDays: "木曜日",
    budget: {
      dinner: { min: 3000, max: 5000 },
      lunch: { min: 1200, max: 2000 }
    },
    smokingPolicy: "SEPARATED",
    paymentMethods: {
      cash: true,
      creditCards: ["VISA", "Master", "JCB"],
      digitalPayments: ["PayPay"]
    },
    usageScenes: ["家族、子供と", "デート", "おひとり様"]
  },
  {
    id: "8",
    name: "フレンチビストロ ル・ソレイユ",
    genre: "french",
    genreLabel: "フレンチ",
    address: "埼玉県さいたま市浦和区常盤3-18-20 ソレイユビル2F",
    phone: "048-890-1234",
    description:
      "本格フレンチを気軽に楽しめるビストロ。シェフ厳選のワインと共に、繊細で美しいフランス料理をお楽しみください。",
    thumbnailUrl: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=2",
    isFavorite: true,
    businessHours: "12:00〜15:00、18:00〜23:00",
    closedDays: "月曜日",
    budget: {
      dinner: { min: 8000, max: 12000 },
      lunch: { min: 3000, max: 5000 }
    },
    smokingPolicy: "NON_SMOKING",
    paymentMethods: {
      cash: true,
      creditCards: ["VISA", "Master", "JCB", "Amex"],
      digitalPayments: ["PayPay"]
    },
    usageScenes: ["デート", "接待", "記念日"]
  },
  {
    id: "9",
    name: "中華料理 龍王",
    genre: "chinese",
    genreLabel: "中華",
    address: "埼玉県さいたま市南区南浦和2-35-8 龍王ビル1F",
    phone: "048-901-2345",
    description:
      "本格四川料理から広東料理まで幅広い中華料理をご提供。熟練シェフが作る本場の味をお楽しみください。",
    thumbnailUrl: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=2",
    isFavorite: false,
    businessHours: "11:30〜14:30、17:30〜22:30",
    closedDays: "火曜日",
    budget: {
      dinner: { min: 3500, max: 6000 },
      lunch: { min: 1000, max: 1800 }
    },
    smokingPolicy: "SEPARATED",
    paymentMethods: {
      cash: true,
      creditCards: ["VISA", "Master", "JCB"],
      digitalPayments: ["PayPay", "Alipay"]
    },
    usageScenes: ["家族、子供と", "友人と", "宴会"]
  },
  {
    id: "10",
    name: "韓国料理 ソウル",
    genre: "korean",
    genreLabel: "韓国料理",
    address: "埼玉県さいたま市北区宮原町3-506-1 ソウルビル1F",
    phone: "048-012-3456",
    description:
      "本場韓国の味を再現した韓国料理専門店。キムチから焼肉、チゲまで豊富なメニューをご用意しています。",
    thumbnailUrl: "https://images.pexels.com/photos/1633525/pexels-photo-1633525.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=2",
    isFavorite: false,
    businessHours: "17:00〜翌1:00",
    closedDays: "水曜日",
    budget: {
      dinner: { min: 3000, max: 5500 }
    },
    smokingPolicy: "SEPARATED",
    paymentMethods: {
      cash: true,
      creditCards: ["VISA", "Master", "JCB"],
      digitalPayments: ["PayPay", "楽天Pay"]
    },
    usageScenes: ["友人と", "女子会", "合コン"]
  },
  {
    id: "11",
    name: "アジアンキッチン スパイス",
    genre: "asian",
    genreLabel: "アジアン",
    address: "埼玉県さいたま市西区指扇1-2-10 スパイスビル1F",
    phone: "048-123-4567",
    description:
      "タイ、ベトナム、インドなど様々なアジア料理が楽しめるレストラン。スパイスの効いた本格的な味をお楽しみください。",
    thumbnailUrl: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=2",
    isFavorite: true,
    businessHours: "11:30〜15:00、17:30〜22:00",
    closedDays: "月曜日",
    budget: {
      dinner: { min: 2500, max: 4500 },
      lunch: { min: 1200, max: 2000 }
    },
    smokingPolicy: "NON_SMOKING",
    paymentMethods: {
      cash: true,
      creditCards: ["VISA", "Master"],
      digitalPayments: ["PayPay"]
    },
    usageScenes: ["友人と", "デート", "おひとり様"]
  },
  {
    id: "12",
    name: "ラーメン横丁 麺屋",
    genre: "ramen",
    genreLabel: "ラーメン",
    address: "埼玉県さいたま市見沼区東大宮5-32-10",
    phone: "048-234-5678",
    description:
      "こだわりの豚骨スープと自家製麺が自慢のラーメン店。深夜まで営業しているので、仕事帰りにも最適です。",
    thumbnailUrl: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=2",
    isFavorite: false,
    businessHours: "11:00〜翌2:00",
    closedDays: "年中無休",
    budget: {
      dinner: { min: 800, max: 1500 },
      lunch: { min: 800, max: 1200 }
    },
    smokingPolicy: "NON_SMOKING",
    paymentMethods: {
      cash: true,
      creditCards: ["VISA", "Master"],
      digitalPayments: ["PayPay"]
    },
    usageScenes: ["おひとり様", "友人と", "深夜食事"]
  },
  {
    id: "13",
    name: "手打ちそば 武蔵野",
    genre: "soba",
    genreLabel: "そば",
    address: "埼玉県さいたま市桜区田島5-20-3",
    phone: "048-345-6789",
    description:
      "毎朝手打ちする十割そばが自慢の老舗そば店。つゆにもこだわり、関東風の濃いめの味付けが人気です。",
    thumbnailUrl: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=2",
    isFavorite: false,
    businessHours: "11:00〜15:00、17:00〜20:00",
    closedDays: "木曜日",
    budget: {
      dinner: { min: 1500, max: 2500 },
      lunch: { min: 1000, max: 1800 }
    },
    smokingPolicy: "NON_SMOKING",
    paymentMethods: {
      cash: true,
      creditCards: ["VISA", "Master"],
      digitalPayments: ["PayPay"]
    },
    usageScenes: ["おひとり様", "家族、子供と", "ランチ"]
  },
  {
    id: "14",
    name: "讃岐うどん 麦の香",
    genre: "udon",
    genreLabel: "うどん",
    address: "埼玉県さいたま市緑区東浦和2-15-8",
    phone: "048-456-7890",
    description:
      "本場讃岐から取り寄せた小麦粉で作る本格讃岐うどん。コシの強い麺と出汁の効いたつゆが絶品です。",
    thumbnailUrl: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=2",
    isFavorite: true,
    businessHours: "10:30〜15:00、17:00〜21:00",
    closedDays: "火曜日",
    budget: {
      dinner: { min: 1200, max: 2000 },
      lunch: { min: 800, max: 1500 }
    },
    smokingPolicy: "NON_SMOKING",
    paymentMethods: {
      cash: true,
      creditCards: ["VISA", "Master"],
      digitalPayments: ["PayPay", "楽天Pay"]
    },
    usageScenes: ["おひとり様", "家族、子供と", "ランチ"]
  },
  {
    id: "15",
    name: "ビストロ カフェ パリ",
    genre: "western",
    genreLabel: "洋食",
    address: "埼玉県さいたま市中央区上落合2-3-5 パリビル1F",
    phone: "048-567-8901",
    description:
      "カジュアルなビストロスタイルの洋食レストラン。ハンバーグやオムライスなど定番メニューが充実しています。",
    thumbnailUrl: "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=2",
    isFavorite: false,
    businessHours: "11:00〜22:00",
    closedDays: "年中無休",
    budget: {
      dinner: { min: 2500, max: 4000 },
      lunch: { min: 1500, max: 2500 }
    },
    smokingPolicy: "SEPARATED",
    paymentMethods: {
      cash: true,
      creditCards: ["VISA", "Master", "JCB"],
      digitalPayments: ["PayPay", "楽天Pay"]
    },
    usageScenes: ["家族、子供と", "デート", "ランチ"]
  },
  {
    id: "16",
    name: "タイ料理 バンコク",
    genre: "asian",
    genreLabel: "アジアン",
    address: "埼玉県さいたま市岩槻区本町1-1-2 バンコクビル2F",
    phone: "048-678-9012",
    description:
      "本場タイ人シェフが作る本格タイ料理。トムヤムクンやガパオライスなど、スパイシーで香り豊かな料理が楽しめます。",
    thumbnailUrl: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=2",
    isFavorite: false,
    businessHours: "11:30〜14:30、17:30〜22:00",
    closedDays: "水曜日",
    budget: {
      dinner: { min: 2800, max: 4500 },
      lunch: { min: 1200, max: 2000 }
    },
    smokingPolicy: "NON_SMOKING",
    paymentMethods: {
      cash: true,
      creditCards: ["VISA", "Master"],
      digitalPayments: ["PayPay"]
    },
    usageScenes: ["友人と", "デート", "女子会"]
  },
]
