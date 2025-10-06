# Next.jsアプリケーション用Dockerfile（ローカル開発用）
FROM node:20-alpine

# 依存関係のインストール
RUN apk add --no-cache libc6-compat
WORKDIR /app

# pnpmのインストール
RUN npm install -g pnpm

# 依存関係ファイルのコピー
COPY tamanomi-web/frontend/package.json tamanomi-web/frontend/pnpm-lock.yaml* ./

# スキーマパッケージをコピー（存在する場合）
COPY tamanomi-schemas ./tamanomi-schemas

# 開発環境ではローカルパッケージを参照するようにpackage.jsonを修正
RUN if [ -f "tamanomi-schemas/package.json" ]; then \
      sed -i 's|"@hv-development/schemas": "\^1\.4\.0"|"@hv-development/schemas": "file:./tamanomi-schemas"|g' package.json; \
    fi

RUN pnpm install --no-frozen-lockfile

# 環境変数の設定
ENV NEXT_TELEMETRY_DISABLED 1

# 開発サーバーのポート
EXPOSE 3000

# 開発サーバー起動（デフォルトコマンド）
CMD ["pnpm", "dev"] 