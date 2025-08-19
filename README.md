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
docker-compose --profile dev up
```

### 本番環境
```bash
cd infrastructure/docker
docker-compose --profile prod up
```

## 技術スタック

- **フロントエンド**: Next.js 14, React, TypeScript
- **スタイリング**: Tailwind CSS, shadcn/ui
- **コンテナ化**: Docker, Docker Compose
- **リバースプロキシ**: Nginx
