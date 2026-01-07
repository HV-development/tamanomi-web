# tamanomi-web

Tamanomi Web Frontend - Next.js + TypeScript + Tailwind CSS

## 🚀 特徴

- **Next.js 14**: React フレームワーク
- **TypeScript**: 型安全な開発
- **Tailwind CSS**: ユーティリティファーストのCSS
- **型安全性**: `@hv-development/schemas`パッケージを使用した型安全なAPI通信

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

# E2Eテスト実行
pnpm test:e2e
```

### E2Eテストの環境変数設定

E2Eテストは環境変数で接続先URLとログイン情報を設定できます。環境変数は以下の2つの方法で設定できます：

#### 方法1: e2e/.envファイルを使用（推奨）

1. `e2e/.env.example`をコピーして`e2e/.env`を作成：
```bash
cp e2e/.env.example e2e/.env
```

2. `e2e/.env`ファイルを編集して、実際の値を設定：
```env
# テスト用メールアドレス（デフォルト: users@example.com）
E2E_TEST_EMAIL=users@example.com

# テスト用パスワード（デフォルト: users123）
E2E_TEST_PASSWORD=users123

# プラン未登録ユーザーのメールアドレス
E2E_NO_PLAN_EMAIL=minaton.tutan+no-plan@gmail.com

# プラン未登録ユーザーのパスワード
E2E_NO_PLAN_PASSWORD=Lala0810

# OTP取得方法（mailhog または gmail）
E2E_OTP_RETRIEVER=mailhog

# 接続先URL（デフォルト: http://localhost:3000）
# E2E_BASE_URL=http://localhost:3000
```

3. E2Eテストを実行：
```bash
pnpm test:e2e
```

#### 方法2: 環境変数を直接設定

```bash
# 接続先URL（デフォルト: http://localhost:3000）
export E2E_BASE_URL=https://your-production-url.com

# テスト用メールアドレス（デフォルト: users@example.com）
export E2E_TEST_EMAIL=users@example.com

# テスト用パスワード（デフォルト: users123）
export E2E_TEST_PASSWORD=users123

# プラン未登録ユーザーのメールアドレス
export E2E_NO_PLAN_EMAIL=minaton.tutan+no-plan@gmail.com

# プラン未登録ユーザーのパスワード
export E2E_NO_PLAN_PASSWORD=Lala0810

# E2Eテスト実行
pnpm test:e2e
```

**注意**: 
- 本番環境でE2Eテストを実行する場合は、`E2E_BASE_URL`を本番環境のURLに設定してください。この場合、開発サーバーは自動的に起動されません。
- `e2e/.env`ファイルは`.gitignore`に含まれているため、Gitにコミットされません。機密情報を含む場合は、この方法を使用してください。

### Gmail API設定（本番環境のE2Eテスト用）

本番環境でE2Eテストを実行する場合、Gmail APIを使用してOTPを取得できます。開発環境ではMailHogを使用し、本番環境ではGmail APIを使用するように自動的に切り替わります。

#### 1. Google Cloud Consoleでプロジェクトを作成

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. 新しいプロジェクトを作成（または既存のプロジェクトを選択）
3. 「APIとサービス」→「ライブラリ」から「Gmail API」を検索して有効化

#### 2. OAuth 2.0認証情報を作成

1. 「APIとサービス」→「認証情報」→「認証情報を作成」→「OAuth 2.0 クライアント ID」
2. 同意画面を設定（初回のみ）
   - ユーザータイプ: 「外部」を選択
   - アプリ名: 「E2E Test Client」など
   - ユーザーサポートメール: 自分のメールアドレス
   - スコープ: デフォルトのまま
   - テストユーザー: テスト用のGmailアドレスを追加
3. OAuth 2.0 クライアント IDを作成
   - アプリケーションの種類: 「デスクトップアプリ」
   - 名前: 「E2E Test Client」
4. 作成後、クライアントIDとクライアントシークレットをコピー

#### 3. リフレッシュトークンを取得

プロジェクトに含まれているスクリプトを使用してリフレッシュトークンを取得：

```bash
# tamanomi-web/frontendディレクトリに移動
cd tamanomi-web/frontend

