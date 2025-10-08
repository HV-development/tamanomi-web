# Next.jsアプリケーション用Dockerfile
FROM node:22-alpine

# ビルド引数としてGitHub tokenを受け取る
ARG GITHUB_TOKEN

# 依存関係のインストール
RUN apk add --no-cache libc6-compat
WORKDIR /app

# pnpmのインストール
RUN npm install -g pnpm

# 依存関係ファイルのコピー
COPY tamanomi-web/frontend/package.json tamanomi-web/frontend/pnpm-lock.yaml* ./

# .npmrcファイルのコピー（GitHub Package Registryの設定）
COPY tamanomi-web/frontend/.npmrc ./

# ビルド時にGitHub tokenを設定（トークンが提供された場合のみ）
RUN if [ -n "$GITHUB_TOKEN" ]; then \
      echo "//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}" >> .npmrc; \
    fi

# 依存関係のインストール（公開パッケージから）
RUN pnpm install --no-frozen-lockfile

# ソースコードをコピー
COPY tamanomi-web/frontend ./

# トークンを含む.npmrcを削除（セキュリティのため）
RUN rm -f .npmrc

# 環境変数の設定
ENV NEXT_TELEMETRY_DISABLED 1

# 開発サーバーのポート
EXPOSE 3000

# 開発サーバー起動（デフォルトコマンド）
CMD ["pnpm", "dev"] 