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

- Node.js 20以上
- pnpm
- Docker（Docker Compose使用時）
- GitHub Package Registryへのアクセス権限

### セットアップ手順

1. **GitHubパーソナルアクセストークンの設定**

GitHub Package Registryからパッケージを取得するため、`~/.npmrc`に以下を設定：

```bash
@hv-development:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

2. **依存関係のインストール**

```bash
cd tamanomi-web/frontend
pnpm install
```

3. **開発サーバーを起動**

```bash
# ローカル開発
pnpm dev

# またはDocker開発環境
cd ../infrastructure/docker
docker-compose up --build
```

### パッケージの更新

- `@hv-development/schemas`パッケージの新しいバージョンがリリースされた場合：

```bash
cd tamanomi-web/frontend
pnpm update @hv-development/schemas
```

## 開発環境の起動

### ローカル開発
```bash
cd frontend
pnpm install
pnpm dev
```

### Docker開発環境

Docker環境でビルドする場合は、`tamanomi-schemas/.env`から環境変数を読み込んでください：

```bash
cd infrastructure/docker

# .envファイルから環境変数を読み込む（exportも同時に実行）
set -a && source ../../../tamanomi-schemas/.env && set +a

# 初回起動時（ビルドが必要）
docker-compose build
docker-compose up -d

# 2回目以降の起動
docker-compose up -d

# ログを確認
docker-compose logs -f

# 停止
docker-compose down
```

**注意**: 
- `set -a`を使用することで、sourceで読み込んだ変数を自動的にexportします
- `GITHUB_TOKEN`が設定されていない場合、パッケージのインストールに失敗します

### ポート番号
- **開発環境**: http://localhost:3000

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

