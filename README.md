# tamayoi-web

埼玉県の飲食店マップアプリケーション

## プロジェクト構造

```
tamayoi-web/
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

## 開発環境の起動

### ローカル開発
```bash
cd frontend
pnpm install
pnpm dev
```

### Docker開発環境
```bash
cd infrastructure/docker

# 初回起動時（ビルドが必要）
docker-compose --profile dev up --build

# 2回目以降の起動
docker-compose --profile dev up

# バックグラウンドで起動
docker-compose --profile dev up -d

# ログを確認
docker-compose --profile dev logs -f

# 停止
docker-compose --profile dev down
```

### 本番環境
```bash
cd infrastructure/docker

# 初回起動時（ビルドが必要）
docker-compose --profile prod up --build

# 2回目以降の起動
docker-compose --profile prod up

# バックグラウンドで起動
docker-compose --profile prod up -d

# ログを確認
docker-compose --profile prod logs -f

# 停止
docker-compose --profile prod down
```

### ポート番号
- **開発環境**: http://localhost:3001
- **本番環境**: http://localhost:3000
- **Nginx**: http://localhost:80, https://localhost:443

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
docker-compose --profile dev up --build
```

#### イメージの再ビルドが必要な場合
```bash
# キャッシュを使わずに再ビルド
docker-compose --profile dev build --no-cache

# 全イメージを削除して再ビルド
docker-compose down --rmi all
docker-compose --profile dev up --build
```

#### ボリュームのクリーンアップ
```bash
# 未使用のボリュームを削除
docker volume prune

# 全ボリュームを削除（注意：データが失われます）
docker volume prune -a
```

