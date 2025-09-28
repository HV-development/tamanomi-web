# Next.jsアプリケーション用Dockerfile（ローカル開発用）
FROM node:18-alpine

# 依存関係のインストール
RUN apk add --no-cache libc6-compat
WORKDIR /app

# pnpmのインストール
RUN npm install -g pnpm

# 依存関係ファイルのコピー
COPY package.json pnpm-lock.yaml* ./

# スキーマパッケージをコピー（存在する場合）
COPY ../../tamanomi-schemas ./tamanomi-schemas

# package.jsonのパスを修正（Dockerコンテキスト用）
RUN if [ -f "tamanomi-schemas/package.json" ]; then \
      sed -i 's|file:../../tamanomi-schemas|file:./tamanomi-schemas|g' package.json; \
    fi

RUN pnpm install --frozen-lockfile

# 環境変数の設定
ENV NEXT_TELEMETRY_DISABLED 1

# 開発サーバーのポート
EXPOSE 3000

# 開発サーバー起動（デフォルトコマンド）
CMD ["pnpm", "dev"] 