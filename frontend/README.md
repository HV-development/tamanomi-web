# tamanomi-web

Tamanomi Web Frontend - Next.js + TypeScript + Tailwind CSS

## 🚀 特徴

- **Next.js 14**: React フレームワーク
- **TypeScript**: 型安全な開発
- **Tailwind CSS**: ユーティリティファーストのCSS
- **型安全性**: `@tamanomi/schemas`パッケージを使用した型安全なAPI通信

## 🛠️ 環境構築

### 前提条件

- Node.js 18以上
- pnpm
- tamanomi-api が起動していること

### クイックスタート

1. **環境変数の設定**

```bash
# 環境変数ファイルを作成
cp env.example .env
# .envファイルを編集して、必要に応じて値を変更
```

2. **依存関係のインストール**

```bash
# 依存関係をインストール
pnpm install
```

3. **開発サーバーの起動**

```bash
# 開発モードで起動
pnpm dev
```

### Docker環境での起動

```bash
# Docker Composeで起動
cd infrastructure/docker
docker-compose up -d

# ログを確認
docker-compose logs -f app
```

### 環境変数

```env
# API設定
NEXT_PUBLIC_API_BASE_URL=http://localhost:3002/api/v1

# Next.js設定
NEXT_TELEMETRY_DISABLED=1
WATCHPACK_POLLING=true
NEXT_CACHE_DISABLED=1
```

## 🌐 アクセス先

- **Web Frontend**: http://localhost:3000

## 🧪 テスト

```bash
# リント実行
pnpm lint

# 型チェック
pnpm type-check
```

## 🚨 トラブルシューティング

### ポート競合エラー

```bash
# 使用中のポートを確認
lsof -i :3000

# プロセスを停止
pnpm stop:all
```

### API接続エラー

```bash
# tamanomi-apiが起動しているか確認
curl http://localhost:3002/health

# APIサーバーを起動
cd ../tamanomi-api && pnpm dev
```

### ビルドエラー

```bash
# キャッシュをクリア
pnpm clean

# 依存関係を再インストール
pnpm install:clean
```

## 📁 プロジェクト構造

```
src/
├── app/                    # Next.js App Router
├── components/             # React コンポーネント
│   ├── atoms/             # 原子コンポーネント
│   ├── molecules/          # 分子コンポーネント
│   ├── organisms/          # 有機体コンポーネント
│   └── templates/          # テンプレート
├── hooks/                  # カスタムフック
├── lib/                    # ユーティリティ
├── types/                  # TypeScript型定義
└── utils/                  # ヘルパー関数
```

## 🎨 UI/UX

- **デザインシステム**: 原子設計に基づくコンポーネント設計
- **レスポンシブ**: モバイルファーストデザイン
- **アクセシビリティ**: WCAG 2.1準拠
- **パフォーマンス**: Next.js最適化機能を活用

## 🔧 開発コマンド

```bash
# 開発サーバー起動
pnpm dev

# プロダクションビルド
pnpm build

# プロダクションサーバー起動
pnpm start

# リント実行
pnpm lint

# 型チェック
pnpm type-check

# キャッシュクリア
pnpm clean

# 依存関係クリーンインストール
pnpm install:clean
```