# スクリプトを実行
E2E_GMAIL_CLIENT_ID=your-client-id \
E2E_GMAIL_CLIENT_SECRET=your-client-secret \
node scripts/get-gmail-token.js
```

スクリプトが表示するURLにアクセスして認証を行い、表示された認証コードを入力してください。リフレッシュトークンが表示されます。

#### 4. 環境変数を設定

```bash
# OTP取得方法をGmail APIに設定
export E2E_OTP_RETRIEVER=gmail

# Gmail API設定
export E2E_GMAIL_CLIENT_ID=your-client-id.apps.googleusercontent.com
export E2E_GMAIL_CLIENT_SECRET=your-client-secret
export E2E_GMAIL_REFRESH_TOKEN=your-refresh-token
export E2E_GMAIL_USER_EMAIL=test@example.com  # オプション（デフォルトはE2E_TEST_EMAIL）

# テスト用メールアドレス（Gmail APIでアクセス可能なアカウント）
export E2E_TEST_EMAIL=test@example.com
export E2E_TEST_PASSWORD=test123
```

#### 5. テストを実行

```bash
# 本番環境でE2Eテストを実行
E2E_BASE_URL=https://your-production-url.com \
E2E_OTP_RETRIEVER=gmail \
E2E_GMAIL_CLIENT_ID=your-client-id \
E2E_GMAIL_CLIENT_SECRET=your-client-secret \
E2E_GMAIL_REFRESH_TOKEN=your-refresh-token \
E2E_TEST_EMAIL=test@example.com \
E2E_TEST_PASSWORD=test123 \
pnpm test:e2e
```

#### 注意事項

- **セキュリティ**: リフレッシュトークンは機密情報です。環境変数やシークレット管理サービス（GitHub Secrets、AWS Secrets Managerなど）で管理してください
- **レート制限**: Gmail APIにはレート制限があります（1日あたり1,000,000リクエスト、1秒あたり250リクエスト）。通常のE2Eテストでは問題ありませんが、大量のテストを実行する場合は注意してください
- **テスト用アカウント**: テスト専用のGmailアカウントを使用することを強く推奨します
- **認証の有効期限**: リフレッシュトークンは無期限ですが、アプリの認証情報を削除した場合は再取得が必要です
- **開発環境**: 開発環境では`E2E_OTP_RETRIEVER`を設定しないか、`mailhog`に設定することでMailHogを使用できます

### Docker経由でE2Eテストを実行

Docker Composeを使用して、すべてのサービス（API、データベース、MailHogなど）を起動し、Dockerネットワーク内でE2Eテストを実行できます。

#### 前提条件

- DockerとDocker Composeがインストールされていること
- `tamanomi-hub`ディレクトリにDocker Compose設定があること

#### 手順

1. **Docker Composeでサービスを起動**

```bash
# tamanomi-hubディレクトリに移動
cd ../../tamanomi-hub

# 必要なサービスを起動（web, api, db, mailhog）
docker-compose up -d web api db mailhog

# サービスが起動するまで待機（約30秒）
sleep 30
```

2. **E2Eテストを実行**

```bash
# tamanomi-web/frontendディレクトリに戻る
cd ../tamanomi-web/frontend

# Dockerコンテナ内のwebサービスに対してE2Eテストを実行
E2E_BASE_URL=http://localhost:3000 pnpm test:e2e
```

3. **テスト完了後のクリーンアップ（オプション）**

```bash
# サービスを停止（必要に応じて）
cd ../../tamanomi-hub
docker-compose stop web api db mailhog

# サービスを停止してコンテナを削除（必要に応じて）
docker-compose down
```

#### Docker経由でテストする利点

- **一貫した環境**: すべてのサービスがDockerコンテナ内で実行されるため、環境の違いによる問題を回避できます
- **ネットワーク分離**: Dockerネットワーク内で`api`ホスト名を使用してAPIサーバーにアクセスできます
- **依存関係の管理**: データベース、MailHogなどの依存サービスが自動的に起動されます

#### トラブルシューティング

- **接続エラーが発生する場合**: サービスが完全に起動するまで待機してください（`docker-compose logs web`でログを確認）
- **ポートが既に使用されている場合**: `docker-compose ps`で実行中のコンテナを確認し、必要に応じて停止してください

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
