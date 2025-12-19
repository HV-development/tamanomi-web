# Next.jsアプリケーション用Dockerfile
FROM node:22-alpine

# ビルド引数としてGitHub tokenを受け取る
ARG GITHUB_TOKEN

WORKDIR /app

# pnpmをインストール
RUN npm install -g pnpm

# 依存関係ファイルのコピー
COPY tamanomi-web/frontend/package.json tamanomi-web/frontend/pnpm-lock.yaml* ./

# .npmrcファイルのコピー（GitHub Package Registryの設定）
COPY tamanomi-web/frontend/.npmrc ./

# ビルド時にGitHub tokenを設定（トークンが提供された場合のみ）
# 注意: @hv-development/schemasは実行時にローカルでビルドされるため、ビルド時のインストールはスキップ
RUN if [ -z "$GITHUB_TOKEN" ]; then \
      echo "⚠️  GITHUB_TOKENが設定されていません。@hv-development/schemas以外のパッケージのみインストールします。" >&2; \
      # package.jsonから@hv-development/schemasを一時的に削除してインストール
      sed -i '/"@hv-development\/schemas"/d' package.json || true; \
      pnpm install --no-frozen-lockfile || pnpm install --no-frozen-lockfile --ignore-scripts || true; \
    else \
      echo "//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}" >> .npmrc; \
      # @hv-development/schemasをスキップしてインストール（実行時にローカルでビルドされるため）
      pnpm install --no-frozen-lockfile --filter '!@hv-development/schemas' || \
      (sed -i '/"@hv-development\/schemas"/d' package.json && pnpm install --no-frozen-lockfile) || \
      pnpm install --no-frozen-lockfile --ignore-scripts || true; \
    fi

# ソースコードをコピー（node_modulesは除外される）
# 念のため、既存のnode_modulesを削除してからコピー
RUN rm -rf node_modules/@hv-development/schemas 2>/dev/null || true
COPY tamanomi-web/frontend ./

# トークンを含む.npmrcを削除（セキュリティのため）
RUN rm -f .npmrc

# 開発サーバーのポート
EXPOSE 3000

# 開発サーバー起動（デフォルトコマンド）
CMD ["pnpm", "dev"] 