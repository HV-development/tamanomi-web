# tamanomi-web

埼玉県の飲食店マップアプリケーション

## プロジェクト構造

```
tamanomi-web/
├── frontend/              # Next.jsアプリケーション
│   ├── src/              # ソースコード
│   │   ├── app/          # Next.js App Router
│   │   ├── components/   # Reactコンポーネント
│   │   ├── hooks/        # カスタムフック
│   │   ├── lib/          # ユーティリティライブラリ
│   │   ├── types/        # TypeScript型定義
│   │   ├── utils/        # ユーティリティ関数
│   │   ├── data/         # モックデータ
│   │   └── styles/       # スタイルファイル
│   ├── public/           # 静的ファイル
│   ├── package.json      # 依存関係
│   └── ...               # 設定ファイル
├── infrastructure/       # インフラストラクチャ
│   └── docker/          # Docker関連ファイル
│       ├── Dockerfile    # アプリケーション用Dockerfile
│       ├── docker-compose.yml # Docker Compose設定
│       └── nginx/        # Nginx設定
└── README.md
```

## 📦 パッケージ管理

このプロジェクトは`@hv-development/schemas`パッケージをGitHub Package Registryから取得します。

### 前提条件

- Node.js 22以上
- pnpm
- Docker（Docker Compose使用時）
- GitHub Package Registryへのアクセス権限

### 🚀 クイックスタート（推奨）

環境セットアップスクリプトを使用して、簡単に環境を構築できます：

```bash
cd tamanomi-web/frontend
pnpm setup:env
```

このスクリプトは以下を自動で実行します：
1. `env.example`から`.env`ファイルを作成
2. GITHUB_TOKENの設定（環境変数から取得または入力を促す）
3. Docker用のシンボリックリンク作成
4. 依存関係のインストール（pnpm install）

### 手動セットアップ手順

スクリプトを使わずに手動でセットアップする場合：

1. **環境ファイルの作成**

```bash
cd tamanomi-web/frontend
cp env.example .env
```

2. **GitHubパーソナルアクセストークンの設定**

GitHub Package Registryからパッケージを取得するため、`.env`ファイルに設定：

```bash
GITHUB_TOKEN=ghp_your_github_personal_access_token_here
```

トークンの作成手順：
- https://github.com/settings/tokens にアクセス
- 'Generate new token (classic)' をクリック
- Scopes: `read:packages` にチェック
- トークンをコピーして`.env`に設定

3. **依存関係のインストール**

```bash
pnpm install
```

4. **開発サーバーを起動**

```bash
pnpm dev
```

### パッケージの更新

- `@hv-development/schemas`パッケージの新しいバージョンがリリースされた場合：

```bash
cd tamanomi-web/frontend
pnpm update @hv-development/schemas
```

## 🛠️ 開発

### 利用可能なスクリプト

```bash
# 環境セットアップ
pnpm setup:env

# JWT_SECRET生成
pnpm secret:generate

# 開発サーバー起動
pnpm dev

# 本番ビルド
pnpm build

# 本番サーバー起動
pnpm start

# リント実行
pnpm lint

# 全サービス起動
pnpm start:all

# 全サービス停止
pnpm stop:all
```

### ローカル開発
```bash
cd frontend
pnpm install
pnpm dev
```

### Docker開発環境

このプロジェクトはDocker環境での開発を推奨しています。

```bash
cd infrastructure/docker

# シンプルに起動（シンボリックリンク経由でfrontend/.envを自動参照）
docker-compose up --build

# ログを確認
docker-compose logs -f

# 停止
docker-compose down
```

**注意**: 
- `GITHUB_TOKEN`が設定されていない場合、ビルドに失敗します
- `pnpm setup:env`で自動的に`infrastructure/docker/.env`のシンボリックリンクが作成されます
- Docker Composeが自動的に`.env`を読み込んでビルドに使用します

### ポート番号
- **開発環境（ローカル）**: http://localhost:3000
- **開発環境（Docker）**: http://localhost:3000

## 技術スタック

- **フロントエンド**: Next.js 14, React, TypeScript
- **スタイリング**: Tailwind CSS, shadcn/ui
- **コンテナ化**: Docker, Docker Compose
- **リバースプロキシ**: Nginx

## Docker関連のトラブルシューティング

### よくある問題と解決方法

#### ポートが既に使用されている場合
```bash
# ポート3000を使用しているプロセスを確認
lsof -i :3000

# ポート3001を使用しているプロセスを確認
lsof -i :3001

# プロセスを終了
kill -9 <PID>
```

#### コンテナが起動しない場合
```bash
# コンテナの状態を確認
docker-compose ps

# ログを確認
docker-compose logs

# コンテナを再作成
docker-compose down
docker-compose up --build
```

#### イメージの再ビルドが必要な場合
```bash
# キャッシュを使わずに再ビルド
docker-compose build --no-cache

# 全イメージを削除して再ビルド
docker-compose down --rmi all
docker-compose up --build
```

#### ボリュームのクリーンアップ
```bash
# 未使用のボリュームを削除
docker volume prune

# 全ボリュームを削除（注意：データが失われます）
docker volume prune -a
```

