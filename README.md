# tamanomi-web

埼玉県の飲食店マップアプリケーション - Next.js 14 + TypeScript

> **統合管理**: セットアップとDocker管理は[tamanomi-root](https://github.com/HV-development/tamanomi-root)で行います

## 🚀 特徴

- **Next.js 14**: App Routerを使用したモダンなNext.jsアプリケーション
- **TypeScript**: 型安全性を確保
- **Tailwind CSS + shadcn/ui**: 美しいUIコンポーネント
- **地図機能**: 店舗位置の表示
- **ポイントシステム**: ユーザーポイント管理
- **API統合**: `@hv-development/schemas`パッケージを使用した型安全なAPI通信

## 🛠️ ローカル開発

### 単独での開発サーバー起動

```bash
cd tamanomi-web/frontend

# 開発サーバー起動
pnpm dev
# → http://localhost:3000

# 本番ビルド
pnpm build

# 本番サーバー起動
pnpm start
```

### コード品質

```bash
# リント実行
pnpm lint
```

## 📦 主な機能

### ユーザー向け機能

- 店舗検索・地図表示
- クーポン取得・利用
- ポイント確認・履歴
- マイページ

### 技術スタック

- **フロントエンド**: Next.js 14, React, TypeScript
- **スタイリング**: Tailwind CSS, shadcn/ui
- **UIコンポーネント**: Radix UI
- **フォーム**: React Hook Form + Zod
- **アイコン**: Lucide React

## 🚀 デプロイ (Vercel)

Vercelへのデプロイを推奨します。

### 環境変数

```bash
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api/v1
NEXT_PUBLIC_MYPAGE_SHOW_USAGE_HISTORY=true
NEXT_PUBLIC_MYPAGE_SHOW_PAYMENT_HISTORY=true
```

詳細は [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) を参照。

## 📝 ライセンス

ISC License
