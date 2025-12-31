# nomoca-kagawa-web E2Eテスト

Playwrightを使用したE2Eテストスイートです。

## 前提条件

- Node.js 22.x
- pnpm 8.x
- Docker（ローカル開発環境）
- tamanomi-api が起動していること
- MailHog が起動していること（OTP取得用）

## セットアップ

### 1. 依存関係のインストール

```bash
cd frontend
pnpm install
```

### 2. 環境変数の設定

`e2e/.env` ファイルを作成（または `.env.example` をコピー）:

```bash
cp e2e/.env.example e2e/.env
```

主な環境変数:

| 変数名 | 説明 | デフォルト値 |
|--------|------|-------------|
| `E2E_BASE_URL` | テスト対象のベースURL | `http://localhost:3004` |
| `E2E_TEST_EMAIL` | テストユーザーのメールアドレス | `nomoca-user@example.com` |
| `E2E_TEST_PASSWORD` | テストユーザーのパスワード | `nomoca-user123` |
| `E2E_ENV` | 環境識別子（local/staging/production） | `local` |

### 3. サービスの起動

```bash
# tamanomi-hub ディレクトリで
docker-compose up -d

# または nomoca-kagawa-web のみ起動
cd infrastructure/docker
docker-compose up -d
```

## テストの実行

### 全テスト実行

```bash
pnpm test:e2e
```

### UIモードで実行（デバッグ用）

```bash
pnpm test:e2e:ui
```

### ブラウザ表示モードで実行

```bash
pnpm test:e2e:headed
```

### 特定のテストファイルのみ実行

```bash
pnpm test:e2e auth.spec.ts
pnpm test:e2e shops.spec.ts
```

## テストの構成

### プロジェクト分類

| プロジェクト | 説明 | 認証状態 |
|------------|------|---------|
| `setup` | OTP認証を実行し `.auth/user.json` に保存 | なし |
| `authenticated` | storageStateを使用（実データ） | あり |
| `auth-flow` | 認証フローのテスト（シリアル実行） | なし |
| `navigation` | ページナビゲーションのテスト | あり |
| `error-handling` | エラーハンドリングのテスト | なし |

### テストファイル一覧

| ファイル | 説明 | プロジェクト |
|---------|------|-------------|
| `auth.setup.ts` | 認証セットアップ（OTP認証） | setup |
| `auth.spec.ts` | ログイン・ログアウトのテスト | auth-flow |
| `registration.spec.ts` | ユーザー登録のテスト | auth-flow |
| `shops.spec.ts` | 店舗一覧・詳細のテスト | authenticated |
| `coupons.spec.ts` | クーポン使用のテスト | authenticated |
| `favorites.spec.ts` | お気に入り機能のテスト | authenticated |
| `mypage.spec.ts` | マイページのテスト | authenticated |
| `plans.spec.ts` | プラン表示のテスト | authenticated |
| `headers.spec.ts` | HTTPヘッダーのテスト | authenticated |
| `navigation.spec.ts` | ナビゲーションのテスト | navigation |
| `error-handling.spec.ts` | エラーハンドリングのテスト | error-handling |

## ディレクトリ構成

```
e2e/
├── .env                    # 環境変数
├── .env.example            # 環境変数のサンプル
├── auth.setup.ts           # 認証セットアップ
├── *.spec.ts               # テストファイル
├── utils/
│   ├── test-helpers.ts     # 共通ヘルパー関数
│   ├── test-data.ts        # テストデータユーティリティ
│   └── mailhog.ts          # MailHogからOTP取得
└── README.md               # このファイル
```

## 認証フロー

1. `auth.setup.ts` が実行され、OTP認証を行う
2. 認証状態が `.auth/user.json` に保存される
3. `authenticated` プロジェクトのテストは `storageState` で認証状態を再利用
4. テスト間で認証を共有し、OTP競合を回避

## トラブルシューティング

### OTP取得に失敗する

- MailHog が起動していることを確認: `docker ps | grep mailhog`
- MailHog UI で確認: http://localhost:8025

### テストがタイムアウトする

- サーバーが起動していることを確認: `curl http://localhost:3004`
- APIサーバーが起動していることを確認: `curl http://localhost:3002/api/v1/health`

### クーポンテストが失敗する

- クーポン使用履歴がリセットされていない可能性
- ローカル環境では `beforeAll` でリセットされるが、手動リセットが必要な場合:

```sql
DELETE FROM coupon_usage_history WHERE user_id = 'ユーザーID';
```

## レポート

テスト実行後、HTMLレポートが生成されます:

```bash
pnpm exec playwright show-report
```

スクリーンショット・動画・トレースは `test-results/` に保存されます。
